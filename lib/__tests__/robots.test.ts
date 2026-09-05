import { afterEach, describe, expect, it } from "vitest";
import robots from "../../app/robots";

describe("robots", () => {
  const original = process.env.BLOG_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.BLOG_ENABLED;
    else process.env.BLOG_ENABLED = original;
  });

  it("disallows /blog while the blog is not public", () => {
    delete process.env.BLOG_ENABLED;
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.disallow).toContain("/blog");
  });

  it("does not disallow /blog once the blog is public", () => {
    process.env.BLOG_ENABLED = "true";
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.disallow).not.toContain("/blog");
  });
});
