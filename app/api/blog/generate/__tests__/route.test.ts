import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/blog/createBlogDraftDeps", () => ({
  createBlogDraftDeps: vi.fn().mockReturnValue({}),
}));
vi.mock("@/services/blog/generateDraft", () => ({
  generateDraft: vi.fn(),
}));
vi.mock("@/services/blog/discordNotifier", () => ({
  createDiscordNotifier: vi.fn(),
}));

import { createBlogDraftDeps } from "@/services/blog/createBlogDraftDeps";
import { createDiscordNotifier } from "@/services/blog/discordNotifier";
import { generateDraft } from "@/services/blog/generateDraft";

import { POST } from "../route";

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("https://elancestvous.fr/api/blog/generate", {
    method: "POST",
    headers,
  });
}

describe("POST /api/blog/generate", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.BLOG_CRON_SECRET = "test-secret";
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_CHANNEL_ID = "channel-123";
    vi.mocked(generateDraft).mockReset();
    vi.mocked(createBlogDraftDeps).mockClear();
    vi.mocked(createBlogDraftDeps).mockReturnValue({} as ReturnType<typeof createBlogDraftDeps>);
    vi.mocked(createDiscordNotifier).mockReset();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("rejects requests without a valid bearer token", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(generateDraft).not.toHaveBeenCalled();
  });

  it("rejects requests with the wrong secret", async () => {
    const response = await POST(
      makeRequest({ authorization: "Bearer wrong-secret" })
    );

    expect(response.status).toBe(401);
    expect(generateDraft).not.toHaveBeenCalled();
  });

  it("returns 200 and the result when the secret matches and generation succeeds", async () => {
    vi.mocked(generateDraft).mockResolvedValue({
      status: "committed",
      slug: "un-article",
      title: "Un article",
      branch: "blog-draft/un-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-article",
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("committed");
    expect(generateDraft).toHaveBeenCalled();
  });

  it("returns 500 when generation fails", async () => {
    vi.mocked(generateDraft).mockResolvedValue({
      status: "generation_failed",
      reason: "boom",
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );

    expect(response.status).toBe(500);
  });

  it("notifies Discord with the reason when generation_failed", async () => {
    const notifyGenerationFailed = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createDiscordNotifier).mockReturnValue({
      notifyGenerationFailed,
    } as unknown as ReturnType<typeof createDiscordNotifier>);
    vi.mocked(generateDraft).mockResolvedValue({
      status: "generation_failed",
      reason: "Variable d'environnement manquante : ANTHROPIC_API_KEY",
    });

    await POST(makeRequest({ authorization: "Bearer test-secret" }));

    expect(createDiscordNotifier).toHaveBeenCalledWith({
      botToken: "bot-token",
      channelId: "channel-123",
    });
    expect(notifyGenerationFailed).toHaveBeenCalledWith(
      expect.stringContaining("ANTHROPIC_API_KEY")
    );
  });

  it("notifies Discord with the reason when Claude refuses to generate", async () => {
    const notifyGenerationFailed = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createDiscordNotifier).mockReturnValue({
      notifyGenerationFailed,
    } as unknown as ReturnType<typeof createDiscordNotifier>);
    vi.mocked(generateDraft).mockResolvedValue({
      status: "refused",
      category: "frontier_llm",
    });

    await POST(makeRequest({ authorization: "Bearer test-secret" }));

    expect(notifyGenerationFailed).toHaveBeenCalledWith(
      expect.stringContaining("frontier_llm")
    );
  });

  it("notifies Discord when createBlogDraftDeps itself throws (e.g. missing ANTHROPIC_API_KEY)", async () => {
    const notifyGenerationFailed = vi.fn().mockResolvedValue(undefined);
    vi.mocked(createDiscordNotifier).mockReturnValue({
      notifyGenerationFailed,
    } as unknown as ReturnType<typeof createDiscordNotifier>);
    vi.mocked(createBlogDraftDeps).mockImplementation(() => {
      throw new Error("Variable d'environnement manquante : ANTHROPIC_API_KEY");
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );

    expect(response.status).toBe(500);
    expect(notifyGenerationFailed).toHaveBeenCalledWith(
      expect.stringContaining("ANTHROPIC_API_KEY")
    );
  });

  it("does not notify Discord on success", async () => {
    vi.mocked(generateDraft).mockResolvedValue({
      status: "committed",
      slug: "un-article",
      title: "Un article",
      branch: "blog-draft/un-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-article",
    });

    await POST(makeRequest({ authorization: "Bearer test-secret" }));

    expect(createDiscordNotifier).not.toHaveBeenCalled();
  });

  it("still returns the original failure when the Discord notification itself fails", async () => {
    vi.mocked(createDiscordNotifier).mockReturnValue({
      notifyGenerationFailed: vi.fn().mockRejectedValue(new Error("discord down")),
    } as unknown as ReturnType<typeof createDiscordNotifier>);
    vi.mocked(generateDraft).mockResolvedValue({
      status: "generation_failed",
      reason: "boom",
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.reason).toBe("boom");
  });

  it("skips the Discord notification silently when DISCORD_BOT_TOKEN/DISCORD_CHANNEL_ID aren't configured", async () => {
    delete process.env.DISCORD_BOT_TOKEN;
    vi.mocked(generateDraft).mockResolvedValue({
      status: "generation_failed",
      reason: "boom",
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );

    expect(response.status).toBe(500);
    expect(createDiscordNotifier).not.toHaveBeenCalled();
  });
});
