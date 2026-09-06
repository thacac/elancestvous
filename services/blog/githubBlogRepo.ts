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
      coverImage: Buffer | null;
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
        if (!isUnprocessable(err)) throw err;
        // La branche existe déjà (retouche d'un brouillon déjà généré, ou
        // re-génération d'un même slug) : on commite directement dessus
        // plutôt que de la réinitialiser sur la base actuelle — un ruleset
        // de dépôt peut interdire le force-push (constaté en prod avec
        // "Cannot force-push to this branch"), et ce n'est de toute façon
        // pas nécessaire : createOrUpdateFileContents met à jour les
        // fichiers en place ci-dessous, en récupérant leur sha existant.
      }

      await writeDraftFile(
        `content/_drafts/${args.slug}/post.md`,
        Buffer.from(args.postMarkdown, "utf8").toString("base64")
      );
      // Pas d'image tant que la génération n'est pas configurée (ex. clé
      // OpenAI absente) : on committe le brouillon texte seul plutôt que
      // d'échouer sur un fichier qu'on n'a pas.
      if (args.coverImage) {
        await writeDraftFile(
          `content/_drafts/${args.slug}/cover.jpg`,
          args.coverImage.toString("base64")
        );
      }

      async function writeDraftFile(path: string, content: string): Promise<void> {
        // Un fichier déjà présent sur la branche (retouche) exige son sha
        // actuel pour être mis à jour ; un fichier absent (première
        // génération, ou brouillon texte-seul qui gagne une image) doit au
        // contraire être créé sans sha.
        let sha: string | undefined;
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branchName,
          });
          if (!Array.isArray(data) && data.type === "file") sha = data.sha;
        } catch (err) {
          if (!isNotFound(err)) throw err;
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner,
          repo,
          branch: branchName,
          path,
          message: args.commitMessage,
          content,
          ...(sha ? { sha } : {}),
        });
      }

      return {
        branch: branchName,
        url: `https://github.com/${owner}/${repo}/tree/${branchName}`,
      };
    },

    async publishDraft(args: {
      slug: string;
      commitMessage: string;
    }): Promise<{ commitUrl: string }> {
      // Git Data API plutôt que Contents API : on réutilise les blobs déjà
      // commités sur blog-draft/<slug> à leur SHA (pas de re-upload) —
      // c'est le "greffage" documenté dans docs/blog-architecture.md.
      const draftBranch = `blog-draft/${args.slug}`;

      const { data: draftRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${draftBranch}`,
      });
      const { data: draftCommit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: draftRef.object.sha,
      });
      const { data: draftTree } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: draftCommit.tree.sha,
        recursive: "true",
      });

      const postEntry = draftTree.tree.find(
        (entry) =>
          entry.path === `content/_drafts/${args.slug}/post.md` && entry.type === "blob"
      );
      if (!postEntry?.sha) {
        throw new Error(
          `Impossible de publier "${args.slug}" : post.md introuvable sur ${draftBranch}`
        );
      }
      const coverEntry = draftTree.tree.find(
        (entry) =>
          entry.path === `content/_drafts/${args.slug}/cover.jpg` && entry.type === "blob"
      );

      const { data: masterRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });
      const { data: masterCommit } = await octokit.rest.git.getCommit({
        owner,
        repo,
        commit_sha: masterRef.object.sha,
      });

      const tree = [
        {
          path: `content/blog/${args.slug}.md`,
          mode: "100644" as const,
          type: "blob" as const,
          sha: postEntry.sha,
        },
        ...(coverEntry?.sha
          ? [
              {
                path: `public/blog/${args.slug}/cover.jpg`,
                mode: "100644" as const,
                type: "blob" as const,
                sha: coverEntry.sha,
              },
            ]
          : []),
      ];

      const { data: newTree } = await octokit.rest.git.createTree({
        owner,
        repo,
        base_tree: masterCommit.tree.sha,
        tree,
      });
      const { data: newCommit } = await octokit.rest.git.createCommit({
        owner,
        repo,
        message: args.commitMessage,
        tree: newTree.sha,
        parents: [masterRef.object.sha],
      });
      try {
        await octokit.rest.git.updateRef({
          owner,
          repo,
          ref: `heads/${baseBranch}`,
          sha: newCommit.sha,
        });
      } catch (err) {
        // 422 = non-fast-forward : quelqu'un a poussé sur master entre la
        // lecture de masterRef et cette mise à jour (une autre publication,
        // un push manuel...). L'erreur Octokit brute remonterait jusqu'au
        // message Discord de façon peu actionnable.
        if (isUnprocessable(err)) {
          throw new Error(
            `Publication de "${args.slug}" impossible : ${baseBranch} a changé entre-temps, réessaie.`
          );
        }
        throw err;
      }

      return { commitUrl: `https://github.com/${owner}/${repo}/commit/${newCommit.sha}` };
    },

    async getDraftContent(
      slug: string
    ): Promise<{ markdown: string; coverImage: Buffer | null } | null> {
      const branch = `blog-draft/${slug}`;
      let postData;
      try {
        ({ data: postData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: `content/_drafts/${slug}/post.md`,
          ref: branch,
        }));
      } catch (err) {
        if (isNotFound(err)) return null;
        throw err;
      }
      if (Array.isArray(postData) || postData.type !== "file" || !postData.content) {
        return null;
      }

      // cover.jpg peut manquer si le brouillon a été généré sans
      // IMAGE_GEN_API_KEY (bypass) — un texte committé ne doit pas devenir
      // introuvable pour l'aperçu juste parce que l'image n'existe pas.
      let coverImage: Buffer | null = null;
      try {
        const { data: coverData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: `content/_drafts/${slug}/cover.jpg`,
          ref: branch,
        });
        if (!Array.isArray(coverData) && coverData.type === "file" && coverData.content) {
          coverImage = Buffer.from(coverData.content, "base64");
        }
      } catch (err) {
        if (!isNotFound(err)) throw err;
      }

      return {
        markdown: Buffer.from(postData.content, "base64").toString("utf8"),
        coverImage,
      };
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
