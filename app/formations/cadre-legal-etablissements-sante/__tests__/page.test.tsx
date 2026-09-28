import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/formations", () => ({
  getAllFormationsMeta: vi.fn(() => [
    {
      titre: "Obligations légales des établissements",
      slug: "obligations-legales-des-etablissements",
      famille: "cadre-legal-etablissements-sante",
      duree: "1 journée",
    },
  ]),
}));

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

import CadreLegalPage from "../page";

describe("CadreLegalPage — contenu de réassurance nouveau", () => {
  it("affiche un titre et du contenu marketing propres à cette famille", () => {
    render(<CadreLegalPage />);
    expect(
      screen.getByRole("heading", { name: /cadre légal/i, level: 1 })
    ).toBeInTheDocument();
  });

  it("le fil d'Ariane pointe vers le hub Formations", () => {
    render(<CadreLegalPage />);
    expect(screen.getByRole("link", { name: "Formations" })).toHaveAttribute(
      "href",
      "/formations"
    );
  });
});

describe("CadreLegalPage — ordre du DOM (FR: formations avant réassurance)", () => {
  it("la section Formations disponibles précède tout contenu de réassurance (pédagogie, public cible)", () => {
    render(<CadreLegalPage />);

    const headings = screen.getAllByRole("heading");
    const textOf = (h: HTMLElement) => h.textContent ?? "";
    const indexFormations = headings.findIndex(
      (h) => textOf(h) === "Formations disponibles"
    );
    const indexReassurance = headings.findIndex((h) =>
      /à qui s.adress/i.test(textOf(h))
    );

    expect(indexFormations).toBeGreaterThanOrEqual(0);
    expect(indexReassurance).toBeGreaterThanOrEqual(0);
    expect(indexFormations).toBeLessThan(indexReassurance);
  });

  it("liste la fiche réelle de cette famille", () => {
    render(<CadreLegalPage />);
    expect(
      screen.getByRole("link", { name: "Voir la fiche" })
    ).toHaveAttribute(
      "href",
      "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
  });
});
