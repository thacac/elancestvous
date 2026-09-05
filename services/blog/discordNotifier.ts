type NotifyDraftReadyArgs = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: Buffer;
  previewUrl: string;
};

const BRAND_COLOR = 0x29b5ad;

export function createDiscordNotifier(options: {
  botToken: string;
  channelId: string;
  fetchImpl?: typeof fetch;
}) {
  const fetchImpl = options.fetchImpl ?? fetch;

  return {
    async notifyDraftReady(args: NotifyDraftReadyArgs): Promise<{ messageId: string }> {
      const payload = {
        embeds: [
          {
            title: args.title,
            description: args.excerpt,
            url: args.previewUrl,
            color: BRAND_COLOR,
            image: { url: "attachment://cover.jpg" },
          },
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 3,
                label: "Approuver",
                custom_id: `blog_approve:${args.slug}`,
              },
              {
                type: 2,
                style: 2,
                label: "Retoucher",
                custom_id: `blog_revise:${args.slug}`,
              },
            ],
          },
        ],
      };

      const body = new FormData();
      body.set("payload_json", JSON.stringify(payload));
      body.set(
        "files[0]",
        new Blob([new Uint8Array(args.coverImage)], { type: "image/jpeg" }),
        "cover.jpg"
      );

      const response = await fetchImpl(
        `https://discord.com/api/v10/channels/${options.channelId}/messages`,
        {
          method: "POST",
          headers: { Authorization: `Bot ${options.botToken}` },
          body,
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
