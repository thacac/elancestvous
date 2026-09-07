import { describe, expect, it, vi } from "vitest";

import { createRssFeedFetcher, parseFeedXml } from "../rssFeedFetcher";

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Service-public.fr</title>
    <item>
      <title><![CDATA[Nouvelle obligation QVCT pour les établissements de santé]]></title>
      <link>https://www.service-public.fr/actu-1</link>
      <description><![CDATA[Résumé de l'actualité 1.]]></description>
      <pubDate>Mon, 01 Sep 2026 08:00:00 GMT</pubDate>
    </item>
    <item>
      <title>Aide financière pour la prévention des RPS</title>
      <link>https://www.service-public.fr/actu-2</link>
      <description>Résumé de l'actualité 2.</description>
      <pubDate>Tue, 02 Sep 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const RSS_XML_SINGLE_ITEM = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Ameli.fr</title>
    <item>
      <title>Décret unique</title>
      <link>https://www.ameli.fr/actu-unique</link>
      <description>Résumé unique.</description>
      <pubDate>Wed, 03 Sep 2026 08:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`;

const ATOM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Légifrance</title>
  <entry>
    <title>Réforme du travail en établissement de santé</title>
    <link href="https://www.legifrance.gouv.fr/actu-1" />
    <summary>Résumé Atom 1.</summary>
    <updated>2026-09-04T08:00:00Z</updated>
  </entry>
</feed>`;

const ATOM_XML_MULTIPLE_LINKS = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Légifrance</title>
  <entry>
    <title>Réforme du travail en établissement de santé</title>
    <link rel="self" href="https://www.legifrance.gouv.fr/feed.atom" />
    <link rel="alternate" href="https://www.legifrance.gouv.fr/actu-1" />
    <summary>Résumé Atom 1.</summary>
    <updated>2026-09-04T08:00:00Z</updated>
  </entry>
</feed>`;

const EMPTY_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Flux vide</title>
  </channel>
</rss>`;

describe("parseFeedXml", () => {
  it("parses multiple RSS 2.0 items, unwrapping CDATA", () => {
    const items = parseFeedXml(RSS_XML);

    expect(items).toEqual([
      {
        title: "Nouvelle obligation QVCT pour les établissements de santé",
        summary: "Résumé de l'actualité 1.",
        url: "https://www.service-public.fr/actu-1",
        publishedAt: "Mon, 01 Sep 2026 08:00:00 GMT",
      },
      {
        title: "Aide financière pour la prévention des RPS",
        summary: "Résumé de l'actualité 2.",
        url: "https://www.service-public.fr/actu-2",
        publishedAt: "Tue, 02 Sep 2026 08:00:00 GMT",
      },
    ]);
  });

  it("parses a single RSS item without leaving it unwrapped as a bare object", () => {
    const items = parseFeedXml(RSS_XML_SINGLE_ITEM);

    expect(items).toEqual([
      {
        title: "Décret unique",
        summary: "Résumé unique.",
        url: "https://www.ameli.fr/actu-unique",
        publishedAt: "Wed, 03 Sep 2026 08:00:00 GMT",
      },
    ]);
  });

  it("parses Atom entries, reading the link href attribute", () => {
    const items = parseFeedXml(ATOM_XML);

    expect(items).toEqual([
      {
        title: "Réforme du travail en établissement de santé",
        summary: "Résumé Atom 1.",
        url: "https://www.legifrance.gouv.fr/actu-1",
        publishedAt: "2026-09-04T08:00:00Z",
      },
    ]);
  });

  it("picks the alternate link's href when an Atom entry has several <link> elements (rel=self, rel=alternate)", () => {
    const items = parseFeedXml(ATOM_XML_MULTIPLE_LINKS);

    expect(items).toEqual([
      {
        title: "Réforme du travail en établissement de santé",
        summary: "Résumé Atom 1.",
        url: "https://www.legifrance.gouv.fr/actu-1",
        publishedAt: "2026-09-04T08:00:00Z",
      },
    ]);
  });

  it("returns an empty array for a feed with no items", () => {
    expect(parseFeedXml(EMPTY_RSS_XML)).toEqual([]);
  });

  it("returns an empty array for unparseable content instead of throwing", () => {
    expect(parseFeedXml("not xml at all")).toEqual([]);
  });
});

describe("createRssFeedFetcher", () => {
  it("fetches the source URL and parses the response body as a feed", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue(RSS_XML_SINGLE_ITEM),
    });
    const fetchFeedItems = createRssFeedFetcher(fetchImpl);

    const items = await fetchFeedItems("https://www.ameli.fr/rss.xml");

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://www.ameli.fr/rss.xml",
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(items).toEqual([
      {
        title: "Décret unique",
        summary: "Résumé unique.",
        url: "https://www.ameli.fr/actu-unique",
        publishedAt: "Wed, 03 Sep 2026 08:00:00 GMT",
      },
    ]);
  });

  it("throws with the response status when the source is unreachable", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 503, text: vi.fn() });
    const fetchFeedItems = createRssFeedFetcher(fetchImpl);

    await expect(fetchFeedItems("https://www.ameli.fr/rss.xml")).rejects.toThrow(/503/);
  });

  it("aborts a source that never responds instead of hanging the whole weekly run", async () => {
    const fetchImpl = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        })
    );
    // Timeout réduit à 5 ms plutôt que d'attendre le vrai délai de
    // production : on laisse le vrai mécanisme d'AbortSignal.timeout()
    // déclencher l'abandon plutôt que de simuler l'événement à la main.
    const fetchFeedItems = createRssFeedFetcher(fetchImpl as unknown as typeof fetch, 5);

    await expect(fetchFeedItems("https://www.ameli.fr/rss.xml")).rejects.toThrow(/aborted/);
  });
});
