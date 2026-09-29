import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/formations", () => ({
  getAllFormationsMeta: vi.fn(() => []),
}));

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

import { getAllFormationsMeta } from "@/lib/formations";
import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import FormationsEtArticlesLiesBloc from "../FormationsEtArticlesLiesBloc";

const TARGET_PAGE = "/formations/cadre-legal-etablissements-sante";

describe("FormationsEtArticlesLiesBloc — bloc partagé par tous les hubs Famille", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
    vi.mocked(getAllFormationsMeta).mockReset();
    vi.mocked(getAllFormationsMeta).mockReturnValue([]);
  });

  it("affiche toujours la section Formations disponibles pour la famille demandée", () => {
    render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    expect(
      screen.getByRole("heading", { name: "Formations disponibles" })
    ).toBeInTheDocument();
  });

  it("interroge les articles liés pour la page cible fournie", () => {
    render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    expect(getRelatedArticleLinks).toHaveBeenCalledWith(TARGET_PAGE);
  });

  it("ne réserve aucune colonne latérale quand aucun article ne cible encore cette page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);

    const { container } = render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    expect(container.querySelector("aside")).toBeNull();
  });

  it("affiche les articles liés en colonne latérale sticky dès md, à côté de Formations disponibles, quand au moins un article cible cette page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-un", label: "Article lié" },
    ]);

    const { container } = render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.className).toMatch(/md:sticky/);
    expect(
      screen.getByRole("link", { name: "Article lié" })
    ).toHaveAttribute("href", "/blog/article-un");
  });

  it("la grille n'a que 2 enfants directs (colonne Formations + colonne articles), pas le titre et la fiche éclatés en 2 colonnes", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-un", label: "Article lié" },
    ]);

    const { container } = render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    const aside = container.querySelector("aside")!;
    expect(aside.parentElement!.children).toHaveLength(2);
  });

  it("ne récupère les articles liés qu'une seule fois (pas de second appel dans ArticlesBlogLiesBloc)", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-un", label: "Article lié" },
    ]);

    render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    expect(getRelatedArticleLinks).toHaveBeenCalledTimes(1);
  });

  it("ne rend qu'une seule fois le bloc Formations disponibles, sans double conteneur (bare)", () => {
    const { container } = render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    expect(container.querySelectorAll("section")).toHaveLength(0);
  });

  it("liste la fiche réelle de la famille demandée", () => {
    vi.mocked(getAllFormationsMeta).mockReturnValue([
      {
        titre: "Obligations légales des établissements",
        slug: "obligations-legales-des-etablissements",
        famille: "cadre-legal-etablissements-sante",
        duree: "1 journée",
      },
    ] as unknown as ReturnType<typeof getAllFormationsMeta>);

    render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    expect(
      screen.getByRole("link", { name: "Voir la fiche" })
    ).toHaveAttribute(
      "href",
      "/formations/cadre-legal-etablissements-sante/obligations-legales-des-etablissements"
    );
  });

  it("côté formations, ne réserve pas non plus de colonne quand aucun article ne cible la page (container simple)", () => {
    const { container } = render(
      <FormationsEtArticlesLiesBloc
        famille="cadre-legal-etablissements-sante"
        targetPage={TARGET_PAGE}
      />
    );

    const wrapper = container.firstElementChild!;
    expect(wrapper.className).not.toContain("grid");
    within(wrapper as HTMLElement).getByRole("heading", {
      name: "Formations disponibles",
    });
  });
});
