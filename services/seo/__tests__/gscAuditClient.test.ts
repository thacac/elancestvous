import { describe, expect, it, vi } from "vitest";

import { createGscAuditClient } from "../gscAuditClient";

function client(overrides: Partial<Parameters<typeof createGscAuditClient>[0]> = {}) {
  return createGscAuditClient({
    serviceAccountJson: "{}",
    siteUrl: "sc-domain:elancestvous.fr",
    queryImpl: vi.fn().mockResolvedValue({ data: {} }),
    inspectImpl: vi.fn().mockResolvedValue({ data: {} }),
    sitemapsListImpl: vi.fn().mockResolvedValue({ data: {} }),
    ...overrides,
  });
}

describe("createGscAuditClient.fetchAllPageQueryRows", () => {
  it("queries page+query over the whole site (no /blog/ filter) and paginates", async () => {
    const full = Array.from({ length: 2 }, (_, i) => ({
      keys: [`https://elancestvous.fr/p${i}`, `q${i}`],
      clicks: 0,
      impressions: 1,
      ctr: 0,
      position: 3,
    }));
    const queryImpl = vi
      .fn()
      .mockResolvedValueOnce({ data: { rows: full } })
      .mockResolvedValueOnce({ data: { rows: [full[0]] } });

    const rows = await client({ queryImpl, rowLimit: 2 }).fetchAllPageQueryRows(90);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toEqual({
      page: "https://elancestvous.fr/p0",
      query: "q0",
      clicks: 0,
      impressions: 1,
      ctr: 0,
      position: 3,
    });
    const [first] = queryImpl.mock.calls[0];
    expect(first.siteUrl).toBe("sc-domain:elancestvous.fr");
    expect(first.requestBody.dimensions).toEqual(["page", "query"]);
    expect(first.requestBody.dimensionFilterGroups).toBeUndefined();
    expect(queryImpl.mock.calls[1][0].requestBody.startRow).toBe(2);
  });
});

describe("createGscAuditClient.fetchPageTotals", () => {
  it("queries the page dimension only, so anonymized queries are counted", async () => {
    const queryImpl = vi.fn().mockResolvedValue({
      data: { rows: [{ keys: ["https://elancestvous.fr/"], clicks: 2, impressions: 40, ctr: 0.05, position: 6 }] },
    });

    const rows = await client({ queryImpl }).fetchPageTotals(90);

    expect(rows).toEqual([
      { page: "https://elancestvous.fr/", clicks: 2, impressions: 40, ctr: 0.05, position: 6 },
    ]);
    expect(queryImpl.mock.calls[0][0].requestBody.dimensions).toEqual(["page"]);
  });
});

describe("createGscAuditClient.inspectUrls", () => {
  it("inspects each URL sequentially against the property and summarizes it", async () => {
    const inspectImpl = vi.fn().mockResolvedValue({
      data: {
        inspectionResult: {
          indexStatusResult: { verdict: "PASS", coverageState: "Submitted and indexed" },
        },
      },
    });

    const results = await client({ inspectImpl }).inspectUrls([
      "https://elancestvous.fr",
      "https://elancestvous.fr/a-propos",
    ]);

    expect(results.map((r) => [r.url, r.verdict])).toEqual([
      ["https://elancestvous.fr", "PASS"],
      ["https://elancestvous.fr/a-propos", "PASS"],
    ]);
    expect(inspectImpl).toHaveBeenCalledWith({
      requestBody: {
        inspectionUrl: "https://elancestvous.fr",
        siteUrl: "sc-domain:elancestvous.fr",
        languageCode: "fr-FR",
      },
    });
  });

  it("records an error for a failed inspection instead of aborting the whole audit", async () => {
    const inspectImpl = vi
      .fn()
      .mockRejectedValueOnce(new Error("Quota exceeded"))
      .mockResolvedValueOnce({
        data: { inspectionResult: { indexStatusResult: { verdict: "PASS" } } },
      });

    const results = await client({ inspectImpl }).inspectUrls([
      "https://elancestvous.fr/a",
      "https://elancestvous.fr/b",
    ]);

    expect(results[0]).toMatchObject({ url: "https://elancestvous.fr/a", error: "Quota exceeded" });
    expect(results[1]).toMatchObject({ url: "https://elancestvous.fr/b", verdict: "PASS", error: null });
  });
});

describe("createGscAuditClient.listSitemaps", () => {
  it("maps submitted sitemaps with their last download date and error counts", async () => {
    const sitemapsListImpl = vi.fn().mockResolvedValue({
      data: {
        sitemap: [
          {
            path: "https://elancestvous.fr/sitemap.xml",
            lastSubmitted: "2026-09-01T00:00:00Z",
            lastDownloaded: "2026-11-01T00:00:00Z",
            isPending: false,
            errors: "0",
            warnings: "2",
          },
        ],
      },
    });

    const sitemaps = await client({ sitemapsListImpl }).listSitemaps();

    expect(sitemapsListImpl).toHaveBeenCalledWith({ siteUrl: "sc-domain:elancestvous.fr" });
    expect(sitemaps).toEqual([
      {
        path: "https://elancestvous.fr/sitemap.xml",
        lastSubmitted: "2026-09-01T00:00:00Z",
        lastDownloaded: "2026-11-01T00:00:00Z",
        isPending: false,
        errors: 0,
        warnings: 2,
      },
    ]);
  });

  it("returns an empty list when no sitemap was submitted", async () => {
    expect(await client().listSitemaps()).toEqual([]);
  });
});
