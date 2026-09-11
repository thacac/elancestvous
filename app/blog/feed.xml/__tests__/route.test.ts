import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/blog", () => ({
  getAllPostsMeta: vi.fn(),
}));

import { getAllPostsMeta } from "@/lib/blog";
import type { PostMeta } from "@/lib/blog";

import { GET } from "../route";

function makePost(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    title: "Titre",
    slug: "titre",
    description: "Description",
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

describe("GET /blog/feed.xml", () => {
  const original = process.env.BLOG_ENABLED;

  beforeEach(() => {
    vi.mocked(getAllPostsMeta).mockReset();
  });

  afterEach(() => {
    if (original === undefined) delete process.env.BLOG_ENABLED;
    else process.env.BLOG_ENABLED = original;
  });

  it("returns 404 while the blog is not public", async () => {
    delete process.env.BLOG_ENABLED;

    const response = GET();

    expect(response.status).toBe(404);
    expect(getAllPostsMeta).not.toHaveBeenCalled();
  });

  it("returns the RSS feed with the right content type once the blog is public", async () => {
    process.env.BLOG_ENABLED = "true";
    vi.mocked(getAllPostsMeta).mockReturnValue([makePost()]);

    const response = GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/rss+xml; charset=utf-8");
    expect(body).toContain("<link>https://elancestvous.fr/blog/titre</link>");
  });
});
