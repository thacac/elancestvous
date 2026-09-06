import { describe, expect, it, vi } from "vitest";

const messagesParse = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: function Anthropic() {
    return { messages: { parse: messagesParse } };
  },
}));

import { createAnthropicDraftGenerator } from "../anthropicDraftGenerator";

function makeParseResponse() {
  return {
    stop_reason: "end_turn",
    stop_details: null,
    parsed_output: {
      title: "Titre",
      slug: "titre",
      description: "Description",
      excerpt: "Extrait",
      tags: ["QVCT"],
      bodyMarkdown: "## Section\n\nCorps.",
      imagePrompts: [{ purpose: "cover", prompt: "prompt", altText: "alt" }],
    },
  };
}

describe("createAnthropicDraftGenerator.parseDraft", () => {
  it("does not enable prompt caching (weekly cron never reuses the cache within its TTL)", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(typeof call.system).toBe("string");
  });
});

describe("createAnthropicDraftGenerator.reviseDraft", () => {
  it("enables prompt caching on the system prompt (same SYSTEM_PROMPT reused across revise rounds within minutes)", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.reviseDraft("---\ntitle: Ancien\n---\nCorps.", "Le titre est trop générique");

    const call = messagesParse.mock.calls[0][0];
    expect(Array.isArray(call.system)).toBe(true);
    expect(call.system[0].cache_control).toEqual({ type: "ephemeral" });
    expect(call.system[0].text.length).toBeGreaterThan(0);
  });

  it("includes the current draft markdown and human feedback in the request", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.reviseDraft("---\ntitle: Ancien\n---\nCorps existant.", "Trop long, raccourcis");

    const call = messagesParse.mock.calls[0][0];
    const userContent = call.messages[0].content as string;
    expect(userContent).toContain("Corps existant.");
    expect(userContent).toContain("Trop long, raccourcis");
  });

  it("returns the parsed result in the same shape as parseDraft", async () => {
    const response = makeParseResponse();
    messagesParse.mockReset().mockResolvedValue(response);
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    const result = await generator.reviseDraft("---\ntitle: X\n---\nY", "feedback");

    expect(result).toEqual({
      stop_reason: "end_turn",
      stop_details: null,
      parsed_output: response.parsed_output,
    });
  });
});
