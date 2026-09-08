import { afterEach, describe, expect, it, vi } from "vitest";

const messagesParse = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: function Anthropic() {
    return { messages: { parse: messagesParse } };
  },
}));

import { createActualiteWatch, filterRelevantItems, LEGAL_DISCLAIMER } from "../actualiteWatch";

import type { FeedItem } from "../rssFeedFetcher";

function makeItem(overrides: Partial<FeedItem> = {}): FeedItem {
  return {
    title: "Nouvelle obligation QVCT pour les établissements de santé",
    summary: "Un décret précise les nouvelles obligations en matière de QVCT.",
    url: "https://source.example/actu-1",
    publishedAt: "2026-09-01T08:00:00Z",
    ...overrides,
  };
}

function triageResponse(candidates: Array<{ sourceUrl: string; title: string; summary: string; pillarId: string }>) {
  return { parsed_output: { candidates } };
}

describe("filterRelevantItems", () => {
  it("keeps items whose title or summary matches a QVCT/RPS keyword", () => {
    const items = [
      makeItem({ title: "Prévention des risques psychosociaux en entreprise" }),
      makeItem({ title: "Recette de tarte aux pommes", summary: "Un dessert simple et rapide." }),
    ];

    const result = filterRelevantItems(items);

    expect(result).toHaveLength(1);
    expect(result[0].title).toContain("risques psychosociaux");
  });

  it("matches case-insensitively", () => {
    const items = [makeItem({ title: "BURN-OUT : comment le prévenir ?" })];

    expect(filterRelevantItems(items)).toHaveLength(1);
  });

  it("returns an empty array when nothing matches", () => {
    const items = [makeItem({ title: "Météo du week-end", summary: "Ensoleillé sur toute la France." })];

    expect(filterRelevantItems(items)).toEqual([]);
  });
});

