import { afterEach, describe, expect, it } from "vitest";

import { siteRobotsMetadata } from "../featureFlags";

describe("siteRobotsMetadata", () => {
  const original = process.env.SITE_ENV;

  afterEach(() => {
    if (original === undefined) delete process.env.SITE_ENV;
    else process.env.SITE_ENV = original;
  });

  it("indexe le site en prod", () => {
    delete process.env.SITE_ENV;
    expect(siteRobotsMetadata()).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    });
  });

  it("passe tout en noindex/nofollow en validation", () => {
    process.env.SITE_ENV = "validation";
    expect(siteRobotsMetadata()).toEqual({
      index: false,
      follow: false,
      nocache: true,
      googleBot: { index: false, follow: false, noimageindex: true },
    });
  });
});
