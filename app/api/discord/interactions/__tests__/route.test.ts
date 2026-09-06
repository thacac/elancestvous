import { NextRequest } from "next/server";
import nacl from "tweetnacl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/blog/discordInteractionHandler", () => ({
  handleDiscordInteraction: vi.fn(),
  getApprovalSlug: vi.fn(),
}));
vi.mock("@/services/blog/publishDraft", () => ({
  publishDraft: vi.fn(),
}));
vi.mock("@/services/blog/githubBlogRepo", () => ({
  createGithubBlogRepo: vi.fn().mockReturnValue({}),
  parseGithubRepoEnv: vi.fn().mockReturnValue({ owner: "thacac", repo: "elancestvous" }),
}));
vi.mock("@/services/blog/discordNotifier", () => ({
  updateInteractionMessage: vi.fn().mockResolvedValue(undefined),
}));

import {
  getApprovalSlug,
  handleDiscordInteraction,
} from "@/services/blog/discordInteractionHandler";
import { updateInteractionMessage } from "@/services/blog/discordNotifier";
import { publishDraft } from "@/services/blog/publishDraft";
import { POST } from "../route";

const keyPair = nacl.sign.keyPair();
const publicKeyHex = Buffer.from(keyPair.publicKey).toString("hex");

function sign(timestamp: string, body: string): string {
  const message = new Uint8Array(Buffer.from(timestamp + body, "utf8"));
  const signature = nacl.sign.detached(message, keyPair.secretKey);
  return Buffer.from(signature).toString("hex");
}

function makeRequest(body: string, opts: { timestamp?: string; signature?: string } = {}) {
  const timestamp = opts.timestamp ?? "1700000000";
  const signature = opts.signature ?? sign(timestamp, body);
  return new NextRequest("https://elancestvous.fr/api/discord/interactions", {
    method: "POST",
    headers: {
      "x-signature-ed25519": signature,
      "x-signature-timestamp": timestamp,
    },
    body,
  });
}

describe("POST /api/discord/interactions", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.DISCORD_PUBLIC_KEY = publicKeyHex;
    process.env.GITHUB_REPO = "thacac/elancestvous";
    process.env.GH_PAT_TOKEN = "pat";
    vi.mocked(handleDiscordInteraction).mockReset();
    vi.mocked(getApprovalSlug).mockReset().mockReturnValue(null);
    vi.mocked(publishDraft).mockReset();
    vi.mocked(updateInteractionMessage).mockReset().mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("rejects a request with no signature headers", async () => {
    const request = new NextRequest("https://elancestvous.fr/api/discord/interactions", {
      method: "POST",
      body: '{"type":1}',
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(handleDiscordInteraction).not.toHaveBeenCalled();
  });

  it("rejects a request with a forged signature", async () => {
    const body = '{"type":1}';
    const request = makeRequest(body, { signature: sign("1700000000", '{"type":3}') });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(handleDiscordInteraction).not.toHaveBeenCalled();
  });

  it("delegates a validly signed request to the interaction handler", async () => {
    const body = JSON.stringify({ type: 3, data: { custom_id: "blog_approve:mon-article" } });
    vi.mocked(handleDiscordInteraction).mockReturnValue({
      type: 7,
      data: { content: "ok", components: [] },
    });

    const response = await POST(makeRequest(body));
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ type: 7, data: { content: "ok", components: [] } });
    expect(handleDiscordInteraction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 3, data: { custom_id: "blog_approve:mon-article" } })
    );
  });

  it("does not trigger a publish for a non-approve interaction", async () => {
    const body = JSON.stringify({ type: 1 });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 1 });
    vi.mocked(getApprovalSlug).mockReturnValue(null);

    await POST(makeRequest(body));

    expect(publishDraft).not.toHaveBeenCalled();
    expect(updateInteractionMessage).not.toHaveBeenCalled();
  });

  it("publishes asynchronously and updates the message when the interaction is an approve click", async () => {
    const body = JSON.stringify({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
      application_id: "app-123",
      token: "interaction-token-abc",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 6 });
    vi.mocked(getApprovalSlug).mockReturnValue("mon-article");
    vi.mocked(publishDraft).mockResolvedValue({
      status: "published",
      slug: "mon-article",
      title: "Mon article",
      commitUrl: "https://github.com/thacac/elancestvous/commit/abc",
    });

    const response = await POST(makeRequest(body));
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ type: 6 });

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "interaction-token-abc",
        expect.objectContaining({ content: expect.stringContaining("Mon article") })
      );
    });
  });

  it("updates the message with a clear reason when the draft has no cover image", async () => {
    const body = JSON.stringify({
      type: 3,
      data: { custom_id: "blog_approve:sans-image" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 6 });
    vi.mocked(getApprovalSlug).mockReturnValue("sans-image");
    vi.mocked(publishDraft).mockResolvedValue({
      status: "missing_cover_image",
      slug: "sans-image",
    });

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ content: expect.stringContaining("image") })
      );
    });
  });

  it("logs (without leaking the interaction token) when the final message update itself fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const body = JSON.stringify({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
      application_id: "app-123",
      token: "super-secret-interaction-token",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getApprovalSlug).mockReturnValue("mon-article");
    vi.mocked(publishDraft).mockResolvedValue({
      status: "published",
      slug: "mon-article",
      title: "Mon article",
      commitUrl: "https://github.com/thacac/elancestvous/commit/abc",
    });
    vi.mocked(updateInteractionMessage).mockRejectedValue(new Error("Unknown Webhook"));

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });
    const loggedText = consoleError.mock.calls.flat().join(" ");
    expect(loggedText).toContain("Unknown Webhook");
    expect(loggedText).not.toContain("super-secret-interaction-token");

    consoleError.mockRestore();
  });

  it("updates the message with the error when publishing throws unexpectedly", async () => {
    const body = JSON.stringify({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 6 });
    vi.mocked(getApprovalSlug).mockReturnValue("mon-article");
    vi.mocked(publishDraft).mockRejectedValue(new Error("GitHub API down"));

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ content: expect.stringContaining("GitHub API down") })
      );
    });
  });
});
