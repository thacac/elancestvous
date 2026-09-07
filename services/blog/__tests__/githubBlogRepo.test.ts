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
const listMatchingRefs = vi.fn();

vi.mock("@octokit/rest", () => ({
  Octokit: function Octokit() {
    return {
      rest: {
        repos: { getContent, createOrUpdateFileContents },
        git: {
          getRef,
          createRef,
          getCommit,
          getTree,
          createTree,
          createCommit,
          updateRef,
          listMatchingRefs,
        },
      },
    };
  },
}));

import { createGithubBlogRepo } from "../githubBlogRepo";
import { PILLARS } from "../pillars";


const pillarD = PILLARS.find((p) => p.id === "D")!;

describe("createGithubBlogRepo.listPublishedPosts", () => {
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

    await github.listPublishedPosts();

    expect(getContent).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ path: "content/blog", ref: "master" })
    );
    expect(getContent).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ path: "content/blog/post.md", ref: "master" })
    );
  });

  it("extracts pillar, localAngle, tags, sourceUrl and publishedAt from each post's frontmatter", async () => {
    getContent
      .mockResolvedValueOnce({
        data: [{ type: "file", name: "post.md", path: "content/blog/post.md" }],
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(
            "---\ntitle: Un article\npublishedAt: '2026-06-01'\npillar: C\nlocalAngle: true\nsourceUrl: https://source.example/actu\ntags:\n  - QVCT\n  - RPS\n---\n"
          ).toString("base64"),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const posts = await github.listPublishedPosts();

    expect(posts).toEqual([
      {
        title: "Un article",
        publishedAt: "2026-06-01",
        pillar: "C",
        localAngle: true,
        sourceUrl: "https://source.example/actu",
        tags: ["QVCT", "RPS"],
      },
    ]);
  });

  it("defaults gracefully when a post predates the pillar/localAngle/sourceUrl/tags fields", async () => {
    getContent
      .mockResolvedValueOnce({
        data: [{ type: "file", name: "post.md", path: "content/blog/post.md" }],
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(
            "---\ntitle: Ancien article\npublishedAt: '2026-01-01'\n---\n"
          ).toString("base64"),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const posts = await github.listPublishedPosts();

    expect(posts).toEqual([
      {
        title: "Ancien article",
        publishedAt: "2026-01-01",
        pillar: null,
        localAngle: false,
        sourceUrl: null,
        tags: [],
      },
    ]);
  });

  it("ignores an unrecognized pillar value instead of trusting it blindly", async () => {
    getContent
      .mockResolvedValueOnce({
        data: [{ type: "file", name: "post.md", path: "content/blog/post.md" }],
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(
            "---\ntitle: Article corrompu\npublishedAt: '2026-01-01'\npillar: Z\n---\n"
          ).toString("base64"),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const posts = await github.listPublishedPosts();

    expect(posts[0].pillar).toBeNull();
  });

  it("ignores a non-string sourceUrl value instead of trusting it blindly", async () => {
    getContent
      .mockResolvedValueOnce({
        data: [{ type: "file", name: "post.md", path: "content/blog/post.md" }],
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(
            "---\ntitle: Article corrompu\npublishedAt: '2026-01-01'\nsourceUrl: 42\n---\n"
          ).toString("base64"),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const posts = await github.listPublishedPosts();

    expect(posts[0].sourceUrl).toBeNull();
  });

  it("returns posts sorted chronologically by publishedAt regardless of directory-listing order", async () => {
    getContent
      .mockResolvedValueOnce({
        data: [
          { type: "file", name: "recent.md", path: "content/blog/recent.md" },
          { type: "file", name: "ancien.md", path: "content/blog/ancien.md" },
        ],
      })
      // "recent.md" listé en premier par l'API (ordre alphabétique), mais
      // publié après "ancien.md" — l'ordre de sortie doit suivre publishedAt,
      // pas l'ordre du dossier.
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(
            "---\ntitle: Article récent\npublishedAt: '2026-06-01'\n---\n"
          ).toString("base64"),
        },
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(
            "---\ntitle: Article ancien\npublishedAt: '2026-01-01'\n---\n"
          ).toString("base64"),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const posts = await github.listPublishedPosts();

    expect(posts.map((p) => p.title)).toEqual(["Article ancien", "Article récent"]);
  });
});

describe("createGithubBlogRepo.commitDraftBranch", () => {
  function resetCommitMocks() {
    getRef.mockReset();
    createRef.mockReset();
    createOrUpdateFileContents.mockReset();
    getContent.mockReset();
    updateRef.mockReset();
  }

  it("skips writing cover.jpg when no cover image is provided", async () => {
    resetCommitMocks();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockResolvedValue({});
    getContent.mockRejectedValue({ status: 404 });
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

  it("commits directly onto an already-existing draft branch instead of force-resetting it (retouche)", async () => {
    resetCommitMocks();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockRejectedValueOnce({ status: 422 });
    getContent
      .mockResolvedValueOnce({ data: { type: "file", sha: "old-post-sha" } })
      .mockResolvedValueOnce({ data: { type: "file", sha: "old-cover-sha" } });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.commitDraftBranch({
      slug: "mon-article",
      postMarkdown: "nouveau contenu",
      coverImage: Buffer.from("nouvelle-image"),
      commitMessage: "blog: retouche",
    });

    // Un ruleset de dépôt peut bloquer les force-push (constaté en prod) —
    // la branche existante ne doit donc jamais être réinitialisée.
    expect(updateRef).not.toHaveBeenCalled();
    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ path: "content/_drafts/mon-article/post.md", sha: "old-post-sha" })
    );
    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "content/_drafts/mon-article/cover.jpg",
        sha: "old-cover-sha",
      })
    );
  });

  it("creates files without a sha when the existing branch doesn't have them yet", async () => {
    resetCommitMocks();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockRejectedValueOnce({ status: 422 });
    getContent.mockRejectedValue({ status: 404 });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.commitDraftBranch({
      slug: "mon-article",
      postMarkdown: "contenu",
      coverImage: null,
      commitMessage: "blog: retouche",
    });

    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ path: "content/_drafts/mon-article/post.md" })
    );
    const call = createOrUpdateFileContents.mock.calls[0][0];
    expect(call.sha).toBeUndefined();
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

describe("createGithubBlogRepo.queueActualiteProposal / getActualiteProposal / listProposedActualiteSourceUrls", () => {
  function resetProposalMocks() {
    getRef.mockReset();
    createRef.mockReset();
    getContent.mockReset();
    createOrUpdateFileContents.mockReset();
    listMatchingRefs.mockReset();
  }

  const candidate = {
    title: "Nouvelle obligation QVCT",
    summary: "Résumé factuel vérifiable.",
    sourceUrl: "https://source.example/actu-1",
    pillar: pillarD,
  };

  it("commits the candidate as JSON on a dedicated branch derived from the source URL", async () => {
    resetProposalMocks();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockResolvedValue({});
    getContent.mockRejectedValue({ status: 404 });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const { id } = await github.queueActualiteProposal(candidate);

    expect(id).toMatch(/^[0-9a-f]{12}$/);
    expect(createRef).toHaveBeenCalledWith(
      expect.objectContaining({ ref: `refs/heads/blog-actu-proposal/${id}` })
    );
    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        branch: `blog-actu-proposal/${id}`,
        path: `content/_actu-proposals/${id}.json`,
        content: Buffer.from(JSON.stringify(candidate), "utf8").toString("base64"),
      })
    );
  });

  it("derives the same id for the same source URL, so proposing it again is idempotent", async () => {
    resetProposalMocks();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockResolvedValue({});
    getContent.mockRejectedValue({ status: 404 });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const first = await github.queueActualiteProposal(candidate);
    const second = await github.queueActualiteProposal(candidate);

    expect(second.id).toBe(first.id);
  });

  it("does not throw when the proposal branch already exists (422)", async () => {
    resetProposalMocks();
    getRef.mockResolvedValue({ data: { object: { sha: "base-sha" } } });
    createRef.mockRejectedValueOnce({ status: 422 });
    getContent.mockResolvedValueOnce({ data: { type: "file", sha: "existing-sha" } });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await expect(github.queueActualiteProposal(candidate)).resolves.toEqual(
      expect.objectContaining({ id: expect.any(String) })
    );
    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ sha: "existing-sha" })
    );
  });

  it("reads back a queued proposal by id", async () => {
    resetProposalMocks();
    getContent.mockResolvedValueOnce({
      data: { type: "file", content: Buffer.from(JSON.stringify(candidate), "utf8").toString("base64") },
    });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.getActualiteProposal("abc123def456");

    expect(getContent).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "content/_actu-proposals/abc123def456.json",
        ref: "blog-actu-proposal/abc123def456",
      })
    );
    expect(result).toEqual(candidate);
  });

  it("returns null for an unknown proposal id (branch or file deleted)", async () => {
    resetProposalMocks();
    getContent.mockRejectedValue({ status: 404 });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const result = await github.getActualiteProposal("disparu");

    expect(result).toBeNull();
  });

  it("lists the sourceUrl of every proposal branch, whether pending, approved or rejected", async () => {
    resetProposalMocks();
    listMatchingRefs.mockResolvedValue({
      data: [
        { ref: "refs/heads/blog-actu-proposal/aaa111" },
        { ref: "refs/heads/blog-actu-proposal/bbb222" },
      ],
    });
    getContent
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(JSON.stringify({ ...candidate, sourceUrl: "https://a.example/1" })).toString(
            "base64"
          ),
        },
      })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(JSON.stringify({ ...candidate, sourceUrl: "https://b.example/2" })).toString(
            "base64"
          ),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const urls = await github.listProposedActualiteSourceUrls();

    expect(listMatchingRefs).toHaveBeenCalledWith(
      expect.objectContaining({ ref: "heads/blog-actu-proposal/" })
    );
    expect(urls).toEqual(["https://a.example/1", "https://b.example/2"]);
  });

  it("still returns the other branches' sourceUrl when one branch's read fails unexpectedly", async () => {
    resetProposalMocks();
    listMatchingRefs.mockResolvedValue({
      data: [
        { ref: "refs/heads/blog-actu-proposal/aaa111" },
        { ref: "refs/heads/blog-actu-proposal/bbb222" },
      ],
    });
    getContent
      .mockRejectedValueOnce({ status: 500 })
      .mockResolvedValueOnce({
        data: {
          type: "file",
          content: Buffer.from(JSON.stringify({ ...candidate, sourceUrl: "https://b.example/2" })).toString(
            "base64"
          ),
        },
      });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const urls = await github.listProposedActualiteSourceUrls();

    expect(urls).toEqual(["https://b.example/2"]);
  });

  it("returns an empty array when no proposal branch exists yet", async () => {
    resetProposalMocks();
    listMatchingRefs.mockResolvedValue({ data: [] });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const urls = await github.listProposedActualiteSourceUrls();

    expect(urls).toEqual([]);
    expect(getContent).not.toHaveBeenCalled();
  });
});

