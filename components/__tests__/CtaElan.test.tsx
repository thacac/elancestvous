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

// Story 4.3 : le CTA final passe à la charte des slides — la question
// devient une bulle (vrai h2), le bouton est le bouton orange foncé de la
// charte (blanc dessus 5.7:1), jamais une « pilule » (PRD §4.7), et une
// vague fait la transition vers le pied de page pétrole.
describe("CtaElan — charte des slides (Story 4.3)", () => {
  it("garde le h2 « Prêt à mettre vos équipes en mouvement ? » dans une bulle", () => {
    render(<CtaElan />);
    const titre = screen.getByRole("heading", { level: 2 });
    expect(titre).toHaveTextContent(/^Prêt à mettre\s*vos équipes en mouvement \?$/);
    expect(titre).toHaveClass("bg-sky");
  });

  it("utilise le bouton orange foncé de la charte, sans forme pilule ni zoom", () => {
    render(<CtaElan />);
    const cta = screen.getByRole("link", { name: "Prendre contact" });
    expect(cta.className.split(/\s+/)).toContain("bg-accent");
    expect(cta.className).not.toMatch(/rounded-full|scale|uppercase/);
  });

  it("écrit la phrase d'accompagnement en bleu nuit plein (≈ 18:1 sur blanc)", () => {
    render(<CtaElan />);
    const phrase = screen.getByText(/premier échange pour comprendre votre contexte/i);
    expect(phrase.className.split(/\s+/)).toContain("text-primary");
    expect(phrase.className).not.toMatch(/text-primary\/\d+/);
  });

  it("se termine par une vague décorative vers le pied de page", () => {
    const { container } = render(<CtaElan />);
    const section = container.querySelector("section")!;
    expect(section.lastElementChild!.tagName.toLowerCase()).toBe("svg");
    expect(section.lastElementChild).toHaveAttribute("aria-hidden", "true");
  });

  // Supprimé sur décision de Cédric (2026-10-31) : il chargeait la bulle et
  // utilisait une valeur arbitraire (text-[20vw], NFR1).
  it("n'a plus le motif « ELAN » en filigrane", () => {
    const { container } = render(<CtaElan />);
    expect(screen.queryByText("ELAN")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/-\[/);
  });
});
