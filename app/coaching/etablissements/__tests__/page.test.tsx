import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import CoachingEtablissementsPage from "../page";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

describe("CoachingEtablissementsPage — contenu conservé (FR7)", () => {
  it("conserve le contenu marketing (titre, sections) de l'ancienne page", () => {
    render(<CoachingEtablissementsPage />);
    expect(
      screen.getByRole("heading", { name: /coaching individuel ou collectif/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dans quels contextes proposer un coaching/i)
    ).toBeInTheDocument();
  });

  it("le fil d'Ariane pointe vers le hub /coaching", () => {
    render(<CoachingEtablissementsPage />);
    expect(screen.getByRole("link", { name: "Coaching" })).toHaveAttribute(
      "href",
      "/coaching"
    );
  });
});

describe("CoachingEtablissementsPage internal linking", () => {
  it("links to the GAPP page on its new URL", () => {
    render(<CoachingEtablissementsPage />);
    expect(screen.getByRole("link", { name: /gapp/i })).toHaveAttribute(
      "href",
      "/gapp-analyse-pratiques-professionnelles"
    );
  });
});

describe("CoachingEtablissementsPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page, on its new URL", () => {
    render(<CoachingEtablissementsPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith("/coaching/etablissements");
  });
});
