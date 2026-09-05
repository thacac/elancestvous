import nacl from "tweetnacl";
import { describe, expect, it } from "vitest";
import { verifyDiscordSignature } from "../discordSignature";

function makeKeyPair() {
  const keyPair = nacl.sign.keyPair();
  return {
    publicKeyHex: Buffer.from(keyPair.publicKey).toString("hex"),
    secretKey: keyPair.secretKey,
  };
}

function sign(secretKey: Uint8Array, timestamp: string, body: string): string {
  const message = new Uint8Array(Buffer.from(timestamp + body, "utf8"));
  const signature = nacl.sign.detached(message, secretKey);
  return Buffer.from(signature).toString("hex");
}

describe("verifyDiscordSignature", () => {
  it("accepts a correctly signed request", () => {
    const { publicKeyHex, secretKey } = makeKeyPair();
    const timestamp = "1234567890";
    const body = '{"type":1}';
    const signature = sign(secretKey, timestamp, body);

    expect(verifyDiscordSignature(body, signature, timestamp, publicKeyHex)).toBe(true);
  });

  it("rejects a signature for a different body (forged request)", () => {
    const { publicKeyHex, secretKey } = makeKeyPair();
    const timestamp = "1234567890";
    const signature = sign(secretKey, timestamp, '{"type":1}');

    expect(
      verifyDiscordSignature('{"type":3,"data":{"custom_id":"blog_approve:x"}}', signature, timestamp, publicKeyHex)
    ).toBe(false);
  });

  it("rejects a signature made with a different key", () => {
    const { secretKey } = makeKeyPair();
    const { publicKeyHex: wrongPublicKey } = makeKeyPair();
    const timestamp = "1234567890";
    const body = '{"type":1}';
    const signature = sign(secretKey, timestamp, body);

    expect(verifyDiscordSignature(body, signature, timestamp, wrongPublicKey)).toBe(false);
  });

  it("rejects malformed hex without throwing", () => {
    expect(verifyDiscordSignature("{}", "not-hex-zz", "123", "also-not-hex")).toBe(false);
  });

  it("rejects when signature or timestamp is missing", () => {
    const { publicKeyHex } = makeKeyPair();
    expect(verifyDiscordSignature("{}", null, "123", publicKeyHex)).toBe(false);
    expect(verifyDiscordSignature("{}", "abcd", null, publicKeyHex)).toBe(false);
  });
});
