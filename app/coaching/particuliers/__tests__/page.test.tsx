import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import CoachingParticuliersPage from "../page";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

describe("CoachingParticuliersPage — contenu conservé (FR7)", () => {
  it("conserve le contenu marketing (titre, sections) de l'ancienne page", () => {
    render(<CoachingParticuliersPage />);
    expect(
      screen.getByRole("heading", { name: "Coaching individuel." })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/quand faire appel au coaching individuel/i)
    ).toBeInTheDocument();
  });

  it("le fil d'Ariane pointe vers le hub /coaching", () => {
    render(<CoachingParticuliersPage />);
    expect(screen.getByRole("link", { name: "Coaching" })).toHaveAttribute(
      "href",
      "/coaching"
    );
  });
});

describe("CoachingParticuliersPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page, on its new URL", () => {
    render(<CoachingParticuliersPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith("/coaching/particuliers");
  });
});
