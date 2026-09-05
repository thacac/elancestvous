import { NextRequest } from "next/server";
import nacl from "tweetnacl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/blog/discordInteractionHandler", () => ({
  handleDiscordInteraction: vi.fn(),
}));

import { handleDiscordInteraction } from "@/services/blog/discordInteractionHandler";
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
    vi.mocked(handleDiscordInteraction).mockReset();
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
});
