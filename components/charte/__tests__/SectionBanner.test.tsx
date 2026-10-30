import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionBanner } from "../SectionBanner";

// Bandeau de section des slides : vague pétrole, icône au trait, barre orange,
// titre + sous-titre manuscrit. SEO first : un seul vrai titre (niveau
// choisi par la page), le sous-titre reste un paragraphe hors du titre, et
// tout le décor est masqué aux technologies d'assistance.
describe("SectionBanner", () => {
  it("rend un titre h2 par défaut avec le texte fourni", () => {
    render(<SectionBanner title="Mes 3 axes d'intervention" />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Mes 3 axes d'intervention" }),
    ).toBeInTheDocument();
  });

  it("permet de choisir le niveau de titre (hiérarchie Hn de la page)", () => {
    render(<SectionBanner as="h1" title="Formations RPS et QVCT" />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Formations RPS et QVCT");
  });

  it("porte l'id sur le titre pour les ancres internes", () => {
    render(<SectionBanner id="axes-de-travail" title="Mes axes" />);
    expect(screen.getByRole("heading")).toHaveAttribute("id", "axes-de-travail");
  });

  it("rend le sous-titre comme paragraphe, hors du titre", () => {
    render(<SectionBanner title="Mes axes" subtitle="Une approche globale" />);
    const subtitle = screen.getByText("Une approche globale");
    expect(subtitle.tagName).toBe("P");
    expect(screen.getByRole("heading")).not.toContainElement(subtitle);
    expect(screen.getByRole("heading")).toHaveTextContent(/^Mes axes$/);
  });

  it("masque l'icône et les formes décoratives", () => {
    const { container } = render(
      <SectionBanner title="Mes axes" icon={<svg data-testid="icone" />} />,
    );
    expect(screen.getByTestId("icone").closest("[aria-hidden='true']")).not.toBeNull();
    for (const svg of container.querySelectorAll("svg")) {
      expect(svg.closest("[aria-hidden='true']")).not.toBeNull();
    }
  });
});
