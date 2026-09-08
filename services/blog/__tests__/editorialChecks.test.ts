import { describe, expect, it } from "vitest";

import { hasServiceLink } from "../editorialChecks";

describe("hasServiceLink", () => {
  it("returns true for a Markdown link to a known service page (relative URL)", () => {
    const body =
      "## Section\n\nPour aller plus loin, découvrez notre [accompagnement individuel](/particuliers/coaching-individuel).";
    expect(hasServiceLink(body)).toBe(true);
  });

  it("returns true for a Markdown link using the absolute site URL", () => {
    const body =
      "## Section\n\n[Nos formations QVCT/RPS](https://elancestvous.fr/professionnels-etablissements-de-soins/formations-rps-qvct) en établissement.";
    expect(hasServiceLink(body)).toBe(true);
  });

  it("returns true when the link carries an anchor or query string suffix", () => {
    const body =
      "[Le GAPP en pratique](/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles#fonctionnement)";
    expect(hasServiceLink(body)).toBe(true);
  });

  it("returns true for a link with a trailing slash", () => {
    const body = "[Coaching individuel](/particuliers/coaching-individuel/)";
    expect(hasServiceLink(body)).toBe(true);
  });

  it("returns true for an absolute link using a www. prefix", () => {
    const body =
      "[Coaching individuel](https://www.elancestvous.fr/particuliers/coaching-individuel)";
    expect(hasServiceLink(body)).toBe(true);
  });

  it("returns false when the article has no link at all", () => {
    const body = "## Section\n\nContenu de l'article, sans aucun lien.";
    expect(hasServiceLink(body)).toBe(false);
  });

  it("returns false when the only links point elsewhere than a service page", () => {
    const body =
      "Voir [notre article précédent](/blog/un-autre-article) ou [la page à propos](/a-propos).";
    expect(hasServiceLink(body)).toBe(false);
  });
});
