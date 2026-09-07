import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import ParticuliersPage from "../page";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

describe("ParticuliersPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page", () => {
    render(<ParticuliersPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith(
      "/particuliers/coaching-individuel"
    );
  });

  it("links to a related blog article when one targets this page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/exemple-coaching-individuel", label: "Exemple d'article lié" },
    ]);

    render(<ParticuliersPage />);

    expect(
      screen.getByRole("link", { name: "Exemple d'article lié" })
    ).toHaveAttribute("href", "/blog/exemple-coaching-individuel");
  });

  it("renders no blog link block when no article targets this page yet", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);

    render(<ParticuliersPage />);

    expect(screen.queryByRole("link", { name: /exemple/i })).not.toBeInTheDocument();
  });
});
