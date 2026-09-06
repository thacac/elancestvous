import { NextRequest } from "next/server";
import nacl from "tweetnacl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/blog/discordInteractionHandler", () => ({
  handleDiscordInteraction: vi.fn(),
  getApprovalSlug: vi.fn(),
  getRevisionRequest: vi.fn(),
}));
vi.mock("@/services/blog/publishDraft", () => ({
  publishDraft: vi.fn(),
}));
vi.mock("@/services/blog/reviseDraft", () => ({
  reviseDraft: vi.fn(),
}));
vi.mock("@/services/blog/createBlogDraftDeps", () => ({
  createReviseDraftDeps: vi.fn().mockReturnValue({}),
}));
vi.mock("@/services/blog/githubBlogRepo", () => ({
  createGithubBlogRepo: vi.fn().mockReturnValue({}),
  parseGithubRepoEnv: vi.fn().mockReturnValue({ owner: "thacac", repo: "elancestvous" }),
}));
vi.mock("@/services/blog/discordNotifier", () => ({
  updateInteractionMessage: vi.fn().mockResolvedValue(undefined),
  buildDraftActionRow: vi.fn((slug: string) => [{ type: 1, marker: `row-for-${slug}` }]),
}));

import {
  getApprovalSlug,
  getRevisionRequest,
  handleDiscordInteraction,
} from "@/services/blog/discordInteractionHandler";
import { buildDraftActionRow, updateInteractionMessage } from "@/services/blog/discordNotifier";
import { publishDraft } from "@/services/blog/publishDraft";
import { reviseDraft } from "@/services/blog/reviseDraft";
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
    vi.mocked(getRevisionRequest).mockReset().mockReturnValue(null);
    vi.mocked(publishDraft).mockReset();
    vi.mocked(reviseDraft).mockReset();
    vi.mocked(updateInteractionMessage).mockReset().mockResolvedValue(undefined);
    vi.mocked(buildDraftActionRow).mockClear();
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

  it("does not trigger a revision for a non-modal-submit interaction", async () => {
    const body = JSON.stringify({ type: 1 });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 1 });
    vi.mocked(getRevisionRequest).mockReturnValue(null);

    await POST(makeRequest(body));

    expect(reviseDraft).not.toHaveBeenCalled();
    expect(updateInteractionMessage).not.toHaveBeenCalled();
  });

  it("revises asynchronously and updates the message when the modal is submitted", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "interaction-token-abc",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({
      slug: "mon-article",
      feedback: "Le titre est trop générique",
    });
    vi.mocked(reviseDraft).mockResolvedValue({
      status: "committed",
      slug: "mon-article",
      title: "Mon article retouché",
      branch: "blog-draft/mon-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/mon-article",
    });

    const response = await POST(makeRequest(body));
    const responseBody = await response.json();

    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ type: 7 });
    expect(reviseDraft).toHaveBeenCalledWith(
      "mon-article",
      "Le titre est trop générique",
      expect.anything()
    );

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "interaction-token-abc",
        expect.objectContaining({ content: expect.stringContaining("mon-article") })
      );
    });
  });

  it("updates the message with a clear reason when the model refuses to revise", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
    vi.mocked(reviseDraft).mockResolvedValue({ status: "refused", category: "harmful" });

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ content: expect.stringContaining("refusé") })
      );
    });
  });

  it("updates the message with the reason when the revision generation fails", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
    vi.mocked(reviseDraft).mockResolvedValue({
      status: "generation_failed",
      reason: "sortie structurée invalide",
    });

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ content: expect.stringContaining("sortie structurée invalide") })
      );
    });
  });

  it("updates the message when the draft to revise is not found", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:disparu" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "disparu", feedback: "..." });
    vi.mocked(reviseDraft).mockResolvedValue({ status: "draft_not_found", slug: "disparu" });

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ content: expect.stringContaining("introuvable") })
      );
    });
  });

  it("logs (without leaking the interaction token) when the final revision message update fails", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "super-secret-interaction-token",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
    vi.mocked(reviseDraft).mockResolvedValue({
      status: "committed",
      slug: "mon-article",
      title: "Mon article retouché",
      branch: "blog-draft/mon-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/mon-article",
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

  it("updates the message with the error when revising throws unexpectedly", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
    vi.mocked(reviseDraft).mockRejectedValue(new Error("Anthropic API down"));

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ content: expect.stringContaining("Anthropic API down") })
      );
    });
  });

  it.each([
    "missing_cover_image",
    "slug_mismatch",
    "invalid_cover_path",
    "draft_not_found",
  ] as const)(
    "re-attaches the original Approuver/Retoucher buttons when publishing returns %s, so the click can be retried",
    async (status) => {
      const body = JSON.stringify({
        type: 3,
        data: { custom_id: "blog_approve:mon-article" },
        application_id: "app-123",
        token: "tok",
      });
      vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
      vi.mocked(getApprovalSlug).mockReturnValue("mon-article");
      vi.mocked(publishDraft).mockResolvedValue({ status, slug: "mon-article" });

      await POST(makeRequest(body));

      await vi.waitFor(() => {
        expect(updateInteractionMessage).toHaveBeenCalledWith(
          "app-123",
          "tok",
          expect.objectContaining({ components: [{ type: 1, marker: "row-for-mon-article" }] })
        );
      });
    }
  );

  it("re-attaches the buttons when publishing throws unexpectedly", async () => {
    const body = JSON.stringify({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getApprovalSlug).mockReturnValue("mon-article");
    vi.mocked(publishDraft).mockRejectedValue(new Error("GitHub API down"));

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ components: [{ type: 1, marker: "row-for-mon-article" }] })
      );
    });
  });

  it("does not re-attach buttons when publishing succeeds", async () => {
    const body = JSON.stringify({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getApprovalSlug).mockReturnValue("mon-article");
    vi.mocked(publishDraft).mockResolvedValue({
      status: "published",
      slug: "mon-article",
      title: "Mon article",
      commitUrl: "https://github.com/thacac/elancestvous/commit/abc",
    });

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalled();
    });
    expect(buildDraftActionRow).not.toHaveBeenCalled();
  });

  it.each([
    { status: "refused" as const, category: "harmful" },
    { status: "generation_failed" as const, reason: "sortie structurée invalide" },
    { status: "draft_not_found" as const, slug: "mon-article" },
  ])(
    "re-attaches the original buttons when revising returns $status, so the click can be retried",
    async (result) => {
      const body = JSON.stringify({
        type: 5,
        data: { custom_id: "revise_feedback:mon-article" },
        application_id: "app-123",
        token: "tok",
      });
      vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
      vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
      vi.mocked(reviseDraft).mockResolvedValue(result);

      await POST(makeRequest(body));

      await vi.waitFor(() => {
        expect(updateInteractionMessage).toHaveBeenCalledWith(
          "app-123",
          "tok",
          expect.objectContaining({ components: [{ type: 1, marker: "row-for-mon-article" }] })
        );
      });
    }
  );

  it("re-attaches the buttons when revising throws unexpectedly", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
    vi.mocked(reviseDraft).mockRejectedValue(new Error("Anthropic API down"));

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalledWith(
        "app-123",
        "tok",
        expect.objectContaining({ components: [{ type: 1, marker: "row-for-mon-article" }] })
      );
    });
  });

  it("does not re-attach buttons when revising succeeds (a fresh message with buttons is posted separately)", async () => {
    const body = JSON.stringify({
      type: 5,
      data: { custom_id: "revise_feedback:mon-article" },
      application_id: "app-123",
      token: "tok",
    });
    vi.mocked(handleDiscordInteraction).mockReturnValue({ type: 7 });
    vi.mocked(getRevisionRequest).mockReturnValue({ slug: "mon-article", feedback: "..." });
    vi.mocked(reviseDraft).mockResolvedValue({
      status: "committed",
      slug: "mon-article",
      title: "Titre révisé",
      branch: "blog-draft/mon-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/mon-article",
    });

    await POST(makeRequest(body));

    await vi.waitFor(() => {
      expect(updateInteractionMessage).toHaveBeenCalled();
    });
    expect(buildDraftActionRow).not.toHaveBeenCalled();
  });
});
