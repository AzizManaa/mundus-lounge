import { test, after } from "node:test";
import { clearEmulator } from "./loyalty-emulator";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { encode } from "next-auth/jwt";
import { loadEnvConfig } from "@next/env";
import { cardDetail } from "../src/lib/loyalty/store";
loadEnvConfig(process.cwd());
const base = process.env.LOYALTY_TEST_BASE_URL;
if (
  base &&
  (!/^http:\/\/localhost:3001$/.test(base) ||
    process.env.LOYALTY_FIREBASE_PROJECT_ID !== "demo-mundus-loyalty" ||
    !process.env.FIRESTORE_EMULATOR_HOST)
)
  throw new Error("HTTP tests require the local demo emulator server.");
after(async () => {
  if (base) await clearEmulator();
});
async function cookie(email: string) {
  return (
    "next-auth.session-token=" +
    (await encode({
      secret: process.env.NEXTAUTH_SECRET!,
      token: { email },
      maxAge: 60,
    }))
  );
}
async function post(body: object, auth = "", origin = base!) {
  return fetch(base + "/api/admin/loyalty", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      Cookie: auth,
    },
    body: JSON.stringify(body),
  });
}
test(
  "HTTP authorization, CSRF, public projection and private headers",
  { skip: !base },
  async () => {
    assert.equal((await post({ action: "list" })).status, 401);
    assert.equal(
      (await post({ action: "list" }, await cookie("unapproved@example.test")))
        .status,
      401,
    );
    const auth = await cookie(
      process.env.MENU_ADMIN_ALLOWED_EMAILS!.split(",")[0].trim(),
    );
    assert.equal(
      (await post({ action: "list" }, auth, "https://evil.test")).status,
      403,
    );
    assert.equal(
      (
        await post(
          { action: "stamp", operationId: randomUUID(), id: [], revision: 0 },
          auth,
        )
      ).status,
      400,
    );
    assert.equal(
      (await post({ action: "detail", token: {} }, auth)).status,
      404,
    );
    assert.equal(
      (
        await fetch(base + "/api/loyalty/card", {
          method: "POST",
          headers: { "Content-Type": "application/json-fake" },
          body: "{}",
        })
      ).status,
      415,
    );
    const token = randomBytes(32).toString("base64url");
    const cmd = {
      action: "create",
      operationId: randomUUID(),
      token,
      name: "HTTP Privado",
      phone: "+34 600 999 123",
    };
    const response = await post(cmd, auth);
    assert.equal(response.status, 200);
    const result = await response.json();
    // Confirms this web server actually writes to the demo emulator before proceeding.
    assert.equal((await cardDetail(result.id)).card.name, "HTTP Privado");
    assert.deepEqual(await (await post(cmd, auth)).json(), result);
    const share = { action: "share", id: result.id };
    assert.equal((await post(share)).status, 401);
    assert.equal((await post(share, await cookie("unapproved@example.test"))).status, 401);
    assert.equal((await post(share, auth, "https://evil.test")).status, 403);
    const shared = await post(share, auth);
    assert.equal(shared.status, 200);
    assert.match(shared.headers.get("cache-control")!, /no-store/);
    assert.deepEqual(await shared.json(), { token });
    const details = await (await post({ action: "detail", id: result.id }, auth)).json();
    assert.ok(!JSON.stringify(details).includes("sealedToken"));
    assert.ok(!JSON.stringify(details).includes(token));
    const publicResponse = await fetch(base + "/api/loyalty/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    assert.deepEqual(await publicResponse.json(), {
      firstName: "HTTP",
      balance: 0,
      target: 7,
    });
    for (const r of [
      response,
      publicResponse,
      await fetch(base + "/vip/" + token),
      await fetch(base + "/admin/loyalty"),
    ]) {
      assert.match(r.headers.get("cache-control")!, /no-store/);
      assert.equal(r.headers.get("x-robots-tag"), "noindex, nofollow");
      assert.equal(r.headers.get("referrer-policy"), "no-referrer");
    }
    const html = await (await fetch(base + "/vip/" + token)).text();
    assert.ok(!html.includes("600 999 123"));
    assert.ok(!html.includes("HTTP Privado"));
    const sitemap = await (await fetch(base + "/sitemap.xml")).text();
    assert.ok(!sitemap.includes("/vip/"));
    assert.ok(!sitemap.includes("/admin"));
    const deletion = {
      action: "delete", operationId: randomUUID(), id: result.id, revision: 0,
    };
    assert.equal((await post(deletion)).status, 401);
    assert.equal((await post(deletion, await cookie("unapproved@example.test"))).status, 401);
    assert.equal((await post(deletion, auth, "https://evil.test")).status, 403);
    assert.equal((await post(deletion, auth)).status, 200);
    assert.equal((await post(deletion, auth)).status, 200);
    assert.equal((await post({ action: "detail", id: result.id }, auth)).status, 404);
    const unavailable = await fetch(base + "/api/loyalty/card", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    assert.equal(unavailable.status, 404);
  },
);
