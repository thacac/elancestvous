import { describe, expect, it } from "vitest";

import { buildRssFeed } from "../rssFeed";

import type { PostMeta } from "../blog";

function makePost(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    title: "Titre de l'article",
    slug: "titre-de-larticle",
    description: "Description de l'article",
    excerpt: "Extrait",
    publishedAt: "2026-09-01",
    coverImage: "/images/blog/cover.jpg",
    coverImageAlt: "Alt",
    tags: [],
    pillar: null,
    readingTime: "5 min de lecture",
    ...overrides,
  };
}

describe("buildRssFeed", () => {
  it("produces a valid RSS 2.0 channel with one item per post", () => {
    const xml = buildRssFeed([makePost()]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain("<rss version=\"2.0\">");
    expect(xml).toContain("<link>https://elancestvous.fr/blog/titre-de-larticle</link>");
    expect(xml).toContain("<guid>https://elancestvous.fr/blog/titre-de-larticle</guid>");
  });

  it("escapes XML special characters in title and description", () => {
    const xml = buildRssFeed([
      makePost({
        title: "RPS & QVCT : \"tenir\" <sans> s'épuiser",
        description: "Des soins <particuliers> pour l'équipe & la direction",
      }),
    ]);

    expect(xml).toContain(
      "<title>RPS &amp; QVCT : &quot;tenir&quot; &lt;sans&gt; s&apos;épuiser</title>"
    );
    expect(xml).toContain(
      "<description>Des soins &lt;particuliers&gt; pour l&apos;équipe &amp; la direction</description>"
    );
    expect(xml).not.toContain("<sans>");
  });

  it("formats publishedAt as an RFC 822 pubDate", () => {
    const xml = buildRssFeed([makePost({ publishedAt: "2026-09-01" })]);

    expect(xml).toContain(`<pubDate>${new Date("2026-09-01").toUTCString()}</pubDate>`);
  });

  it("preserves the order of the posts it is given (caller decides sort order)", () => {
    const xml = buildRssFeed([
      makePost({ slug: "premier", publishedAt: "2026-09-08" }),
      makePost({ slug: "second", publishedAt: "2026-09-01" }),
    ]);

    const premierIndex = xml.indexOf("premier");
    const secondIndex = xml.indexOf("second");
    expect(premierIndex).toBeGreaterThan(-1);
    expect(secondIndex).toBeGreaterThan(premierIndex);
  });

  it("produces a valid empty channel when there are no posts", () => {
    const xml = buildRssFeed([]);

    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });
});
