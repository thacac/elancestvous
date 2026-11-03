import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FormationsCataloguePage from "../formations/page";

import { expectH1StyleGlobal } from "./outils/h1";

// Story 4.7 : à 390 px, la première fiche arrivait après 2,7 écrans (4 grandes
// tuiles Famille puis 4 lignes de filtres). Pistes retenues par Cédric
// (2026-11-01) : liste avant les tuiles, filtres sur une ligne défilante avec
// fondu, tuiles compactes, H1 réduit. Contenu réel de content/formations/.
// Cédric, 2026-11-03 : liste et filtres retirés, seules les tuiles restent.
function renderCatalogue() {
  return render(<FormationsCataloguePage />);
}

describe("/formations — tuiles Famille sous leur bandeau (Story 4.7)", () => {
  it("ouvre les tuiles par un bandeau h2 et passe leurs titres en h3, textes et liens inchangés", async () => {
    await renderCatalogue();
    const bandeau = screen.getByRole("heading", { level: 2, name: "Explorer les formations par famille" });
    const section = bandeau.closest("section")!;
    const titres = within(section).getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titres).toEqual([
      "Cadre légal, droits et éthique",
      "Prévention des RPS et QVCT",
      "Accompagnement et pratiques professionnelles",
      "Dynamique d'équipe et développement professionnel",
    ]);
    expect(within(section).getAllByRole("link", { name: /^Découvrir/ })).toHaveLength(4);
  });

  it("réduit les médaillons sur smartphone (décor), taille d'origine dès sm", async () => {
    await renderCatalogue();
    const section = screen
      .getByRole("heading", { level: 2, name: "Explorer les formations par famille" })
      .closest("section")!;
    const medaillons = section.querySelectorAll("img");
    expect(medaillons).toHaveLength(4);
    medaillons.forEach((img) => {
      expect(img).toHaveAttribute("alt", "");
      expect(img).toHaveClass("size-14", "sm:size-32");
    });
  });
});

describe("/formations — H1 réduit sur smartphone (Story 4.7)", () => {
  it("ne surcharge pas la règle h1 globale, texte inchangé", async () => {
    await renderCatalogue();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Formations professionnelles");
    expectH1StyleGlobal(h1);
  });
});

// Revue : la région des tuiles s'annonçait « Familles de formations » alors
// que son titre visible est « Explorer les formations par famille ».
describe("/formations — région des tuiles nommée par son titre (Story 4.7)", () => {
  it("prend le nom de son bandeau h2", async () => {
    await renderCatalogue();
    const region = screen.getByRole("region", { name: "Explorer les formations par famille" });
    expect(within(region).getAllByRole("link", { name: /^Découvrir/ })).toHaveLength(4);
    expect(region).not.toHaveAttribute("aria-label");
  });
});
