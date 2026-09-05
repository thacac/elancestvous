import { describe, expect, it, vi } from "vitest";
import { createDiscordNotifier } from "../discordNotifier";

function makeFetch(status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status < 400,
    status,
    json: vi.fn().mockResolvedValue({ id: "message-id-123" }),
    text: vi.fn().mockResolvedValue(""),
  });
}

describe("createDiscordNotifier", () => {
  it("posts a message to the channel with the bot token, embed, buttons and cover image", async () => {
    const fetchImpl = makeFetch();
    const notifier = createDiscordNotifier({
      botToken: "bot-token",
      channelId: "channel-123",
      fetchImpl,
    });

    const result = await notifier.notifyDraftReady({
      slug: "mon-article",
      title: "Mon article",
      excerpt: "Un extrait court.",
      coverImage: Buffer.from("fake-image-bytes"),
      previewUrl: "https://elancestvous.fr/blog-review/mon-article?token=abc",
    });

    expect(result).toEqual({ messageId: "message-id-123" });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://discord.com/api/v10/channels/channel-123/messages");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bot bot-token");

    const body = init.body as FormData;
    const payloadRaw = body.get("payload_json");
    expect(typeof payloadRaw).toBe("string");
    const payload = JSON.parse(payloadRaw as string);

    expect(payload.embeds[0].title).toBe("Mon article");
    expect(payload.embeds[0].description).toBe("Un extrait court.");
    expect(payload.embeds[0].url).toBe(
      "https://elancestvous.fr/blog-review/mon-article?token=abc"
    );
    expect(payload.embeds[0].image.url).toBe("attachment://cover.jpg");

    const approveButton = payload.components[0].components[0];
    const reviseButton = payload.components[0].components[1];
    expect(approveButton.custom_id).toBe("blog_approve:mon-article");
    expect(reviseButton.custom_id).toBe("blog_revise:mon-article");

    const filePart = body.get("files[0]");
    expect(filePart).toBeInstanceOf(Blob);
  });

  it("throws with the response status when Discord rejects the request", async () => {
    const fetchImpl = makeFetch(401);
    const notifier = createDiscordNotifier({
      botToken: "bad-token",
      channelId: "channel-123",
      fetchImpl,
    });

    await expect(
      notifier.notifyDraftReady({
        slug: "mon-article",
        title: "Mon article",
        excerpt: "Un extrait court.",
        coverImage: Buffer.from("fake-image-bytes"),
        previewUrl: "https://elancestvous.fr/blog-review/mon-article?token=abc",
      })
    ).rejects.toThrow(/401/);
  });
});
