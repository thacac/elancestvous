import { createHash } from "node:crypto";

import { Octokit } from "@octokit/rest";
import matter from "gray-matter";

import { PILLARS, type PillarId } from "./pillars";

import type { ActualiteCandidate } from "./actualiteWatch";

const CONTENT_BLOG_PATH = "content/blog";
const VALID_PILLAR_IDS = new Set<string>(PILLARS.map((p) => p.id));
// Préfixe de branche pour une actualité proposée à validation humaine avant
// génération (correction de #66 : un flux RSS/Atom externe n'est pas trié
// par un humain ni par un agent, donc rien ne garantit sa pertinence pour
// l'audience — la génération ne doit jamais démarrer sans un "OK" explicite).
const ACTUALITE_PROPOSAL_BRANCH_PREFIX = "blog-actu-proposal/";

// Exportée (pas seulement interne à queueActualiteProposal) : generateDraft.ts
// doit pouvoir calculer le même id *avant* de committer quoi que ce soit, pour
// notifier Discord d'abord et ne persister la proposition qu'une fois la
// notification confirmée (cf. queueActualiteProposal, plus bas).
export function deriveActualiteProposalId(sourceUrl: string): string {
  return createHash("sha256").update(sourceUrl).digest("hex").slice(0, 12);
}

export type PublishedPost = {
  title: string;
  publishedAt: string;
  // null pour un article publié avant l'introduction du champ pillar, ou
  // portant une valeur qui ne correspond plus à un pilier connu (édition
  // manuelle, renommage) — pickNextPillar() (services/blog/pillars.ts)
  // l'ignore simplement plutôt que d'échouer sur l'historique existant.
  pillar: PillarId | null;
  localAngle: boolean;
  // URL de la source d'actualité citée (#66) — null pour un article de
  // rotation classique. Sert à exclure les sources déjà traitées (mitigation
  // "pas de dédoublonnage" de #66) via actualiteWatch.ts.
  sourceUrl: string | null;
  tags: string[];
};

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
    async listPublishedPosts(): Promise<PublishedPost[]> {
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

      const posts: PublishedPost[] = [];
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
        if (typeof frontmatter.title !== "string") continue;
        const pillar =
          typeof frontmatter.pillar === "string" && VALID_PILLAR_IDS.has(frontmatter.pillar)
            ? (frontmatter.pillar as PillarId)
            : null;
        posts.push({
          title: frontmatter.title,
          publishedAt: typeof frontmatter.publishedAt === "string" ? frontmatter.publishedAt : "",
          pillar,
          localAngle: frontmatter.localAngle === true,
          sourceUrl: typeof frontmatter.sourceUrl === "string" ? frontmatter.sourceUrl : null,
          tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        });
      }
      // L'ordre de listage de l'API Contents (alphabétique par nom de
      // fichier) ne correspond pas à l'ordre de publication (cf.
      // lib/blog.ts qui re-trie lui aussi par publishedAt) — les
      // consommateurs (rotation de piliers, cf. generateDraft.ts) supposent
      // un ordre chronologique croissant (le plus récent en dernier).
      posts.sort((a, b) => (a.publishedAt < b.publishedAt ? -1 : a.publishedAt > b.publishedAt ? 1 : 0));
      return posts;
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

    // Id dérivé du sourceUrl (pas un aléa) : proposer deux fois la même
    // actualité (deux exécutions du cron avant qu'une décision humaine soit
    // prise) retombe sur la même branche/id plutôt que d'en créer une
    // nouvelle à chaque fois.
    async queueActualiteProposal(
      candidate: ActualiteCandidate
    ): Promise<{ id: string }> {
      const id = deriveActualiteProposalId(candidate.sourceUrl);
      const branchName = `${ACTUALITE_PROPOSAL_BRANCH_PREFIX}${id}`;
      const path = `content/_actu-proposals/${id}.json`;

      const { data: baseRef } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });

      try {
        await octokit.rest.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branchName}`,
          sha: baseRef.object.sha,
        });
      } catch (err) {
        if (!isUnprocessable(err)) throw err;
        // Cette actualité a déjà été proposée (même id, dérivé du même
        // sourceUrl) : on réécrit le même contenu sur la branche existante
        // plutôt que d'échouer, idempotent comme commitDraftBranch().
      }

      let sha: string | undefined;
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branchName });
        if (!Array.isArray(data) && data.type === "file") sha = data.sha;
      } catch (err) {
        if (!isNotFound(err)) throw err;
      }

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        branch: branchName,
        path,
        message: `blog: actualité proposée "${candidate.title}"`,
        content: Buffer.from(JSON.stringify(candidate), "utf8").toString("base64"),
        ...(sha ? { sha } : {}),
      });

      return { id };
    },

    async getActualiteProposal(id: string): Promise<ActualiteCandidate | null> {
      const branchName = `${ACTUALITE_PROPOSAL_BRANCH_PREFIX}${id}`;
      const path = `content/_actu-proposals/${id}.json`;
      try {
        const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branchName });
        if (Array.isArray(data) || data.type !== "file" || !data.content) return null;
        return JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
      } catch (err) {
        if (isNotFound(err)) return null;
        throw err;
      }
    },

    // Une actualité déjà proposée à validation humaine ne doit plus jamais
    // être re-proposée, qu'elle ait été approuvée, ignorée, ou qu'elle
    // attende encore une décision — la branche de proposition sert donc de
    // registre permanent, sans fichier de suivi séparé à maintenir en plus.
    async listProposedActualiteSourceUrls(): Promise<string[]> {
      const { data: refs } = await octokit.rest.git.listMatchingRefs({
        owner,
        repo,
        ref: `heads/${ACTUALITE_PROPOSAL_BRANCH_PREFIX}`,
      });

      // En parallèle (pas séquentiel) et tolérant à l'échec d'une branche
      // isolée (réseau, 5xx transitoire) : cette liste grandit avec chaque
      // actualité jamais proposée (aucun nettoyage des branches décidées
      // pour l'instant, accepté vu le volume attendu d'un blog hebdomadaire)
      // — la lire séquentiellement ajouterait une latence croissante à
      // chaque génération, et une seule branche en échec ne doit pas priver
      // les autres candidats déjà lus de leur exclusion.
      const results = await Promise.allSettled(
        refs.map(async (ref) => {
          const branchName = ref.ref.replace("refs/heads/", "");
          const id = branchName.slice(ACTUALITE_PROPOSAL_BRANCH_PREFIX.length);
          const path = `content/_actu-proposals/${id}.json`;
          const { data } = await octokit.rest.repos.getContent({ owner, repo, path, ref: branchName });
          if (Array.isArray(data) || data.type !== "file" || !data.content) return null;
          const parsed = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));
          return typeof parsed.sourceUrl === "string" ? parsed.sourceUrl : null;
        })
      );

      return results.flatMap((result) =>
        result.status === "fulfilled" && result.value !== null ? [result.value] : []
      );
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
