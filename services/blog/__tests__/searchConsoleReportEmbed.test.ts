import { describe, expect, it } from "vitest";

import { renderSearchConsoleReportEmbed } from "../searchConsoleReportEmbed";

import type { SearchConsoleReport } from "../searchConsoleReport";

function baseReport(overrides: Partial<SearchConsoleReport> = {}): SearchConsoleReport {
  return {
    generatedAt: "2026-09-10T00:00:00.000Z",
    rangeDays: 90,
    siteUrl: "sc-domain:elancestvous.fr",
    articles: [],
    byPillar: [],
    ...overrides,
  };
}

describe("renderSearchConsoleReportEmbed", () => {
  it("titles the embed with the range in days", () => {
    const [embed] = renderSearchConsoleReportEmbed(baseReport());
    expect(embed.title).toContain("90");
  });

  it("adds one field per pillar with aggregated stats", () => {
    const report = baseReport({
      byPillar: [
        { pillar: "C", articleCount: 2, clicks: 15, impressions: 400, position: 15 },
      ],
    });
    const [embed] = renderSearchConsoleReportEmbed(report);
    const pillarField = embed.fields.find((f) => f.name.includes("Pilier C"));
    expect(pillarField).toBeDefined();
    expect(pillarField?.value).toContain("15"); // clicks
    expect(pillarField?.value).toContain("400"); // impressions
  });

  it("includes a per-article breakdown in a code block", () => {
    const report = baseReport({
      articles: [
        {
          slug: "mon-article",
          pillar: "C",
          tags: [],
          publishedAt: "2026-09-01",
          clicks: 4,
          impressions: 150,
          position: 10,
          topQueries: [],
          diagnostics: [],
          delta: null,
        },
      ],
    });
    const [embed] = renderSearchConsoleReportEmbed(report);
    const articlesField = embed.fields.find((f) => f.name.includes("Articles"));
    expect(articlesField?.value).toContain("```");
    expect(articlesField?.value).toContain("mon-article");
  });

  it("truncates the articles code block to Discord's 1024-char field limit, noting omitted rows", () => {
    const articles = Array.from({ length: 40 }, (_, i) => ({
      slug: `article-avec-un-slug-assez-long-numero-${i}`,
      pillar: null,
      tags: [],
      publishedAt: "2026-09-01",
      clicks: i,
      impressions: 100 - i,
      position: 10,
      topQueries: [],
      diagnostics: [],
      delta: null,
    }));
    const report = baseReport({ articles });
    const [embed] = renderSearchConsoleReportEmbed(report);
    const articlesField = embed.fields.find((f) => f.name.includes("Articles"));
    expect(articlesField).toBeDefined();
    expect(articlesField!.value.length).toBeLessThanOrEqual(1024);
    expect(articlesField!.value).toContain("```");
    expect(articlesField!.value.trim().endsWith("```")).toBe(true);
    expect(articlesField!.value).toMatch(/autres/);
  });

  it("adds a diagnostics field only when at least one article has a diagnostic", () => {
    const withDiagnostics = baseReport({
      articles: [
        {
          slug: "a",
          pillar: null,
          tags: [],
          publishedAt: "2026-09-01",
          clicks: 0,
          impressions: 0,
          position: 0,
          topQueries: [],
          diagnostics: ["ZERO_IMPRESSIONS"],
          delta: null,
        },
      ],
    });
    const [withField] = renderSearchConsoleReportEmbed(withDiagnostics);
    expect(withField.fields.some((f: { name: string }) => f.name.includes("À surveiller"))).toBe(true);

    const withoutDiagnostics = baseReport({
      articles: [
        {
          slug: "a",
          pillar: null,
          tags: [],
          publishedAt: "2026-09-01",
          clicks: 5,
          impressions: 100,
          position: 5,
          topQueries: [],
          diagnostics: [],
          delta: null,
        },
      ],
    });
    const [withoutField] = renderSearchConsoleReportEmbed(withoutDiagnostics);
    expect(withoutField.fields.some((f: { name: string }) => f.name.includes("À surveiller"))).toBe(false);
  });
});
