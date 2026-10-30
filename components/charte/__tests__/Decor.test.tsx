import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrushUnderline, Sparkle, Wave } from "../Decor";

describe("Wave", () => {
  it("est purement décorative (masquée, non focusable)", () => {
    const { container } = render(<Wave />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
  });

  it("se retourne pour une vague de haut de section", () => {
    const { container } = render(<Wave position="top" />);
    expect(container.querySelector("svg")).toHaveClass("-scale-y-100");
  });
});

describe("Sparkle", () => {
  it("est purement décorative", () => {
    const { container } = render(<Sparkle />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("BrushUnderline", () => {
  it("garde le texte intact (indexé tel quel) et masque le trait de pinceau", () => {
    const { container } = render(
      <h1>
        Préserver la santé de <BrushUnderline>ceux qui soignent</BrushUnderline>.
      </h1>,
    );
    expect(screen.getByRole("heading")).toHaveTextContent("Préserver la santé de ceux qui soignent.");
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
