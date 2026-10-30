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

describe("Axes — toute la tuile est cliquable (rattrapage design)", () => {
  it("chaque tuile n'est qu'un seul lien (pas un lien imbriqué dans un autre élément cliquable)", () => {
    const { container } = render(<Axes />);
    const grille = container.querySelector(".grid")!;
    const tuiles = Array.from(grille.children) as HTMLElement[];

    expect(tuiles).toHaveLength(3);
    for (const tuile of tuiles) {
      expect(tuile.tagName).toBe("A");
      expect(tuile.querySelectorAll("a")).toHaveLength(0);
    }
  });

  it("le lien de la tuile Formations couvre tout le contenu (titre, texte et CTA)", () => {
    render(<Axes />);
    const lien = screen.getByRole("link", { name: /découvrir les formations/i });
    expect(lien).toHaveAccessibleName(/formations/i);
    expect(lien.querySelector("h3")).toHaveTextContent("Formations");
  });

  it("expose un nom accessible concis (aria-label) plutôt que tout le texte de la tuile concaténé", () => {
    render(<Axes />);
    // La tuile entière est cliquable, mais l'annonce lecteur d'écran doit
    // rester "Découvrir les formations", pas titre + paragraphe + CTA bout à bout.
    const lien = screen.getByRole("link", { name: /découvrir les formations/i });
    expect(lien).toHaveAccessibleName("Découvrir les formations");
  });
});

// Story 4.2 (charte slides) : fonds pastel alternés à la place de
// pastel / navy / logo, donc le même bouton secondaire teinté partout (FR12).
describe("Axes — tuiles pastel alternées (Story 4.2)", () => {
  function corps(nom: RegExp) {
    return screen.getByRole("link", { name: nom }).querySelector("h3")!.parentElement!;
  }

  it("Formations sur ciel, Coaching sur pêche, GAPP sur vert d'eau", () => {
    render(<Axes />);
    expect(corps(/découvrir les formations/i)).toHaveClass("bg-sky");
    expect(corps(/découvrir le coaching/i)).toHaveClass("bg-peach");
    expect(corps(/découvrir les gapp/i)).toHaveClass("bg-sage");
  });

  it("utilise le même CTA teinté sur fond clair dans les 3 tuiles (FR12)", () => {
    render(<Axes />);
    for (const nom of [/découvrir les formations/i, /découvrir le coaching/i, /découvrir les gapp/i]) {
      const cta = corps(nom).lastElementChild as HTMLElement;
      expect(cta.className).toContain("border-primary");
      expect(cta.className).not.toContain("border-white");
    }
  });
});

// Story 4.2 : la section s'ouvre sur le bandeau pétrole de la charte. Même
// texte qu'avant ; la phrase d'introduction n'est plus un faux h3 et les
// tuiles passent de h4 à h3 (hiérarchie Hn sans saut, validé par Cédric).
describe("Axes — bandeau de section et hiérarchie des titres (Story 4.2)", () => {
  it("ouvre sur un h2 inchangé dans un bandeau pétrole", () => {
    render(<Axes />);
    const titre = screen.getByRole("heading", { level: 2, name: "Mes 3 Axes d'Intervention" });
    expect(titre.closest(".bg-petrol")).not.toBeNull();
  });

  it("garde la phrase d'introduction, en paragraphe et non plus en titre", () => {
    render(<Axes />);
    const intro = screen.getByText(
      "Une approche globale, avec des modalités d'intervention adaptables aux besoins des équipes.",
    );
    expect(intro.tagName).toBe("P");
  });

  it("titre chaque tuile en h3, sans aucun h4", () => {
    const { container } = render(<Axes />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(container.querySelectorAll("h4")).toHaveLength(0);
  });

  it("garde l'ancre #axes-de-travail visée par le bouton du Hero", () => {
    const { container } = render(<Axes />);
    expect(container.querySelector("#axes-de-travail")).not.toBeNull();
  });
});
