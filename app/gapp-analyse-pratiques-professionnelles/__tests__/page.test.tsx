import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import GappPage from "../page";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => []),
}));

describe("GappPage — contenu conservé (FR7)", () => {
  it("conserve le contenu marketing (titre, sections) de l'ancienne page", () => {
    render(<GappPage />);
    expect(
      screen.getByRole("heading", { name: /groupe d.analyse des pratiques professionnelles/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/les objectifs du gapp/i)).toBeInTheDocument();
  });
});

describe("GappPage internal linking", () => {
  it("links to the coaching en établissement page on its new URL", () => {
    render(<GappPage />);
    expect(
      screen.getByRole("link", { name: /coaching en établissement/i })
    ).toHaveAttribute("href", "/coaching/etablissements");
  });
});

describe("GappPage blog backlink (issue #72 : maillage retour)", () => {
  afterEach(() => {
    vi.mocked(getRelatedArticleLinks).mockReset();
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("asks for the articles related to this specific service page, on its new URL", () => {
    render(<GappPage />);
    expect(getRelatedArticleLinks).toHaveBeenCalledWith(
      "/gapp-analyse-pratiques-professionnelles"
    );
  });
});

describe("GappPage — CTA final, provenance transmise au formulaire de contact", () => {
  it("pré-remplit le formulaire de contact avec le type institution", () => {
    render(<GappPage />);

    const cta = screen.getByRole("link", { name: "Prendre contact" });
    const url = new URL(cta.getAttribute("href")!, "https://elancestvous.fr");
    expect(url.searchParams.get("type")).toBe("institution");
    expect(url.searchParams.get("sujet")).toBe(
      "GAPP – Analyse des pratiques professionnelles"
    );
  });
});
