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
      const branchName = `blog-draft/${args.slug}`;

      const { data: baseRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });
      const baseSha = baseRef.object.sha;
      const { data: baseCommit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: baseSha,
      });

      const [postBlob, imageBlob] = await Promise.all([
        octokit.rest.git.createBlob({
          owner,
          repo,
          content: Buffer.from(args.postMarkdown, "utf8").toString("base64"),
          encoding: "base64",
        }),
        octokit.rest.git.createBlob({
          owner,
          repo,
          content: args.coverImage.toString("base64"),
          encoding: "base64",
        }),
      ]);

      const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: baseCommit.tree.sha,
        tree: [
          {
            path: `content/_drafts/${args.slug}/post.md`,
            mode: "100644",
            type: "blob",
            sha: postBlob.data.sha,
          },
          {
            path: `content/_drafts/${args.slug}/cover.jpg`,
            mode: "100644",
            type: "blob",
            sha: imageBlob.data.sha,
          },
        ],
      });

      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: args.commitMessage,
        tree: newTree.sha,
        parents: [baseSha],
      });

      try {
        await octokit.rest.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: newCommit.sha,
        });
      } catch (err) {
        // La branche existe déjà (re-génération d'un même slug) : on la met à jour.
        if (isUnprocessable(err)) {
          await octokit.rest.git.updateRef({
            owner,
            repo,
            ref: `heads/${branchName}`,
            sha: newCommit.sha,
            force: true,
          });
        } else {
          throw err;
        }
      }

      return {
        branch: branchName,
        url: `https://github.com/${owner}/${repo}/tree/${branchName}`,
      };
    },
  };
}

function isNotFound(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && err.status === 404;
}

function isUnprocessable(err: unknown): boolean {
  return typeof err === "object" && err !== null && "status" in err && err.status === 422;
}
