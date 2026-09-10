import { describe, expect, it } from "vitest";

import { encodeToBase64, requireFilePathArg } from "../encodeServiceAccountJson";

describe("requireFilePathArg", () => {
  it("returns the third argv entry (the file path passed on the command line)", () => {
    expect(requireFilePathArg(["node", "encodeServiceAccountJson.ts", "/tmp/cle.json"])).toBe(
      "/tmp/cle.json"
    );
  });

  it("throws a usage message when no path is given", () => {
    expect(() => requireFilePathArg(["node", "encodeServiceAccountJson.ts"])).toThrow(
      /yarn blog:encode-service-account/
    );
  });
});

describe("encodeToBase64", () => {
  it("round-trips a service-account-shaped JSON (embedded newlines and control-like bytes in the PEM key) losslessly", () => {
    const original = JSON.stringify({
      client_email: "robot@example.iam.gserviceaccount.com",
      private_key: "-----BEGIN PRIVATE KEY-----\nABC\r\nDEF\t\n-----END PRIVATE KEY-----\n",
    });
    const buffer = Buffer.from(original, "utf8");

    const encoded = encodeToBase64(buffer);

    // Regression guard : si l'implémentation utilisait "utf8"/"binary" au
    // lieu de "base64", la sortie contiendrait les retours à la ligne bruts
    // (le tout premier bug rencontré en configurant ce secret) au lieu d'un
    // alphabet restreint sans caractère de contrôle.
    expect(encoded).not.toMatch(/[\n\r\t]/);
    expect(Buffer.from(encoded, "base64").toString("utf8")).toBe(original);
  });
});
