import { createHash, randomUUID } from "node:crypto";
import {
  FieldPath,
  type DocumentData,
  type Query,
} from "firebase-admin/firestore";
import { loyaltyDb } from "./db";
import {
  TARGET,
  LoyaltyError,
  normalizeName,
  normalizePhone,
  type Card,
  parseCommand,
  validToken,
  validId,
  type PublicCard,
  type Activity,
} from "./types";
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const fingerprint = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");
const fail = (status: number, message: string): never => {
  throw new LoyaltyError(status, message);
};
function asCard(id: string, d: DocumentData): Card {
  return {
    id,
    name: d.name,
    phone: d.phone,
    active: d.active,
    balance: d.balance,
    revision: d.revision,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    lastBalanceAction: d.lastBalanceAction,
  };
}
export async function publicCard(token: unknown): Promise<PublicCard> {
  if (!validToken(token))
    return fail(404, "Tarjeta no disponible. Pide ayuda al personal.");
  const db = loyaltyDb();
  // Transaction keeps token replacement/deactivation consistent with public reads.
  return db.runTransaction(
    async (tx) => {
      const index = await tx.get(
        db.collection("loyaltyTokens").doc(hashToken(token)),
      );
      if (!index.exists)
        return fail(404, "Tarjeta no disponible. Pide ayuda al personal.");
      const card = await tx.get(
        db.collection("loyaltyCards").doc(index.get("cardId")),
      );
      if (
        !card.exists ||
        !card.get("active") ||
        card.get("tokenHash") !== hashToken(token)
      )
        return fail(404, "Tarjeta no disponible. Pide ayuda al personal.");
      return {
        firstName: String(card.get("name")).trim().split(/\s+/)[0],
        balance: card.get("balance"),
        target: TARGET,
      };
    },
    { readOnly: true },
  );
}
export async function cardDetail(id?: unknown, token?: unknown) {
  const db = loyaltyDb();
  let tokenHash: string | undefined;
  if (token !== undefined) {
    if (!validToken(token)) return fail(404, "Tarjeta no encontrada.");
    tokenHash = hashToken(token);
    const index = await db.collection("loyaltyTokens").doc(tokenHash).get();
    id = index.get("cardId");
  }
  if (!validId(id)) return fail(404, "Tarjeta no encontrada.");
  const ref = db.collection("loyaltyCards").doc(id);
  const snap = await ref.get();
  if (!snap.exists || (tokenHash && snap.get("tokenHash") !== tokenHash))
    return fail(404, "Tarjeta no encontrada.");
  const history = await ref
    .collection("activity")
    .orderBy("at", "desc")
    .limit(20)
    .get();
  return {
    card: asCard(id, snap.data()!),
    activity: history.docs.map((d) => ({ id: d.id, ...d.data() }) as Activity),
  };
}
export async function listCards(search: unknown = "", cursor: unknown = "") {
  const db = loyaltyDb();
  if (
    typeof search !== "string" ||
    typeof cursor !== "string" ||
    search.length > 100 ||
    (cursor && !validId(cursor))
  )
    return fail(400, "Búsqueda no válida.");
  let query: Query = db.collection("loyaltyCards");
  if (search.trim()) {
    const phone = /^[+\d\s().-]+$/.test(search);
    const value = phone ? normalizePhone(search) : normalizeName(search);
    if (!value) return fail(400, "Búsqueda no válida.");
    query = query
      .orderBy(phone ? "phoneSearch" : "nameSearch")
      .startAt(value)
      .endAt(value + "\uf8ff");
  } else {
    query = query.orderBy(FieldPath.documentId());
    if (cursor) query = query.startAfter(cursor);
  }
  const docs = (await query.limit(26).get()).docs;
  return {
    cards: docs.slice(0, 25).map((d) => asCard(d.id, d.data())),
    next: !search.trim() && docs.length > 25 ? docs[24].id : null,
    truncated: !!search.trim() && docs.length > 25,
  };
}
export async function mutateCard(value: unknown, actor: string) {
  const input = parseCommand(value);
  const { action, operationId, id, revision } = input;
  const db = loyaltyDb();
  const cardId = action === "create" ? randomUUID() : id!;
  const ref = db.collection("loyaltyCards").doc(cardId);
  const operation = db.collection("loyaltyOperations").doc(operationId);
  const signature = fingerprint({ input, actor });
  return db.runTransaction(async (tx) => {
    const receipt = await tx.get(operation);
    if (receipt.exists) {
      if (receipt.get("signature") !== signature)
        return fail(409, "El identificador de operación ya está en uso.");
      return receipt.get("result") as { id: string; revision: number };
    }
    const snapshot = await tx.get(ref);
    const before = snapshot.data();
    if (action !== "create" && !before)
      return fail(404, "Tarjeta no encontrada.");
    if (before && before.revision !== revision)
      return fail(409, "La tarjeta ha cambiado. Actualiza antes de continuar.");
    const at = new Date().toISOString();
    const next: DocumentData = before
      ? { ...before, revision: before.revision + 1, updatedAt: at }
      : {
          name: "",
          phone: "",
          active: true,
          balance: 0,
          revision: 0,
          createdAt: at,
          updatedAt: at,
          lastBalanceAction: "",
        };
    let tokenRef;
    if (action === "create" || action === "replace") {
      tokenRef = db.collection("loyaltyTokens").doc(hashToken(input.token!));
      if ((await tx.get(tokenRef)).exists)
        return fail(409, "El enlace ya existe.");
      next.tokenHash = tokenRef.id;
    }
    if (["stamp", "redeem", "undo"].includes(action) && !next.active)
      return fail(409, "Esta tarjeta está desactivada.");
    if (action === "stamp") {
      if (next.balance >= TARGET)
        return fail(409, "Canjea primero la bebida gratis.");
      next.balance++;
    }
    if (action === "redeem") {
      if (next.balance !== TARGET)
        return fail(409, "Todavía no hay una bebida disponible.");
      next.balance = 0;
    }
    if (action === "undo") {
      if (next.lastBalanceAction !== "stamp" || next.balance < 1)
        return fail(409, "No se puede deshacer ese sello.");
      next.balance--;
    }
    if (["stamp", "redeem", "undo"].includes(action)) {
      next.lastBalanceAction = action;
    }
    if (action === "create" || action === "update") {
      next.name = input.name!.trim();
      next.phone = input.phone!.trim();
      next.nameSearch = normalizeName(next.name);
      next.phoneSearch = normalizePhone(next.phone);
      if (action === "update") next.active = input.active;
    }
    if (action === "replace")
      tx.delete(db.collection("loyaltyTokens").doc(before!.tokenHash));
    if (tokenRef) tx.set(tokenRef, { cardId });
    tx.set(ref, next);
    tx.set(ref.collection("activity").doc(operationId), {
      action,
      actor,
      at,
      before: before?.balance ?? 0,
      after: next.balance,
    });
    const result = { id: cardId, revision: next.revision as number };
    tx.set(operation, { signature, result, at });
    return result;
  });
}