describe("createActualiteWatch", () => {
  afterEach(() => {
    messagesParse.mockReset();
  });

  it("returns an empty array without calling the model when no source is configured", async () => {
    const fetchFeedItems = vi.fn();
    const watch = createActualiteWatch({ sources: [], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toEqual([]);
    expect(fetchFeedItems).not.toHaveBeenCalled();
    expect(messagesParse).not.toHaveBeenCalled();
  });

  it("fetches every configured source and merges their items before triage", async () => {
    const fetchFeedItems = vi
      .fn()
      .mockResolvedValueOnce([makeItem({ url: "https://a.example/1" })])
      .mockResolvedValueOnce([makeItem({ url: "https://b.example/1" })]);
    messagesParse.mockResolvedValue(triageResponse([]));
    const watch = createActualiteWatch({
      sources: ["https://a.example/rss.xml", "https://b.example/rss.xml"],
      fetchFeedItems,
      apiKey: "key",
    });

    await watch.findActualite([]);

    expect(fetchFeedItems).toHaveBeenCalledWith("https://a.example/rss.xml");
    expect(fetchFeedItems).toHaveBeenCalledWith("https://b.example/rss.xml");
  });

  it("tolerates a source that fails to fetch and continues with the others (Promise.allSettled)", async () => {
    const fetchFeedItems = vi
      .fn()
      .mockRejectedValueOnce(new Error("flux hors service"))
      .mockResolvedValueOnce([makeItem({ url: "https://b.example/1" })]);
    messagesParse.mockResolvedValue(
      triageResponse([
        {
          sourceUrl: "https://b.example/1",
          title: "Titre",
          summary: "Résumé",
          pillarId: "C",
        },
      ])
    );
    const watch = createActualiteWatch({
      sources: ["https://a.example/rss.xml", "https://b.example/rss.xml"],
      fetchFeedItems,
      apiKey: "key",
    });

    const result = await watch.findActualite([]);

    expect(result).toHaveLength(1);
    expect(result[0].sourceUrl).toBe("https://b.example/1");
  });

  it("never calls the model when no fetched item survives the keyword pre-filter", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([
      makeItem({ title: "Météo du week-end", summary: "Ensoleillé sur toute la France.", url: "https://a.example/1" }),
    ]);
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toEqual([]);
    expect(messagesParse).not.toHaveBeenCalled();
  });

  it("excludes already-cited URLs before they ever reach the model", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem({ url: "https://deja-cite.example/a" })]);
    messagesParse.mockResolvedValue(triageResponse([]));
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    await watch.findActualite(["https://deja-cite.example/a"]);

    expect(messagesParse).not.toHaveBeenCalled();
  });

  it("returns candidates mapped to their full pillar (id, label, targetPage, theme)", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem()]);
    messagesParse.mockResolvedValue(
      triageResponse([
        {
          sourceUrl: "https://source.example/actu-1",
          title: "Nouvelle obligation QVCT",
          summary: "Un décret précise les nouvelles obligations en matière de QVCT.",
          pillarId: "C",
        },
      ])
    );
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toEqual([
      {
        title: "Nouvelle obligation QVCT",
        summary: "Un décret précise les nouvelles obligations en matière de QVCT.",
        sourceUrl: "https://source.example/actu-1",
        pillar: expect.objectContaining({ id: "C", label: expect.any(String), targetPage: expect.any(String) }),
      },
    ]);
  });

  it("caps candidates to at most one per pillar, in the model's returned order", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([
      makeItem({ url: "https://a.example/1" }),
      makeItem({ url: "https://a.example/2" }),
    ]);
    messagesParse.mockResolvedValue(
      triageResponse([
        { sourceUrl: "https://a.example/1", title: "Titre 1", summary: "Résumé 1", pillarId: "C" },
        { sourceUrl: "https://a.example/2", title: "Titre 2", summary: "Résumé 2", pillarId: "C" },
      ])
    );
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toHaveLength(1);
    expect(result[0].sourceUrl).toBe("https://a.example/1");
  });

  it("caps candidates to at most 3, even if the model returns more", async () => {
    const items = ["1", "2", "3", "4"].map((n) => makeItem({ url: `https://a.example/${n}` }));
    const fetchFeedItems = vi.fn().mockResolvedValue(items);
    messagesParse.mockResolvedValue(
      triageResponse([
        { sourceUrl: "https://a.example/1", title: "T1", summary: "R1", pillarId: "A" },
        { sourceUrl: "https://a.example/2", title: "T2", summary: "R2", pillarId: "B" },
        { sourceUrl: "https://a.example/3", title: "T3", summary: "R3", pillarId: "C" },
        { sourceUrl: "https://a.example/4", title: "T4", summary: "R4", pillarId: "D" },
      ])
    );
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toHaveLength(3);
  });

  it("drops a candidate whose sourceUrl was never actually fetched (defense against a hallucinated URL)", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem({ url: "https://a.example/1" })]);
    messagesParse.mockResolvedValue(
      triageResponse([
        { sourceUrl: "https://invente.example/rien", title: "Titre", summary: "Résumé", pillarId: "C" },
      ])
    );
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toEqual([]);
  });

  it("drops a candidate with an unknown pillarId rather than throwing", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem({ url: "https://a.example/1" })]);
    messagesParse.mockResolvedValue(
      triageResponse([{ sourceUrl: "https://a.example/1", title: "Titre", summary: "Résumé", pillarId: "Z" }])
    );
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toEqual([]);
  });

  it("returns an empty array (never throws) when the model yields no parsed_output (e.g. refusal)", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem()]);
    messagesParse.mockResolvedValue({ parsed_output: null });
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    const result = await watch.findActualite([]);

    expect(result).toEqual([]);
  });

  it("uses a cheap model (haiku) — this triage step never needs opus/sonnet-level reasoning", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem()]);
    messagesParse.mockResolvedValue(triageResponse([]));
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    await watch.findActualite([]);

    expect(messagesParse.mock.calls[0][0].model).toBe("claude-haiku-4-5");
  });

  it("instructs the model to treat feed content as data, never as instructions (prompt-injection defense)", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem()]);
    messagesParse.mockResolvedValue(triageResponse([]));
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    await watch.findActualite([]);

    const prompt = messagesParse.mock.calls[0][0].messages[0].content as string;
    expect(prompt).toMatch(/jamais comme des instructions/i);
  });

  it("never calls web_search or any tool — this is a pure structuring call over already-fetched RSS items", async () => {
    const fetchFeedItems = vi.fn().mockResolvedValue([makeItem()]);
    messagesParse.mockResolvedValue(triageResponse([]));
    const watch = createActualiteWatch({ sources: ["https://a.example/rss.xml"], fetchFeedItems, apiKey: "key" });

    await watch.findActualite([]);

    expect(messagesParse.mock.calls[0][0].tools).toBeUndefined();
  });
});

describe("LEGAL_DISCLAIMER", () => {
  it("mentions it is not legal advice and points to the official source or a professional", () => {
    expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("pas un conseil juridique");
  });
});
