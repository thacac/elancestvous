import { describe, expect, it } from "vitest";
import { createReviewToken, verifyReviewToken } from "../reviewToken";

describe("reviewToken", () => {
  const secret = "test-secret";

  it("verifies a token created for the same slug and secret", () => {
    const token = createReviewToken("mon-article", secret);
    expect(verifyReviewToken("mon-article", token, secret)).toBe(true);
  });

  it("rejects a token created for a different slug", () => {
    const token = createReviewToken("mon-article", secret);
    expect(verifyReviewToken("un-autre-article", token, secret)).toBe(false);
  });

  it("rejects a token created with a different secret", () => {
    const token = createReviewToken("mon-article", secret);
    expect(verifyReviewToken("mon-article", token, "wrong-secret")).toBe(false);
  });

  it("rejects a malformed token without throwing", () => {
    expect(verifyReviewToken("mon-article", "not-a-valid-hex-token", secret)).toBe(false);
  });

  it("rejects an empty or missing token", () => {
    expect(verifyReviewToken("mon-article", "", secret)).toBe(false);
  });
});
