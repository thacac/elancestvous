import nacl from "tweetnacl";

/**
 * Vérifie qu'une requête d'interaction Discord (webhook) est bien signée par
 * Discord — protection centrale de app/api/discord/interactions/route.ts.
 * Le corps DOIT être le texte brut de la requête, jamais re-sérialisé après
 * un JSON.parse (ça casserait silencieusement la vérification).
 */
export function verifyDiscordSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  publicKey: string
): boolean {
  if (!signature || !timestamp) return false;

  try {
    // tweetnacl requires plain Uint8Array instances — a Node Buffer (even
    // though it extends Uint8Array) fails its internal type check.
    const message = new Uint8Array(Buffer.from(timestamp + rawBody, "utf8"));
    const signatureBytes = new Uint8Array(Buffer.from(signature, "hex"));
    const publicKeyBytes = new Uint8Array(Buffer.from(publicKey, "hex"));
    if (signatureBytes.length !== 64 || publicKeyBytes.length !== 32) return false;
    return nacl.sign.detached.verify(message, signatureBytes, publicKeyBytes);
  } catch {
    return false;
  }
}
