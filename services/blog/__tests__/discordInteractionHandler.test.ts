import { describe, expect, it, vi } from "vitest";

import {
  getActualiteApprovalId,
  getActualiteRejectionId,
  getApprovalSlug,
  getBlogSujetSubmission,
  getRevisionRequest,
  handleDiscordInteraction,
  hasTagOverlap,
  submitBlogSujet,
} from "../discordInteractionHandler";

// components est typé unknown[] côté DiscordInteractionResponse (payload
// externe) — ce helper évite de dupliquer un cast à chaque accès dans les
// tests ci-dessous, sans changer le type public.
type ModalRow = { components?: Array<{ custom_id: string; required?: boolean; value?: string }> };
function modalField(rows: unknown[] | undefined, rowIndex: number) {
  const row = rows?.[rowIndex] as ModalRow | undefined;
  return row?.components?.[0];
}

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

  it("disables the buttons immediately on actualité approval, before the real generation completes", () => {
    const result = handleDiscordInteraction({
      type: 3,
      data: { custom_id: "actu_approve:abc123def456" },
    });

    expect(result.type).toBe(7);
    expect(result.data?.components).toEqual([]);
    expect(result.data?.allowed_mentions).toEqual({ parse: [] });
  });

  it("disables the buttons immediately on actualité rejection, before the fallback generation completes", () => {
    const result = handleDiscordInteraction({
      type: 3,
      data: { custom_id: "actu_reject:abc123def456" },
    });

    expect(result.type).toBe(7);
    expect(result.data?.components).toEqual([]);
    expect(result.data?.allowed_mentions).toEqual({ parse: [] });
  });

  it("opens a topic-submission modal when the /blog-sujet command is invoked, without checking identity", () => {
    const result = handleDiscordInteraction({
      type: 2,
      data: { name: "blog-sujet" },
    });

    expect(result.type).toBe(9);
    expect(result.data?.custom_id).toBe("blog_sujet_submit");
    const topicField = modalField(result.data?.components, 0);
    expect(topicField?.custom_id).toBe("topic");
    expect(topicField?.required).toBe(true);
    const notesField = modalField(result.data?.components, 1);
    expect(notesField?.custom_id).toBe("notes");
    expect(notesField?.required).toBe(false);
  });

  it("ignores payload.member entirely when opening the /blog-sujet modal (open to the whole channel, by design)", () => {
    const result = handleDiscordInteraction({
      type: 2,
      data: { name: "blog-sujet" },
      // @ts-expect-error member is intentionally not part of the payload type: never read
      member: { user: { id: "someone" } },
    });

    expect(result.type).toBe(9);
  });

  it("falls back to an ephemeral acknowledgment for an unrecognized command name", () => {
    const result = handleDiscordInteraction({
      type: 2,
      data: { name: "autre-commande" },
    });

    expect(result.type).toBe(4);
    expect(result.data?.flags).toBe(64);
  });
});

describe("getBlogSujetSubmission", () => {
  it("extracts the topic and optional notes from a submitted /blog-sujet modal", () => {
    expect(
      getBlogSujetSubmission({
        type: 5,
        data: {
          custom_id: "blog_sujet_submit",
          components: [
            { components: [{ custom_id: "topic", value: "La nouvelle obligation RPS" }] },
            { components: [{ custom_id: "notes", value: "Source : service-public.fr" }] },
          ],
        },
      })
    ).toEqual({ topic: "La nouvelle obligation RPS", notes: "Source : service-public.fr" });
  });

  it("returns null notes when the optional field is left empty", () => {
    expect(
      getBlogSujetSubmission({
        type: 5,
        data: {
          custom_id: "blog_sujet_submit",
          components: [
            { components: [{ custom_id: "topic", value: "Un sujet" }] },
            { components: [{ custom_id: "notes", value: "" }] },
          ],
        },
      })
    ).toEqual({ topic: "Un sujet", notes: null });
  });

  it("returns null for a non-modal-submit interaction", () => {
    expect(
      getBlogSujetSubmission({ type: 2, data: { name: "blog-sujet" } })
    ).toBeNull();
  });

  it("returns null for an unrelated modal submission (e.g. revise feedback)", () => {
    expect(
      getBlogSujetSubmission({
        type: 5,
        data: { custom_id: "revise_feedback:mon-article" },
      })
    ).toBeNull();
  });
});

