import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

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

describe("CadreLegalPage — colonne latérale sticky des articles liés (Story 3.2)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("affiche les articles liés en colonne latérale sticky à côté de Formations disponibles quand au moins un article cible ce pilier", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-cadre-legal", label: "Article cadre légal" },
    ]);

    const { container } = render(<CadreLegalPage />);

    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.className).toMatch(/md:sticky/);
    expect(
      screen.getByRole("link", { name: "Article cadre légal" })
    ).toHaveAttribute("href", "/blog/article-cadre-legal");
  });

  it("ne réserve aucune colonne latérale quand aucun article ne cible encore ce pilier", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);

    const { container } = render(<CadreLegalPage />);

    expect(container.querySelector("aside")).toBeNull();
  });

  it("la grille n'a que 2 enfants directs (colonne Formations + colonne articles), pas le titre et la fiche éclatés en 2 colonnes", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-cadre-legal", label: "Article cadre légal" },
    ]);

    const { container } = render(<CadreLegalPage />);

    const aside = container.querySelector("aside")!;
    expect(aside.parentElement!.children).toHaveLength(2);
  });

  it("ne récupère les articles liés qu'une seule fois (pas de second appel dans ArticlesBlogLiesBloc)", () => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-cadre-legal", label: "Article cadre légal" },
    ]);

    render(<CadreLegalPage />);

    expect(getRelatedArticleLinks).toHaveBeenCalledTimes(1);
  });
});
