import { createAnthropicDraftGenerator } from "./anthropicDraftGenerator";
import { createOpenAiImageGenerator } from "./openaiImageGenerator";
import { createGithubBlogRepo } from "./githubBlogRepo";
import type { GenerateDraftDeps } from "./generateDraft";

/**
 * Construit les dépendances réelles (Anthropic, OpenAI, GitHub) à partir des
 * variables d'environnement. Isolé de generateDraft() pour que l'orchestrateur
 * reste testable par injection sans toucher au réseau.
 */
export function createBlogDraftDeps(): GenerateDraftDeps {
  const [owner, repo] = requireEnv("GITHUB_REPO").split("/");
  if (!owner || !repo) {
    throw new Error('GITHUB_REPO doit être au format "owner/repo"');
  }

  return {
    anthropic: createAnthropicDraftGenerator({
      apiKey: requireEnv("ANTHROPIC_API_KEY"),
    }),
    imageGenerator: createOpenAiImageGenerator({
      apiKey: requireEnv("IMAGE_GEN_API_KEY"),
    }),
    github: createGithubBlogRepo({
      auth: requireEnv("GITHUB_BLOG_PAT"),
      owner,
      repo,
    }),
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}
