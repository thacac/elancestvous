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
const { notifyDraftReady, notifyActualiteProposal } = vi.hoisted(() => ({
  notifyDraftReady: vi.fn().mockResolvedValue({ messageId: "id" }),
  notifyActualiteProposal: vi.fn().mockResolvedValue({ messageId: "id-2" }),
}));
vi.mock("../discordNotifier", () => ({
  createDiscordNotifier: vi.fn().mockReturnValue({ notifyDraftReady, notifyActualiteProposal }),
}));
const { findActualite } = vi.hoisted(() => ({ findActualite: vi.fn() }));
vi.mock("../actualiteWatch", () => ({
  createActualiteWatch: vi.fn().mockReturnValue({ findActualite }),
}));
vi.mock("../rssFeedFetcher", () => ({
  createRssFeedFetcher: vi.fn().mockReturnValue(vi.fn()),
}));

import { createActualiteWatch } from "../actualiteWatch";
import { createBlogDraftDeps, createReviseDraftDeps } from "../createBlogDraftDeps";
import { createDiscordNotifier } from "../discordNotifier";
import { createGithubBlogRepo } from "../githubBlogRepo";
import { createOpenAiImageGenerator } from "../openaiImageGenerator";

describe("createBlogDraftDeps", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.IMAGE_GEN_API_KEY = "image-key";
    process.env.GH_PAT_TOKEN = "pat";
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_CHANNEL_ID = "channel-123";
    process.env.BLOG_REVIEW_SECRET = "review-secret";
    vi.mocked(createGithubBlogRepo).mockClear();
    vi.mocked(createDiscordNotifier).mockClear();
    vi.mocked(createOpenAiImageGenerator).mockClear();
    vi.mocked(createActualiteWatch).mockClear();
    notifyDraftReady.mockClear();
    notifyActualiteProposal.mockClear();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("delegates notifyActualiteProposal directly to the real notifier (no signed preview URL needed)", async () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";

    const deps = createBlogDraftDeps();
    await deps.discord.notifyActualiteProposal({
      id: "abc123def456",
      title: "Nouvelle obligation QVCT",
      summary: "Résumé",
      sourceUrl: "https://source.example/actu-1",
      pillarLabel: "GAPP",
    });

    expect(notifyActualiteProposal).toHaveBeenCalledWith({
      id: "abc123def456",
      title: "Nouvelle obligation QVCT",
      summary: "Résumé",
      sourceUrl: "https://source.example/actu-1",
      pillarLabel: "GAPP",
    });
  });

  it("parses BLOG_VEILLE_SOURCES into the actualité watch's sources list", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";
    process.env.BLOG_VEILLE_SOURCES = "https://a.example/rss.xml, https://b.example/rss.xml";

    const deps = createBlogDraftDeps();

    expect(createActualiteWatch).toHaveBeenCalledWith(
      expect.objectContaining({
        sources: ["https://a.example/rss.xml", "https://b.example/rss.xml"],
        fetchFeedItems: expect.any(Function),
      })
    );
    expect(deps.actualiteWatch?.findActualite).toBe(findActualite);
  });

  it("wires an actualité watch with an empty sources list when BLOG_VEILLE_SOURCES is unset", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";
    delete process.env.BLOG_VEILLE_SOURCES;

    createBlogDraftDeps();

    expect(createActualiteWatch).toHaveBeenCalledWith(
      expect.objectContaining({ sources: [] })
    );
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

  it("omits the image generator when IMAGE_GEN_API_KEY is not set (bypass en attendant l'accès OpenAI)", () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";
    delete process.env.IMAGE_GEN_API_KEY;

    const deps = createBlogDraftDeps();

    expect(createOpenAiImageGenerator).not.toHaveBeenCalled();
    expect(deps.imageGenerator).toBeUndefined();
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
      sourceUrl: null,
      missingServiceLink: true,
    });

    expect(notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "mon-article",
        title: "Mon article",
        excerpt: "Extrait",
        missingServiceLink: true,
        previewUrl: expect.stringMatching(
          /^https:\/\/elancestvous\.fr\/blog-review\/mon-article\?token=[0-9a-f]{64}$/
        ),
      })
    );
  });
});

describe("createReviseDraftDeps", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = "anthropic-key";
    process.env.IMAGE_GEN_API_KEY = "image-key";
    process.env.GH_PAT_TOKEN = "pat";
    process.env.DISCORD_BOT_TOKEN = "bot-token";
    process.env.DISCORD_CHANNEL_ID = "channel-123";
    process.env.BLOG_REVIEW_SECRET = "review-secret";
    process.env.GITHUB_REPO = "thacac/elancestvous";
    vi.mocked(createGithubBlogRepo).mockClear();
    vi.mocked(createDiscordNotifier).mockClear();
    notifyDraftReady.mockClear();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("wires the same GITHUB_REPO/Discord/image setup as createBlogDraftDeps", () => {
    createReviseDraftDeps();

    expect(createGithubBlogRepo).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "thacac", repo: "elancestvous" })
    );
    expect(createDiscordNotifier).toHaveBeenCalledWith(
      expect.objectContaining({ botToken: "bot-token", channelId: "channel-123" })
    );
  });

  it("builds a signed preview URL and delegates to the real notifier", async () => {
    const deps = createReviseDraftDeps();

    await deps.discord.notifyDraftReady({
      slug: "mon-article",
      title: "Mon article",
      excerpt: "Extrait",
      coverImage: Buffer.from("img"),
      sourceUrl: null,
      missingServiceLink: false,
    });

    expect(notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({
        previewUrl: expect.stringMatching(
          /^https:\/\/elancestvous\.fr\/blog-review\/mon-article\?token=[0-9a-f]{64}$/
        ),
      })
    );
  });
});
