import { describe, expect, it } from "vitest";
import { handleDiscordInteraction } from "../discordInteractionHandler";

describe("handleDiscordInteraction", () => {
  it("responds to a PING with a PONG", () => {
    const result = handleDiscordInteraction({ type: 1 });
    expect(result).toEqual({ type: 1 });
  });

  it("logs the approve decision and disables the buttons", () => {
    const result = handleDiscordInteraction({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
    });

    expect(result.type).toBe(7);
    expect(result.data?.components).toEqual([]);
    expect(result.data?.content).toContain("mon-article");
    expect(result.data?.content).toContain("Approuver");
  });

  it("opens a feedback modal for the revise button", () => {
    const result = handleDiscordInteraction({
      type: 3,
      data: { custom_id: "blog_revise:mon-article" },
    });

    expect(result.type).toBe(9);
    expect(result.data?.custom_id).toBe("revise_feedback:mon-article");
    const textInput = result.data?.components?.[0]?.components?.[0];
    expect(textInput?.custom_id).toBe("feedback");
    expect(textInput?.type).toBe(4);
  });

  it("logs the revise feedback from a submitted modal", () => {
    const result = handleDiscordInteraction({
      type: 5,
      data: {
        custom_id: "revise_feedback:mon-article",
        components: [
          { components: [{ custom_id: "feedback", value: "Le titre est trop générique" }] },
        ],
      },
    });

    expect(result.type).toBe(7);
    expect(result.data?.components).toEqual([]);
    expect(result.data?.content).toContain("mon-article");
    expect(result.data?.content).toContain("Le titre est trop générique");
  });

  it("falls back to an ephemeral acknowledgment for an unrecognized interaction", () => {
    const result = handleDiscordInteraction({
      type: 3,
      data: { custom_id: "something_else:mon-article" },
    });

    expect(result.type).toBe(4);
    expect(result.data?.flags).toBe(64);
  });
});
