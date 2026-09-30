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
