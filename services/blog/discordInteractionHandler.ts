type DiscordComponentValue = { custom_id: string; value?: string };
type DiscordComponentRow = { components?: DiscordComponentValue[] };

type DiscordInteractionPayload = {
  type: number;
  data?: {
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
 * updateInteractionMessage() une fois terminé. "Retoucher" reste Phase 3 :
 * journalise la décision, la relance IA réelle n'est pas encore construite.
 */
export function handleDiscordInteraction(
  payload: DiscordInteractionPayload
): DiscordInteractionResponse {
  if (payload.type === 1) {
    return { type: 1 };
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
    const feedback = payload.data?.components?.[0]?.components?.[0]?.value ?? "";
    return {
      type: 7,
      data: {
        content: `🔵 Retouche demandée pour \`${slug}\` : "${feedback}" — la relance automatique de l'IA arrivera en Phase 4.`,
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
