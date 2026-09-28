import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/formations", () => ({
  getAllFormationsMeta: vi.fn(() => []),
}));

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

import AccompagnementProfessionnelPage from "../page";

describe("AccompagnementProfessionnelPage — contenu de réassurance nouveau", () => {
  it("affiche un titre et du contenu marketing propres à cette famille", () => {
    render(<AccompagnementProfessionnelPage />);
    expect(
      screen.getByRole("heading", { name: /accompagnement/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("le fil d'Ariane pointe vers le hub Formations", () => {
    render(<AccompagnementProfessionnelPage />);
    expect(screen.getByRole("link", { name: "Formations" })).toHaveAttribute(
      "href",
      "/formations"
    );
  });
});

describe("AccompagnementProfessionnelPage — état vide honnête (UJ-1)", () => {
  it("affiche la section Formations disponibles sans liste tronquée ni erreur", () => {
    render(<AccompagnementProfessionnelPage />);
    expect(
      screen.getByRole("heading", { name: "Formations disponibles" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Voir la fiche" })).not.toBeInTheDocument();
  });
});

describe("AccompagnementProfessionnelPage — maillage retour blog (sans pilier)", () => {
  it("ne rend rien à cet endroit, sans code spécial pour ce cas", () => {
    render(<AccompagnementProfessionnelPage />);
    expect(screen.queryByText(/pour aller plus loin/i)).not.toBeInTheDocument();
  });
});
