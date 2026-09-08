type DiscordComponentValue = { custom_id: string; value?: string };
type DiscordComponentRow = { components?: DiscordComponentValue[] };

type DiscordInteractionPayload = {
  type: number;
  data?: {
    name?: string;
    custom_id?: string;
    components?: DiscordComponentRow[];
  };
};

export type DiscordInteractionResponse = {
  type: number;
  data?: {
    content?: string;
    embeds?: unknown[];
    components?: unknown[];
    custom_id?: string;
    title?: string;
    flags?: number;
    allowed_mentions?: { parse: string[] };
  };
};

// Le contenu des messages "journalise la décision" ci-dessous inclut le
// texte de retouche saisi par un humain dans la modale Discord : sans ça,
// un "@everyone" ou "@here" tapé par accident pingerait tout le salon.
const NO_MENTIONS: { parse: string[] } = { parse: [] };

const APPROVE_PREFIX = "blog_approve:";
const REVISE_PREFIX = "blog_revise:";
const REVISE_FEEDBACK_PREFIX = "revise_feedback:";
// Correction de #66 : une actualité trouvée par la veille est soumise à
// validation humaine avant génération (aucun tri par un humain ni par un
// agent en amont) — ces deux boutons remplacent le déclenchement direct de
// generateDraft() sur un candidat "actualité".
const ACTU_APPROVE_PREFIX = "actu_approve:";
const ACTU_REJECT_PREFIX = "actu_reject:";

// Commande slash /blog-sujet (issue #67) — ouverte à tout le salon Discord,
// volontairement sans vérification de payload.member.user.id (décision
// tranchée dans l'issue : le salon est privé, SYSTEM_PROMPT reste la seule
// protection en aval contre une tentative d'injection de prompt via le
// champ "sujet"/"notes", cf. submitBlogSujet ci-dessous).
const BLOG_SUJET_COMMAND_NAME = "blog-sujet";
const BLOG_SUJET_MODAL_ID = "blog_sujet_submit";
const BLOG_SUJET_TOPIC_FIELD = "topic";
const BLOG_SUJET_NOTES_FIELD = "notes";

/**
 * Vérifie/route les interactions Discord. "Approuver" déclenche une vraie
 * publication (Phase 4) qui prend plus que les ~3s que Discord accorde pour
 * répondre à un clic. Répond type 7 (UPDATE_MESSAGE) immédiatement avec les
 * boutons désactivés (components: []) plutôt qu'un type 6 différé : avec un
 * type 6, le message ne change pas tant que le follow-up n'arrive pas, donc
 * les boutons restent cliquables pendant toute la publication — un double
 * clic déclencherait deux publications concurrentes (au mieux un 422
 * non-fast-forward sur master, au pire une confusion côté Discord). Le vrai
 * travail se termine ensuite de façon asynchrone
 * (app/api/discord/interactions/route.ts) et met à jour le même message via
 * updateInteractionMessage() une fois terminé. Même schéma pour la
 * soumission de la modale "Retoucher" (relance Claude + recommit + nouvelle
 * notification Discord).
 */
