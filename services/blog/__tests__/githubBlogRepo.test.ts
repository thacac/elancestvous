import { describe, expect, it, vi } from "vitest";

const getContent = vi.fn();
const getRef = vi.fn();
const createRef = vi.fn();
const createOrUpdateFileContents = vi.fn();
const getCommit = vi.fn();
const getTree = vi.fn();
const createTree = vi.fn();
const createCommit = vi.fn();
const updateRef = vi.fn();

vi.mock("@octokit/rest", () => ({
  Octokit: function Octokit() {
    return {
      rest: {
        repos: { getContent, createOrUpdateFileContents },
        git: { getRef, createRef, getCommit, getTree, createTree, createCommit, updateRef },
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

describe("createGithubBlogRepo.commitDraftBranch", () => {
  it("skips writing cover.jpg when no cover image is provided", async () => {
    getRef.mockReset();
    createRef.mockReset();
    createOrUpdateFileContents.mockReset();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockResolvedValue({});
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.commitDraftBranch({
      slug: "sans-image",
      postMarkdown: "contenu",
      coverImage: null,
      commitMessage: "blog: brouillon",
    });

    expect(createOrUpdateFileContents).toHaveBeenCalledTimes(1);
    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ path: "content/_drafts/sans-image/post.md" })
    );
  });
});

describe("createGithubBlogRepo.publishDraft", () => {
  function resetGraftMocks() {
    getRef.mockReset();
    getCommit.mockReset();
    getTree.mockReset();
    createTree.mockReset();
    createCommit.mockReset();
    updateRef.mockReset();
  }

  it("grafts the draft's blobs onto a new commit on master and updates the ref", async () => {
    resetGraftMocks();
    getRef
      .mockResolvedValueOnce({ data: { object: { sha: "draft-commit-sha" } } }) // heads/blog-draft/mon-article
      .mockResolvedValueOnce({ data: { object: { sha: "master-commit-sha" } } }); // heads/master
    getCommit
      .mockResolvedValueOnce({ data: { tree: { sha: "draft-tree-sha" } } })
      .mockResolvedValueOnce({ data: { tree: { sha: "master-tree-sha" } } });
    getTree.mockResolvedValueOnce({
      data: {
        tree: [
          { path: "content/_drafts/mon-article/post.md", sha: "post-blob-sha", type: "blob" },
          { path: "content/_drafts/mon-article/cover.jpg", sha: "cover-blob-sha", type: "blob" },
        ],
      },
    });
    createTree.mockResolvedValueOnce({ data: { sha: "new-tree-sha" } });
    createCommit.mockResolvedValueOnce({ data: { sha: "new-commit-sha" } });
    updateRef.mockResolvedValueOnce({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.publishDraft({
      slug: "mon-article",
      commitMessage: 'blog: publication "Mon article"',
    });

    expect(getTree).toHaveBeenCalledWith(
      expect.objectContaining({ tree_sha: "draft-tree-sha", recursive: "true" })
    );
    expect(createTree).toHaveBeenCalledWith(
      expect.objectContaining({
        base_tree: "master-tree-sha",
        tree: [
          expect.objectContaining({
            path: "content/blog/mon-article.md",
            sha: "post-blob-sha",
          }),
          expect.objectContaining({
            path: "public/blog/mon-article/cover.jpg",
            sha: "cover-blob-sha",
          }),
        ],
      })
    );
    expect(createCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        tree: "new-tree-sha",
        parents: ["master-commit-sha"],
        message: 'blog: publication "Mon article"',
      })
    );
    expect(updateRef).toHaveBeenCalledWith(
      expect.objectContaining({ ref: "heads/master", sha: "new-commit-sha" })
    );
    expect(result).toEqual({
      commitUrl: "https://github.com/thacac/elancestvous/commit/new-commit-sha",
    });
  });

  it("publishes text-only when the draft has no cover.jpg blob", async () => {
    resetGraftMocks();
    getRef
      .mockResolvedValueOnce({ data: { object: { sha: "draft-commit-sha" } } })
      .mockResolvedValueOnce({ data: { object: { sha: "master-commit-sha" } } });
    getCommit
      .mockResolvedValueOnce({ data: { tree: { sha: "draft-tree-sha" } } })
      .mockResolvedValueOnce({ data: { tree: { sha: "master-tree-sha" } } });
    getTree.mockResolvedValueOnce({
      data: {
        tree: [
          { path: "content/_drafts/sans-image/post.md", sha: "post-blob-sha", type: "blob" },
        ],
      },
    });
    createTree.mockResolvedValueOnce({ data: { sha: "new-tree-sha" } });
    createCommit.mockResolvedValueOnce({ data: { sha: "new-commit-sha" } });
    updateRef.mockResolvedValueOnce({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.publishDraft({ slug: "sans-image", commitMessage: "blog: publication" });

    expect(createTree).toHaveBeenCalledWith(
      expect.objectContaining({
        tree: [expect.objectContaining({ path: "content/blog/sans-image.md" })],
      })
    );
  });

  it("throws when the draft's post.md blob can't be found", async () => {
    resetGraftMocks();
    getRef.mockResolvedValueOnce({ data: { object: { sha: "draft-commit-sha" } } });
    getCommit.mockResolvedValueOnce({ data: { tree: { sha: "draft-tree-sha" } } });
    getTree.mockResolvedValueOnce({ data: { tree: [] } });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await expect(
      github.publishDraft({ slug: "corrompu", commitMessage: "blog: publication" })
    ).rejects.toThrow(/post\.md/);
    expect(createCommit).not.toHaveBeenCalled();
  });

  it("ignores a non-blob tree entry at the post.md path (e.g. an unexpected submodule/tree)", async () => {
    resetGraftMocks();
    getRef.mockResolvedValueOnce({ data: { object: { sha: "draft-commit-sha" } } });
    getCommit.mockResolvedValueOnce({ data: { tree: { sha: "draft-tree-sha" } } });
    getTree.mockResolvedValueOnce({
      data: {
        tree: [
          { path: "content/_drafts/corrompu/post.md", sha: "not-a-blob-sha", type: "tree" },
        ],
      },
    });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await expect(
      github.publishDraft({ slug: "corrompu", commitMessage: "blog: publication" })
    ).rejects.toThrow(/post\.md/);
    expect(createCommit).not.toHaveBeenCalled();
  });

  it("ignores a non-blob tree entry at the cover.jpg path", async () => {
    resetGraftMocks();
    getRef
      .mockResolvedValueOnce({ data: { object: { sha: "draft-commit-sha" } } })
      .mockResolvedValueOnce({ data: { object: { sha: "master-commit-sha" } } });
    getCommit
      .mockResolvedValueOnce({ data: { tree: { sha: "draft-tree-sha" } } })
      .mockResolvedValueOnce({ data: { tree: { sha: "master-tree-sha" } } });
    getTree.mockResolvedValueOnce({
      data: {
        tree: [
          { path: "content/_drafts/mon-article/post.md", sha: "post-blob-sha", type: "blob" },
          { path: "content/_drafts/mon-article/cover.jpg", sha: "not-a-blob-sha", type: "tree" },
        ],
      },
    });
    createTree.mockResolvedValueOnce({ data: { sha: "new-tree-sha" } });
    createCommit.mockResolvedValueOnce({ data: { sha: "new-commit-sha" } });
    updateRef.mockResolvedValueOnce({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.publishDraft({ slug: "mon-article", commitMessage: "blog: publication" });

    expect(createTree).toHaveBeenCalledWith(
      expect.objectContaining({
        tree: [expect.objectContaining({ path: "content/blog/mon-article.md" })],
      })
    );
  });

  it("throws a clear error when master advanced in the meantime (non-fast-forward)", async () => {
    resetGraftMocks();
    getRef
      .mockResolvedValueOnce({ data: { object: { sha: "draft-commit-sha" } } })
      .mockResolvedValueOnce({ data: { object: { sha: "master-commit-sha" } } });
    getCommit
      .mockResolvedValueOnce({ data: { tree: { sha: "draft-tree-sha" } } })
      .mockResolvedValueOnce({ data: { tree: { sha: "master-tree-sha" } } });
    getTree.mockResolvedValueOnce({
      data: {
        tree: [
          { path: "content/_drafts/mon-article/post.md", sha: "post-blob-sha", type: "blob" },
        ],
      },
    });
    createTree.mockResolvedValueOnce({ data: { sha: "new-tree-sha" } });
    createCommit.mockResolvedValueOnce({ data: { sha: "new-commit-sha" } });
    updateRef.mockRejectedValueOnce({ status: 422 });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await expect(
      github.publishDraft({ slug: "mon-article", commitMessage: "blog: publication" })
    ).rejects.toThrow(/master a changé/);
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
    getContent.mockRejectedValue({ status: 404 });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.getDraftContent("inconnu");

    expect(result).toBeNull();
  });

  it("returns the markdown with coverImage null when only cover.jpg is missing (bypass image)", async () => {
    getContent.mockReset();
    getContent.mockImplementation(({ path }: { path: string }) => {
      if (path.endsWith("cover.jpg")) return Promise.reject({ status: 404 });
      return Promise.resolve({
        data: {
          type: "file",
          content: Buffer.from("---\ntitle: Brouillon sans image\n---\nCorps.").toString(
            "base64"
          ),
        },
      });
    });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.getDraftContent("sans-image");

    expect(result).toEqual({
      markdown: "---\ntitle: Brouillon sans image\n---\nCorps.",
      coverImage: null,
    });
  });
});
