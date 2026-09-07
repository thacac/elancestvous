import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { getRelatedArticleLinks } from "../relatedArticles";

const FIXTURES = path.join(__dirname, "fixtures", "blog");
const PILLARS_DIR = path.join(FIXTURES, "pillars");
const CAP_DIR = path.join(FIXTURES, "pillars-cap");

// Pilier A du plan éditorial (services/blog/pillars.ts) — reste stable ici
// pour ne pas dépendre d'un import de PILLARS dans le test.
const TARGET_PAGE_A = "/particuliers/coaching-individuel";
const TARGET_PAGE_B = "/professionnels-etablissements-de-soins/coaching";

describe("getRelatedArticleLinks", () => {
  const original = process.env.BLOG_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.BLOG_ENABLED;
    else process.env.BLOG_ENABLED = original;
  });

  it("returns nothing while the blog is not public (BLOG_ENABLED unset)", () => {
    delete process.env.BLOG_ENABLED;
    expect(getRelatedArticleLinks(TARGET_PAGE_A, PILLARS_DIR)).toEqual([]);
  });

  it("returns the posts whose pillar targets this page, most recent first", () => {
    process.env.BLOG_ENABLED = "true";
    expect(getRelatedArticleLinks(TARGET_PAGE_A, PILLARS_DIR)).toEqual([
      { href: "/blog/pilier-a-recent", label: "Article pilier A le plus récent" },
      { href: "/blog/pilier-a-ancien", label: "Article pilier A le plus ancien" },
    ]);
  });

  it("excludes posts targeting a different service page", () => {
    process.env.BLOG_ENABLED = "true";
    const links = getRelatedArticleLinks(TARGET_PAGE_A, PILLARS_DIR);
    expect(links.some((l) => l.href === "/blog/pilier-b")).toBe(false);
  });

  it("returns an empty array for a page that isn't a known pillar target", () => {
    process.env.BLOG_ENABLED = "true";
    expect(getRelatedArticleLinks("/a-propos", PILLARS_DIR)).toEqual([]);
  });

  it("returns an empty array when no post targets this pillar yet", () => {
    process.env.BLOG_ENABLED = "true";
    expect(getRelatedArticleLinks(TARGET_PAGE_B, PILLARS_DIR)).toEqual([
      { href: "/blog/pilier-b", label: "Article pilier B" },
    ]);
    expect(
      getRelatedArticleLinks(
        "/professionnels-etablissements-de-soins/formations-rps-qvct",
        PILLARS_DIR
      )
    ).toEqual([]);
  });

  it("caps the number of links to avoid an ever-growing list", () => {
    process.env.BLOG_ENABLED = "true";
    const links = getRelatedArticleLinks(TARGET_PAGE_A, CAP_DIR);
    expect(links).toHaveLength(3);
    expect(links.map((l) => l.href)).toEqual([
      "/blog/article-4",
      "/blog/article-3",
      "/blog/article-2",
    ]);
  });
});
