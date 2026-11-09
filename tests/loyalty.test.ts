import assert from "node:assert/strict";
import { test, after } from "node:test";
import { clearEmulator } from "./loyalty-emulator";
import { randomBytes, randomUUID } from "node:crypto";
import { loyaltyDb } from "../src/lib/loyalty/db";
import {
  mutateCard,
  cardDetail,
  listCards,
  publicCard,
  hashToken,
} from "../src/lib/loyalty/store";
import {
  LoyaltyError,
  safeReturnPath,
  scanToken,
  type Command,
} from "../src/lib/loyalty/types";
import { readBody } from "../src/lib/loyalty/http";
if (
  !process.env.FIRESTORE_EMULATOR_HOST ||
  process.env.LOYALTY_FIREBASE_PROJECT_ID !== "demo-mundus-loyalty"
)
  throw new Error("Tests require the demo Firestore emulator.");
after(() => clearEmulator());
const actor = "staff@example.test";
const token = () => randomBytes(32).toString("base64url");
const operation = () => randomUUID();
const reject = (code: number) => (e: unknown) =>
  e instanceof LoyaltyError && e.status === code;
async function create(name = "Prueba Cliente", phone = "") {
  const secret = token();
  const command: Command = {
    action: "create",
    operationId: operation(),
    token: secret,
    name,
    phone,
  };
  const result = await mutateCard(command, actor);
  return { ...result, token: secret, command };
}
async function action(
  id: string,
  kind: Command["action"],
  fields: Partial<Command> = {},
) {
  const { card } = await cardDetail(id);
  return mutateCard(
    {
      action: kind,
      operationId: operation(),
      id,
      revision: card.revision,
      ...fields,
    },
    actor,
  );
}
test("loyalty lifecycle and public privacy", async () => {
  const c = await create("Álvaro Privado", "+34 600 000 001");
  assert.deepEqual(await mutateCard(c.command, actor), {
    id: c.id,
    revision: 0,
  });
  assert.deepEqual(await publicCard(c.token), {
    firstName: "Álvaro",
    balance: 0,
    target: 7,
  });
  const raw = (
    await loyaltyDb().collection("loyaltyCards").doc(c.id).get()
  ).data()!;
  assert.equal(raw.tokenHash, hashToken(c.token));
  assert.ok(!JSON.stringify(raw).includes(c.token));
  await assert.rejects(action(c.id, "redeem"), reject(409));
  for (let i = 0; i < 7; i++) await action(c.id, "stamp");
  await assert.rejects(action(c.id, "stamp"), reject(409));
  assert.equal((await publicCard(c.token)).balance, 7);
  await action(c.id, "undo");
  assert.equal((await publicCard(c.token)).balance, 6);
  await assert.rejects(action(c.id, "undo"), reject(409));
  await action(c.id, "stamp");
  await action(c.id, "redeem");
  assert.equal((await publicCard(c.token)).balance, 0);
  await assert.rejects(action(c.id, "redeem"), reject(409));
  await assert.rejects(action(c.id, "undo"), reject(409));
  const { activity } = await cardDetail(c.id);
  assert.equal(activity.filter((a) => a.action === "redeem").length, 1);
});
test("duplicate requests, conflicts and changed-payload retry", async () => {
  const c = await create();
  const cmd: Command = {
    action: "stamp",
    operationId: operation(),
    id: c.id,
    revision: 0,
  };
  const duplicate = await Promise.all([
    mutateCard(cmd, actor),
    mutateCard(cmd, actor),
  ]);
  assert.deepEqual(duplicate[0], duplicate[1]);
  assert.equal((await publicCard(c.token)).balance, 1);
  await assert.rejects(
    mutateCard({ ...cmd, operationId: operation() }, actor),
    reject(409),
  );
  await assert.rejects(
    mutateCard({ ...cmd, action: "undo" }, actor),
    reject(409),
  );
  const { card } = await cardDetail(c.id);
  const results = await Promise.allSettled(
    [1, 2].map(() =>
      mutateCard(
        { ...cmd, operationId: operation(), revision: card.revision },
        actor,
      ),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await publicCard(c.token)).balance, 2);
});
test("deactivate, replace link and reactivate without losing balance", async () => {
  const c = await create();
  await action(c.id, "stamp");
  await action(c.id, "update", {
    name: "Cliente Editado",
    phone: "",
    active: false,
  });
  await assert.rejects(publicCard(c.token), reject(404));
  await assert.rejects(action(c.id, "stamp"), reject(409));
  const secret = token();
  const { card } = await cardDetail(c.id);
  const cmd: Command = {
    action: "replace",
    operationId: operation(),
    id: c.id,
    revision: card.revision,
    token: secret,
  };
  await mutateCard(cmd, actor);
  await mutateCard(cmd, actor);
  await action(c.id, "update", {
    name: "Cliente Editado",
    phone: "",
    active: true,
  });
  await assert.rejects(publicCard(c.token), reject(404));
  await assert.rejects(cardDetail(undefined, c.token), reject(404));
  assert.equal((await publicCard(secret)).balance, 1);
});
test("bounded prefix search and cursor pagination", async () => {
  for (let i = 0; i < 27; i++)
    await create("Búsqueda " + i, "600123" + String(i).padStart(3, "0"));
  const search = await listCards("busqueda");
  assert.equal(search.cards.length, 25);
  assert.equal(search.truncated, true);
  assert.ok((await listCards("60012300")).cards.length > 0);
  const first = await listCards();
  assert.equal(first.cards.length, 25);
  assert.ok(first.next);
  const second = await listCards("", first.next!);
  assert.ok(second.cards.every((c) => !first.cards.some((x) => x.id === c.id)));
});
test("URLs, inputs and body limits reject invalid data", async () => {
  const t = token();
  const origin = "https://munduslounge.com";
  assert.equal(scanToken(origin + "/vip/" + t, origin), t);
  for (const url of [
    "https://evil.test/vip/" + t,
    origin + "/vip/" + t + "?x=1",
    origin + "/vip/nope",
    "javascript:alert(1)",
  ])
    assert.equal(scanToken(url, origin), null);
  assert.equal(
    safeReturnPath("/admin/loyalty?token=" + t),
    "/admin/loyalty?token=" + t,
  );
  for (const path of [
    "//evil.test",
    "/admin/loyalty?next=https://evil.test",
    "https://evil.test",
  ])
    assert.equal(safeReturnPath(path), "/admin");
  await assert.rejects(publicCard("bad"), reject(404));
  await assert.rejects(
    mutateCard(
      {
        action: "create",
        operationId: operation(),
        token: t,
        name: "",
        phone: "",
      },
      actor,
    ),
    reject(400),
  );
  await assert.rejects(
    readBody(
      new Request("http://localhost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "x".repeat(9000),
      }),
    ),
    reject(413),
  );
});
test("browser Firestore access is denied by deployed emulator rules", async () => {
  const url = `http://${process.env.FIRESTORE_EMULATOR_HOST}/v1/projects/demo-mundus-loyalty/databases/(default)/documents/loyaltyCards`;
  const response = await fetch(url);
  assert.equal(response.status, 403);
});

