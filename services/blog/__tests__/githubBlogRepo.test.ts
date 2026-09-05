import { describe, expect, it, vi } from "vitest";

const getContent = vi.fn();
const getRef = vi.fn();
const createRef = vi.fn();
const createOrUpdateFileContents = vi.fn();

vi.mock("@octokit/rest", () => ({
  Octokit: function Octokit() {
    return {
      rest: {
        repos: { getContent, createOrUpdateFileContents },
        git: { getRef, createRef },
      },
    };
  },
}));

import { createGithubBlogRepo } from "../githubBlogRepo";

describe("createGithubBlogRepo.listPublishedPostTitles", () => {
  it("reads content/blog on baseBranch rather than the repo's default branch", async () => {
    getContent
      .mockResolvedValueOnce({
        data: [{ type: "file", name: "post.md", path: "content/blog/post.md" }],
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from("---\ntitle: Un article\n---\n").toString("base64"),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.listPublishedPostTitles();

    expect(getContent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ path: "content/blog", ref: "master" })
    );
    expect(getContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ path: "content/blog/post.md", ref: "master" })
    );
  });
});

describe("createGithubBlogRepo.getDraftContent", () => {
  it("reads the post markdown and cover image from the draft branch", async () => {
    getContent.mockReset();
    getContent
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from("---\ntitle: Brouillon\n---\nCorps.").toString("base64"),
        },
      })
      .mockResolvedValueOnce({
        data: { type: "file", content: Buffer.from("fake-jpeg-bytes").toString("base64") },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.getDraftContent("mon-article");

    expect(getContent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        path: "content/_drafts/mon-article/post.md",
        ref: "blog-draft/mon-article",
      })
    );
    expect(getContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        path: "content/_drafts/mon-article/cover.jpg",
        ref: "blog-draft/mon-article",
      })
    );
    expect(result).toEqual({
      markdown: "---\ntitle: Brouillon\n---\nCorps.",
      coverImage: Buffer.from("fake-jpeg-bytes"),
    });
  });

  it("returns null when the draft branch or files don't exist", async () => {
    getContent.mockReset();
    getContent.mockRejectedValueOnce({ status: 404 });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.getDraftContent("inconnu");

    expect(result).toBeNull();
  });
});
