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
    expect(lien.querySelector("h4")).toHaveTextContent("Formations");
  });

  it("expose un nom accessible concis (aria-label) plutôt que tout le texte de la tuile concaténé", () => {
    render(<Axes />);
    // La tuile entière est cliquable, mais l'annonce lecteur d'écran doit
    // rester "Découvrir les formations", pas titre + paragraphe + CTA bout à bout.
    const lien = screen.getByRole("link", { name: /découvrir les formations/i });
    expect(lien).toHaveAccessibleName("Découvrir les formations");
  });
});

describe("Axes — fond de tuile coloré par pilier (rattrapage design)", () => {
  it("Formations sur fond pastel, Coaching sur fond navy plein, GAPP sur fond logo", () => {
    render(<Axes />);
    const corpsFormations = screen
      .getByRole("link", { name: /découvrir les formations/i })
      .querySelector("h4")!.parentElement!;
    const corpsCoaching = screen
      .getByRole("link", { name: /découvrir le coaching/i })
      .querySelector("h4")!.parentElement!;
    const corpsGapp = screen
      .getByRole("link", { name: /découvrir les gapp/i })
      .querySelector("h4")!.parentElement!;

    expect(corpsFormations.className).toContain("bg-pastel");
    expect(corpsCoaching.className).toContain("bg-primary");
    expect(corpsGapp.className).toContain("bg-logo");
  });

  it("le CTA utilise le variant clair (tintedOnDark) sur la tuile Coaching, sombre (tinted) ailleurs", () => {
    render(<Axes />);
    const corpsFormations = screen
      .getByRole("link", { name: /découvrir les formations/i })
      .querySelector("h4")!.parentElement!;
    const corpsCoaching = screen
      .getByRole("link", { name: /découvrir le coaching/i })
      .querySelector("h4")!.parentElement!;
    const corpsGapp = screen
      .getByRole("link", { name: /découvrir les gapp/i })
      .querySelector("h4")!.parentElement!;

    const ctaFormations = corpsFormations.lastElementChild as HTMLElement;
    const ctaCoaching = corpsCoaching.lastElementChild as HTMLElement;
    const ctaGapp = corpsGapp.lastElementChild as HTMLElement;

    expect(ctaFormations.className).toContain("border-primary");
    expect(ctaGapp.className).toContain("border-primary");
    expect(ctaCoaching.className).toContain("border-white");
  });
});

describe("Axes — espacement sous le Hero (titre collé au bord sans padding-top)", () => {
  it("a un padding-top symétrique à son padding-bottom (pt-0 collait le titre pile à la limite de couleur avec le Hero)", () => {
    const { container } = render(<Axes />);
    const section = container.querySelector("section")!;

    expect(section.className).not.toContain("pt-0");
    expect(section.className).toContain("pt-15");
  });
});
