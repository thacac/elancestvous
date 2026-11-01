import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/relatedArticles", () => ({ getRelatedArticleLinks: vi.fn(() => []) }));

import CoachingEtablissementsPage, { metadata as metaEtablissements } from "../coaching/etablissements/page";
import CoachingHubPage, { metadata as metaCoaching } from "../coaching/page";
import CoachingParticuliersPage, { metadata as metaParticuliers } from "../coaching/particuliers/page";
import FormationsCataloguePage, { metadata as metaFormations } from "../formations/page";
import GappPage, { metadata as metaGapp } from "../gapp-analyse-pratiques-professionnelles/page";

// Story 4.3 : la charte des slides habille les hubs Coaching, GAPP et
// Formations sans toucher au SEO (FR7, UX-DR6) : title, description, H1 et
// textes inchangés, hiérarchie Hn sans saut, un bandeau par section.
const root = join(__dirname, "..", "..");

function niveaux(container: HTMLElement) {
  return Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
}

function sansSaut(container: HTMLElement) {
  const n = niveaux(container);
  expect(n[0]).toBe(1);
  expect(n.filter((niveau) => niveau === 1)).toHaveLength(1);
  n.forEach((niveau, i) => {
    if (i > 0) expect(niveau - n[i - 1]).toBeLessThanOrEqual(1);
  });
}

// Les h2 de section (hors sous-titre du hero et bulle du CTA final) ouvrent
// chacun un SectionBanner.
function h2DeSection() {
  return screen
    .getAllByRole("heading", { level: 2 })
    .filter((h) => !h.closest("#formations-cta-final") && !h.closest("[data-hero]"));
}

async function renderFormations() {
  const jsx = await FormationsCataloguePage({ searchParams: Promise.resolve({}) });
  return render(jsx);
}

