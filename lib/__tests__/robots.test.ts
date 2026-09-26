import { afterEach, describe, expect, it } from "vitest";

import robots from "../../app/robots";

describe("robots", () => {
  const original = process.env.BLOG_ENABLED;
  const originalSiteEnv = process.env.SITE_ENV;

  afterEach(() => {
    if (original === undefined) delete process.env.BLOG_ENABLED;
    else process.env.BLOG_ENABLED = original;
    if (originalSiteEnv === undefined) delete process.env.SITE_ENV;
    else process.env.SITE_ENV = originalSiteEnv;
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

  it("interdit tout le site (Disallow: /) en environnement de validation", () => {
    process.env.SITE_ENV = "validation";
    process.env.BLOG_ENABLED = "true";
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.userAgent).toBe("*");
    expect(rule.disallow).toBe("/");
    expect(rule.allow).toBeUndefined();
    expect(result.sitemap).toBeUndefined();
  });

  it("garde le robots.txt de prod quand SITE_ENV n'est pas 'validation'", () => {
    delete process.env.SITE_ENV;
    const result = robots();
    const rule = Array.isArray(result.rules) ? result.rules[0] : result.rules;
    expect(rule.allow).toBe("/");
    expect(result.sitemap).toBe("https://elancestvous.fr/sitemap.xml");
  });
});
