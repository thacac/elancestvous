import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CartesContrastBloc from "../CartesContrastBloc";

// Story 4.3 : le bloc (7 pages) passe à la charte des slides — bandeau
// pétrole avec un vrai h2, puis cartes pastel ciel/pêche en alternance.
// Contrastes (formule WCAG) : accent #a64d08 ≈ 5.1:1 sur ciel, 5.05:1 sur
// pêche ; l'orange vif tomberait à ≈ 2.3:1, il est interdit en texte.
const cartes = [
  { numero: "01", titre: "Prévenir", texte: "Un texte de carte." },
  { numero: "02", titre: "Comprendre", texte: "Un deuxième texte." },
  { numero: "03", titre: "Avancer", texte: "Un troisième texte." },
];

describe("CartesContrastBloc — charte des slides (Story 4.3)", () => {
  it("s'ouvre sur un bandeau dont le titre est un vrai h2, sous-titre en paragraphe", () => {
    render(<CartesContrastBloc titre="Dans quels contextes ?" sousTitre="Sans solution préconçue." cartes={cartes} />);
    const titre = screen.getByRole("heading", { level: 2, name: "Dans quels contextes ?" });
    expect(titre.closest("header")).toHaveClass("text-white");
    const sousTitre = screen.getByText("Sans solution préconçue.");
    expect(sousTitre.tagName).toBe("P");
    expect(titre).not.toContainElement(sousTitre);
  });

  it("présente les cartes dans une liste, en pastels ciel et pêche alternés", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    const liste = screen.getByRole("list");
    const items = within(liste).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items.map((item) => (item.className.includes("bg-sky") ? "sky" : item.className.includes("bg-peach") ? "peach" : "?"))).toEqual(["sky", "peach", "sky"]);
  });

  it("écrit le numéro en orange foncé (accent), jamais en orange vif", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    const numero = screen.getByText("01").className.split(/\s+/);
    expect(numero).toContain("text-accent");
    expect(numero).not.toContain("text-orange");
  });

  it("titre de carte h3 en bleu nuit (le style global des h3 est gris)", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    expect(screen.getByRole("heading", { level: 3, name: "Prévenir" })).toHaveClass("text-primary!");
  });

  it("n'utilise plus le fond bleu nuit ni les anciennes couleurs", () => {
    const { container } = render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    expect(container.innerHTML).not.toMatch(/\bbg-primary\b|pastel|muted|secondary/);
  });

  // Les classes construites (`md:grid-cols-${n}`) ne sont pas détectées par
  // Tailwind : la grille doit utiliser des classes écrites en entier.
  it("utilise une classe de grille littérale pour 3 cartes", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    expect(screen.getByRole("list")).toHaveClass("md:grid-cols-3");
  });

  it("garde le texte de chaque carte inchangé", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    expect(screen.getByText("Un deuxième texte.")).toBeInTheDocument();
  });
});
