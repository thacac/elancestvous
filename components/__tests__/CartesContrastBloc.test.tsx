import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CartesContrastBloc from "../CartesContrastBloc";

// Bloc sur fond bleu nuit (7 pages). Revue palette 2026-10-30 : l'orange
// foncé `accent` sur le bleu nuit tombait à 2.9:1 ; et le titre de carte
// héritait du gris global des h3 (2.2:1). Règle CLAUDE.md : ≥ 3:1 en grand
// texte, ≥ 4.5:1 sinon.
const cartes = [{ numero: "01", titre: "Prévenir", texte: "Un texte de carte." }];

describe("CartesContrastBloc — contrastes sur fond bleu nuit", () => {
  it("écrit le numéro en orange vif (≈ 6.6:1 sur bleu nuit), jamais en orange foncé", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    const numero = screen.getByText("01").className.split(/\s+/);
    expect(numero).toContain("text-orange");
    expect(numero).not.toContain("text-accent");
  });

  it("écrit le titre de carte en blanc (le style global des h3 est gris)", () => {
    render(<CartesContrastBloc titre="Titre" cartes={cartes} />);
    expect(screen.getByRole("heading", { level: 3, name: "Prévenir" })).toHaveClass("text-white!");
  });
});
