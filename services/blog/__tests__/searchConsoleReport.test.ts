import { describe, expect, it } from "vitest";

import type { PostMeta } from "@/lib/blog";

import { buildSearchConsoleReport } from "../searchConsoleReport";

import type { GscPageQueryRow } from "../searchConsoleReport";

function post(overrides: Partial<PostMeta>): PostMeta {
  return {
    title: "Titre",
    slug: "mon-article",
    description: "Description",
    excerpt: "Extrait",
    publishedAt: "2026-09-01",
    coverImage: "/og-banner.jpg",
    coverImageAlt: "Alt",
    tags: [],
    pillar: null,
    readingTime: "5 min de lecture",
    ...overrides,
  };
}

function row(overrides: Partial<GscPageQueryRow>): GscPageQueryRow {
  return {
    page: "https://elancestvous.fr/blog/mon-article",
    query: "une requête",
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    ...overrides,
  };
}

describe("buildSearchConsoleReport", () => {
  it("aggregates multiple query rows for the same article by slug", () => {
    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [
        row({ query: "qvct etablissement", clicks: 3, impressions: 100, ctr: 0.03, position: 8 }),
        row({ query: "qualite de vie au travail", clicks: 1, impressions: 50, ctr: 0.02, position: 15 }),
      ],
      posts: [post({ slug: "mon-article", pillar: "C", tags: ["QVCT"] })],
      previousReport: null,
    });

    expect(report.articles).toHaveLength(1);
    const article = report.articles[0];
    expect(article.slug).toBe("mon-article");
    expect(article.pillar).toBe("C");
    expect(article.clicks).toBe(4);
    expect(article.impressions).toBe(150);
    // Position moyenne pondérée par les impressions : (8*100 + 15*50) / 150
    expect(article.position).toBeCloseTo((8 * 100 + 15 * 50) / 150, 5);
    expect(article.topQueries[0].query).toBe("qvct etablissement");
  });

  it("ignores GSC rows for URLs that don't match a known published post", () => {
    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [
        row({ page: "https://elancestvous.fr/blog", impressions: 40 }),
        row({ page: "https://elancestvous.fr/blog/article-inconnu", impressions: 40 }),
      ],
      posts: [],
      previousReport: null,
    });

    expect(report.articles).toHaveLength(0);
  });

  it("includes every published post even with zero GSC rows", () => {
    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [],
      posts: [post({ slug: "mon-article" })],
      previousReport: null,
    });

    expect(report.articles).toHaveLength(1);
    expect(report.articles[0].impressions).toBe(0);
    expect(report.articles[0].diagnostics).toContain("ZERO_IMPRESSIONS");
  });

  it("flags LOW_CTR_TOP10 only when ranking in the top 10 with a low CTR", () => {
    const inTop10 = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [row({ impressions: 500, clicks: 2, ctr: 0.004, position: 6 })],
      posts: [post({ slug: "mon-article" })],
      previousReport: null,
    });
    expect(inTop10.articles[0].diagnostics).toContain("LOW_CTR_TOP10");

    const belowTop10 = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [row({ impressions: 500, clicks: 2, ctr: 0.004, position: 25 })],
      posts: [post({ slug: "mon-article" })],
      previousReport: null,
    });
    expect(belowTop10.articles[0].diagnostics).not.toContain("LOW_CTR_TOP10");
  });

  it("flags POOR_POSITION when impressions exist but ranking is beyond page 3", () => {
    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [row({ impressions: 200, clicks: 0, ctr: 0, position: 45 })],
      posts: [post({ slug: "mon-article" })],
      previousReport: null,
    });
    expect(report.articles[0].diagnostics).toContain("POOR_POSITION");
    expect(report.articles[0].diagnostics).not.toContain("ZERO_IMPRESSIONS");
  });

  it("aggregates by pillar, excluding posts without a declared pillar", () => {
    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [
        row({ page: "https://elancestvous.fr/blog/article-c1", impressions: 100, clicks: 5, position: 10 }),
        row({ page: "https://elancestvous.fr/blog/article-c2", impressions: 300, clicks: 10, position: 20 }),
        row({ page: "https://elancestvous.fr/blog/article-sans-pilier", impressions: 50, clicks: 1, position: 30 }),
      ],
      posts: [
        post({ slug: "article-c1", pillar: "C" }),
        post({ slug: "article-c2", pillar: "C" }),
        post({ slug: "article-sans-pilier", pillar: null }),
      ],
      previousReport: null,
    });

    expect(report.byPillar).toHaveLength(1);
    const pillarC = report.byPillar[0];
    expect(pillarC.pillar).toBe("C");
    expect(pillarC.articleCount).toBe(2);
    expect(pillarC.clicks).toBe(15);
    expect(pillarC.impressions).toBe(400);
  });

  it("computes deltas against the previous report for matching slugs", () => {
    const previousReport = buildSearchConsoleReport({
      generatedAt: "2026-08-01T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [row({ impressions: 100, clicks: 2, position: 20 })],
      posts: [post({ slug: "mon-article" })],
      previousReport: null,
    });

    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [row({ impressions: 150, clicks: 5, position: 12 })],
      posts: [post({ slug: "mon-article" })],
      previousReport,
    });

    expect(report.articles[0].delta).toEqual({
      clicks: 3,
      impressions: 50,
      position: 12 - 20,
    });
  });

  it("returns a null delta for an article absent from the previous report", () => {
    const report = buildSearchConsoleReport({
      generatedAt: "2026-09-10T00:00:00.000Z",
      rangeDays: 90,
      siteUrl: "sc-domain:elancestvous.fr",
      rows: [row({ impressions: 10 })],
      posts: [post({ slug: "mon-article" })],
      previousReport: null,
    });
    expect(report.articles[0].delta).toBeNull();
  });
});
