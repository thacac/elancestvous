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

    expect(payload.allowed_mentions).toEqual({ parse: [] });
  });

  it("truncates an oversized title and excerpt to Discord's embed limits", async () => {
    const fetchImpl = makeFetch();
    const notifier = createDiscordNotifier({
      botToken: "bot-token",
      channelId: "channel-123",
      fetchImpl,
    });

    await notifier.notifyDraftReady({
      slug: "mon-article",
      title: "T".repeat(300),
      excerpt: "E".repeat(5000),
      coverImage: Buffer.from("fake-image-bytes"),
      previewUrl: "https://elancestvous.fr/blog-review/mon-article?token=abc",
    });

    const body = fetchImpl.mock.calls[0][1].body as FormData;
    const payload = JSON.parse(body.get("payload_json") as string);

    expect(payload.embeds[0].title.length).toBeLessThanOrEqual(256);
    expect(payload.embeds[0].description.length).toBeLessThanOrEqual(4096);
  });

  it("posts a plain JSON message without an attachment when no cover image is provided", async () => {
    const fetchImpl = makeFetch();
    const notifier = createDiscordNotifier({
      botToken: "bot-token",
      channelId: "channel-123",
      fetchImpl,
    });

    await notifier.notifyDraftReady({
      slug: "mon-article",
      title: "Mon article",
      excerpt: "Un extrait court.",
      coverImage: null,
      previewUrl: "https://elancestvous.fr/blog-review/mon-article?token=abc",
    });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.body).not.toBeInstanceOf(FormData);
    const payload = JSON.parse(init.body as string);
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(payload.embeds[0].image).toBeUndefined();
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

describe("createDiscordNotifier.notifyGenerationFailed", () => {
  it("posts a plain failure message with the reason, without pinging anyone", async () => {
    const fetchImpl = makeFetch();
    const notifier = createDiscordNotifier({
      botToken: "bot-token",
      channelId: "channel-123",
      fetchImpl,
    });

    await notifier.notifyGenerationFailed(
      "Variable d'environnement manquante : ANTHROPIC_API_KEY"
    );

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("https://discord.com/api/v10/channels/channel-123/messages");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bot bot-token");
    expect(init.headers["Content-Type"]).toBe("application/json");
    const payload = JSON.parse(init.body as string);
    expect(payload.content).toContain("ANTHROPIC_API_KEY");
    expect(payload.allowed_mentions).toEqual({ parse: [] });
  });

  it("throws with the response status when Discord rejects the request", async () => {
    const fetchImpl = makeFetch(401);
    const notifier = createDiscordNotifier({
      botToken: "bad-token",
      channelId: "channel-123",
      fetchImpl,
    });

    await expect(notifier.notifyGenerationFailed("boom")).rejects.toThrow(/401/);
  });
});