describe("SEO inchangé (FR7, UX-DR6)", () => {
  it.each([
    [metaCoaching, "Coaching individuel et collectif | Élan C'est Vous", /^Coaching individuel pour particuliers ou coaching individuel et collectif/],
    [metaParticuliers, "Coaching individuel pour particuliers à Toulouse et à distance", /^Coaching individuel pour particuliers : clarifier une situation/],
    [metaEtablissements, "Coaching individuel et collectif en établissements de santé", /^Coaching individuel ou collectif pour les équipes et professionnels/],
    [metaGapp, "GAPP – Groupe d'analyse des pratiques professionnelles en santé", /^Groupe d'analyse des pratiques professionnelles \(GAPP\) : un espace sécurisé/],
    [metaFormations, "Formations professionnelles pour établissements de santé", /^Catalogue de formations sur-mesure pour les établissements de santé/],
  ])("garde le title %#", (meta, title, description) => {
    expect(meta.title).toBe(title);
    expect(meta.description).toMatch(description);
  });

  it.each([
    ["/coaching", () => render(<CoachingHubPage />), "Coaching."],
    ["/coaching/particuliers", () => render(<CoachingParticuliersPage />), "Coaching individuel."],
    ["/coaching/etablissements", () => render(<CoachingEtablissementsPage />), "Coaching individuel ou collectif."],
    ["/gapp", () => render(<GappPage />), "Groupe d'analyse des pratiques professionnelles."],
  ])("%s garde son H1 et une hiérarchie Hn sans saut", (_page, rendu, h1) => {
    const { container } = rendu();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(h1);
    sansSaut(container);
  });

  it("/formations garde son H1 et une hiérarchie Hn sans saut", async () => {
    const { container } = await renderFormations();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Formations professionnelles");
    sansSaut(container);
  });
});

describe("Un bandeau de la charte par section (UX-DR1)", () => {
  it.each([
    ["/coaching/particuliers", () => render(<CoachingParticuliersPage />), [
      "Quand faire appel au coaching individuel ?",
      "Une posture d'écoute et de co-construction",
      "Un processus structuré & progressif",
      "À qui s'adresse le coaching individuel ?",
    ]],
    ["/coaching/etablissements", () => render(<CoachingEtablissementsPage />), [
      "Le stress au travail chez les professionnels de santé : des repères chiffrés",
      "Dans quels contextes proposer un coaching ?",
      "Une approche respectueuse et non prescriptive",
      "Mes accompagnements coaching.",
      "À qui s'adresse le coaching en établissement ?",
    ]],
    ["/gapp", () => render(<GappPage />), [
      "Les objectifs du GAPP",
      "Un cadre méthodologique sécurisé",
      "Une démarche inscrite dans la durée",
      "À qui s’adresse le GAPP ?",
    ]],
  ])("%s : chaque h2 de section ouvre un SectionBanner, dans l'ordre", (_page, rendu, titres) => {
    rendu();
    const h2 = h2DeSection();
    expect(h2.map((h) => h.textContent)).toEqual(titres);
    h2.forEach((h) => expect(h.closest("header")?.querySelector(".bg-petrol")).not.toBeNull());
  });

  it("le CTA final reste la bulle-question en h2", () => {
    render(<CoachingParticuliersPage />);
    const cta = document.getElementById("formations-cta-final")!;
    expect(within(cta).getByRole("heading", { level: 2 })).toHaveTextContent(/Prêt à mettre\s*vos équipes en mouvement \?/);
  });
});

// Le layout racine fournit déjà <main> : une page ne doit pas en ajouter un
// second (un seul repère principal, RGAA 12).
describe("Un seul repère principal", () => {
  it.each([
    ["/coaching", () => render(<CoachingHubPage />)],
    ["/coaching/particuliers", () => render(<CoachingParticuliersPage />)],
    ["/coaching/etablissements", () => render(<CoachingEtablissementsPage />)],
    ["/gapp", () => render(<GappPage />)],
  ])("%s ne rend pas de <main> propre", (_page, rendu) => {
    const { container } = rendu();
    expect(container.querySelector("main")).toBeNull();
  });
});

describe("/coaching — cartes pastel vers les deux publics", () => {
  it("présente Particuliers et Établissements en cartes ciel puis pêche", () => {
    render(<CoachingHubPage />);
    const liste = document.querySelector<HTMLElement>("[data-hero] ul")!;
    expect(liste).toHaveAttribute("role", "list");
    const items = within(liste).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveClass("bg-sky");
    expect(items[1]).toHaveClass("bg-peach");
    expect(within(items[0]).getByRole("heading", { level: 3, name: "Particuliers" })).toBeInTheDocument();
    expect(within(items[1]).getByRole("heading", { level: 3, name: "Établissements" })).toBeInTheDocument();
  });
});

describe("/coaching/particuliers — démarche ordonnée", () => {
  it("présente les 6 étapes dans une liste ordonnée, textes inchangés et sans titres ajoutés", () => {
    render(<CoachingParticuliersPage />);
    const section = document.getElementById("modalites")!;
    const liste = section.querySelector("ol")!;
    expect(liste).toHaveAttribute("role", "list");
    const items = within(liste).getAllByRole("listitem");
    expect(items.map((li) => li.textContent?.replace(/^\d+/, ""))).toEqual([
      "Évaluation de votre situation et définition de vos objectifs",
      "Exploration des freins et identification de vos ressources",
      "Clarification de vos enjeux et de votre direction",
      "Régulation émotionnelle et leviers d'ajustement",
      "Mise en mouvement progressive, pas à pas",
      "Consolidation et ancrage des changements",
    ]);
    expect(within(liste).queryAllByRole("heading")).toHaveLength(0);
    // Numéros décoratifs : l'ordre est porté par <ol>.
    expect(items[0].querySelector("[aria-hidden='true']")).toHaveTextContent("1");
  });
});

// Repères DREES validés par Cédric (2026-10-31), tirés de la slide « Le
// stress au travail chez les professionnels de santé : des repères
// chiffrés ». NFR3 : chaque chiffre affiche sa source, rien n'est inventé.
describe("/coaching/etablissements — repères chiffrés DREES (NFR3)", () => {
  const SOURCE = "Source : DREES, enquête TraCov2, données 2023, publication juin 2025.";

  it("place la section juste après le hero, avant les contextes", () => {
    render(<CoachingEtablissementsPage />);
    expect(h2DeSection()[0]).toHaveTextContent(/des repères chiffrés$/);
  });

  it("affiche les deux repères, chacun avec sa source", () => {
    render(<CoachingEtablissementsPage />);
    const section = screen
      .getByRole("heading", { level: 2, name: /des repères chiffrés/ })
      .closest("section")!;
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(/46\s%.*souvent ou toujours sous pression.*contre 29\s% de l'ensemble des salariés/);
    expect(items[1]).toHaveTextContent(/50\s%.*le respect et l'estime que mérite leur travail.*contre 63\s% de l'ensemble des salariés/);
    items.forEach((item) => expect(item).toHaveTextContent(SOURCE));
  });
});

describe("/formations — tuiles Famille en cartes pastel", () => {
  it("alterne ciel et pêche, titres de famille inchangés", async () => {
    await renderFormations();
    const grille = document.querySelector('[aria-label="Familles de formations"] .grid')!;
    const tuiles = Array.from(grille.children);
    expect(tuiles).toHaveLength(4);
    expect(tuiles.map((t) => (t.className.includes("bg-sky") ? "sky" : t.className.includes("bg-peach") ? "peach" : "?"))).toEqual([
      "sky",
      "peach",
      "sky",
      "peach",
    ]);
  });
});

// Revue : `.container` est hors @layer et écrasait max-w-3xl et le padding
// de la carte posée sur le même élément (carte collée aux bords sur mobile).
describe("/gapp — carte « Une démarche inscrite dans la durée »", () => {
  it("est posée dans le conteneur, pas confondue avec lui", () => {
    render(<GappPage />);
    const carte = document.querySelector("#gapp-duree .bg-sky")!;
    expect(carte).not.toHaveClass("container");
    expect(carte.parentElement).toHaveClass("container");
    expect(carte).toHaveClass("max-w-3xl", "mx-auto");
  });
});

// Story 4.3 : médaillons dessinés tirés des slides (validés par Cédric le
// 2026-10-31). Décoratifs : le titre de la carte porte l'information.
describe("Médaillons dessinés", () => {
  it("/coaching : un dessin décoratif par carte", () => {
    render(<CoachingHubPage />);
    const items = within(document.querySelector<HTMLElement>("[data-hero] ul")!).getAllByRole("listitem");
    const sources = items.map((item) => {
      const image = item.querySelector("img")!;
      expect(image).toHaveAttribute("alt", "");
      return image.getAttribute("src");
    });
    expect(sources[0]).toContain("soignante-pensive-coaching.jpg");
    expect(sources[1]).toContain("responsable-et-soignante.jpg");
  });

  it("/formations : un dessin décoratif par tuile Famille", async () => {
    await renderFormations();
    const tuiles = Array.from(document.querySelector('[aria-label="Familles de formations"] .grid')!.children);
    const sources = tuiles.map((tuile) => {
      const image = tuile.querySelector("img")!;
      expect(image).toHaveAttribute("alt", "");
      return decodeURIComponent(image.getAttribute("src")!);
    });
    ["presse-papiers-coche.jpg", "soignante-stressee.jpg", "soignante-explique.jpg", "collegues-en-tension.jpg"].forEach(
      (fichier, i) => expect(sources[i]).toContain(fichier),
    );
  });
});

// Palette resserrée : les anciennes couleurs disparaissent des pages touchées.
describe("Anciennes couleurs retirées (Story 4.3)", () => {
  it.each([
    "app/coaching/page.tsx",
    "app/coaching/particuliers/page.tsx",
    "app/coaching/etablissements/page.tsx",
    "app/gapp-analyse-pratiques-professionnelles/page.tsx",
    "app/formations/page.tsx",
    "components/CtaElan.tsx",
    "components/Citation.tsx",
    "components/CartesContrastBloc.tsx",
    "components/BadgesBloc.tsx",
    "components/PublicsCiblesBloc.tsx",
    "components/ArticulationBloc.tsx",
  ])("%s n'utilise ni secondary, ni muted, ni pastel", (fichier) => {
    expect(readFileSync(join(root, fichier), "utf8")).not.toMatch(/\b[a-z]+(?:\/\d+)?-(?:secondary|muted|pastel)\b|-(?:secondary|muted|pastel)(?:\/\d+)?\b/);
  });
});
