import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../anthropicDraftGenerator", () => ({
  createAnthropicDraftGenerator: vi.fn().mockReturnValue({}),
}));
vi.mock("../openaiImageGenerator", () => ({
  createOpenAiImageGenerator: vi.fn().mockReturnValue({}),
}));
vi.mock("../githubBlogRepo", () => ({
  createGithubBlogRepo: vi.fn().mockReturnValue({}),
}));

import { createBlogDraftDeps } from "../createBlogDraftDeps";
import { createGithubBlogRepo } from "../githubBlogRepo";

describe("createBlogDraftDeps", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.IMAGE_GEN_API_KEY = "image-key";
    process.env.GITHUB_BLOG_PAT = "pat";
    vi.mocked(createGithubBlogRepo).mockClear();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("parses a well-formed owner/repo", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";

    createBlogDraftDeps();

    expect(createGithubBlogRepo).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "thacac", repo: "elancestvous" })
    );
  });

  it("rejects a GITHUB_REPO with an extra segment instead of silently truncating it", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous/extra";

    expect(() => createBlogDraftDeps()).toThrow(/owner\/repo/);
  });

  it("rejects a GITHUB_REPO missing the repo segment", () => {
    process.env.GITHUB_REPO = "thacac";

    expect(() => createBlogDraftDeps()).toThrow(/owner\/repo/);
  });
});
