import matter from "gray-matter";

import { BlogDraftSchema, type BlogDraft } from "./draftSchema";
import { deriveActualiteProposalId } from "./githubBlogRepo";
import { pickNextPillar, shouldInjectLocalAngle, type PillarId, type PillarSuggestion } from "./pillars";

import type { ActualiteCandidate } from "./actualiteWatch";
import type { PublishedPost } from "./githubBlogRepo";

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
  | { status: "generation_failed"; reason: string }
  // Correction de #66 : un sujet d'actualité trouvé par la veille n'est trié
  // ni par un humain (source scopée ou non) ni par un agent — la génération
  // ne démarre donc jamais directement dessus. generateDraft() s'arrête ici
  // et attend un clic explicite sur "Approuver le sujet" côté Discord
  // (cf. discordInteractionHandler.ts, generateApprovedActualite() ci-dessous).
  | { status: "pending_actualite_approval"; proposalId: string; title: string };

export type AnthropicParseResult = {
  stop_reason: string | null;
  stop_details?: { category?: string | null } | null;
  parsed_output: BlogDraft | null;
};

export type GenerateDraftDeps = {
  anthropic: {
    parseDraft(
      existingTitles: string[],
      suggestion?: PillarSuggestion
    ): Promise<AnthropicParseResult>;
  };
  // Optionnel : tant qu'aucune clé de génération d'image n'est configurée
  // (ex. accès API OpenAI pas encore activé), le brouillon est committé et
  // notifié sans illustration plutôt que de bloquer toute la génération.
  imageGenerator?: {
    generateCoverImage(prompt: string): Promise<Buffer>;
  };
  github: {
    listPublishedPosts(): Promise<PublishedPost[]>;
    commitDraftBranch(args: {
      slug: string;
      postMarkdown: string;
      coverImage: Buffer | null;
      commitMessage: string;
    }): Promise<{ branch: string; url: string }>;
    queueActualiteProposal(candidate: ActualiteCandidate): Promise<{ id: string }>;
    getActualiteProposal(id: string): Promise<ActualiteCandidate | null>;
    listProposedActualiteSourceUrls(): Promise<string[]>;
  };
  discord: {
    notifyDraftReady(args: {
      slug: string;
      title: string;
      excerpt: string;
      coverImage: Buffer | null;
      // null pour un article de rotation classique ; l'URL de la source
      // vérifiable pour un article dérivé de la veille actualité (#66,
      // mitigation 4 : revue humaine renforcée).
      sourceUrl: string | null;
    }): Promise<{ messageId: string }>;
    notifyActualiteProposal(args: {
      id: string;
      title: string;
      summary: string;
      sourceUrl: string;
      pillarLabel: string;
    }): Promise<{ messageId: string }>;
  };
  // Optionnel : tant qu'aucune source de veille n'est configurée
  // (BLOG_VEILLE_SOURCES vide), findActualite() renvoie toujours null et la
  // génération retombe directement sur la rotation pondérée de piliers (#52)
  // — cascade de priorité définie dans #66.
  actualiteWatch?: {
    findActualite(
      alreadyCitedUrls: string[],
      recentPillars: PillarId[]
    ): Promise<ActualiteCandidate | null>;
  };
};

export function buildDraftMarkdown(
  draft: BlogDraft,
  coverImage: Buffer | null,
  sourceUrl?: string | null
): string {
  const publishedAt = new Date().toISOString().slice(0, 10);
  return matter.stringify(draft.bodyMarkdown.trim(), {
    title: draft.title,
    slug: draft.slug,
    description: draft.description,
    excerpt: draft.excerpt,
    publishedAt,
    // Pas de couverture tant que la génération d'image n'est pas configurée
    // (cf. IMAGE_GEN_API_KEY) : un frontmatter promettant une image absente
    // casserait l'aperçu (lib/blog.ts::parseDraftContent tolère leur absence
    // pour cette raison précise).
    ...(coverImage
      ? {
          coverImage: `/blog/${draft.slug}/cover.jpg`,
          coverImageAlt: draft.imagePrompts[0].altText,
        }
      : {}),
    tags: draft.tags,
    pillar: draft.pillar,
    localAngle: draft.localAngle,
    // Absent pour un article de rotation classique : un champ vide/null
    // casserait la validation "chaîne non vide" côté dédoublonnage des
    // sources de veille (githubBlogRepo.ts::listPublishedPosts).
    ...(sourceUrl ? { sourceUrl } : {}),
  });
}

// Nombre d'articles publiés récents examinés pour l'anti-cannibalisation de
// mots-clés (mitigation SEO de l'issue #52) — évite d'envoyer la liste
// entière de tags depuis le premier article du blog.
const RECENT_TAGS_WINDOW = 6;

// Partagé entre la rotation de piliers et une actualité approuvée : les deux
// doivent appliquer la même fenêtre anti-cannibalisation et la même cadence
// d'ancrage local, sans que ça soit dupliqué (et risque de diverger) à
// chaque point d'entrée.
function computeRecentContentSignals(
  publishedPosts: PublishedPost[]
): Pick<PillarSuggestion, "recentTags" | "injectLocalAngle"> {
  const recentLocalAngleFlags = publishedPosts.map((p) => p.localAngle);
  const recentTags = publishedPosts.flatMap((p) => p.tags).slice(-RECENT_TAGS_WINDOW);

  return {
    recentTags,
    injectLocalAngle: shouldInjectLocalAngle(recentLocalAngleFlags),
  };
}

