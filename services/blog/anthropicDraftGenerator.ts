import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

import { BlogDraftSchema } from "./draftSchema";
import { SYSTEM_PROMPT, type AnthropicParseResult } from "./generateDraft";

const DEFAULT_MODEL = "claude-opus-5";

type Effort = "low" | "medium" | "high" | "xhigh" | "max";
const VALID_EFFORTS: readonly Effort[] = ["low", "medium", "high", "xhigh", "max"];

type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

// Tarifs $/million de tokens (shared/models.md du skill claude-api) — sert
// uniquement à une estimation de coût affichée dans les logs, jamais à une
// facturation réelle. Un modèle absent de cette table log ses tokens sans
// coût estimé plutôt que d'inventer un tarif.
const PRICING_PER_MTOK: Record<string, { input: number; output: number }> = {
  "claude-opus-5": { input: 5, output: 25 },
  "claude-sonnet-5": { input: 2, output: 10 },
};

// Le cache write coûte ~1.25x le tarif input, le cache read ~0.1x (cf.
// shared/prompt-caching.md du skill claude-api) — reviseDraft() active le
// cache sur SYSTEM_PROMPT, donc les ignorer fausserait l'estimation dès
// qu'une retouche relance Claude avec le même prompt système en cache.
function logUsage(label: string, model: string, usage: Usage): void {
  const pricing = PRICING_PER_MTOK[model];
  const cacheWrite = usage.cache_creation_input_tokens ?? 0;
  const cacheRead = usage.cache_read_input_tokens ?? 0;
  const estimatedCostUsd = pricing
    ? (
        (usage.input_tokens * pricing.input +
          cacheWrite * pricing.input * 1.25 +
          cacheRead * pricing.input * 0.1) /
          1_000_000 +
        (usage.output_tokens * pricing.output) / 1_000_000
      ).toFixed(4)
    : null;

  console.log(`[blog/anthropic] ${label}`, {
    model,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cache_creation_input_tokens: cacheWrite,
    cache_read_input_tokens: cacheRead,
    estimated_cost_usd: estimatedCostUsd,
  });
}

export function createAnthropicDraftGenerator(options?: {
  apiKey?: string;
  model?: string;
  effort?: Effort;
}) {
  const client = new Anthropic({ apiKey: options?.apiKey });
  // `|| undefined` (pas `??`) : .env.example documente ces deux variables
  // comme "laisser vide pour garder le défaut", et dotenv fixe une variable
  // vide à "" plutôt qu'à undefined — `??` laisserait passer cette chaîne
  // vide telle quelle.
  const model = options?.model ?? (process.env.ANTHROPIC_BLOG_MODEL || undefined) ?? DEFAULT_MODEL;
  // Non défini par défaut plutôt que figé sur "high" : on garde le
  // comportement actuel (défaut adaptatif du SDK) tant que personne ne
  // configure explicitement ANTHROPIC_BLOG_EFFORT — un changement d'effort
  // est un compromis coût/qualité qui ne doit jamais s'appliquer en silence.
  const requestedEffort = options?.effort ?? (process.env.ANTHROPIC_BLOG_EFFORT || undefined);
  if (requestedEffort && !VALID_EFFORTS.includes(requestedEffort as Effort)) {
    throw new Error(
      `ANTHROPIC_BLOG_EFFORT invalide : "${requestedEffort}" (valeurs acceptées : ${VALID_EFFORTS.join(", ")})`
    );
  }
  const effort = requestedEffort as Effort | undefined;

  return {
    async parseDraft(existingTitles: string[]): Promise<AnthropicParseResult> {
      const response = await client.messages.parse({
        model,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        output_config: { format: zodOutputFormat(BlogDraftSchema), ...(effort ? { effort } : {}) },
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

      logUsage("parseDraft", model, response.usage);

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
        output_config: { format: zodOutputFormat(BlogDraftSchema), ...(effort ? { effort } : {}) },
        messages: [
          {
            role: "user",
            content: `Voici le brouillon actuel :\n\n${currentMarkdown}\n\nRetours humains à intégrer :\n${feedback}\n\nProduis une version révisée complète de l'article (même sortie structurée qu'une génération initiale).`,
          },
        ],
      });

      logUsage("reviseDraft", model, response.usage);

      return {
        stop_reason: response.stop_reason,
        stop_details: response.stop_details,
        parsed_output: response.parsed_output,
      };
    },
  };
}