test("private export and create-only recovery to an empty database", async () => {
  const { mkdtemp, stat } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { execFileSync } = await import("node:child_process");
  const dir = await mkdtemp(join(tmpdir(), "mundus-loyalty-backup-"));
  const file = join(dir, "backup.json");
  const c = await create("Recuperar Cliente");
  await action(c.id, "stamp");
  const run = (mode: string, project: string) =>
    execFileSync(
      process.execPath,
      [
        "node_modules/tsx/dist/cli.mjs",
        "scripts/loyalty-backup.ts",
        mode,
        file,
        project,
      ],
      {
        env: { ...process.env, LOYALTY_FIREBASE_PROJECT_ID: project },
        stdio: "pipe",
      },
    );
  run("export", "demo-mundus-loyalty");
  assert.equal((await stat(file)).mode & 0o777, 0o600);
  assert.throws(() => run("export", "demo-mundus-loyalty"));
  const destination = "demo-restored-" + randomBytes(4).toString("hex");
  run("restore", destination);
  const { initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  const db = getFirestore(
    initializeApp({ projectId: destination }, destination),
  );
  const restored = await db.collection("loyaltyCards").doc(c.id).get();
  assert.equal(restored.get("balance"), 1);
  assert.equal(restored.get("tokenHash"), hashToken(c.token));
  assert.equal(
    (await db.collection("loyaltyCards").doc(c.id).collection("activity").get())
      .size,
    2,
  );
  assert.equal(
    (
      await db.collection("loyaltyOperations").doc(c.command.operationId).get()
    ).get("result").id,
    c.id,
  );
  assert.throws(() => run("restore", destination));
  await clearEmulator(destination);
  await db.terminate();
});

test("only one concurrent redemption succeeds and Preview fails closed", async () => {
  const c = await create();
  for (let i = 0; i < 7; i++) await action(c.id, "stamp");
  const { card } = await cardDetail(c.id);
  const results = await Promise.allSettled(
    [1, 2].map(() =>
      mutateCard(
        {
          action: "redeem",
          operationId: operation(),
          id: c.id,
          revision: card.revision,
        },
        actor,
      ),
    ),
  );
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal((await publicCard(c.token)).balance, 0);
  const previous = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "preview";
  try {
    assert.throws(() => loyaltyDb(), reject(503));
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
  }
});

test("command validation rejects malformed input and normalizes retry payloads", async () => {
  const { parseCommand } = await import("../src/lib/loyalty/types");
  for (const value of [
    null,
    [],
    {},
    {
      action: "stamp",
      operationId: operation(),
      id: "-".repeat(36),
      revision: 0,
    },
  ]) {
    assert.throws(() => parseCommand(value), reject(400));
  }
  const c = await create();
  const operationId = operation();
  const first = await mutateCard(
    { action: "stamp", operationId, id: c.id, revision: 0 },
    actor,
  );
  const reordered = {
    revision: 0,
    id: c.id,
    operationId,
    action: "stamp",
    ignored: "not part of the operation",
  };
  assert.deepEqual(await mutateCard(reordered, actor), first);
  await assert.rejects(listCards(123), reject(400));
  await assert.rejects(cardDetail(undefined, {}), reject(404));
});

test("retry state survives blocked browser storage and rejects corrupt commands", async () => {
  const pending = await import("../src/lib/loyalty/pending-operation");
  const original = Object.getOwnPropertyDescriptor(
    globalThis,
    "sessionStorage",
  );
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get() {
      throw new Error("Storage disabled");
    },
  });
  try {
    const command: Command = {
      action: "stamp",
      operationId: operation(),
      id: operation(),
      revision: 0,
    };
    pending.setPending(command);
    assert.deepEqual(pending.readPending(pending.pendingSnapshot()), command);
    assert.equal(pending.readPending("{bad"), null);
    assert.equal(pending.readPending('{"action":"stamp"}'), null);
    pending.setPending(null);
    assert.equal(pending.pendingSnapshot(), null);
  } finally {
    if (original) Object.defineProperty(globalThis, "sessionStorage", original);
    else Reflect.deleteProperty(globalThis, "sessionStorage");
  }
});

