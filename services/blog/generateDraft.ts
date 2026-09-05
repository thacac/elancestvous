import matter from "gray-matter";

import { BlogDraftSchema, type BlogDraft } from "./draftSchema";

const SYSTEM_PROMPT = `Tu écris pour le blog d'Élan C'est Vous (Coralie Mathorel), coach
professionnelle certifiée à Toulouse : coaching individuel et collectif, formations
QVCT/RPS, groupes d'analyse des pratiques professionnelles (GAPP), pour des soignants
et établissements de santé en Occitanie.

Voix : humaine, concrète, jamais théorique — proche du ton déjà utilisé sur le site
("je ne parle pas de théorie, je parle de votre réalité"). Vocabulaire attendu : QVCT,
RPS, GAPP, soignants, prévention, épuisement professionnel.

Règles strictes :
- Aucune allégation médicale ou thérapeutique. Le contenu est informatif, pas un
  diagnostic ni un traitement. Si le sujet touche à la santé, termine par une phrase
  invitant à consulter un professionnel de santé si besoin.
- Un article = un sujet précis, actionnable, 500 à 900 mots, en Markdown (titres ##,
  listes, pas de titre # — le titre est géré séparément).
- Ne reprends jamais un titre déjà publié (liste fournie ci-dessous).
- Fournis toujours au moins un prompt d'illustration de couverture, en anglais, décrivant
  une image éditoriale sobre et chaleureuse (pas de texte dans l'image, pas de visage
  reconnaissable), cohérente avec la palette turquoise/marine de la marque.`;

export type GenerateDraftResult =
  | {
      status: "committed";
      slug: string;
      title: string;
      branch: string;
      url: string;
    }
  | { status: "refused"; category?: string }
  | { status: "generation_failed"; reason: string };

export type AnthropicParseResult = {
  stop_reason: string | null;
  stop_details?: { category?: string | null } | null;
  parsed_output: BlogDraft | null;
};

export type GenerateDraftDeps = {
  anthropic: {
    parseDraft(existingTitles: string[]): Promise<AnthropicParseResult>;
  };
  // Optionnel : tant qu'aucune clé de génération d'image n'est configurée
  // (ex. accès API OpenAI pas encore activé), le brouillon est committé et
  // notifié sans illustration plutôt que de bloquer toute la génération.
  imageGenerator?: {
    generateCoverImage(prompt: string): Promise<Buffer>;
  };
  github: {
    listPublishedPostTitles(): Promise<string[]>;
    commitDraftBranch(args: {
      slug: string;
      postMarkdown: string;
      coverImage: Buffer | null;
      commitMessage: string;
    }): Promise<{ branch: string; url: string }>;
  };
  discord: {
    notifyDraftReady(args: {
      slug: string;
      title: string;
      excerpt: string;
      coverImage: Buffer | null;
    }): Promise<{ messageId: string }>;
  };
};

export function buildDraftMarkdown(draft: BlogDraft): string {
  const publishedAt = new Date().toISOString().slice(0, 10);
  return matter.stringify(draft.bodyMarkdown.trim(), {
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    excerpt: draft.excerpt,
    publishedAt,
    coverImage: `/blog/${draft.slug}/cover.jpg`,
    coverImageAlt: draft.imagePrompts[0].altText,
    tags: draft.tags,
  });
}

export async function generateDraft(
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
  const existingTitles = await deps.github.listPublishedPostTitles();

  const response = await deps.anthropic.parseDraft(existingTitles);

  if (response.stop_reason === "refusal") {
    return { status: "refused", category: response.stop_details?.category ?? undefined };
  }

  const parsed = BlogDraftSchema.safeParse(response.parsed_output);
  if (!parsed.success) {
    return {
      status: "generation_failed",
      reason: `sortie structurée invalide : ${parsed.error.message}`,
    };
  }
  const draft = parsed.data;

  let coverImage: Buffer | null = null;
  if (deps.imageGenerator) {
    try {
      coverImage = await deps.imageGenerator.generateCoverImage(
        draft.imagePrompts[0].prompt
      );
    } catch (err) {
      return {
        status: "generation_failed",
        reason: `génération de l'illustration échouée : ${
          err instanceof Error ? err.message : String(err)
        }`,
      };
    }
  }

  const postMarkdown = buildDraftMarkdown(draft);
  const { branch, url } = await deps.github.commitDraftBranch({
    slug: draft.slug,
    postMarkdown,
    coverImage,
    commitMessage: `blog: brouillon "${draft.title}" (génération hebdomadaire)`,
  });

  // Le brouillon est déjà en sécurité sur GitHub à ce stade : une erreur ici
  // (Discord indisponible, etc.) remonte comme generation_failed via la route
  // API, mais ne perd aucun contenu — une relance retombera sur la même
  // branche (commitDraftBranch la réinitialise plutôt que d'échouer).
  await deps.discord.notifyDraftReady({
    slug: draft.slug,
    title: draft.title,
    excerpt: draft.excerpt,
    coverImage,
  });

  return { status: "committed", slug: draft.slug, title: draft.title, branch, url };
}

export { SYSTEM_PROMPT };