describe("hasTagOverlap", () => {
  it("detects a case-insensitive keyword overlap with a recent tag", () => {
    expect(hasTagOverlap("La prévention du RPS en établissement", ["rps"])).toBe(true);
  });

  it("returns false when no recent tag appears in the topic", () => {
    expect(hasTagOverlap("La reconversion professionnelle", ["GAPP", "QVCT"])).toBe(false);
  });

  it("returns false when there are no recent tags", () => {
    expect(hasTagOverlap("N'importe quel sujet", [])).toBe(false);
  });
});

describe("submitBlogSujet", () => {
  function makeDeps(overrides: Partial<{ tags: string[][] }> = {}) {
    const posts = (overrides.tags ?? [["QVCT"]]).map((tags) => ({ tags }));
    return {
      github: {
        listPublishedPosts: vi.fn().mockResolvedValue(posts),
        queueDiscordTopic: vi.fn().mockResolvedValue(undefined),
      },
    };
  }

  it("queues the topic and confirms with an immediate type 4 response", async () => {
    const deps = makeDeps();

    const result = await submitBlogSujet({ topic: "Un sujet neuf", notes: null }, deps);

    expect(deps.github.queueDiscordTopic).toHaveBeenCalledWith({
      topic: "Un sujet neuf",
      notes: null,
    });
    expect(result.type).toBe(4);
    expect(result.data?.content).toContain("Un sujet neuf");
    expect(result.data?.allowed_mentions).toEqual({ parse: [] });
  });

  it("includes a visible (non-blocking) warning when the topic overlaps a recent tag", async () => {
    const deps = makeDeps({ tags: [["RPS"]] });

    const result = await submitBlogSujet(
      { topic: "La prévention du RPS", notes: null },
      deps
    );

    expect(deps.github.queueDiscordTopic).toHaveBeenCalled();
    expect(result.data?.content).toMatch(/recoupe/);
  });

  it("omits the warning when the topic doesn't overlap any recent tag", async () => {
    const deps = makeDeps({ tags: [["GAPP"]] });

    const result = await submitBlogSujet(
      { topic: "Un sujet totalement différent", notes: null },
      deps
    );

    expect(result.data?.content).not.toMatch(/recoupe/);
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

describe("getActualiteApprovalId", () => {
  it("extracts the id from an actu_approve button interaction", () => {
    expect(
      getActualiteApprovalId({ type: 3, data: { custom_id: "actu_approve:abc123def456" } })
    ).toBe("abc123def456");
  });

  it("returns null for an actu_reject interaction", () => {
    expect(
      getActualiteApprovalId({ type: 3, data: { custom_id: "actu_reject:abc123def456" } })
    ).toBeNull();
  });

  it("returns null for a non-component interaction", () => {
    expect(getActualiteApprovalId({ type: 1 })).toBeNull();
  });
});

describe("getActualiteRejectionId", () => {
  it("extracts the id from an actu_reject button interaction", () => {
    expect(
      getActualiteRejectionId({ type: 3, data: { custom_id: "actu_reject:abc123def456" } })
    ).toBe("abc123def456");
  });

  it("returns null for an actu_approve interaction", () => {
    expect(
      getActualiteRejectionId({ type: 3, data: { custom_id: "actu_approve:abc123def456" } })
    ).toBeNull();
  });

  it("returns null for a non-component interaction", () => {
    expect(getActualiteRejectionId({ type: 1 })).toBeNull();
  });
});
