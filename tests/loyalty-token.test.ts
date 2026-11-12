import assert from "node:assert/strict";
import { test } from "node:test";
import { randomBytes, randomUUID } from "node:crypto";
import { openToken, sealToken } from "../src/lib/loyalty/token-vault";

test("encrypted links are bound to their card, authenticated and protected by the server secret", () => {
  const original = process.env.NEXTAUTH_SECRET;
  process.env.NEXTAUTH_SECRET = "test-only-server-secret-at-least-32-characters";
  try {
    const id = randomUUID();
    const token = randomBytes(32).toString("base64url");
    const sealed = sealToken(token, id);
    assert.equal(openToken(sealed, id), token);
    assert.ok(!sealed.includes(token));
    assert.notEqual(sealToken(token, id), sealed);
    assert.throws(() => openToken(sealed, randomUUID()));
    const tampered = Buffer.from(sealed.slice(3), "base64url");
    tampered[30] ^= 1;
    assert.throws(() => openToken("v1." + tampered.toString("base64url"), id));
    assert.throws(() => openToken("v2." + sealed.slice(3), id));
    process.env.NEXTAUTH_SECRET = "different-test-server-secret-at-least-32-characters";
    assert.throws(() => openToken(sealed, id));
    delete process.env.NEXTAUTH_SECRET;
    assert.throws(() => sealToken(token, id));
  } finally {
    if (original === undefined) delete process.env.NEXTAUTH_SECRET;
    else process.env.NEXTAUTH_SECRET = original;
  }
});
