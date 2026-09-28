import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Axes from "../Axes";

describe("Axes — 3 tuiles de poids visuel comparable (Story 2.5)", () => {
  it("affiche les 3 tuiles Formations, Coaching et GAPP", () => {
    render(<Axes />);
    expect(screen.getByRole("heading", { name: /formations/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /coaching/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /gapp/i })).toBeInTheDocument();
  });

  it("chaque tuile mène vers sa page dédiée", () => {
    render(<Axes />);
    expect(screen.getByRole("link", { name: /découvrir les formations/i })).toHaveAttribute(
      "href",
      "/formations"
    );
    expect(screen.getByRole("link", { name: /découvrir le coaching/i })).toHaveAttribute(
      "href",
      "/coaching"
    );
    expect(screen.getByRole("link", { name: /découvrir les gapp/i })).toHaveAttribute(
      "href",
      "/gapp-analyse-pratiques-professionnelles"
    );
  });

  it("chaque CTA utilise le variant secondaire tinted (Story 1.2)", () => {
    render(<Axes />);
    const ctas = [
      screen.getByRole("link", { name: /découvrir les formations/i }),
      screen.getByRole("link", { name: /découvrir le coaching/i }),
      screen.getByRole("link", { name: /découvrir les gapp/i }),
    ];
    for (const cta of ctas) {
      expect(cta.className).toContain("border-primary");
      expect(cta.className).toContain("bg-primary/10");
    }
  });

  it("les 3 tuiles partagent la même classe de carte (largeur/hauteur comparables dans la grille)", () => {
    const { container } = render(<Axes />);
    const grille = container.querySelector(".grid")!;
    const tuiles = Array.from(grille.children) as HTMLElement[];
    expect(tuiles).toHaveLength(3);
    const [premiere, ...reste] = tuiles;
    for (const tuile of reste) {
      expect(tuile.className).toBe(premiere.className);
    }
  });
});
