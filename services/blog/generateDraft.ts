import matter from "gray-matter";

import { BlogDraftSchema, type BlogDraft } from "./draftSchema";
import { hasServiceLink } from "./editorialChecks";
import { deriveActualiteProposalId } from "./githubBlogRepo";
import { PILLARS, pickNextPillar, shouldInjectLocalAngle, type PillarId, type PillarSuggestion } from "./pillars";

import type { ActualiteCandidate } from "./actualiteWatch";
import type { ActualiteQueueEntry, PublishedPost, QueuedTopicEntry } from "./githubBlogRepo";

// Liste des pages de service dérivée de PILLARS (seule source de vérité,
// services/blog/pillars.ts) : SYSTEM_PROMPT fournit ces URLs exactes plutôt
// que de laisser le modèle deviner un chemin plausible mais inexistant
// (#74). Les instructions par pilier ci-dessous (anthropicDraftGenerator.ts)
// pointent déjà vers UNE page ciblée selon le thème suggéré ; cette liste
// couvre en plus les générations sans suggestion de pilier (sujet soumis via
// Discord, #67), qui n'avaient jusqu'ici aucune consigne de maillage.
const SERVICE_PAGES_LIST = PILLARS.map((p) => `- ${p.label} : ${p.targetPage}`).join("\n");

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
- Maillage interne obligatoire : le corps de l'article doit contenir au moins un lien
  Markdown ([texte](url)) vers l'une des pages de service ci-dessous, celle la plus
  pertinente par rapport au sujet traité. Utilise toujours l'une de ces URLs exactes,
  jamais une URL inventée ou approximative :
