import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Hero from "../Hero";

describe("Hero — pas de décalage négatif sous la navbar sticky", () => {
  it("n'a plus de top négatif (la navbar est sticky et déjà dans le flux, aucun chevauchement à compenser)", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;

    expect(section.className).not.toMatch(/-top-\d/);
  });
});
