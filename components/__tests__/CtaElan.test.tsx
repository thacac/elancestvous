import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CtaElan from "../CtaElan";

describe("CtaElan — lien vers /contact nu par défaut (comportement historique inchangé)", () => {
  it("pointe vers /contact sans paramètre quand aucune provenance n'est fournie", () => {
    render(<CtaElan />);

    expect(screen.getByRole("link", { name: "Prendre contact" })).toHaveAttribute(
      "href",
      "/contact"
    );
  });
});

describe("CtaElan — provenance transmise au formulaire de contact", () => {
  it("ajoute type et sujet en query params quand ils sont fournis", () => {
    render(<CtaElan contactType="particulier" contactSujet="Coaching individuel" />);

    expect(screen.getByRole("link", { name: "Prendre contact" })).toHaveAttribute(
      "href",
      "/contact?type=particulier&sujet=Coaching+individuel"
    );
  });

  it("encode correctement un sujet contenant des caractères spéciaux", () => {
    render(
      <CtaElan
        contactType="institution"
        contactSujet="Formations « Prévention des RPS et QVCT »"
      />
    );

    const href = screen.getByRole("link", { name: "Prendre contact" }).getAttribute("href")!;
    const url = new URL(href, "https://elancestvous.fr");
    expect(url.searchParams.get("type")).toBe("institution");
    expect(url.searchParams.get("sujet")).toBe(
      "Formations « Prévention des RPS et QVCT »"
    );
  });
});

// Revue palette 2026-10-30 : texte courant sur l'orange foncé, ≥ 4.5:1 exigé
// (CLAUDE.md). Blanc pur ≈ 5.7:1 ; le motif « ELAN » derrière ne doit pas
// éclaircir le fond au point de passer sous le seuil.
describe("CtaElan — contraste du texte sur le bandeau orange", () => {
  it("écrit la phrase d'accompagnement en blanc pur", () => {
    render(<CtaElan />);
    const phrase = screen.getByText(/premier échange pour comprendre votre contexte/i);
    expect(phrase.className.split(/\s+/)).toContain("text-white");
    expect(phrase.className).not.toMatch(/text-white\/\d+/);
  });

  it("garde le motif « ELAN » discret (opacité 10 %)", () => {
    render(<CtaElan />);
    expect(screen.getByText("ELAN")).toHaveClass("opacity-10");
  });
});

