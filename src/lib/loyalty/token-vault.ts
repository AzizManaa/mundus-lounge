import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from "node:crypto";
import { LoyaltyError } from "./types";

function key() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new LoyaltyError(503, "No se pudo proteger el enlace de la tarjeta.");
  return Buffer.from(hkdfSync("sha256", secret, "mundus-loyalty", "card-token-v1", 32));
}

export function sealToken(token: string, cardId: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(cardId));
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return "v1." + Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function openToken(value: string, cardId: string): string {
  if (!/^v1\.[A-Za-z0-9_-]{95}$/.test(value)) throw new Error("Invalid sealed token");
  const data = Buffer.from(value.slice(3), "base64url");
  const decipher = createDecipheriv("aes-256-gcm", key(), data.subarray(0, 12));
  decipher.setAAD(Buffer.from(cardId));
  decipher.setAuthTag(data.subarray(12, 28));
  return Buffer.concat([decipher.update(data.subarray(28)), decipher.final()]).toString("utf8");
}