function buildPillarRotationSuggestion(publishedPosts: PublishedPost[]): PillarSuggestion {
  const recentPillars = publishedPosts
    .map((p) => p.pillar)
    .filter((p): p is PillarId => p !== null);

  return {
    pillar: pickNextPillar(recentPillars),
    ...computeRecentContentSignals(publishedPosts),
  };
}

// Cœur commun aux deux points d'entrée exportés ci-dessous : une fois qu'un
// sujet est décidé (rotation de piliers, ou actualité approuvée par un
// humain), la génération/commit/notification se déroule à l'identique.
async function generateDraftFromSuggestion(
  suggestion: PillarSuggestion,
  existingTitles: string[],
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
  const response = await deps.anthropic.parseDraft(existingTitles, suggestion);

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

  const sourceUrl = suggestion.actualite?.sourceUrl ?? null;
  const postMarkdown = buildDraftMarkdown(draft, coverImage, sourceUrl);
  const { branch, url } = await deps.github.commitDraftBranch({
    slug: draft.slug,
    postMarkdown,
    coverImage,
    commitMessage: suggestion.actualite
      ? `blog: brouillon "${draft.title}" (actualité approuvée)`
      : `blog: brouillon "${draft.title}" (génération hebdomadaire)`,
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
    sourceUrl,
  });

  return { status: "committed", slug: draft.slug, title: draft.title, branch, url };
}

export async function generateDraft(
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
  const publishedPosts = await deps.github.listPublishedPosts();
  const existingTitles = publishedPosts.map((p) => p.title);

  // Cascade de priorité du sujet de la semaine (#66) : une actualité pas
  // déjà citée ni déjà proposée passe avant la rotation pondérée de piliers,
  // qui reste le seul niveau toujours disponible (fallback de #52). Elle
  // n'est cependant jamais générée directement (cf. GenerateDraftResult
  // ci-dessus) : elle est d'abord soumise à validation humaine sur Discord.
  if (deps.actualiteWatch) {
    const recentPillars = publishedPosts
      .map((p) => p.pillar)
      .filter((p): p is PillarId => p !== null);
    const citedByPublishedPosts = publishedPosts
      .map((p) => p.sourceUrl)
      .filter((u): u is string => u !== null);
    // Une actualité déjà soumise à validation (approuvée, ignorée, ou encore
    // en attente d'une décision) ne doit jamais être reproposée — voir
    // githubBlogRepo.ts::listProposedActualiteSourceUrls.
    const alreadyProposedUrls = await deps.github.listProposedActualiteSourceUrls();
    const alreadyCitedUrls = [...citedByPublishedPosts, ...alreadyProposedUrls];

    const candidate = await deps.actualiteWatch.findActualite(alreadyCitedUrls, recentPillars);
    if (candidate) {
      // Notifier *avant* de persister (pas l'inverse) : une fois committée,
      // une proposition exclut définitivement ce sourceUrl des recherches
      // futures (ci-dessus). Committer d'abord puis échouer sur la
      // notification Discord orphelinerait silencieusement le candidat —
      // plus jamais vu par personne, mais plus jamais reproposé non plus.
      // En cas d'échec ici, l'exception remonte telle quelle (best-effort
      // notifyFailureBestEffort côté route) et rien n'est committé : le même
      // candidat reste trouvable au prochain essai.
      const id = deriveActualiteProposalId(candidate.sourceUrl);
      await deps.discord.notifyActualiteProposal({
        id,
        title: candidate.title,
        summary: candidate.summary,
        sourceUrl: candidate.sourceUrl,
        pillarLabel: candidate.pillar.label,
      });
      await deps.github.queueActualiteProposal(candidate);
      return { status: "pending_actualite_approval", proposalId: id, title: candidate.title };
    }
  }

  const suggestion = buildPillarRotationSuggestion(publishedPosts);
  return generateDraftFromSuggestion(suggestion, existingTitles, deps);
}

// Appelé après le clic "Approuver le sujet" sur Discord (jamais depuis le
// cron hebdomadaire) : reprend l'actualité mise en attente par
// generateDraft() ci-dessus et lance la génération, seulement maintenant
// qu'un humain a confirmé sa pertinence.
export async function generateApprovedActualite(
  proposalId: string,
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult | { status: "proposal_not_found" }> {
  const candidate = await deps.github.getActualiteProposal(proposalId);
  if (!candidate) return { status: "proposal_not_found" };

  const publishedPosts = await deps.github.listPublishedPosts();
  const existingTitles = publishedPosts.map((p) => p.title);

  const suggestion: PillarSuggestion = {
    pillar: candidate.pillar,
    ...computeRecentContentSignals(publishedPosts),
    actualite: {
      title: candidate.title,
      summary: candidate.summary,
      sourceUrl: candidate.sourceUrl,
    },
  };

  return generateDraftFromSuggestion(suggestion, existingTitles, deps);
}

export { SYSTEM_PROMPT };
