import { describe, expect, it, vi } from "vitest";

import { createGoogleSearchConsoleClient } from "../googleSearchConsoleClient";

describe("createGoogleSearchConsoleClient", () => {
  it("queries page+query dimensions filtered to /blog/ and maps rows", async () => {
    const queryImpl = vi.fn().mockResolvedValue({
      data: {
        rows: [
          {
            keys: ["https://elancestvous.fr/blog/mon-article", "qvct etablissement"],
            clicks: 3,
            impressions: 100,
            ctr: 0.03,
            position: 8,
          },
        ],
      },
    });

    const client = createGoogleSearchConsoleClient({
      serviceAccountJson: "{}",
      siteUrl: "sc-domain:elancestvous.fr",
      queryImpl,
    });

    const rows = await client.fetchBlogPageQueryRows(90);

    expect(rows).toEqual([
      {
        page: "https://elancestvous.fr/blog/mon-article",
        query: "qvct etablissement",
        clicks: 3,
        impressions: 100,
        ctr: 0.03,
        position: 8,
      },
    ]);

    const [callArgs] = queryImpl.mock.calls[0];
    expect(callArgs.siteUrl).toBe("sc-domain:elancestvous.fr");
    expect(callArgs.requestBody.dimensions).toEqual(["page", "query"]);
    expect(callArgs.requestBody.dimensionFilterGroups).toEqual([
      { filters: [{ dimension: "page", operator: "contains", expression: "/blog/" }] },
    ]);
  });

  it("returns an empty array when GSC has no data for the range", async () => {
    const queryImpl = vi.fn().mockResolvedValue({ data: {} });
    const client = createGoogleSearchConsoleClient({
      serviceAccountJson: "{}",
      siteUrl: "sc-domain:elancestvous.fr",
      queryImpl,
    });

    expect(await client.fetchBlogPageQueryRows(90)).toEqual([]);
  });

  it("paginates via startRow when a page comes back full, stopping once a page is short", async () => {
    const fullPage = Array.from({ length: 3 }, (_, i) => ({
      keys: [`https://elancestvous.fr/blog/article-${i}`, "requête"],
      clicks: 1,
      impressions: 10,
      ctr: 0.1,
      position: 5,
    }));
    const shortPage = [
      {
        keys: ["https://elancestvous.fr/blog/dernier", "requête"],
        clicks: 1,
        impressions: 10,
        ctr: 0.1,
        position: 5,
      },
    ];
    const queryImpl = vi
      .fn()
      .mockResolvedValueOnce({ data: { rows: fullPage } })
      .mockResolvedValueOnce({ data: { rows: shortPage } });

    const client = createGoogleSearchConsoleClient({
      serviceAccountJson: "{}",
      siteUrl: "sc-domain:elancestvous.fr",
      queryImpl,
      rowLimit: 3,
    });

    const rows = await client.fetchBlogPageQueryRows(90);

    expect(queryImpl).toHaveBeenCalledTimes(2);
    expect(queryImpl.mock.calls[0][0].requestBody.startRow).toBe(0);
    expect(queryImpl.mock.calls[1][0].requestBody.startRow).toBe(3);
    expect(rows).toHaveLength(4);
  });

  it("requests a date range spanning the given number of days", async () => {
    const queryImpl = vi.fn().mockResolvedValue({ data: {} });
    const client = createGoogleSearchConsoleClient({
      serviceAccountJson: "{}",
      siteUrl: "sc-domain:elancestvous.fr",
      queryImpl,
    });

    await client.fetchBlogPageQueryRows(30);

    const [callArgs] = queryImpl.mock.calls[0];
    const start = new Date(callArgs.requestBody.startDate);
    const end = new Date(callArgs.requestBody.endDate);
    const diffDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    expect(diffDays).toBe(30);
  });
});
