import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PublicsCiblesBloc from "../PublicsCiblesBloc";

// Story 4.3 : bandeau pétrole (vrai h2), introduction en paragraphe, puis
// publics en cartes pastel alternées, icône dans une pastille pétrole.
const cartes = [
  { icon: <svg data-testid="icone" />, titre: "Aux équipes" },
  { titre: "Aux cadres" },
  { titre: "Aux professionnels" },
  { titre: "Aux établissements" },
];

describe("PublicsCiblesBloc — charte des slides (Story 4.3)", () => {
  it("s'ouvre sur un bandeau avec un vrai h2, l'introduction hors du titre", () => {
    render(<PublicsCiblesBloc titre="À qui s'adresse ?" sousTitre="Notamment :" cartes={cartes} />);
    const titre = screen.getByRole("heading", { level: 2, name: "À qui s'adresse ?" });
    expect(titre.closest("header")).not.toBeNull();
    expect(screen.getByText("Notamment :").tagName).toBe("P");
  });

  it("liste les publics en cartes ciel / pêche alternées", () => {
    render(<PublicsCiblesBloc titre="Titre" cartes={cartes} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveClass("bg-sky");
    expect(items[1]).toHaveClass("bg-peach");
  });

  it("place l'icône, décorative, dans une pastille pétrole", () => {
    render(<PublicsCiblesBloc titre="Titre" cartes={cartes} />);
    const pastille = screen.getByTestId("icone").parentElement!;
    expect(pastille).toHaveAttribute("aria-hidden", "true");
    expect(pastille).toHaveClass("bg-petrol");
  });

  it("utilise une classe de grille littérale et aucune ancienne couleur", () => {
    const { container } = render(<PublicsCiblesBloc titre="Titre" cartes={cartes} />);
    expect(screen.getByRole("list")).toHaveClass("sm:grid-cols-2");
    expect(container.innerHTML).not.toMatch(/muted|pastel|secondary|shadow/);
  });
});
