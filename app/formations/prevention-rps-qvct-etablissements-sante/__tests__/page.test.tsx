import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/formations", () => ({
  getAllFormationsMeta: vi.fn(() => [
    {
      titre: "Diagnostic et plan d'action QVCT",
      slug: "diagnostic-plan-action-qvct",
      famille: "prevention-rps-qvct-etablissements-sante",
      duree: "2 jours",
    },
  ]),
}));

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

import PreventionRpsQvctPage from "../page";

describe("PreventionRpsQvctPage — contenu conservé (FR7)", () => {
  it("conserve le contenu marketing (titre, sections) de l'ancienne page", () => {
    render(<PreventionRpsQvctPage />);
    expect(
      screen.getByRole("heading", { name: "Formations professionnelles." })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/une formation pensée pour la réalité du terrain/i)
    ).toBeInTheDocument();
  });

  it("le fil d'Ariane pointe vers le hub Formations", () => {
    render(<PreventionRpsQvctPage />);
    expect(screen.getByRole("link", { name: "Formations" })).toHaveAttribute(
      "href",
      "/formations"
    );
  });
});

describe("PreventionRpsQvctPage — ordre du DOM (FR: formations avant réassurance)", () => {
  it("la section Formations disponibles précède le contenu de réassurance (pédagogie, public cible)", () => {
    render(<PreventionRpsQvctPage />);

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
    render(<PreventionRpsQvctPage />);
    expect(screen.getByRole("link", { name: "Voir la fiche" })).toHaveAttribute(
      "href",
      "/formations/prevention-rps-qvct-etablissements-sante/diagnostic-plan-action-qvct"
    );
  });
});

describe("PreventionRpsQvctPage internal linking", () => {
  it("links to the coaching en établissement page on its new URL", () => {
    render(<PreventionRpsQvctPage />);
    expect(
      screen.getByRole("link", { name: /coaching en établissement/i })
    ).toHaveAttribute("href", "/coaching/etablissements");
  });

  it("links to the GAPP page on its new URL", () => {
    render(<PreventionRpsQvctPage />);
    expect(screen.getByRole("link", { name: /gapp/i })).toHaveAttribute(
      "href",
      "/gapp-analyse-pratiques-professionnelles"
    );
  });
});

describe("PreventionRpsQvctPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page, on its new URL", () => {
    render(<PreventionRpsQvctPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith(
      "/formations/prevention-rps-qvct-etablissements-sante"
    );
  });
});

describe("PreventionRpsQvctPage — colonne latérale sticky des articles liés (Story 3.2)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("affiche les articles liés en colonne latérale sticky à côté de Formations disponibles quand au moins un article cible ce pilier", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-rps-qvct", label: "Article RPS QVCT" },
    ]);

    const { container } = render(<PreventionRpsQvctPage />);

    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.className).toMatch(/md:sticky/);
    expect(
      screen.getByRole("link", { name: "Article RPS QVCT" })
    ).toHaveAttribute("href", "/blog/article-rps-qvct");
  });

  it("ne réserve aucune colonne latérale quand aucun article ne cible encore ce pilier", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);

    const { container } = render(<PreventionRpsQvctPage />);

    expect(container.querySelector("aside")).toBeNull();
  });

  it("la grille n'a que 2 enfants directs (colonne Formations + colonne articles), pas le titre et la fiche éclatés en 2 colonnes", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-rps-qvct", label: "Article RPS QVCT" },
    ]);

    const { container } = render(<PreventionRpsQvctPage />);

    const aside = container.querySelector("aside")!;
    expect(aside.parentElement!.children).toHaveLength(2);
  });

  it("ne récupère les articles liés qu'une seule fois (pas de second appel dans ArticlesBlogLiesBloc)", () => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-rps-qvct", label: "Article RPS QVCT" },
    ]);

    render(<PreventionRpsQvctPage />);

    expect(getRelatedArticleLinks).toHaveBeenCalledTimes(1);
  });
});

describe("PreventionRpsQvctPage — CTA final, provenance transmise au formulaire de contact", () => {
  it("pré-remplit le formulaire de contact pour ce hub (institution)", () => {
    render(<PreventionRpsQvctPage />);

    const cta = screen.getByRole("link", { name: "Prendre contact" });
    const url = new URL(cta.getAttribute("href")!, "https://elancestvous.fr");
    expect(url.searchParams.get("type")).toBe("institution");
    expect(url.searchParams.get("sujet")).toBe(
      "Formations « Prévention des RPS et QVCT »"
    );
  });
});
