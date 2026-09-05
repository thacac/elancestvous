import { describe, expect, it } from "vitest";

// Next.js metadata resolution does NOT deep-merge `openGraph`/`twitter`
// objects across route segments: as soon as a page defines its own
// `openGraph`, the entire object from the root layout (including its
// `images`) is replaced, not merged. Every page below re-declares
// `openGraph` for its own title/description/url but forgot to re-declare
// `images`, so none of these pages actually ship an og:image — only
// `mentions-legales` (which never overrides `openGraph` at all) keeps the
// root's image, but for the same reason also keeps the root's `url`
// (the homepage) instead of its own.
const EXPECTED_OG_IMAGE = {
  url: "/og-banner.jpg",
  width: 1200,
  height: 630,
};

describe("openGraph images survive per-page metadata overrides", () => {
  it.each([
    ["app/page.tsx (home)", () => import("../page")],
    ["app/a-propos/page.tsx", () => import("../a-propos/page")],
    ["app/contact/page.tsx", () => import("../contact/page")],
    [
      "app/particuliers/coaching-individuel/page.tsx",
      () => import("../particuliers/coaching-individuel/page"),
    ],
    [
      "app/professionnels-etablissements-de-soins/coaching/page.tsx",
      () => import("../professionnels-etablissements-de-soins/coaching/page"),
    ],
    [
      "app/professionnels-etablissements-de-soins/formations-rps-qvct/page.tsx",
      () =>
        import(
          "../professionnels-etablissements-de-soins/formations-rps-qvct/page"
        ),
    ],
    [
      "app/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles/page.tsx",
      () =>
        import(
          "../professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles/page"
        ),
    ],
    ["app/blog/page.tsx", () => import("../blog/page")],
  ])("%s keeps a real openGraph.images entry", async (_label, load) => {
    const { metadata } = await load();
    const images = metadata.openGraph?.images;
    expect(images).toBeDefined();
    const first = Array.isArray(images) ? images[0] : images;
    expect(first).toMatchObject(EXPECTED_OG_IMAGE);
  });

  it("app/page.tsx (home) keeps a real twitter.images entry", async () => {
    const { metadata } = await import("../page");
    expect(metadata.twitter?.images).toBeDefined();
  });

  it("app/mentions-legales/page.tsx points og:url at itself, not the homepage", async () => {
    const { metadata } = await import("../mentions-legales/page");
    expect(metadata.openGraph?.url).toBe(
      "https://elancestvous.fr/mentions-legales",
    );
  });
});
