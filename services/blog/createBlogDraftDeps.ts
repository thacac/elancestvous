import { createReviewToken } from "@/lib/reviewToken";
import { SITE } from "@/lib/siteIdentifiers";

import { createAnthropicDraftGenerator } from "./anthropicDraftGenerator";
import { createDiscordNotifier } from "./discordNotifier";
import { createGithubBlogRepo, parseGithubRepoEnv } from "./githubBlogRepo";
import { createOpenAiImageGenerator } from "./openaiImageGenerator";

import type { GenerateDraftDeps } from "./generateDraft";

/**
 * Construit les dépendances réelles (Anthropic, OpenAI, GitHub, Discord) à
 * partir des variables d'environnement. Isolé de generateDraft() pour que
 * l'orchestrateur reste testable par injection sans toucher au réseau.
 */
export function createBlogDraftDeps(): GenerateDraftDeps {
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
    anthropic: createAnthropicDraftGenerator({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
    }),
    imageGenerator: imageGenApiKey
      ? createOpenAiImageGenerator({ apiKey: imageGenApiKey })
      : undefined,
    github: createGithubBlogRepo({
      auth: requireEnv("GITHUB_BLOG_PAT"),
      owner,
      repo,
    }),
    discord: {
      async notifyDraftReady(args) {
        const token = createReviewToken(args.slug, reviewSecret);
        const previewUrl = `${SITE}/blog-review/${args.slug}?token=${token}`;
        return discordNotifier.notifyDraftReady({ ...args, previewUrl });
      },
    },
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}
