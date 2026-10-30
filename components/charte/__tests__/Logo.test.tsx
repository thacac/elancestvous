import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "../Logo";

// Logo redessiné en vectoriel (variante C validée par Coralie) : même lettre
// et même flèche sur le cercle turquoise, point du « é » orange, et en grand
// les trois étincelles orange des slides, animées en douceur.
describe("Logo", () => {
  it("est décoratif par défaut (à côté du nom en texte, pas de doublon lu)", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("devient une image nommée quand un titre est fourni", () => {
    render(<Logo title="Élan C'est Vous" />);
    expect(screen.getByRole("img", { name: "Élan C'est Vous" })).toBeInTheDocument();
  });

  it("dessine le cercle turquoise du logo et le point orange, via les tokens", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("[data-logo-circle]")).toHaveClass("fill-logo");
    expect(container.querySelector("[data-logo-dot]")).toHaveClass("fill-orange");
  });

  it("n'a pas d'étincelles par défaut (barre de navigation, icônes : trop petit)", () => {
    const { container } = render(<Logo />);
    expect(container.querySelectorAll("[data-sparkle]")).toHaveLength(0);
  });

  it("ajoute les trois étincelles en version « sparkles »", () => {
    const { container } = render(<Logo variant="sparkles" />);
    expect(container.querySelectorAll("[data-sparkle]")).toHaveLength(3);
  });

  it("anime les étincelles seulement si demandé, et jamais en mouvement réduit", () => {
    const { container, rerender } = render(<Logo variant="sparkles" />);
    for (const sparkle of container.querySelectorAll("[data-sparkle]")) {
      expect(sparkle.getAttribute("class") ?? "").not.toMatch(/animate-/);
    }
    rerender(<Logo variant="sparkles" animated />);
    const delays = new Set<string>();
    for (const sparkle of container.querySelectorAll("[data-sparkle]")) {
      expect(sparkle).toHaveClass("motion-safe:animate-elan-sparkle");
      delays.add((sparkle as SVGElement).style.animationDelay);
    }
    // Décalées l'une après l'autre : un scintillement, pas un clignotement.
    expect(delays.size).toBe(3);
  });
});
