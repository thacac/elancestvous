import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import GappPage from "../page";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

describe("GappPage internal linking (audit SEO finding #1)", () => {
  it("links to the coaching en établissement page", () => {
    render(<GappPage />);
    expect(
      screen.getByRole("link", { name: /coaching en établissement/i }),
    ).toHaveAttribute("href", "/professionnels-etablissements-de-soins/coaching");
  });

  it("links to the formations QVCT/RPS page", () => {
    render(<GappPage />);
    expect(
      screen.getByRole("link", { name: /formations qvct.*rps/i }),
    ).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/formations-rps-qvct",
    );
  });
});

describe("GappPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page", () => {
    render(<GappPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith(
      "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    );
  });

  it("links to a related blog article when one targets this page", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([
      { href: "/blog/exemple-gapp", label: "Exemple d'article lié" },
    ]);

    render(<GappPage />);

    expect(
      screen.getByRole("link", { name: "Exemple d'article lié" }),
    ).toHaveAttribute("href", "/blog/exemple-gapp");
  });

  it("renders no blog link block when no article targets this page yet", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);

    render(<GappPage />);

    expect(screen.queryByRole("link", { name: /exemple/i })).not.toBeInTheDocument();
  });
});