export function handleDiscordInteraction(
  payload: DiscordInteractionPayload
): DiscordInteractionResponse {
  if (payload.type === 1) {
    return { type: 1 };
  }

  if (payload.type === 2 && payload.data?.name === BLOG_SUJET_COMMAND_NAME) {
    return {
      type: 9,
      data: {
        custom_id: BLOG_SUJET_MODAL_ID,
        title: "Proposer un sujet pour le blog",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: BLOG_SUJET_TOPIC_FIELD,
                style: 1,
                label: "Sujet / thème",
                placeholder: "Ex. : la nouvelle obligation de formation RPS...",
                required: true,
                max_length: 200,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: BLOG_SUJET_NOTES_FIELD,
                style: 2,
                label: "Notes (optionnel)",
                placeholder: "Contexte, angle, source...",
                required: false,
                max_length: 1000,
              },
            ],
          },
        ],
      },
    };
  }

  const customId = payload.data?.custom_id ?? "";

  if (payload.type === 3 && customId.startsWith(APPROVE_PREFIX)) {
    const slug = customId.slice(APPROVE_PREFIX.length);
    return {
      type: 7,
      data: {
        content: `⏳ Publication de \`${slug}\` en cours...`,
        components: [],
        allowed_mentions: NO_MENTIONS,
      },
    };
  }

  if (payload.type === 3 && customId.startsWith(REVISE_PREFIX)) {
    const slug = customId.slice(REVISE_PREFIX.length);
    return {
      type: 9,
      data: {
        custom_id: `${REVISE_FEEDBACK_PREFIX}${slug}`,
        title: "Que faut-il changer ?",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "feedback",
                style: 2,
                label: "Vos retours",
                placeholder: "Ex. : le titre est trop générique...",
                required: true,
                max_length: 1000,
              },
            ],
          },
        ],
      },
    };
  }

  if (payload.type === 5 && customId.startsWith(REVISE_FEEDBACK_PREFIX)) {
    const slug = customId.slice(REVISE_FEEDBACK_PREFIX.length);
    // Même raisonnement que pour "Approuver" : la relance Claude + le
    // commit + la notification Discord dépassent souvent les ~3s
    // accordés pour répondre, donc réponse immédiate avec les boutons
    // désactivés plutôt qu'un différé qui les laisserait cliquables.
    return {
      type: 7,
      data: {
        content: `🔄 Retouche de \`${slug}\` en cours...`,
        components: [],
        allowed_mentions: NO_MENTIONS,
      },
    };
  }

  if (payload.type === 3 && customId.startsWith(ACTU_APPROVE_PREFIX)) {
    // La veille ne prend plus le pas sur la génération de la semaine :
    // "Approuver" met l'actualité en file (fetch du texte source + écriture
    // GitHub) plutôt que de générer directement, mais ça dépasse quand même
    // souvent les ~3s accordés par Discord.
    return {
      type: 7,
      data: {
        content: "⏳ Mise en file de l'actualité approuvée...",
        components: [],
        allowed_mentions: NO_MENTIONS,
      },
    };
  }

  if (payload.type === 3 && customId.startsWith(ACTU_REJECT_PREFIX)) {
    // Ignorer ne déclenche plus aucune génération ni recherche du sujet
    // suivant (la veille tourne indépendamment, cf. generateDraft.ts) — une
    // simple confirmation, largement sous les ~3s accordés par Discord.
    // Type 7 quand même, pour rester cohérent avec Approuver et désactiver
    // les boutons immédiatement.
    return {
      type: 7,
      data: {
        content: "🚫 Actualité ignorée.",
        components: [],
        allowed_mentions: NO_MENTIONS,
      },
    };
  }

  return { type: 4, data: { content: "Interaction non reconnue.", flags: 64 } };
}

// Utilisé par route.ts pour décider s'il faut lancer la publication réelle
// après avoir répondu à Discord (la réponse type 7 renvoyée ci-dessus par
// handleDiscordInteraction ne porte pas cette information).
export function getApprovalSlug(payload: DiscordInteractionPayload): string | null {
  if (payload.type !== 3) return null;
  const customId = payload.data?.custom_id ?? "";
  if (!customId.startsWith(APPROVE_PREFIX)) return null;
  return customId.slice(APPROVE_PREFIX.length);
}

// Même rôle que getApprovalSlug() ci-dessus, pour la soumission de la
// modale de retouche : la réponse type 7 renvoyée par
// handleDiscordInteraction ne porte pas le slug ni le texte de feedback,
// dont route.ts a besoin pour lancer reviseDraft() de façon asynchrone.
export function getRevisionRequest(
  payload: DiscordInteractionPayload
): { slug: string; feedback: string } | null {
  if (payload.type !== 5) return null;
  const customId = payload.data?.custom_id ?? "";
  if (!customId.startsWith(REVISE_FEEDBACK_PREFIX)) return null;
  const slug = customId.slice(REVISE_FEEDBACK_PREFIX.length);
  const feedback = payload.data?.components?.[0]?.components?.[0]?.value ?? "";
  return { slug, feedback };
}

