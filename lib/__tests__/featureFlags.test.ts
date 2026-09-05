import { afterEach, describe, expect, it } from "vitest";
import { isBlogPublic } from "../featureFlags";

describe("isBlogPublic", () => {
  const original = process.env.BLOG_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.BLOG_ENABLED;
    else process.env.BLOG_ENABLED = original;
  });

  it("is disabled by default (unset)", () => {
    delete process.env.BLOG_ENABLED;
    expect(isBlogPublic()).toBe(false);
  });

  it("is disabled for any value other than the literal string 'true'", () => {
    process.env.BLOG_ENABLED = "1";
    expect(isBlogPublic()).toBe(false);
    process.env.BLOG_ENABLED = "TRUE";
    expect(isBlogPublic()).toBe(false);
  });

  it("is enabled when explicitly set to 'true'", () => {
    process.env.BLOG_ENABLED = "true";
    expect(isBlogPublic()).toBe(true);
  });
});
