import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import FormationsProPage from "../page";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

describe("FormationsProPage internal linking (audit SEO finding #1)", () => {
  it("links to the coaching en établissement page", () => {
    render(<FormationsProPage />);
    expect(
      screen.getByRole("link", { name: /coaching en établissement/i }),
    ).toHaveAttribute("href", "/professionnels-etablissements-de-soins/coaching");
  });

  it("links to the GAPP page", () => {
    render(<FormationsProPage />);
    expect(screen.getByRole("link", { name: /gapp/i })).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    );
  });
});

describe("FormationsProPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page", () => {
    render(<FormationsProPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith(
      "/professionnels-etablissements-de-soins/formations-rps-qvct",
    );
  });

  it("links to a related blog article when one targets this page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/exemple-formation", label: "Exemple d'article lié" },
    ]);

    render(<FormationsProPage />);

    expect(
      screen.getByRole("link", { name: "Exemple d'article lié" }),
    ).toHaveAttribute("href", "/blog/exemple-formation");
  });

  it("renders no blog link block when no article targets this page yet", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);

    render(<FormationsProPage />);

    expect(screen.queryByRole("link", { name: /exemple/i })).not.toBeInTheDocument();
  });
});