// Même rôle que getApprovalSlug() ci-dessus, pour le bouton "Approuver le
// sujet" d'une actualité proposée : route.ts en a besoin pour lancer la mise
// en file de l'actualité de façon asynchrone. Pas d'équivalent pour
// "Ignorer" (ACTU_REJECT_PREFIX) : ce bouton ne déclenche plus aucun travail
// différé, la réponse immédiate ci-dessus lui suffit.
export function getActualiteApprovalId(payload: DiscordInteractionPayload): string | null {
  if (payload.type !== 3) return null;
  const customId = payload.data?.custom_id ?? "";
  if (!customId.startsWith(ACTU_APPROVE_PREFIX)) return null;
  return customId.slice(ACTU_APPROVE_PREFIX.length);
}

// Extrait le sujet/les notes de la soumission de la modale /blog-sujet.
// Contrairement aux boutons Approuver/Retoucher, écrire l'entrée en file
// (via l'API Contents GitHub) reste sous les ~3s accordés par Discord pour
// répondre — cf. submitBlogSujet ci-dessous, appelée avant de répondre
// (réponse immédiate en type 4, pas de schéma différé type 7).
export function getBlogSujetSubmission(
  payload: DiscordInteractionPayload
): { topic: string; notes: string | null } | null {
  if (payload.type !== 5) return null;
  const customId = payload.data?.custom_id ?? "";
  if (customId !== BLOG_SUJET_MODAL_ID) return null;
  const rows = payload.data?.components ?? [];
  const topic = (rows[0]?.components?.[0]?.value ?? "").trim();
  const notes = (rows[1]?.components?.[0]?.value ?? "").trim();
  return { topic, notes: notes || null };
}

// Mitigation 3 de l'issue #67 : même fenêtre de tags récents que
// l'anti-cannibalisation de mots-clés de generateDraft.ts (issue #52) —
// dupliquée ici plutôt que partagée, pour ne pas coupler deux fichiers sur
// un simple flatMap+slice.
const RECENT_TAGS_WINDOW = 6;

// Chevauchement simple, pas un blocage : la soumission Discord ouverte à
// tout le salon (cf. décision d'accès de l'issue #67) doit rester rapide à
// utiliser, l'avertissement sert juste à rendre le doublon potentiel visible
// dans la réponse plutôt que de refuser silencieusement un vrai sujet neuf.
export function hasTagOverlap(topic: string, recentTags: string[]): boolean {
  const normalizedTopic = topic.toLowerCase();
  return recentTags.some((tag) => normalizedTopic.includes(tag.toLowerCase()));
}

export type SubmitBlogSujetDeps = {
  github: {
    listPublishedPosts(): Promise<{ tags: string[] }[]>;
    queueDiscordTopic(entry: { topic: string; notes: string | null }): Promise<void>;
  };
};

// Écrit le sujet en file (content/blog/sujets-discord.json, via
// githubBlogRepo.queueDiscordTopic) puis répond immédiatement en type 4 —
// jamais de type 7 différé ici, l'écriture d'une seule entrée JSON via
// l'API Contents est largement sous les ~3s accordés par Discord, cf. issue
// #67. Le contenu du champ "sujet"/"notes" n'est jamais renvoyé vers Claude
// ici : il n'est injecté dans le message envoyé à parseDraft que plus tard,
// par generateDraft.ts, toujours après SYSTEM_PROMPT (mitigation 4).
export async function submitBlogSujet(
  submission: { topic: string; notes: string | null },
  deps: SubmitBlogSujetDeps
): Promise<DiscordInteractionResponse> {
  // Indépendants l'un de l'autre (le chevauchement de mots-clés ne dépend
  // pas de l'écriture) — lancés en parallèle pour rester sous les ~3s
  // accordés par Discord, cf. le commentaire sur cette fonction.
  const [publishedPosts] = await Promise.all([
    deps.github.listPublishedPosts(),
    deps.github.queueDiscordTopic(submission),
  ]);
  const recentTags = publishedPosts.flatMap((p) => p.tags).slice(-RECENT_TAGS_WINDOW);
  const overlap = hasTagOverlap(submission.topic, recentTags);

  const warning = overlap
    ? "\n⚠️ Ce sujet recoupe des mots-clés déjà traités récemment — vérifie qu'il apporte un angle nouveau."
    : "";

  return {
    type: 4,
    data: {
      content: `✅ Sujet ajouté à la file : « ${submission.topic} ».${warning}`,
      allowed_mentions: NO_MENTIONS,
    },
  };
}
