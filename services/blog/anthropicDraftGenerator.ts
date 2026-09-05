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
  };
}
