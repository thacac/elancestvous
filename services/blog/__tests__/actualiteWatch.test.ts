import { describe, expect, it, vi } from "vitest";

import { createActualiteWatch, LEGAL_DISCLAIMER } from "../actualiteWatch";

import type { FeedItem } from "../rssFeedFetcher";

function item(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    title: "Nouvelle obligation QVCT",
    summary: "Résumé factuel.",
    url: "https://source.example/actu-1",
    publishedAt: "2026-09-01T08:00:00Z",
    ...overrides,
  };
}

describe("createActualiteWatch", () => {
  it("returns null without fetching anything when no source is configured", async () => {
    const fetchFeedItems = vi.fn();
    const watch = createActualiteWatch({ sources: [], fetchFeedItems });

    const result = await watch.findActualite([], []);

    expect(result).toBeNull();
    expect(fetchFeedItems).not.toHaveBeenCalled();
  });

  it("returns the most recent eligible item across all configured sources", async () => {
    const fetchFeedItems = vi.fn(async (source: string) => {
      if (source === "https://source-a.example/rss.xml") {
        return [item({ url: "https://source-a.example/older", publishedAt: "2026-08-01T08:00:00Z" })];
      }
      return [item({ url: "https://source-b.example/newer", publishedAt: "2026-09-01T08:00:00Z" })];
    });
    const watch = createActualiteWatch({
      sources: ["https://source-a.example/rss.xml", "https://source-b.example/rss.xml"],
      fetchFeedItems,
    });

    const result = await watch.findActualite([], []);

    expect(result?.sourceUrl).toBe("https://source-b.example/newer");
  });

  it("excludes items whose URL has already been cited in a published article", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([
      item({ url: "https://source.example/already-cited", publishedAt: "2026-09-02T08:00:00Z" }),
      item({ url: "https://source.example/fresh", publishedAt: "2026-09-01T08:00:00Z" }),
    ]);
    const watch = createActualiteWatch({ sources: ["https://source.example/rss.xml"], fetchFeedItems });

    const result = await watch.findActualite(["https://source.example/already-cited"], []);

    expect(result?.sourceUrl).toBe("https://source.example/fresh");
  });

  it("returns null when every candidate has already been cited", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([item({ url: "https://source.example/actu-1" })]);
    const watch = createActualiteWatch({ sources: ["https://source.example/rss.xml"], fetchFeedItems });

    const result = await watch.findActualite(["https://source.example/actu-1"], []);

    expect(result).toBeNull();
  });

  it("attaches a pillar via the shared weighted rotation, never repeating the last published pillar", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([item()]);
    const watch = createActualiteWatch({ sources: ["https://source.example/rss.xml"], fetchFeedItems });

    const result = await watch.findActualite([], ["D"]);

    expect(result?.pillar.id).not.toBe("D");
  });

  it("carries the title, summary and sourceUrl through onto the candidate", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([
      item({
        title: "Nouvelle aide QVCT",
        summary: "Une aide publique vient d'être annoncée.",
        url: "https://source.example/actu-9",
      }),
    ]);
    const watch = createActualiteWatch({ sources: ["https://source.example/rss.xml"], fetchFeedItems });

    const result = await watch.findActualite([], []);

    expect(result).toEqual(
      expect.objectContaining({
        title: "Nouvelle aide QVCT",
        summary: "Une aide publique vient d'être annoncée.",
        sourceUrl: "https://source.example/actu-9",
      })
    );
  });

  it("skips a source that fails to fetch instead of failing the whole lookup", async () => {
    const fetchFeedItems = vi.fn(async (source: string) => {
      if (source === "https://broken.example/rss.xml") {
        throw new Error("réseau indisponible");
      }
      return [item({ url: "https://ok.example/actu-1" })];
    });
    const watch = createActualiteWatch({
      sources: ["https://broken.example/rss.xml", "https://ok.example/rss.xml"],
      fetchFeedItems,
    });

    const result = await watch.findActualite([], []);

    expect(result?.sourceUrl).toBe("https://ok.example/actu-1");
  });

  it("returns null when every configured source fails", async () => {
    const fetchFeedItems = vi.fn().mockRejectedValue(new Error("réseau indisponible"));
    const watch = createActualiteWatch({ sources: ["https://broken.example/rss.xml"], fetchFeedItems });

    const result = await watch.findActualite([], []);

    expect(result).toBeNull();
  });
});

describe("LEGAL_DISCLAIMER", () => {
  it("mentions it is not legal advice and points to the official source or a professional", () => {
    expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("pas un conseil juridique");
  });
});