describe("createGithubBlogRepo.queueDiscordTopic", () => {
  it("creates content/blog/sujets-discord.json on baseBranch when it doesn't exist yet", async () => {
    getContent.mockReset();
    createOrUpdateFileContents.mockReset();
    getContent.mockRejectedValue({ status: 404 });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.queueDiscordTopic({ topic: "Un sujet", notes: "Des notes" });

    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({
        branch: "master",
        path: "content/blog/sujets-discord.json",
      })
    );
    const call = createOrUpdateFileContents.mock.calls[0][0];
    expect(call.sha).toBeUndefined();
    const written = JSON.parse(Buffer.from(call.content, "base64").toString("utf8"));
    expect(written).toEqual([
      expect.objectContaining({
        topic: "Un sujet",
        notes: "Des notes",
        status: "a_publier",
        submittedAt: expect.any(String),
      }),
    ]);
  });

  it("appends to the existing queue rather than overwriting it", async () => {
    getContent.mockReset();
    createOrUpdateFileContents.mockReset();
    const existing = [
      { topic: "Ancien sujet", notes: null, submittedAt: "2026-01-01T00:00:00.000Z", status: "publie" },
    ];
    getContent.mockResolvedValue({
      data: {
        type: "file",
        sha: "queue-sha",
        content: Buffer.from(JSON.stringify(existing)).toString("base64"),
      },
    });
    createOrUpdateFileContents.mockResolvedValue({});

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    await github.queueDiscordTopic({ topic: "Nouveau sujet", notes: null });

    expect(createOrUpdateFileContents).toHaveBeenCalledWith(
      expect.objectContaining({ sha: "queue-sha" })
    );
    const call = createOrUpdateFileContents.mock.calls[0][0];
    const written = JSON.parse(Buffer.from(call.content, "base64").toString("utf8"));
    expect(written).toHaveLength(2);
    expect(written[0]).toEqual(existing[0]);
    expect(written[1]).toEqual(
      expect.objectContaining({ topic: "Nouveau sujet", notes: null, status: "a_publier" })
    );
  });
});