${SERVICE_PAGES_LIST}
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
    parseDraft(
      existingTitles: string[],
      suggestion?: PillarSuggestion,
      discordTopic?: { topic: string; notes: string | null }
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
    // File d'attente unique (sujets /blog-sujet prio 1, actualités
    // approuvées prio 2 — voir githubBlogRepo.ts::getNextQueuedTopic),
    // prioritaire sur la rotation pondérée de piliers quand elle contient
    // une entrée "a_publier" — voir la cascade de priorité en tête de
    // generateDraft() ci-dessous.
    getNextQueuedTopic(): Promise<QueuedTopicEntry | null>;
    commitDraftBranch(args: {
      slug: string;
      postMarkdown: string;
      coverImage: Buffer | null;
      commitMessage: string;
    }): Promise<{ branch: string; url: string }>;
    queueActualiteProposal(candidate: ActualiteCandidate): Promise<{ id: string }>;
    // Utilisé par queueApprovedActualite() ci-dessous (clic "Approuver le
    // sujet" sur Discord) : ajoute l'actualité à la même file que
    // /blog-sujet plutôt que de générer directement.
    queueActualiteTopic(entry: {
      title: string;
      summary: string;
      sourceUrl: string;
      articleText: string | null;
      pillarId: PillarId;
    }): Promise<void>;
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
      // Calculé via editorialChecks.ts::hasServiceLink() (#74) : SYSTEM_PROMPT
      // exige un lien vers une page de service, mais une consigne de prompt
      // n'est jamais garantie côté modèle — signalé ici pour que la
      // validation Discord attrape ce qui lui échapperait.
      missingServiceLink: boolean;
    }): Promise<{ messageId: string }>;
    notifyActualiteProposal(args: {
      id: string;
      title: string;
      sourceUrl: string;
    }): Promise<{ messageId: string }>;
  };
  // Optionnel — voir imageGenerator ci-dessus pour le même raisonnement :
  // en pratique toujours construit (services/blog/actualiteWatch.ts ne
  // dépend que d'ANTHROPIC_API_KEY, déjà obligatoire pour tout le reste du
  // pipeline), gardé optionnel côté type surtout pour les tests.
  actualiteWatch?: {
    // Jusqu'à 3 candidats, chacun rattaché à un pilier différent (mix RSS +
    // tri IA, cf. actualiteWatch.ts) — le pilier n'est plus imposé en amont
    // par le tourniquet pondéré (contrairement à l'ancien mécanisme
    // web_search) : chaque candidat est notifié/mis en file indépendamment
    // par proposeNextActualiteBestEffort() ci-dessous.
    findActualite(alreadyCitedUrls: string[]): Promise<ActualiteCandidate[]>;
  };
  // Optionnel, comme imageGenerator ci-dessus : tant qu'il n'est pas
  // configuré, queueApprovedActualite() met simplement en file un
  // articleText null (repli sur le résumé RSS/Atom à la génération, cf.
  // anthropicDraftGenerator.ts) plutôt que d'échouer.
  articleTextFetcher?: {
    fetchArticleText(url: string): Promise<string | null>;
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

// Cœur commun à tous les points d'entrée ci-dessous : une fois qu'une
// réponse structurée a été obtenue (rotation de piliers, actualité
// approuvée, ou sujet soumis via Discord), la validation/commit/notification
// se déroule à l'identique.
async function generateDraftFromResponse(
  response: AnthropicParseResult,
  sourceUrl: string | null,
  commitMessageSuffix: string,
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
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

  const postMarkdown = buildDraftMarkdown(draft, coverImage, sourceUrl);
  const { branch, url } = await deps.github.commitDraftBranch({
    slug: draft.slug,
    postMarkdown,
    coverImage,
    commitMessage: `blog: brouillon "${draft.title}" (${commitMessageSuffix})`,
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
    missingServiceLink: !hasServiceLink(draft.bodyMarkdown),
  });

  return { status: "committed", slug: draft.slug, title: draft.title, branch, url };
}

async function generateDraftFromSuggestion(
  suggestion: PillarSuggestion,
  existingTitles: string[],
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
  const response = await deps.anthropic.parseDraft(existingTitles, suggestion);
  const sourceUrl = suggestion.actualite?.sourceUrl ?? null;
  const commitMessageSuffix = suggestion.actualite ? "actualité approuvée" : "génération hebdomadaire";
  return generateDraftFromResponse(response, sourceUrl, commitMessageSuffix, deps);
}

async function generateDraftFromDiscordTopic(
  discordTopic: { topic: string; notes: string | null },
  existingTitles: string[],
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
  const response = await deps.anthropic.parseDraft(existingTitles, undefined, discordTopic);
  return generateDraftFromResponse(response, null, "sujet soumis via Discord", deps);
}

// Retrouve le Pillar complet (label, targetPage, theme...) déclaré au
// moment de la mise en file (githubBlogRepo.ts::ActualiteQueueEntry ne
// garde que le pillarId, seule donnée stable — un Pillar entier dupliqué
// dans la file gèlerait un label/targetPage périmé si PILLARS change avant
// que l'entrée ne soit consommée).
function suggestionFromQueuedActualite(
  entry: ActualiteQueueEntry,
  publishedPosts: PublishedPost[]
): PillarSuggestion | null {
  const pillar = PILLARS.find((p) => p.id === entry.pillarId);
  if (!pillar) return null;
  return {
    pillar,
    ...computeRecentContentSignals(publishedPosts),
    actualite: {
      title: entry.title,
      summary: entry.summary,
      sourceUrl: entry.sourceUrl,
      articleText: entry.articleText,
    },
  };
}

// Effet de bord best-effort, jamais bloquant : une actualité pas encore
// citée ni déjà proposée est signalée sur Discord pour validation humaine
// (#66), mais ne remplace ni ne retarde plus jamais la génération de
// l'article de cette semaine (correction du comportement bloquant d'origine
// — la veille "prenait le pas" sur la génération, cf. retour d'usage réel).
// Toute erreur ici (recherche Claude en échec, Discord indisponible...) est
// journalisée puis avalée : le pire cas est "pas de nouvelle proposition
// cette fois", jamais un échec de la génération elle-même. Valeur de retour
// utilisée par runVeilleScan() ci-dessous (scan quotidien indépendant),
// ignorée par generateDraft() qui n'en a pas besoin.
//
// `reason` (incident du 08/09) : sans lui, {"proposed":false} dans les logs
// du cron GitHub Actions — seule trace disponible, pas d'accès SSH au VPS —
// ne permet pas de distinguer "recherche faite, rien de pertinent trouvé" de
// "une erreur (Discord, GitHub...) a été avalée silencieusement".
//
// Chaque candidat (jusqu'à 3, un par pilier — cf. actualiteWatch.ts) est
// notifié/mis en file indépendamment des autres : un candidat dont la
// notification Discord échoue ne doit jamais empêcher les autres d'être
// proposés (best-effort par candidat, pas seulement au niveau du scan).
async function proposeNextActualiteBestEffort(
  publishedPosts: PublishedPost[],
  deps: GenerateDraftDeps
): Promise<{ proposed: boolean; count: number; reason?: string }> {
  if (!deps.actualiteWatch)
    return { proposed: false, count: 0, reason: "veille désactivée (actualiteWatch absent)" };

  try {
    const citedByPublishedPosts = publishedPosts
      .map((p) => p.sourceUrl)
      .filter((u): u is string => u !== null);
    // Une actualité déjà soumise à validation (approuvée, ignorée, ou encore
    // en attente d'une décision) ne doit jamais être reproposée — voir
    // githubBlogRepo.ts::listProposedActualiteSourceUrls.
    const alreadyProposedUrls = await deps.github.listProposedActualiteSourceUrls();
    const alreadyCitedUrls = [...citedByPublishedPosts, ...alreadyProposedUrls];

    const candidates = await deps.actualiteWatch.findActualite(alreadyCitedUrls);
    if (candidates.length === 0) return { proposed: false, count: 0, reason: "aucune actualité pertinente trouvée" };

    let proposedCount = 0;
    let lastFailureReason: string | undefined;
    for (const candidate of candidates) {
      try {
        // Notifier *avant* de persister (pas l'inverse) : une fois committée,
        // une proposition exclut définitivement ce sourceUrl des recherches
        // futures (ci-dessus). Committer d'abord puis échouer sur la
        // notification Discord orphelinerait silencieusement le candidat —
        // plus jamais vu par personne, mais plus jamais reproposé non plus.
        const id = deriveActualiteProposalId(candidate.sourceUrl);
        await deps.discord.notifyActualiteProposal({
          id,
          title: candidate.title,
          sourceUrl: candidate.sourceUrl,
        });
        await deps.github.queueActualiteProposal(candidate);
        proposedCount++;
      } catch (err) {
        lastFailureReason = err instanceof Error ? err.message : String(err);
        console.error(
          "[blog/generateDraft] proposition individuelle de veille échouée (ignorée, les autres candidats continuent) :",
          lastFailureReason
        );
      }
    }

    return proposedCount > 0
      ? { proposed: true, count: proposedCount }
      : { proposed: false, count: 0, reason: lastFailureReason };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.error(
      "[blog/generateDraft] scan de veille échoué (ignoré, la génération continue) :",
      reason
    );
    return { proposed: false, count: 0, reason };
  }
}

// Point d'entrée du scan quotidien (app/api/blog/veille/route.ts), indépendant
// du cron hebdomadaire de génération : proposeNextActualiteBestEffort()
// tourne aussi à chaque generateDraft(), mais seulement une fois par semaine
// jusqu'ici — l'appeler séparément, plus souvent, comble une file vide plus
// vite sans jamais toucher à la génération elle-même.
export async function runVeilleScan(
  deps: GenerateDraftDeps
): Promise<{ proposed: boolean; count: number; reason?: string }> {
  try {
    const publishedPosts = await deps.github.listPublishedPosts();
    return await proposeNextActualiteBestEffort(publishedPosts, deps);
  } catch (err) {
    // Best-effort de bout en bout, y compris un échec de listPublishedPosts()
    // (en dehors du try/catch interne de proposeNextActualiteBestEffort) :
    // ce scan quotidien est appelé seul, sans génération à protéger derrière
    // — jamais de raison de le laisser lever.
    const reason = err instanceof Error ? err.message : String(err);
    console.error("[blog/generateDraft] scan de veille échoué :", reason);
    return { proposed: false, count: 0, reason };
  }
}

export async function generateDraft(
  deps: GenerateDraftDeps
): Promise<GenerateDraftResult> {
  const publishedPosts = await deps.github.listPublishedPosts();
  const existingTitles = publishedPosts.map((p) => p.title);

  // Les deux sont indépendants (l'effet de bord ne lit ni n'écrit la file
  // JSON, getNextQueuedTopic ne touche ni à la recherche Claude ni à Discord) : lancés
  // en parallèle plutôt que séquentiellement pour rester sous le
  // --max-time généreux mais fini accordé côté cron (cf. commentaire de
  // non-idempotence sur .github/workflows/blog-weekly-trigger.yml).
  const [, queuedTopic] = await Promise.all([
    proposeNextActualiteBestEffort(publishedPosts, deps),
    deps.github.getNextQueuedTopic(),
  ]);

  // Cascade de priorité du sujet de la semaine (#67 > #66 approuvée > #52),
  // toutes deux logées dans la même file (githubBlogRepo.ts::getNextQueuedTopic).
  //
  // 1-2. File d'attente : sujet Discord (#67, prio 1) ou actualité approuvée
  // (#66, prio 2). Le champ "pillar" reste obligatoire (BlogDraftSchema),
  // donc le crédit du pilier réellement déclaré par Claude est
  // automatiquement décrémenté la prochaine fois que pickNextPillar()
  // rejoue l'historique publié (mitigation 2 de #67) — pas besoin d'un
  // mécanisme de crédit séparé pour la file.
  if (queuedTopic) {
    if (queuedTopic.type === "discord_topic") {
      return generateDraftFromDiscordTopic(
        { topic: queuedTopic.topic, notes: queuedTopic.notes },
        existingTitles,
        deps
      );
    }
    const suggestion = suggestionFromQueuedActualite(queuedTopic, publishedPosts);
    // Un pilier de la file introuvable dans PILLARS (édition manuelle de la
    // file, ou PILLARS modifié entre la mise en file et sa consommation) ne
    // doit jamais bloquer toute la génération hebdomadaire indéfiniment (la
    // file n'avance qu'au clic "Approuver"/à la modification manuelle du
    // statut, cf. plus haut) — repli sur la rotation de piliers pour cette
    // entrée plutôt qu'un generation_failed qui se répéterait à chaque essai
    // tant que personne n'a corrigé la file à la main.
    if (suggestion) {
      return generateDraftFromSuggestion(suggestion, existingTitles, deps);
    }
    console.error(
      `[blog/generateDraft] pilier inconnu dans la file d'attente ("${queuedTopic.pillarId}") — repli sur la rotation de piliers pour cette exécution.`
    );
  }

  // 3. Rotation pondérée de piliers (#52) : le seul niveau toujours
  // disponible, fallback final de la cascade.
  const suggestion = buildPillarRotationSuggestion(publishedPosts);
  return generateDraftFromSuggestion(suggestion, existingTitles, deps);
}

export type QueueApprovedActualiteResult =
  | { status: "queued"; title: string }
  | { status: "proposal_not_found" }
  | { status: "generation_failed"; reason: string };

// Appelé après le clic "Approuver le sujet" sur Discord (jamais depuis le
// cron hebdomadaire) : ne génère plus jamais l'article directement (la
// veille ne doit plus prendre le pas sur la génération de la semaine) — elle
// rejoint simplement la même file que /blog-sujet, avec le texte intégral de
// la page source en plus (best-effort, cf. articleTextFetcher.ts) pour
// donner à Claude un contexte bien plus riche que le seul résumé RSS/Atom.
export async function queueApprovedActualite(
  proposalId: string,
  deps: GenerateDraftDeps
): Promise<QueueApprovedActualiteResult> {
  const candidate = await deps.github.getActualiteProposal(proposalId);
  if (!candidate) return { status: "proposal_not_found" };

  // fetchArticleText() (services/blog/articleTextFetcher.ts) n'échoue déjà
  // jamais elle-même (best-effort interne) — deps.articleTextFetcher reste
  // optionnel ici uniquement pour le cas où il n'est pas configuré du tout
  // (comme imageGenerator), pas pour rattraper une exception.
  const articleText = deps.articleTextFetcher
    ? await deps.articleTextFetcher.fetchArticleText(candidate.sourceUrl)
    : null;

  try {
    await deps.github.queueActualiteTopic({
      title: candidate.title,
      summary: candidate.summary,
      sourceUrl: candidate.sourceUrl,
      articleText,
      pillarId: candidate.pillar.id,
    });
  } catch (err) {
    return {
      status: "generation_failed",
      reason: err instanceof Error ? err.message : String(err),
    };
  }

  return { status: "queued", title: candidate.title };
}

export { SYSTEM_PROMPT };
