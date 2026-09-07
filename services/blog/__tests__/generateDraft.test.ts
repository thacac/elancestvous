import { describe, expect, it, vi } from "vitest";

import {
  buildDraftMarkdown,
  generateDraft,
  type GenerateDraftDeps,
} from "../generateDraft";

import type { BlogDraft } from "../draftSchema";
import type { PublishedPost } from "../githubBlogRepo";

const validDraft: BlogDraft = {
  title: "Un titre valide",
  slug: "un-titre-valide",
  description: "Description",
  excerpt: "Extrait",
  tags: ["QVCT"],
  bodyMarkdown: "## Section\n\nContenu de l'article.",
  imagePrompts: [
    { purpose: "cover", prompt: "a calm office illustration", altText: "Illustration" },
  ],
  pillar: "C",
  localAngle: false,
};

function makePublishedPost(overrides: Partial<PublishedPost> = {}): PublishedPost {
  return {
    title: "Un autre article",
    publishedAt: "2026-01-01",
    pillar: "C",
    localAngle: false,
    sourceUrl: null,
    tags: ["QVCT"],
    ...overrides,
  };
}

function makeDeps(overrides: Partial<GenerateDraftDeps> = {}): GenerateDraftDeps {
  return {
    anthropic: {
      parseDraft: vi.fn().mockResolvedValue({
        stop_reason: "end_turn",
        parsed_output: validDraft,
      }),
    },
    imageGenerator: {
      generateCoverImage: vi.fn().mockResolvedValue(Buffer.from("fake-image")),
    },
    github: {
      listPublishedPosts: vi.fn().mockResolvedValue([makePublishedPost()]),
      commitDraftBranch: vi.fn().mockResolvedValue({
        branch: "blog-draft/un-titre-valide",
        url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
      }),
    },
    discord: {
      notifyDraftReady: vi.fn().mockResolvedValue({ messageId: "message-id-123" }),
    },
    ...overrides,
  };
}