describe("createGithubBlogRepo.getNextDiscordTopic", () => {
  it("returns the first entry still marked a_publier", async () => {
    getContent.mockReset();
    const entries = [
      { topic: "Déjà publié", notes: null, submittedAt: "2026-01-01T00:00:00.000Z", status: "publie" },
      { topic: "En attente", notes: "notes", submittedAt: "2026-02-01T00:00:00.000Z", status: "a_publier" },
    ];
    getContent.mockResolvedValue({
      data: { type: "file", content: Buffer.from(JSON.stringify(entries)).toString("base64") },
    });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    const next = await github.getNextDiscordTopic();

    expect(next).toEqual(entries[1]);
  });

  it("returns null when the queue file doesn't exist", async () => {
    getContent.mockReset();
    getContent.mockRejectedValue({ status: 404 });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    expect(await github.getNextDiscordTopic()).toBeNull();
  });

  it("returns null when every entry is already publie", async () => {
    getContent.mockReset();
    const entries = [
      { topic: "Déjà publié", notes: null, submittedAt: "2026-01-01T00:00:00.000Z", status: "publie" },
    ];
    getContent.mockResolvedValue({
      data: { type: "file", content: Buffer.from(JSON.stringify(entries)).toString("base64") },
    });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    expect(await github.getNextDiscordTopic()).toBeNull();
  });

  it("returns null when the file is an empty array", async () => {
    getContent.mockReset();
    getContent.mockResolvedValue({
      data: { type: "file", content: Buffer.from("[]").toString("base64") },
    });

    const github = createGithubBlogRepo({
      auth: "token",
      owner: "thacac",
      repo: "elancestvous",
      baseBranch: "master",
    });

    expect(await github.getNextDiscordTopic()).toBeNull();
  });
});
