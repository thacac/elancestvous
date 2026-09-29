import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import ArticlesBlogLiesBloc from "../ArticlesBlogLiesBloc";

vi.mock("@/lib/relatedArticles");

describe("ArticlesBlogLiesBloc", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
  });

  it("renders nothing when no article targets this page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
    const { container } = render(
      <ArticlesBlogLiesBloc targetPage="/particuliers/coaching-individuel" />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("looks up related articles for the given target page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
    render(<ArticlesBlogLiesBloc targetPage="/particuliers/coaching-individuel" />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith(
      "/particuliers/coaching-individuel"
    );
  });

  it("renders each related article as a real internal link", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-un", label: "Premier article" },
      { href: "/blog/article-deux", label: "Second article" },
    ]);

    render(<ArticlesBlogLiesBloc targetPage="/particuliers/coaching-individuel" />);

    expect(screen.getByRole("link", { name: "Premier article" })).toHaveAttribute(
      "href",
      "/blog/article-un"
    );
    expect(screen.getByRole("link", { name: "Second article" })).toHaveAttribute(
      "href",
      "/blog/article-deux"
    );
  });
});

describe("ArticlesBlogLiesBloc — variant sidebar (Story 3.2)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
  });

  it("renders nothing when no article targets this page, just like the default variant", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
    const { container } = render(
      <ArticlesBlogLiesBloc
        targetPage="/formations/cadre-legal-etablissements-sante"
        variant="sidebar"
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the related articles inside a sticky aside at the md breakpoint", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/article-un", label: "Premier article" },
    ]);

    const { container } = render(
      <ArticlesBlogLiesBloc
        targetPage="/formations/cadre-legal-etablissements-sante"
        variant="sidebar"
      />
    );

    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.className).toMatch(/md:sticky/);
    expect(
      screen.getByRole("link", { name: "Premier article" })
    ).toHaveAttribute("href", "/blog/article-un");
  });
});

describe("ArticlesBlogLiesBloc — liens pré-récupérés (Story 3.2 : évite un second appel)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
  });

  it("utilise les liens fournis sans rappeler getRelatedArticleLinks", () => {
    render(
      <ArticlesBlogLiesBloc
        targetPage="/formations/cadre-legal-etablissements-sante"
        variant="sidebar"
        liens={[{ href: "/blog/article-pre-fetch", label: "Article pré-récupéré" }]}
      />
    );

    expect(
      screen.getByRole("link", { name: "Article pré-récupéré" })
    ).toHaveAttribute("href", "/blog/article-pre-fetch");
    expect(getRelatedArticleLinks).not.toHaveBeenCalled();
  });

  it("renders nothing when the pre-fetched liens array is empty", () => {
    const { container } = render(
      <ArticlesBlogLiesBloc
        targetPage="/formations/cadre-legal-etablissements-sante"
        variant="sidebar"
        liens={[]}
      />
    );
    expect(container).toBeEmptyDOMElement();
    expect(getRelatedArticleLinks).not.toHaveBeenCalled();
  });
});
