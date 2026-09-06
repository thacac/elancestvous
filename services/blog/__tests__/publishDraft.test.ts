import { describe, expect, it, vi } from "vitest";

import { publishDraft, type PublishDraftDeps } from "../publishDraft";

function makeDeps(overrides: Partial<PublishDraftDeps["github"]> = {}): PublishDraftDeps {
  return {
    github: {
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article"',
          'slug: "un-article"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          'coverImage: "/blog/un-article/cover.jpg"',
          'coverImageAlt: "Illustration"',
          "tags: []",
          "---",
          "Corps de l'article.",
        ].join("\n"),
        coverImage: Buffer.from("fake-image"),
      }),
      publishDraft: vi.fn().mockResolvedValue({
        commitUrl: "https://github.com/thacac/elancestvous/commit/abc123",
      }),
      ...overrides,
    },
  };
}

describe("publishDraft", () => {
  it("returns draft_not_found when the draft branch doesn't exist", async () => {
    const deps = makeDeps({ getDraftContent: vi.fn().mockResolvedValue(null) });

    const result = await publishDraft("inconnu", deps);

    expect(result).toEqual({ status: "draft_not_found", slug: "inconnu" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("returns missing_cover_image and does not publish when the draft has no cover image", async () => {
    const deps = makeDeps({
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article sans image"',
          'slug: "sans-image"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          "tags: []",
          "---",
          "Corps.",
        ].join("\n"),
        coverImage: null,
      }),
    });

    const result = await publishDraft("sans-image", deps);

    expect(result).toEqual({ status: "missing_cover_image", slug: "sans-image" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("publishes and returns the commit URL when the draft has a cover image", async () => {
    const deps = makeDeps();

    const result = await publishDraft("un-article", deps);

    expect(result).toEqual({
      status: "published",
      slug: "un-article",
      title: "Un article",
      commitUrl: "https://github.com/thacac/elancestvous/commit/abc123",
    });
    expect(deps.github.publishDraft).toHaveBeenCalledWith({
      slug: "un-article",
      commitMessage: expect.stringContaining("Un article"),
    });
  });
});
