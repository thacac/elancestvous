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
  };
};

const APPROVE_PREFIX = "blog_approve:";
const REVISE_PREFIX = "blog_revise:";
const REVISE_FEEDBACK_PREFIX = "revise_feedback:";

/**
 * Phase 3 : vérifie/route les interactions Discord et journalise la décision
 * (contenu du message mis à jour) sans déclencher de publication ni de
 * relance IA réelle — ça, c'est la Phase 4, une fois l'UX/signature validées.
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
        content: `✅ Décision reçue : **Approuver** pour \`${slug}\`. La publication automatique arrivera en Phase 4 — pour l'instant, cette décision est seulement enregistrée.`,
        components: [],
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
      },
    };
  }

  return { type: 4, data: { content: "Interaction non reconnue.", flags: 64 } };
}
