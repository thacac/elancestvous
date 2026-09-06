type NotifyDraftReadyArgs = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: Buffer | null;
  previewUrl: string;
};

const BRAND_COLOR = 0x29b5ad;
// Limites Discord pour un embed (https://discord.com/developers/docs/resources/message#embed-object-embed-limits).
// Le titre/extrait viennent d'une génération IA sans revue ligne à ligne :
// sans cette troncature, un dépassement ferait échouer l'envoi (4xx) après
// que le brouillon a déjà été commité sur GitHub.
const EMBED_TITLE_MAX = 256;
const EMBED_DESCRIPTION_MAX = 4096;
// Limite de contenu d'un message Discord classique (pas un embed) :
// https://discord.com/developers/docs/resources/message#create-message
const MESSAGE_CONTENT_MAX = 2000;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

// Partagé entre notifyDraftReady() (message hebdomadaire initial) et
// route.ts (ré-affiche les mêmes boutons sur un échec d'Approuver/Retoucher,
// pour permettre de réessayer sans attendre une nouvelle génération
// hebdomadaire) : les deux doivent toujours cibler le même slug avec les
// mêmes custom_id.
export function buildDraftActionRow(slug: string): unknown[] {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "Approuver",
          custom_id: `blog_approve:${slug}`,
        },
        {
          type: 2,
          style: 2,
          label: "Retoucher",
          custom_id: `blog_revise:${slug}`,
        },
      ],
    },
  ];
}

function buildMultipartBody(payload: unknown, coverImage: Buffer): FormData {
  const body = new FormData();
  body.set("payload_json", JSON.stringify(payload));
  body.set("files[0]", new Blob([new Uint8Array(coverImage)], { type: "image/jpeg" }), "cover.jpg");
  return body;
}

export function createDiscordNotifier(options: {
  botToken: string;
  channelId: string;
  fetchImpl?: typeof fetch;
}) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async notifyDraftReady(args: NotifyDraftReadyArgs): Promise<{ messageId: string }> {
      const payload = {
        // Le titre/extrait vivent uniquement dans l'embed, jamais dans
        // `content` (Discord ne parse les mentions @everyone/@here que dans
        // `content`) — allowed_mentions reste une défense en profondeur.
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: truncate(args.title, EMBED_TITLE_MAX),
            description: truncate(args.excerpt, EMBED_DESCRIPTION_MAX),
            url: args.previewUrl,
            color: BRAND_COLOR,
            // Pas d'illustration tant que la génération d'image n'est pas
            // configurée (ex. clé OpenAI absente) : le message part sans
            // pièce jointe plutôt que d'échouer.
            ...(args.coverImage ? { image: { url: "attachment://cover.jpg" } } : {}),
          },
        ],
        components: buildDraftActionRow(args.slug),
      };

      const response = await fetchImpl(
        `https://discord.com/api/v10/channels/${options.channelId}/messages`,
        args.coverImage
          ? {
              method: "POST",
              headers: { Authorization: `Bot ${options.botToken}` },
              body: buildMultipartBody(payload, args.coverImage),
            }
          : {
              method: "POST",
              headers: {
                Authorization: `Bot ${options.botToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }
      );

      if (!response.ok) {
        throw new Error(
          `Discord a refusé l'envoi du message (${response.status}) : ${await response.text()}`
        );
      }

      const data = (await response.json()) as { id: string };
      return { messageId: data.id };
    },

    // Seul signal visible en cas d'échec de génération (clé API manquante/
    // expirée, solde épuisé, refus Claude...) : sans ça, un lundi qui plante
    // ne se voit que dans les logs GitHub Actions. Appelé en best-effort par
    // app/api/blog/generate/route.ts, jamais depuis generateDraft.ts lui-même
    // (qui peut échouer avant même d'avoir des deps Discord utilisables).
    async notifyGenerationFailed(reason: string): Promise<void> {
      const response = await fetchImpl(
        `https://discord.com/api/v10/channels/${options.channelId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${options.botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: truncate(
              `❌ Génération du blog échouée cette semaine : ${reason}`,
              MESSAGE_CONTENT_MAX
            ),
            allowed_mentions: { parse: [] },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Discord a refusé l'envoi du message (${response.status}) : ${await response.text()}`
        );
      }
    },
  };
}

// Met à jour une seconde fois le message d'une interaction déjà répondue
// (type 7 immédiat, cf. discordInteractionHandler.ts) une fois le vrai
// travail asynchrone terminé (Phase 4 : publication réelle sur
// "Approuver"). Endpoint webhook distinct de l'API des messages de canal :
// authentifié par le token d'interaction lui-même (valable 15 min), jamais
// par le bot token.
export async function updateInteractionMessage(
  applicationId: string,
  interactionToken: string,
  payload: { content: string; components?: unknown[] },
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  const response = await fetchImpl(
    `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: truncate(payload.content, MESSAGE_CONTENT_MAX),
        components: payload.components ?? [],
        allowed_mentions: { parse: [] },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Discord a refusé la mise à jour du message (${response.status}) : ${await response.text()}`
    );
  }
}
