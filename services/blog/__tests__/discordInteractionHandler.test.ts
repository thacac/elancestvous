import { describe, expect, it } from "vitest";
import {
  getApprovalSlug,
  getRevisionRequest,
  handleDiscordInteraction,
} from "../discordInteractionHandler";

describe("handleDiscordInteraction", () => {
  it("responds to a PING with a PONG", () => {
    const result = handleDiscordInteraction({ type: 1 });
    expect(result).toEqual({ type: 1 });
  });

  it("disables the buttons immediately on approve, before the real publication completes", () => {
    const result = handleDiscordInteraction({
      type: 3,
      data: { custom_id: "blog_approve:mon-article" },
    });

    expect(result.type).toBe(7);
    expect(result.data?.components).toEqual([]);
    expect(result.data?.content).toContain("mon-article");
    expect(result.data?.allowed_mentions).toEqual({ parse: [] });
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

  it("acknowledges the modal submission immediately and disables the buttons, before the real revision completes", () => {
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
    expect(result.data?.allowed_mentions).toEqual({ parse: [] });
  });

  it("neutralizes mentions in feedback so @everyone/@here/@user can't ping anyone", () => {
    const result = handleDiscordInteraction({
      type: 5,
      data: {
        custom_id: "revise_feedback:mon-article",
        components: [
          {
            components: [
              { custom_id: "feedback", value: "@everyone regarde ça, @here aussi" },
            ],
          },
        ],
      },
    });

    expect(result.data?.allowed_mentions).toEqual({ parse: [] });
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

describe("getApprovalSlug", () => {
  it("extracts the slug from an approve button interaction", () => {
    expect(
      getApprovalSlug({ type: 3, data: { custom_id: "blog_approve:mon-article" } })
    ).toBe("mon-article");
  });

  it("returns null for a revise button interaction", () => {
    expect(
      getApprovalSlug({ type: 3, data: { custom_id: "blog_revise:mon-article" } })
    ).toBeNull();
  });

  it("returns null for a non-component interaction", () => {
    expect(getApprovalSlug({ type: 1 })).toBeNull();
  });
});

describe("getRevisionRequest", () => {
  it("extracts the slug and feedback text from a submitted modal", () => {
    expect(
      getRevisionRequest({
        type: 5,
        data: {
          custom_id: "revise_feedback:mon-article",
          components: [
            { components: [{ custom_id: "feedback", value: "Le titre est trop générique" }] },
          ],
        },
      })
    ).toEqual({ slug: "mon-article", feedback: "Le titre est trop générique" });
  });

  it("returns null for a non-modal-submit interaction", () => {
    expect(
      getRevisionRequest({ type: 3, data: { custom_id: "blog_revise:mon-article" } })
    ).toBeNull();
  });

  it("returns null for an unrelated modal submission", () => {
    expect(getRevisionRequest({ type: 5, data: { custom_id: "something_else" } })).toBeNull();
  });
});
