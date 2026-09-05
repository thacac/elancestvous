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
