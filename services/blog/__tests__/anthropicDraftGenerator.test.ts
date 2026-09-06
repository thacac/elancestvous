import { afterEach, describe, expect, it, vi } from "vitest";

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
    usage: {
      input_tokens: 1200,
      output_tokens: 3400,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  };
}

const ORIGINAL_EFFORT = process.env.ANTHROPIC_BLOG_EFFORT;
const ORIGINAL_MODEL = process.env.ANTHROPIC_BLOG_MODEL;

afterEach(() => {
  if (ORIGINAL_EFFORT === undefined) delete process.env.ANTHROPIC_BLOG_EFFORT;
  else process.env.ANTHROPIC_BLOG_EFFORT = ORIGINAL_EFFORT;
  if (ORIGINAL_MODEL === undefined) delete process.env.ANTHROPIC_BLOG_MODEL;
  else process.env.ANTHROPIC_BLOG_MODEL = ORIGINAL_MODEL;
  vi.restoreAllMocks();
});

describe("createAnthropicDraftGenerator.parseDraft", () => {
  it("does not enable prompt caching (weekly cron never reuses the cache within its TTL)", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(typeof call.system).toBe("string");
  });

  it("omits output_config.effort when ANTHROPIC_BLOG_EFFORT is not set (keeps the SDK default)", async () => {
    delete process.env.ANTHROPIC_BLOG_EFFORT;
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(call.output_config.effort).toBeUndefined();
  });

  it("forwards ANTHROPIC_BLOG_EFFORT as output_config.effort", async () => {
    process.env.ANTHROPIC_BLOG_EFFORT = "low";
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(call.output_config.effort).toBe("low");
  });

  it("falls back to the default model when ANTHROPIC_BLOG_MODEL is an empty string (as left blank in .env.example)", async () => {
    process.env.ANTHROPIC_BLOG_MODEL = "";
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(call.model).toBe("claude-opus-5");
  });

  it("treats an empty ANTHROPIC_BLOG_EFFORT the same as unset", async () => {
    process.env.ANTHROPIC_BLOG_EFFORT = "";
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(call.output_config.effort).toBeUndefined();
  });

  it("throws a clear error when ANTHROPIC_BLOG_EFFORT holds an unrecognized value", () => {
    process.env.ANTHROPIC_BLOG_EFFORT = "hihg";

    expect(() => createAnthropicDraftGenerator({ apiKey: "key" })).toThrow(
      /ANTHROPIC_BLOG_EFFORT/
    );
  });

  it("an explicit effort option takes precedence over ANTHROPIC_BLOG_EFFORT", async () => {
    process.env.ANTHROPIC_BLOG_EFFORT = "low";
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key", effort: "medium" });

    await generator.parseDraft([]);

    const call = messagesParse.mock.calls[0][0];
    expect(call.output_config.effort).toBe("medium");
  });

  it("logs token usage and an estimated cost after the call", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const generator = createAnthropicDraftGenerator({ apiKey: "key", model: "claude-opus-5" });

    await generator.parseDraft([]);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("parseDraft"),
      expect.objectContaining({
        model: "claude-opus-5",
        input_tokens: 1200,
        output_tokens: 3400,
        estimated_cost_usd: expect.any(String),
      })
    );
  });

  it("logs usage without an estimated cost for a model missing from the pricing table", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const generator = createAnthropicDraftGenerator({ apiKey: "key", model: "claude-unknown-9" });

    await generator.parseDraft([]);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("parseDraft"),
      expect.objectContaining({ estimated_cost_usd: null })
    );
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

  it("forwards ANTHROPIC_BLOG_EFFORT as output_config.effort", async () => {
    process.env.ANTHROPIC_BLOG_EFFORT = "medium";
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const generator = createAnthropicDraftGenerator({ apiKey: "key" });

    await generator.reviseDraft("---\ntitle: X\n---\nY", "feedback");

    const call = messagesParse.mock.calls[0][0];
    expect(call.output_config.effort).toBe("medium");
  });

  it("logs token usage and an estimated cost after the call", async () => {
    messagesParse.mockReset().mockResolvedValue(makeParseResponse());
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const generator = createAnthropicDraftGenerator({ apiKey: "key", model: "claude-sonnet-5" });

    await generator.reviseDraft("---\ntitle: X\n---\nY", "feedback");

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("reviseDraft"),
      expect.objectContaining({
        model: "claude-sonnet-5",
        input_tokens: 1200,
        output_tokens: 3400,
        estimated_cost_usd: expect.any(String),
      })
    );
  });
});
