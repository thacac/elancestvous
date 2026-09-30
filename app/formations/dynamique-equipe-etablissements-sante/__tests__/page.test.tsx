import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/formations", () => ({
  getAllFormationsMeta: vi.fn(() => []),
}));

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

import DynamiqueEquipePage from "../page";

describe("DynamiqueEquipePage — contenu de réassurance nouveau", () => {
  it("affiche un titre et du contenu marketing propres à cette famille", () => {
    render(<DynamiqueEquipePage />);
    expect(
      screen.getByRole("heading", { name: /dynamique d.équipe/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("le fil d'Ariane pointe vers le hub Formations", () => {
    render(<DynamiqueEquipePage />);
    expect(screen.getByRole("link", { name: "Formations" })).toHaveAttribute(
      "href",
      "/formations"
    );
  });
});

describe("DynamiqueEquipePage — état vide honnête (UJ-1)", () => {
  it("affiche la section Formations disponibles sans liste tronquée ni erreur", () => {
    render(<DynamiqueEquipePage />);
    expect(
      screen.getByRole("heading", { name: "Formations disponibles" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Voir la fiche" })).not.toBeInTheDocument();
  });
});

describe("DynamiqueEquipePage — maillage retour blog (sans pilier)", () => {
  it("ne rend rien à cet endroit, sans code spécial pour ce cas", () => {
    render(<DynamiqueEquipePage />);
    expect(screen.queryByText(/pour aller plus loin/i)).not.toBeInTheDocument();
  });
});

describe("DynamiqueEquipePage — CTA final, provenance transmise au formulaire de contact", () => {
  it("pré-remplit le formulaire de contact pour ce hub (institution)", () => {
    render(<DynamiqueEquipePage />);

    const cta = screen.getByRole("link", { name: "Prendre contact" });
    const url = new URL(cta.getAttribute("href")!, "https://elancestvous.fr");
    expect(url.searchParams.get("type")).toBe("institution");
    expect(url.searchParams.get("sujet")).toBe(
      "Formations « Dynamique d'équipe et développement professionnel »"
    );
  });
});
