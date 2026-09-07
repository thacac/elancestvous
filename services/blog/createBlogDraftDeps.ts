import { createReviewToken } from "@/lib/reviewToken";
import { SITE } from "@/lib/siteIdentifiers";

import { createActualiteWatch } from "./actualiteWatch";
import { createAnthropicDraftGenerator } from "./anthropicDraftGenerator";
import { createDiscordNotifier } from "./discordNotifier";
import { createGithubBlogRepo, parseGithubRepoEnv } from "./githubBlogRepo";
import { createOpenAiImageGenerator } from "./openaiImageGenerator";
import { createRssFeedFetcher } from "./rssFeedFetcher";
import { parseVeilleSources } from "./veilleSources";

import type { GenerateDraftDeps } from "./generateDraft";
import type { ReviseDraftDeps } from "./reviseDraft";

/**
 * Construit les dépendances communes (GitHub, image, Discord) à partir des
 * variables d'environnement — partagé par createBlogDraftDeps() (génération
 * hebdomadaire) et createReviseDraftDeps() (retouche via Discord), qui ne
 * diffèrent que sur la méthode Anthropic utilisée (parseDraft vs
 * reviseDraft).
 */
function buildSharedDeps() {
  const { owner, repo } = parseGithubRepoEnv(requireEnv("GITHUB_REPO"));
  const reviewSecret = requireEnv("BLOG_REVIEW_SECRET");
  const discordNotifier = createDiscordNotifier({
    botToken: requireEnv("DISCORD_BOT_TOKEN"),
    channelId: requireEnv("DISCORD_CHANNEL_ID"),
  });

  // Optionnelle : tant que l'accès à l'API OpenAI n'est pas configuré, le
  // brouillon est généré et notifié sans illustration plutôt que de bloquer
  // toute la génération (cf. generateDraft.ts).
  const imageGenApiKey = process.env.IMAGE_GEN_API_KEY;

  return {
    imageGenerator: imageGenApiKey
      ? createOpenAiImageGenerator({ apiKey: imageGenApiKey })
      : undefined,
    github: createGithubBlogRepo({
      auth: requireEnv("GH_PAT_TOKEN"),
      owner,
      repo,
    }),
    discord: {
      async notifyDraftReady(args: {
        slug: string;
        title: string;
        excerpt: string;
        coverImage: Buffer | null;
        sourceUrl?: string | null;
        missingServiceLink: boolean;
      }) {
        const token = createReviewToken(args.slug, reviewSecret);
        const previewUrl = `${SITE}/blog-review/${args.slug}?token=${token}`;
        return discordNotifier.notifyDraftReady({
          ...args,
          previewUrl,
          sourceUrl: args.sourceUrl ?? null,
        });
      },
      // Pas de previewUrl signée nécessaire ici : le lien de l'embed pointe
      // directement sur sourceUrl (la source de l'actualité elle-même),
      // rien à prévisualiser sur le site tant que l'article n'existe pas.
      notifyActualiteProposal: discordNotifier.notifyActualiteProposal,
    },
  };
}

/**
 * Construit les dépendances réelles de la génération hebdomadaire.
 * Isolé de generateDraft() pour que l'orchestrateur reste testable par
 * injection sans toucher au réseau.
 */
export function createBlogDraftDeps(): GenerateDraftDeps {
  return {
    anthropic: createAnthropicDraftGenerator({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
    }),
    // Sources vides tant qu'aucune n'a été choisie/configurée
    // (BLOG_VEILLE_SOURCES) : findActualite() renvoie alors toujours null et
    // generateDraft.ts retombe directement sur la rotation pondérée de
    // piliers (#52) — aucun branchement conditionnel nécessaire ici.
    actualiteWatch: createActualiteWatch({
      sources: parseVeilleSources(process.env.BLOG_VEILLE_SOURCES),
      fetchFeedItems: createRssFeedFetcher(),
    }),
    ...buildSharedDeps(),
  };
}

/**
 * Construit les dépendances réelles de la retouche (bouton "Retoucher" sur
 * Discord). Mêmes secrets/branchements que createBlogDraftDeps(), seule la
 * méthode Anthropic utilisée diffère (reviseDraft, avec prompt caching sur
 * le system prompt, plutôt que parseDraft).
 */
export function createReviseDraftDeps(): ReviseDraftDeps {
  return {
    anthropic: createAnthropicDraftGenerator({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
    }),
    ...buildSharedDeps(),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}
