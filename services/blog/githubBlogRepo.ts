import { Octokit } from "@octokit/rest";
import matter from "gray-matter";

const CONTENT_BLOG_PATH = "content/blog";

export function createGithubBlogRepo(options: {
  auth: string;
  owner: string;
  repo: string;
  baseBranch?: string;
}) {
  const octokit = new Octokit({ auth: options.auth });
  const { owner, repo } = options;
  const baseBranch = options.baseBranch ?? "master";

  return {
    async listPublishedPostTitles(): Promise<string[]> {
      let entries;
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: CONTENT_BLOG_PATH,
          ref: baseBranch,
        });
        entries = Array.isArray(data) ? data : [data];
      } catch (err) {
        // Pas de contenu publié pour l'instant (dossier absent) — pas une erreur bloquante.
        if (isNotFound(err)) return [];
        throw err;
      }

      const titles: string[] = [];
      for (const entry of entries) {
        if (entry.type !== "file" || !entry.name.endsWith(".md")) continue;
        const { data: file } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: entry.path,
          ref: baseBranch,
        });
        if (Array.isArray(file) || file.type !== "file" || !file.content) continue;
        const raw = Buffer.from(file.content, "base64").toString("utf8");
        const { data: frontmatter } = matter(raw);
        if (typeof frontmatter.title === "string") titles.push(frontmatter.title);
      }
      return titles;
    },

    async commitDraftBranch(args: {
      slug: string;
      postMarkdown: string;
      coverImage: Buffer;
      commitMessage: string;
    }): Promise<{ branch: string; url: string }> {
      // Contents API plutôt que Git Data API (blobs/trees/commits) : un seul
      // article + une image à la fois, pas besoin de la plomberie bas niveau —
      // GitHub construit blob/tree/commit tout seul derrière un simple PUT.
      // Contrepartie : deux fichiers = deux commits séquentiels sur la branche
      // plutôt qu'un seul commit atomique, sans conséquence pour une branche de
      // brouillon jetable. La création de branche, elle, reste Git Data API —
      // la Contents API ne sait pas créer une branche, seulement y écrire.
      const branchName = `blog-draft/${args.slug}`;

      const { data: baseRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });
      const baseSha = baseRef.object.sha;

      try {
        await octokit.rest.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: baseSha,
        });
      } catch (err) {
        // La branche existe déjà (re-génération d'un même slug) : on la
        // réinitialise sur la base actuelle plutôt que de gérer les sha des
        // fichiers existants un par un.
        if (isUnprocessable(err)) {
          await octokit.rest.git.updateRef({
            owner,
            repo,
            ref: `heads/${branchName}`,
            sha: baseSha,
            force: true,
          });
        } else {
          throw err;
        }
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch: branchName,
        path: `content/_drafts/${args.slug}/post.md`,
        message: args.commitMessage,
        content: Buffer.from(args.postMarkdown, "utf8").toString("base64"),
      });
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch: branchName,
        path: `content/_drafts/${args.slug}/cover.jpg`,
        message: args.commitMessage,
        content: args.coverImage.toString("base64"),
      });

      return {
        branch: branchName,
        url: `https://github.com/${owner}/${repo}/tree/${branchName}`,
      };
    },

    async getDraftContent(
      slug: string
    ): Promise<{ markdown: string; coverImage: Buffer } | null> {
      const branch = `blog-draft/${slug}`;
      try {
        const [postRes, coverRes] = await Promise.all([
          octokit.rest.repos.getContent({
            owner,
            repo,
            path: `content/_drafts/${slug}/post.md`,
            ref: branch,
          }),
          octokit.rest.repos.getContent({
            owner,
            repo,
            path: `content/_drafts/${slug}/cover.jpg`,
            ref: branch,
          }),
        ]);
        const postData = postRes.data;
        const coverData = coverRes.data;
        if (
          Array.isArray(postData) ||
          postData.type !== "file" ||
          !postData.content ||
          Array.isArray(coverData) ||
          coverData.type !== "file" ||
          !coverData.content
        ) {
          return null;
        }
        return {
          markdown: Buffer.from(postData.content, "base64").toString("utf8"),
          coverImage: Buffer.from(coverData.content, "base64"),
        };
      } catch (err) {
        if (isNotFound(err)) return null;
        throw err;
      }
    },
  };
}

export function parseGithubRepoEnv(value: string): { owner: string; repo: string } {
  const segments = value.split("/").map((s) => s.trim());
  if (segments.length !== 2 || !segments[0] || !segments[1]) {
    throw new Error('GITHUB_REPO doit être au format "owner/repo"');
  }
  return { owner: segments[0], repo: segments[1] };
}

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && err.status === 404;
}

function isUnprocessable(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && err.status === 422;
}