describe("generateDraft", () => {
  it("commits a draft branch on the nominal path", async () => {
    const deps = makeDeps();
    const result = await generateDraft(deps);

    expect(result).toEqual({
      status: "committed",
      slug: "un-titre-valide",
      title: "Un titre valide",
      branch: "blog-draft/un-titre-valide",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
    });
    expect(deps.github.listPublishedPosts).toHaveBeenCalled();
    expect(deps.imageGenerator?.generateCoverImage).toHaveBeenCalledWith(
      "a calm office illustration"
    );
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "un-titre-valide" })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith({
      slug: "un-titre-valide",
      title: "Un titre valide",
      excerpt: "Extrait",
      coverImage: Buffer.from("fake-image"),
      sourceUrl: null,
    });
  });

  it("returns a refused status without calling image generation or committing anything", async () => {
    const deps = makeDeps({
      anthropic: {
        parseDraft: vi.fn().mockResolvedValue({
          stop_reason: "refusal",
          stop_details: { category: "frontier_llm" },
          parsed_output: null,
        }),
      },
    });

    const result = await generateDraft(deps);

    expect(result).toEqual({ status: "refused", category: "frontier_llm" });
    expect(deps.imageGenerator?.generateCoverImage).not.toHaveBeenCalled();
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    expect(deps.discord.notifyDraftReady).not.toHaveBeenCalled();
  });

  it("returns generation_failed when structured output fails validation", async () => {
    const deps = makeDeps({
      anthropic: {
        parseDraft: vi.fn().mockResolvedValue({
          stop_reason: "end_turn",
          parsed_output: { title: "incomplet" },
        }),
      },
    });

    const result = await generateDraft(deps);

    expect(result.status).toBe("generation_failed");
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    expect(deps.discord.notifyDraftReady).not.toHaveBeenCalled();
  });

  it("skips image generation and commits without a cover image when imageGenerator is not configured", async () => {
    const deps = makeDeps({ imageGenerator: undefined });

    const result = await generateDraft(deps);

    expect(result.status).toBe("committed");
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: null })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: null })
    );
  });

  it("passes a pillar suggestion computed from publication history to parseDraft", async () => {
    const deps = makeDeps({
      github: {
        listPublishedPosts: vi.fn().mockResolvedValue([
          makePublishedPost({
            title: "Article C1",
            publishedAt: "2026-01-01",
            pillar: "C",
            localAngle: true,
            tags: ["RPS"],
          }),
          makePublishedPost({
            title: "Article D1",
            publishedAt: "2026-01-08",
            pillar: "D",
            localAngle: false,
            tags: ["GAPP"],
          }),
        ]),
        commitDraftBranch: vi.fn().mockResolvedValue({
          branch: "blog-draft/un-titre-valide",
          url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
        }),
      },
    });

    await generateDraft(deps);

    expect(deps.anthropic.parseDraft).toHaveBeenCalledWith(
      ["Article C1", "Article D1"],
      expect.objectContaining({ recentTags: expect.arrayContaining(["RPS", "GAPP"]) })
    );
    // Dernier pilier publié = D : jamais choisi deux fois de suite.
    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.pillar.id).not.toBe("D");
  });

  it("suggests injecting the local angle when no recent article carried it", async () => {
    const deps = makeDeps({
      github: {
        listPublishedPosts: vi
          .fn()
          .mockResolvedValue([makePublishedPost({ localAngle: false })]),
        commitDraftBranch: vi.fn().mockResolvedValue({
          branch: "blog-draft/un-titre-valide",
          url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
        }),
      },
    });

    await generateDraft(deps);

    expect(deps.anthropic.parseDraft).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ injectLocalAngle: true })
    );
  });

  it("uses the actualité watch's candidate (pillar, source) ahead of the pillar rotation when one is found", async () => {
    const findActualite = vi.fn().mockResolvedValue({
      title: "Nouvelle obligation QVCT",
      summary: "Résumé factuel vérifiable.",
      sourceUrl: "https://source.example/actu-1",
      pillar: { id: "D", label: "GAPP", targetPage: "/gapp", theme: "theme", weight: 3 },
    });
    const deps = makeDeps({
      actualiteWatch: { findActualite },
      github: {
        listPublishedPosts: vi.fn().mockResolvedValue([
          makePublishedPost({ sourceUrl: "https://source.example/deja-cite" }),
        ]),
        commitDraftBranch: vi.fn().mockResolvedValue({
          branch: "blog-draft/un-titre-valide",
          url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
        }),
      },
    });

    await generateDraft(deps);

    expect(findActualite).toHaveBeenCalledWith(["https://source.example/deja-cite"], ["C"]);
    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.pillar.id).toBe("D");
    expect(suggestion.actualite).toEqual({
      title: "Nouvelle obligation QVCT",
      summary: "Résumé factuel vérifiable.",
      sourceUrl: "https://source.example/actu-1",
    });
  });

  it("falls back to the weighted pillar rotation when the actualité watch finds nothing", async () => {
    const findActualite = vi.fn().mockResolvedValue(null);
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    await generateDraft(deps);

    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.actualite).toBeUndefined();
  });

  it("writes the actualité candidate's sourceUrl to the committed frontmatter and the Discord notification", async () => {
    const findActualite = vi.fn().mockResolvedValue({
      title: "Nouvelle obligation QVCT",
      summary: "Résumé factuel vérifiable.",
      sourceUrl: "https://source.example/actu-1",
      pillar: { id: "D", label: "GAPP", targetPage: "/gapp", theme: "theme", weight: 3 },
    });
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    await generateDraft(deps);

    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ postMarkdown: expect.stringContaining("sourceUrl: 'https://source.example/actu-1'") })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({ sourceUrl: "https://source.example/actu-1" })
    );
  });

  it("returns generation_failed and does not commit when image generation fails", async () => {
    const deps = makeDeps({
      imageGenerator: {
        generateCoverImage: vi.fn().mockRejectedValue(new Error("quota exceeded")),
      },
    });

    const result = await generateDraft(deps);

    expect(result).toEqual({
      status: "generation_failed",
      reason: expect.stringContaining("quota exceeded"),
    });
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    expect(deps.discord.notifyDraftReady).not.toHaveBeenCalled();
  });
});

describe("buildDraftMarkdown", () => {
  it("produces frontmatter compatible with lib/blog.ts's schema", () => {
    const markdown = buildDraftMarkdown(validDraft, Buffer.from("fake-image"));

    expect(markdown).toContain(`title: ${validDraft.title}`);
    expect(markdown).toContain("slug: un-titre-valide");
    expect(markdown).toContain("coverImage: /blog/un-titre-valide/cover.jpg");
    expect(markdown).toContain("pillar: C");
    expect(markdown).toContain("localAngle: false");
    expect(markdown).toContain("Contenu de l'article.");
  });

  it("omits coverImage/coverImageAlt when no cover image was generated", () => {
    const markdown = buildDraftMarkdown(validDraft, null);

    expect(markdown).not.toContain("coverImage:");
    expect(markdown).not.toContain("coverImageAlt:");
    expect(markdown).toContain("Contenu de l'article.");
  });

  it("includes sourceUrl in the frontmatter when the draft comes from the actualité watch", () => {
    const markdown = buildDraftMarkdown(validDraft, null, "https://source.example/actu-1");

    expect(markdown).toContain("sourceUrl: 'https://source.example/actu-1'");
  });

  it("omits sourceUrl from the frontmatter for a regular pillar-rotation draft", () => {
    const markdown = buildDraftMarkdown(validDraft, null);

    expect(markdown).not.toContain("sourceUrl:");
  });
});
