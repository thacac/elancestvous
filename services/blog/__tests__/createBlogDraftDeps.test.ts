import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../anthropicDraftGenerator", () => ({
  createAnthropicDraftGenerator: vi.fn().mockReturnValue({}),
}));
vi.mock("../openaiImageGenerator", () => ({
  createOpenAiImageGenerator: vi.fn().mockReturnValue({}),
}));
vi.mock("../githubBlogRepo", async () => {
  const actual = await vi.importActual<typeof import("../githubBlogRepo")>(
    "../githubBlogRepo"
  );
  return {
    ...actual,
    createGithubBlogRepo: vi.fn().mockReturnValue({}),
  };
});
const { notifyDraftReady } = vi.hoisted(() => ({
  notifyDraftReady: vi.fn().mockResolvedValue({ messageId: "id" }),
}));
vi.mock("../discordNotifier", () => ({
  createDiscordNotifier: vi.fn().mockReturnValue({ notifyDraftReady }),
}));

import { createBlogDraftDeps } from "../createBlogDraftDeps";
import { createGithubBlogRepo } from "../githubBlogRepo";
import { createDiscordNotifier } from "../discordNotifier";

describe("createBlogDraftDeps", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.IMAGE_GEN_API_KEY = "image-key";
    process.env.GITHUB_BLOG_PAT = "pat";
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_CHANNEL_ID = "channel-123";
    process.env.BLOG_REVIEW_SECRET = "review-secret";
    vi.mocked(createGithubBlogRepo).mockClear();
    vi.mocked(createDiscordNotifier).mockClear();
    notifyDraftReady.mockClear();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("parses a well-formed owner/repo", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";

    createBlogDraftDeps();

    expect(createGithubBlogRepo).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "thacac", repo: "elancestvous" })
    );
  });

  it("rejects a GITHUB_REPO with an extra segment instead of silently truncating it", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous/extra";

    expect(() => createBlogDraftDeps()).toThrow(/owner\/repo/);
  });

  it("rejects a GITHUB_REPO missing the repo segment", () => {
    process.env.GITHUB_REPO = "thacac";

    expect(() => createBlogDraftDeps()).toThrow(/owner\/repo/);
  });

  it("wires DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID into the notifier", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";

    createBlogDraftDeps();

    expect(createDiscordNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ botToken: "bot-token", channelId: "channel-123" })
    );
  });

  it("builds a signed preview URL and delegates to the real notifier", async () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";

    const deps = createBlogDraftDeps();
    await deps.discord.notifyDraftReady({
      slug: "mon-article",
      title: "Mon article",
      excerpt: "Extrait",
      coverImage: Buffer.from("img"),
    });

    expect(notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "mon-article",
        title: "Mon article",
        excerpt: "Extrait",
        previewUrl: expect.stringMatching(
          /^https:\/\/elancestvous\.fr\/blog-review\/mon-article\?token=[0-9a-f]{64}$/
        ),
      })
    );
  });
});
