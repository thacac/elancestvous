import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Citation from "../Citation";

// Story 4.3 : l'ancien gris `text-muted` (#93999b) faisait 2.9:1 sur blanc,
// sous le seuil de 4.5:1. La citation passe en bleu nuit sur pêche (≈ 16:1).
describe("Citation — charte des slides (Story 4.3)", () => {
  it("garde le texte entre guillemets dans un blockquote", () => {
    render(<Citation text="Avancer pas à pas." />);
    expect(screen.getByText('"Avancer pas à pas."').tagName).toBe("BLOCKQUOTE");
  });

  it("écrit la citation en bleu nuit sur une carte pêche, sans l'ancien gris", () => {
    const { container } = render(<Citation text="Avancer pas à pas." />);
    const figure = container.querySelector("figure")!;
    expect(figure).toHaveClass("bg-peach");
    expect(screen.getByText('"Avancer pas à pas."')).toHaveClass("text-primary");
    expect(container.innerHTML).not.toMatch(/muted/);
  });

  it("garde la vraie photo de Coralie avec son alternative", () => {
    render(<Citation text="Texte" imageAlt="Coach Coralie" />);
    expect(screen.getByRole("img", { name: "Coach Coralie" })).toBeInTheDocument();
  });

  it("place l'auteur en légende directe de la figure", () => {
    const { container } = render(<Citation text="Texte" author="Coralie" />);
    const legende = screen.getByText("Coralie");
    expect(legende.tagName).toBe("FIGCAPTION");
    expect(legende.parentElement).toBe(container.querySelector("figure"));
  });
});
