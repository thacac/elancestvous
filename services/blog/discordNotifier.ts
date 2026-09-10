type NotifyDraftReadyArgs = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: Buffer | null;
  previewUrl: string;
  // Présent pour un article dérivé de la veille actualité (#66) : déclenche
  // un champ d'avertissement dédié dans l'embed (mitigation 4 — revue
  // humaine renforcée sur un contenu à caractère réglementaire).
  sourceUrl?: string | null;
  // Calculé par editorialChecks.ts::hasServiceLink() (#74) : true quand
  // aucun lien vers une page de service n'a été détecté dans le corps de
  // l'article — déclenche un champ d'avertissement dédié pour la revue
  // Discord, faute de pouvoir garantir que le modèle a suivi la consigne de
  // SYSTEM_PROMPT à 100 %. Optionnel pour ne pas casser un appelant qui ne
  // le calcule pas (ex. tests existants) : traité comme "non signalé".
  missingServiceLink?: boolean;
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

// Correction de #66 : un sujet trouvé par la veille actualité n'est trié ni
// par un humain (source scopée ou non) ni par un agent — il doit donc être
// soumis à validation explicite avant que génération/coût/publication ne
// démarrent, plutôt que d'être traité comme le sujet de la semaine.
export function buildActualiteProposalActionRow(id: string): unknown[] {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "Approuver le sujet",
          custom_id: `actu_approve:${id}`,
        },
        {
          type: 2,
          style: 2,
          label: "Ignorer",
          custom_id: `actu_reject:${id}`,
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
  // Salon dédié aux propositions de la veille actualité (#66), distinctes des
  // brouillons prêts à valider (notifyDraftReady) — deux flux au rythme très
  // différent (une actualité peut sortir plusieurs fois par semaine) qui
  // noient chacun le message de l'autre dans le même salon. Optionnel :
  // retombe sur channelId tant que ce salon n'est pas configuré séparément.
  veilleChannelId?: string;
  // Optionnel : le rapport Search Console (#57) part sur un salon dédié tant
  // que celui-ci est configuré, pour ne pas noyer les brouillons/propositions
  // — rythme encore différent des deux autres flux (une exécution manuelle
  // ponctuelle plutôt qu'un événement par article). Retombe sur channelId.
  seoReportChannelId?: string;
  fetchImpl?: typeof fetch;
}) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async notifyDraftReady(args: NotifyDraftReadyArgs): Promise<{ messageId: string }> {
      // Deux avertissements indépendants, tous deux optionnels et cumulables
      // (une actualité peut manquer de lien service, et inversement) : un
      // tableau construit dynamiquement plutôt que deux `...(cond ? {fields:
      // [...]} : {})` qui s'écraseraient l'un l'autre.
      const warningFields = [
        ...(args.sourceUrl
          ? [
              {
                name: "⚠️ Article basé sur une actualité",
                value: `Relecture renforcée requise — source citée : ${args.sourceUrl}`,
              },
            ]
          : []),
        ...(args.missingServiceLink
          ? [
              {
                name: "⚠️ Maillage interne manquant",
                value:
                  "Aucun lien vers une page de service détecté dans le corps de l'article — vérifier avant d'approuver.",
              },
            ]
          : []),
      ];

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
            ...(warningFields.length > 0 ? { fields: warningFields } : {}),
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

    // Point de validation humaine ajouté en correction de #66 : une
    // actualité trouvée par la veille est proposée ici, jamais générée
    // directement — un clic "Approuver le sujet" la met en file plutôt que
    // de générer directement (cf. generateDraft.ts::queueApprovedActualite,
    // discordInteractionHandler.ts). Embed volontairement minimal (titre +
    // lien seulement, pas de résumé ni de pilier suggéré) : retour d'usage
    // réel — plusieurs candidats par jour à trier vite, un embed chargé
    // ralentissait la décision Approuver/Ignorer plus qu'il n'aidait.
    async notifyActualiteProposal(args: {
      id: string;
      title: string;
      sourceUrl: string;
    }): Promise<{ messageId: string }> {
      const payload = {
        allowed_mentions: { parse: [] },
        embeds: [
          {
            title: truncate(args.title, EMBED_TITLE_MAX),
            url: args.sourceUrl,
            color: BRAND_COLOR,
          },
        ],
        components: buildActualiteProposalActionRow(args.id),
      };

      const response = await fetchImpl(
        `https://discord.com/api/v10/channels/${options.veilleChannelId ?? options.channelId}/messages`,
        {
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

    // Reçoit l'embed déjà construit (searchConsoleReportEmbed.ts) plutôt que
    // le report brut : ce module ne connaît que le transport Discord, pas la
    // mise en forme du rapport (#57).
    async notifySearchConsoleReport(embeds: unknown[]): Promise<{ messageId: string }> {
      const response = await fetchImpl(
        `https://discord.com/api/v10/channels/${options.seoReportChannelId ?? options.channelId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${options.botToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ embeds, allowed_mentions: { parse: [] } }),
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
