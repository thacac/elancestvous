import { describe, expect, it } from "vitest";

import {
  aggregatePagePerformance,
  buildGscAuditReport,
  normalizePageUrl,
  parseRangeDays,
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

  // Search Console renvoie parfois des URLs avec ancre (liens « aller à ») :
  // ce sont les impressions de la page elle-même.
  it("drops the #fragment", () => {
    expect(normalizePageUrl("https://elancestvous.fr/coaching#modalites")).toBe(
      "https://elancestvous.fr/coaching"
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

  it("compares Google's canonical to the inspected URL when the page declares none", () => {
    const summary = summarizeInspection("https://elancestvous.fr/formations/x", {
      inspectionResult: {
        indexStatusResult: { verdict: "NEUTRAL", googleCanonical: "https://elancestvous.fr/formations" },
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
  // Les totaux viennent de la requête par page seule : la requête
  // page+query omet les requêtes anonymisées (rares), qui sous-estimeraient
  // les impressions — voire mettraient à 0 une page peu visitée.
  it("takes totals from page-level rows, not from the sum of query rows", () => {
    const [perf] = aggregatePagePerformance(
      [{ page: "https://elancestvous.fr/coaching", clicks: 2, impressions: 50, ctr: 0, position: 7 }],
      [row({ page: "https://elancestvous.fr/coaching", query: "a", clicks: 1, impressions: 10, position: 4 })]
    );
    expect(perf).toMatchObject({ clicks: 2, impressions: 50, position: 7 });
    expect(perf.topQueries).toEqual([{ query: "a", clicks: 1, impressions: 10, position: 4 }]);
  });

  it("merges page-level rows that normalize to the same URL (fragment, trailing slash)", () => {
    const perf = aggregatePagePerformance(
      [
        { page: "https://elancestvous.fr/coaching", clicks: 1, impressions: 10, ctr: 0, position: 4 },
        { page: "https://elancestvous.fr/coaching#modalites", clicks: 0, impressions: 30, ctr: 0, position: 12 },
      ],
      []
    );
    expect(perf).toEqual([
      { page: "https://elancestvous.fr/coaching", clicks: 1, impressions: 40, position: 10, topQueries: [] },
    ]);
  });

  it("falls back to query rows for a page missing from page-level rows", () => {
    const perf = aggregatePagePerformance([], [
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
    const [perf] = aggregatePagePerformance([], rows);
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

describe("buildGscAuditReport — sources en échec", () => {
  it("keeps the report and lists the data sources that failed", () => {
    const report = buildGscAuditReport({
      generatedAt: "2026-11-04T10:00:00.000Z",
      siteUrl: "sc-domain:elancestvous.fr",
      rangeDays: 90,
      sitemapUrls: [],
      inspections: [],
      rows: [],
      sitemaps: [],
      sourceErrors: ["sitemaps.list : 403 Forbidden"],
    });
    expect(report.sourceErrors).toEqual(["sitemaps.list : 403 Forbidden"]);
    expect(renderGscAuditMarkdown(report)).toContain("sitemaps.list : 403 Forbidden");
  });
});

describe("renderGscAuditMarkdown — cellules", () => {
  it("keeps a multi-line error message on a single table row", () => {
    const report = buildGscAuditReport({
      generatedAt: "2026-11-04T10:00:00.000Z",
      siteUrl: "sc-domain:elancestvous.fr",
      rangeDays: 90,
      sitemapUrls: ["https://elancestvous.fr/a"],
      inspections: [{ ...summarizeInspection("https://elancestvous.fr/a", {}), error: "ligne 1\nligne 2" }],
      rows: [],
      sitemaps: [],
    });
    const md = renderGscAuditMarkdown(report);
    expect(md).toContain("ERREUR : ligne 1 ligne 2");
  });
});

describe("parseRangeDays", () => {
  it("defaults to 90 when no value is given", () => {
    expect(parseRangeDays(undefined)).toBe(90);
    expect(parseRangeDays("")).toBe(90);
  });

  it("accepts an integer between 1 and 480", () => {
    expect(parseRangeDays("28")).toBe(28);
    expect(parseRangeDays("480")).toBe(480);
  });

  // L'API Search Analytics n'a que 16 mois d'historique ; une date de début
  // après la date de fin (valeur négative) la fait répondre 400.
  it.each(["-30", "0", "12.5", "abc", "481"])("rejects %s with a clear message", (value) => {
    expect(() => parseRangeDays(value)).toThrow(/entre 1 et 480/);
  });
});
