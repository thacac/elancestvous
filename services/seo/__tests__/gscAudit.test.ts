import { describe, expect, it } from "vitest";

import {
  aggregatePagePerformance,
  buildGscAuditReport,
  normalizePageUrl,
  parseSitemapUrls,
  renderGscAuditMarkdown,
  summarizeInspection,
} from "../gscAudit";

import type { GscPageQueryRow } from "@/services/blog/searchConsoleReport";

function row(overrides: Partial<GscPageQueryRow>): GscPageQueryRow {
  return {
    page: "https://elancestvous.fr/coaching",
    query: "coaching toulouse",
    clicks: 0,
    impressions: 0,
    ctr: 0,
    position: 0,
    ...overrides,
  };
}

describe("parseSitemapUrls", () => {
  it("extracts every <loc> of a sitemap, in order", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>https://elancestvous.fr</loc><lastmod>2026-11-04</lastmod></url>
<url>
  <loc>https://elancestvous.fr/a-propos</loc>
</url>
</urlset>`;
    expect(parseSitemapUrls(xml)).toEqual([
      "https://elancestvous.fr",
      "https://elancestvous.fr/a-propos",
    ]);
  });

  it("decodes XML entities in URLs", () => {
    const xml = "<urlset><url><loc>https://elancestvous.fr/a?b=1&amp;c=2</loc></url></urlset>";
    expect(parseSitemapUrls(xml)).toEqual(["https://elancestvous.fr/a?b=1&c=2"]);
  });
});

describe("normalizePageUrl", () => {
  // Le sitemap déclare l'accueil sans slash final, Search Console le renvoie
  // avec : sans normalisation, l'accueil serait compté comme sans impression.
  it("treats the root URL with and without trailing slash as the same page", () => {
    expect(normalizePageUrl("https://elancestvous.fr/")).toBe(
      normalizePageUrl("https://elancestvous.fr")
    );
  });

  it("strips a trailing slash on deeper paths too", () => {
    expect(normalizePageUrl("https://elancestvous.fr/coaching/")).toBe(
      "https://elancestvous.fr/coaching"
    );
  });
});

describe("summarizeInspection", () => {
  it("keeps the index status fields useful for diagnosis", () => {
    const summary = summarizeInspection("https://elancestvous.fr/blog/article", {
      inspectionResult: {
        indexStatusResult: {
          verdict: "NEUTRAL",
          coverageState: "Crawled - currently not indexed",
          robotsTxtState: "ALLOWED",
          indexingState: "INDEXING_ALLOWED",
          pageFetchState: "SUCCESSFUL",
          lastCrawlTime: "2026-10-20T10:00:00Z",
          crawledAs: "MOBILE",
          googleCanonical: "https://elancestvous.fr/blog/article",
          userCanonical: "https://elancestvous.fr/blog/article",
          sitemap: ["https://elancestvous.fr/sitemap.xml"],
          referringUrls: ["https://elancestvous.fr/blog"],
        },
      },
    });

    expect(summary).toEqual({
      url: "https://elancestvous.fr/blog/article",
      verdict: "NEUTRAL",
      coverageState: "Crawled - currently not indexed",
      robotsTxtState: "ALLOWED",
      indexingState: "INDEXING_ALLOWED",
      pageFetchState: "SUCCESSFUL",
      lastCrawlTime: "2026-10-20T10:00:00Z",
      crawledAs: "MOBILE",
      googleCanonical: "https://elancestvous.fr/blog/article",
      userCanonical: "https://elancestvous.fr/blog/article",
      canonicalMismatch: false,
      inSitemap: true,
      referringUrls: ["https://elancestvous.fr/blog"],
      error: null,
    });
  });

  it("flags a canonical mismatch when Google picked another URL than ours", () => {
    const summary = summarizeInspection("https://elancestvous.fr/formations/x", {
      inspectionResult: {
        indexStatusResult: {
          verdict: "NEUTRAL",
          googleCanonical: "https://elancestvous.fr/",
          userCanonical: "https://elancestvous.fr/formations/x",
        },
      },
    });
    expect(summary.canonicalMismatch).toBe(true);
  });

  it("does not flag a mismatch when Google has not chosen a canonical yet", () => {
    const summary = summarizeInspection("https://elancestvous.fr/formations/x", {
      inspectionResult: {
        indexStatusResult: {
          verdict: "NEUTRAL",
          coverageState: "URL is unknown to Google",
          userCanonical: "https://elancestvous.fr/formations/x",
        },
      },
    });
    expect(summary.canonicalMismatch).toBe(false);
    expect(summary.inSitemap).toBe(false);
    expect(summary.googleCanonical).toBeNull();
  });
});

describe("aggregatePagePerformance", () => {
  it("sums clicks/impressions per page and weights position by impressions", () => {
    const perf = aggregatePagePerformance([
      row({ page: "https://elancestvous.fr/coaching", query: "a", clicks: 1, impressions: 10, position: 4 }),
      row({ page: "https://elancestvous.fr/coaching", query: "b", clicks: 0, impressions: 30, position: 12 }),
      row({ page: "https://elancestvous.fr/", query: "c", clicks: 2, impressions: 5, position: 1 }),
    ]);

    expect(perf).toEqual([
      {
        page: "https://elancestvous.fr/coaching",
        clicks: 1,
        impressions: 40,
        position: 10,
        topQueries: [
          { query: "b", clicks: 0, impressions: 30, position: 12 },
          { query: "a", clicks: 1, impressions: 10, position: 4 },
        ],
      },
      {
        page: "https://elancestvous.fr",
        clicks: 2,
        impressions: 5,
        position: 1,
        topQueries: [{ query: "c", clicks: 2, impressions: 5, position: 1 }],
      },
    ]);
  });

  it("keeps only the 5 queries with the most impressions per page", () => {
    const rows = Array.from({ length: 7 }, (_, i) =>
      row({ query: `q${i}`, impressions: i + 1, position: 5 })
    );
    const [perf] = aggregatePagePerformance(rows);
    expect(perf.topQueries.map((q) => q.query)).toEqual(["q6", "q5", "q4", "q3", "q2"]);
  });
});

describe("buildGscAuditReport", () => {
  const indexed = summarizeInspection("https://elancestvous.fr", {
    inspectionResult: { indexStatusResult: { verdict: "PASS", coverageState: "Submitted and indexed" } },
  });
  const notIndexed = summarizeInspection("https://elancestvous.fr/blog/article", {
    inspectionResult: {
      indexStatusResult: { verdict: "NEUTRAL", coverageState: "Discovered - currently not indexed" },
    },
  });

  it("lists sitemap URLs that are not indexed and those without impressions", () => {
    const report = buildGscAuditReport({
      generatedAt: "2026-11-04T10:00:00.000Z",
      siteUrl: "sc-domain:elancestvous.fr",
      rangeDays: 90,
      sitemapUrls: ["https://elancestvous.fr", "https://elancestvous.fr/blog/article"],
      inspections: [indexed, notIndexed],
      rows: [row({ page: "https://elancestvous.fr/", query: "élan c'est vous", impressions: 12, clicks: 3, position: 2 })],
      sitemaps: [],
    });

    expect(report.summary).toEqual({
      sitemapUrlCount: 2,
      indexedCount: 1,
      notIndexed: ["https://elancestvous.fr/blog/article"],
      canonicalMismatches: [],
      blockedByRobots: [],
      inspectionErrors: [],
      withoutImpressions: ["https://elancestvous.fr/blog/article"],
      pagesOutsideSitemap: [],
    });
  });

  it("reports pages that get impressions but are not in the sitemap (old URLs, www…)", () => {
    const report = buildGscAuditReport({
      generatedAt: "2026-11-04T10:00:00.000Z",
      siteUrl: "sc-domain:elancestvous.fr",
      rangeDays: 90,
      sitemapUrls: ["https://elancestvous.fr"],
      inspections: [indexed],
      rows: [
        row({ page: "https://elancestvous.fr/", impressions: 3 }),
        row({ page: "https://elancestvous.fr/professionnels-etablissements-de-soins/coaching", impressions: 8 }),
      ],
      sitemaps: [],
    });

    expect(report.summary.pagesOutsideSitemap).toEqual([
      "https://elancestvous.fr/professionnels-etablissements-de-soins/coaching",
    ]);
  });

  it("lists robots-blocked URLs and inspection errors separately", () => {
    const blocked = summarizeInspection("https://elancestvous.fr/a", {
      inspectionResult: { indexStatusResult: { verdict: "FAIL", robotsTxtState: "DISALLOWED" } },
    });
    const failed = { ...summarizeInspection("https://elancestvous.fr/b", {}), error: "quota" };

    const report = buildGscAuditReport({
      generatedAt: "2026-11-04T10:00:00.000Z",
      siteUrl: "sc-domain:elancestvous.fr",
      rangeDays: 90,
      sitemapUrls: ["https://elancestvous.fr/a", "https://elancestvous.fr/b"],
      inspections: [blocked, failed],
      rows: [],
      sitemaps: [],
    });

    expect(report.summary.blockedByRobots).toEqual(["https://elancestvous.fr/a"]);
    expect(report.summary.inspectionErrors).toEqual(["https://elancestvous.fr/b"]);
    // Une inspection en échec ne dit rien de l'indexation : ne pas la
    // compter comme « non indexée ».
    expect(report.summary.notIndexed).toEqual(["https://elancestvous.fr/a"]);
  });
});

describe("renderGscAuditMarkdown", () => {
  it("renders a readable summary with one row per sitemap URL", () => {
    const report = buildGscAuditReport({
      generatedAt: "2026-11-04T10:00:00.000Z",
      siteUrl: "sc-domain:elancestvous.fr",
      rangeDays: 90,
      sitemapUrls: ["https://elancestvous.fr/blog/article"],
      inspections: [
        summarizeInspection("https://elancestvous.fr/blog/article", {
          inspectionResult: {
            indexStatusResult: {
              verdict: "NEUTRAL",
              coverageState: "Discovered - currently not indexed",
              lastCrawlTime: "2026-10-20T10:00:00Z",
            },
          },
        }),
      ],
      rows: [],
      sitemaps: [
        {
          path: "https://elancestvous.fr/sitemap.xml",
          lastSubmitted: "2026-09-01T00:00:00Z",
          lastDownloaded: "2026-11-01T00:00:00Z",
          isPending: false,
          errors: 0,
          warnings: 0,
        },
      ],
    });

    const md = renderGscAuditMarkdown(report);
    expect(md).toContain("# Audit Search Console");
    expect(md).toContain("/blog/article");
    expect(md).toContain("Discovered - currently not indexed");
    expect(md).toContain("2026-10-20");
    expect(md).toContain("https://elancestvous.fr/sitemap.xml");
    expect(md).toMatch(/Indexées\s*:\s*0\s*\/\s*1/);
  });
});