test("permanent deletion removes card, token and large history; retries cannot recreate it", async () => {
  const c = await create("Cliente Eliminar", "+34 600 000 099");
  await action(c.id, "stamp");
  const replacement = token();
  await action(c.id, "replace", { token: replacement });
  const ref = loyaltyDb().collection("loyaltyCards").doc(c.id);
  // A long-lived card can exceed a single transaction's write limit.
  for (let offset = 0; offset < 600; offset += 300) {
    const batch = loyaltyDb().batch();
    for (let i = offset; i < offset + 300; i++) {
      batch.set(ref.collection("activity").doc(`history-${i}`), {
        action: "stamp", actor, at: new Date().toISOString(), before: 0, after: 1,
      });
    }
    await batch.commit();
  }
  const { card } = await cardDetail(c.id);
  const deletion: Command = {
    action: "delete", operationId: operation(), id: c.id, revision: card.revision,
  };
  await assert.rejects(mutateCard({ ...deletion, revision: 0 }, actor), reject(409));
  assert.equal((await ref.get()).exists, true);
  const results = await Promise.all([
    mutateCard(deletion, actor), mutateCard(deletion, actor),
  ]);
  assert.deepEqual(results[0], results[1]);
  assert.equal((await ref.get()).exists, false);
  assert.equal((await ref.collection("activity").get()).empty, true);
  await assert.rejects(publicCard(c.token), reject(404));
  await assert.rejects(publicCard(replacement), reject(404));
  await assert.rejects(cardDetail(c.id), reject(404));
  assert.equal((await listCards("Cliente Eliminar")).cards.length, 0);
  await assert.rejects(action(c.id, "stamp"), reject(404));
  // The original creation receipt must survive deletion to prevent resurrection.
  assert.equal((await mutateCard(c.command, actor)).id, c.id);
  assert.equal((await ref.get()).exists, false);
  assert.deepEqual(await mutateCard(deletion, actor), results[0]);
});

test("delete and stamp racing cannot leave a partially deleted live card", async () => {
  const c = await create("Carrera Eliminar");
  const results = await Promise.allSettled([
    mutateCard({ action: "delete", operationId: operation(), id: c.id, revision: 0 }, actor),
    mutateCard({ action: "stamp", operationId: operation(), id: c.id, revision: 0 }, actor),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  if (results[0].status === "fulfilled") {
    await assert.rejects(publicCard(c.token), reject(404));
    assert.equal((await loyaltyDb().collection("loyaltyCards").doc(c.id).collection("activity").get()).empty, true);
  } else {
    assert.equal((await publicCard(c.token)).balance, 1);
    await action(c.id, "delete");
  }
  const inactive = await create("Inactivo Eliminar");
  await action(inactive.id, "update", { name: "Inactivo Eliminar", phone: "", active: false });
  await action(inactive.id, "delete");
  await assert.rejects(cardDetail(inactive.id), reject(404));
});

test("uncertain deletion resumes history cleanup on the same operation", async () => {
  const c = await create("Reintento Eliminar");
  const deletion: Command = {
    action: "delete", operationId: operation(), id: c.id, revision: 0,
  };
  const db = loyaltyDb();
  const recursiveDelete = db.recursiveDelete;
  try {
    db.recursiveDelete = async () => { throw new Error("Simulated cleanup failure"); };
    await assert.rejects(mutateCard(deletion, actor), /Simulated cleanup failure/);
    await assert.rejects(publicCard(c.token), reject(404));
    assert.equal((await db.collection("loyaltyCards").doc(c.id).collection("activity").get()).size, 1);
  } finally {
    db.recursiveDelete = recursiveDelete;
  }
  await mutateCard(deletion, actor);
  assert.equal((await db.collection("loyaltyCards").doc(c.id).collection("activity").get()).empty, true);
});
