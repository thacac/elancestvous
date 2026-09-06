import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { BlogDraftSchema } from "./draftSchema";
import { SYSTEM_PROMPT, type AnthropicParseResult } from "./generateDraft";

const DEFAULT_MODEL = "claude-opus-5";

export function createAnthropicDraftGenerator(options?: {
  apiKey?: string;
  model?: string;
}) {
  const client = new Anthropic({ apiKey: options?.apiKey });
  const model = options?.model ?? process.env.ANTHROPIC_BLOG_MODEL ?? DEFAULT_MODEL;

  return {
    async parseDraft(existingTitles: string[]): Promise<AnthropicParseResult> {
      const response = await client.messages.parse({
        model,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        output_config: { format: zodOutputFormat(BlogDraftSchema) },
        messages: [
          {
            role: "user",
            content:
              existingTitles.length > 0
                ? `Titres déjà publiés à ne pas répéter :\n- ${existingTitles.join(
                    "\n- "
                  )}\n\nPropose un nouvel article.`
                : "Aucun article publié pour l'instant. Propose un premier article.",
          },
        ],
      });

      return {
        stop_reason: response.stop_reason,
        stop_details: response.stop_details,
        parsed_output: response.parsed_output,
      };
    },

    // Prompt caching activé ici uniquement (pas sur parseDraft) : le bouton
    // "Retoucher" relance Claude avec le même SYSTEM_PROMPT quelques minutes
    // après la génération initiale (ou entre deux retouches successives),
    // donc dans la fenêtre du cache éphémère. Le cron hebdomadaire
    // (parseDraft) ne tourne qu'une fois par semaine — toujours au-delà du
    // TTL, un cache miss payé pour rien à chaque fois — voir
    // docs/blog-architecture.md.
    async reviseDraft(
      currentMarkdown: string,
      feedback: string
    ): Promise<AnthropicParseResult> {
      const response = await client.messages.parse({
        model,
        max_tokens: 16000,
        system: [
          { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        ],
        output_config: { format: zodOutputFormat(BlogDraftSchema) },
        messages: [
          {
            role: "user",
            content: `Voici le brouillon actuel :\n\n${currentMarkdown}\n\nRetours humains à intégrer :\n${feedback}\n\nProduis une version révisée complète de l'article (même sortie structurée qu'une génération initiale).`,
          },
        ],
      });

      return {
        stop_reason: response.stop_reason,
        stop_details: response.stop_details,
        parsed_output: response.parsed_output,
      };
    },
  };
}
