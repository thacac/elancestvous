import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton HMAC-SHA256 protégeant les liens de prévisualisation d'un brouillon
 * (app/blog-review/[slug]) — le contenu n'est pas encore relu, il ne doit
 * être accessible qu'à qui détient ce lien.
 */
export function createReviewToken(slug: string, secret: string): string {
  return createHmac("sha256", secret).update(slug).digest("hex");
}

export function verifyReviewToken(slug: string, token: string, secret: string): boolean {
  const expected = Buffer.from(createReviewToken(slug, secret), "hex");
  // Buffer.from(str, "hex") never throws — it silently truncates at the first
  // invalid character, which the length check below already catches.
  const actual = Buffer.from(token, "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
