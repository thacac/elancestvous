import { describe, expect, it, vi } from "vitest";

import { reviseDraft, type ReviseDraftDeps } from "../reviseDraft";

import type { BlogDraft } from "../draftSchema";

const revisedDraft: BlogDraft = {
  title: "Titre révisé",
  slug: "un-titre-different-propose-par-claude",
  description: "Description",
  excerpt: "Extrait révisé",
  tags: ["QVCT"],
  bodyMarkdown: "## Section\n\nContenu révisé.",
  imagePrompts: [
    { purpose: "cover", prompt: "a calm office illustration", altText: "Illustration" },
  ],
};

function makeDeps(overrides: Partial<ReviseDraftDeps> = {}): ReviseDraftDeps {
  return {
    anthropic: {
      reviseDraft: vi.fn().mockResolvedValue({
        stop_reason: "end_turn",
        parsed_output: revisedDraft,
      }),
    },
    imageGenerator: {
      generateCoverImage: vi.fn().mockResolvedValue(Buffer.from("fake-image")),
    },
    github: {
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: "---\ntitle: Ancien titre\nslug: mon-article\n---\nAncien corps.",
        coverImage: Buffer.from("old-image"),
      }),
      commitDraftBranch: vi.fn().mockResolvedValue({
        branch: "blog-draft/mon-article",
        url: "https://github.com/thacac/elancestvous/tree/blog-draft/mon-article",
      }),
    },
    discord: {
      notifyDraftReady: vi.fn().mockResolvedValue({ messageId: "message-id-123" }),
    },
    ...overrides,
  };
}

describe("reviseDraft", () => {
  it("returns draft_not_found when the draft branch doesn't exist", async () => {
    const deps = makeDeps({ github: { ...makeDeps().github, getDraftContent: vi.fn().mockResolvedValue(null) } });

    const result = await reviseDraft("inconnu", "feedback", deps);

    expect(result).toEqual({ status: "draft_not_found", slug: "inconnu" });
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
  });

  it("passes the current draft markdown and feedback to the Anthropic revise call", async () => {
    const deps = makeDeps();

    await reviseDraft("mon-article", "Le titre est trop générique", deps);

    expect(deps.anthropic.reviseDraft).toHaveBeenCalledWith(
      "---\ntitle: Ancien titre\nslug: mon-article\n---\nAncien corps.",
      "Le titre est trop générique"
    );
  });

  it("keeps the original slug even if Claude's revised output proposes a different one", async () => {
    const deps = makeDeps();

    const result = await reviseDraft("mon-article", "feedback", deps);

    expect(result).toMatchObject({ status: "committed", slug: "mon-article" });
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "mon-article" })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "mon-article" })
    );
  });

  it("commits the revised draft and notifies Discord on success", async () => {
    const deps = makeDeps();

    const result = await reviseDraft("mon-article", "feedback", deps);

    expect(result).toEqual({
      status: "committed",
      slug: "mon-article",
      title: "Titre révisé",
      branch: "blog-draft/mon-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/mon-article",
    });
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ commitMessage: expect.stringContaining("Titre révisé") })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith({
      slug: "mon-article",
      title: "Titre révisé",
      excerpt: "Extrait révisé",
      coverImage: Buffer.from("fake-image"),
    });
  });

  it("returns refused without committing anything when Claude refuses", async () => {
    const deps = makeDeps({
      anthropic: {
        reviseDraft: vi.fn().mockResolvedValue({
          stop_reason: "refusal",
          stop_details: { category: "frontier_llm" },
          parsed_output: null,
        }),
      },
    });

    const result = await reviseDraft("mon-article", "feedback", deps);

    expect(result).toEqual({ status: "refused", category: "frontier_llm" });
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
  });

  it("returns generation_failed when the structured output fails validation", async () => {
    const deps = makeDeps({
      anthropic: {
        reviseDraft: vi.fn().mockResolvedValue({
          stop_reason: "end_turn",
          parsed_output: { title: "incomplet" },
        }),
      },
    });

    const result = await reviseDraft("mon-article", "feedback", deps);

    expect(result.status).toBe("generation_failed");
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
  });

  it("returns generation_failed and does not commit when image generation fails", async () => {
    const deps = makeDeps({
      imageGenerator: {
        generateCoverImage: vi.fn().mockRejectedValue(new Error("quota exceeded")),
      },
    });

    const result = await reviseDraft("mon-article", "feedback", deps);

    expect(result).toEqual({
      status: "generation_failed",
      reason: expect.stringContaining("quota exceeded"),
    });
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
  });

  it("skips image generation and commits without a cover image when imageGenerator is not configured", async () => {
    const deps = makeDeps({ imageGenerator: undefined });

    const result = await reviseDraft("mon-article", "feedback", deps);

    expect(result.status).toBe("committed");
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: null })
    );
  });
});
