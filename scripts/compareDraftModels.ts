/**
 * Outil manuel (pas de test unitaire — appelle réellement l'API Anthropic et
 * dépense de l'argent, cf. shared/cost-optimization.md du skill claude-api).
 *
 * Génère le même article ("aucun article publié pour l'instant, propose un
 * premier article", cf. generateDraft.ts) avec plusieurs couples
 * modèle/effort, pour comparer coût (loggé automatiquement par
 * anthropicDraftGenerator.ts) et qualité perçue côté humain.
 *
 * Usage : yarn blog:compare-models
 * Requiert ANTHROPIC_API_KEY dans l'environnement.
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { createAnthropicDraftGenerator } from "../services/blog/anthropicDraftGenerator";

type Variant = { label: string; model: string; effort: "low" | "medium" | "high" };

const VARIANTS: Variant[] = [
  { label: "opus-low", model: "claude-opus-5", effort: "low" },
  { label: "sonnet-medium", model: "claude-sonnet-5", effort: "medium" },
];

const OUTPUT_DIR = path.join(process.cwd(), "tmp-blog-compare");

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Variable d'environnement manquante : ANTHROPIC_API_KEY");
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  for (const variant of VARIANTS) {
    console.log(`\n=== ${variant.label} (${variant.model}, effort=${variant.effort}) ===`);

    const generator = createAnthropicDraftGenerator({
      apiKey,
      model: variant.model,
      effort: variant.effort,
    });

    // Même prompt pour toutes les variantes : aucun titre existant fourni,
    // comme le cron hebdomadaire lors du tout premier article.
    const result = await generator.parseDraft([]);

    if (result.stop_reason === "refusal") {
      console.log(`${variant.label} : refusé par le modèle (catégorie : ${result.stop_details?.category ?? "inconnue"})`);
      continue;
    }

    const outputFile = path.join(OUTPUT_DIR, `${variant.label}.md`);
    const draft = result.parsed_output;
    const content = draft
      ? `# ${draft.title}\n\n_${draft.description}_\n\n${draft.bodyMarkdown}\n`
      : "(aucune sortie structurée valide)";
    await writeFile(outputFile, content, "utf-8");
    console.log(`${variant.label} : écrit dans ${outputFile}`);
  }

  console.log(
    `\nComparez le coût estimé loggé ci-dessus pour chaque variante, et la qualité des fichiers dans ${OUTPUT_DIR}/.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
