import { describe, expect, it } from "vitest";

import { BlogDraftSchema } from "../draftSchema";

function validDraftInput() {
  return {
    title: "Titre",
    slug: "titre",
    description: "Description",
    excerpt: "Extrait",
    tags: ["QVCT"],
    bodyMarkdown: "## Section\n\nCorps.",
    imagePrompts: [{ purpose: "cover", prompt: "prompt", altText: "alt" }],
    pillar: "C",
    localAngle: false,
  };
}

describe("BlogDraftSchema", () => {
  it("accepts a draft with pillar and localAngle declared", () => {
    const result = BlogDraftSchema.safeParse(validDraftInput());
    expect(result.success).toBe(true);
  });

  it("rejects a draft missing the pillar field (mitigation : suivi fiable de la rotation)", () => {
    const { pillar: _pillar, ...withoutPillar } = validDraftInput();
    const result = BlogDraftSchema.safeParse(withoutPillar);
    expect(result.success).toBe(false);
  });

  it("rejects a draft with a pillar id outside A-D", () => {
    const result = BlogDraftSchema.safeParse({ ...validDraftInput(), pillar: "E" });
    expect(result.success).toBe(false);
  });

  it("rejects a draft missing the localAngle field", () => {
    const { localAngle: _localAngle, ...withoutLocalAngle } = validDraftInput();
    const result = BlogDraftSchema.safeParse(withoutLocalAngle);
    expect(result.success).toBe(false);
  });
});
