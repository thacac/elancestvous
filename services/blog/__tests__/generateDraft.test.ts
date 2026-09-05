import { describe, expect, it, vi } from "vitest";

import {
  buildDraftMarkdown,
  generateDraft,
  type GenerateDraftDeps,
} from "../generateDraft";

import type { BlogDraft } from "../draftSchema";

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
};

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
      listPublishedPostTitles: vi.fn().mockResolvedValue(["Un autre article"]),
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
    expect(deps.github.listPublishedPostTitles).toHaveBeenCalled();
    expect(deps.imageGenerator.generateCoverImage).toHaveBeenCalledWith(
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
    expect(deps.imageGenerator.generateCoverImage).not.toHaveBeenCalled();
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
    const markdown = buildDraftMarkdown(validDraft);

    expect(markdown).toContain(`title: ${validDraft.title}`);
    expect(markdown).toContain("slug: un-titre-valide");
    expect(markdown).toContain("coverImage: /blog/un-titre-valide/cover.jpg");
    expect(markdown).toContain("Contenu de l'article.");
  });
});
