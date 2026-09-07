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
