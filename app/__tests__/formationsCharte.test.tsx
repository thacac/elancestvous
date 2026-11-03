import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/relatedArticles", () => ({ getRelatedArticleLinks: vi.fn(() => []) }));

import { getRelatedArticleLinks } from "@/lib/relatedArticles";

import FormationPage from "../formations/[famille]/[slug]/page";
import AccompagnementPage, { metadata as metaAccompagnement } from "../formations/accompagnement-professionnel-etablissements-sante/page";
import CadreLegalPage, { metadata as metaCadreLegal } from "../formations/cadre-legal-etablissements-sante/page";
import DynamiquePage, { metadata as metaDynamique } from "../formations/dynamique-equipe-etablissements-sante/page";
import FormationsCataloguePage from "../formations/page";
import PreventionPage, { metadata as metaPrevention } from "../formations/prevention-rps-qvct-etablissements-sante/page";

import { expectH1StyleGlobal } from "./outils/h1";

// Story 4.4 : la charte des slides habille le catalogue, les 4 hubs Famille
// et les fiches formation sans toucher au SEO (FR7, UX-DR6). Contenu réel de
// content/formations/ : une fiche en Prévention, une en Cadre légal, aucune
// dans les deux autres familles (état vide honnête).
const root = join(__dirname, "..", "..");

function sansSaut(container: HTMLElement) {
  const n = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
  expect(n[0]).toBe(1);
  expect(n.filter((niveau) => niveau === 1)).toHaveLength(1);
  n.forEach((niveau, i) => {
    if (i > 0) expect(niveau - n[i - 1]).toBeLessThanOrEqual(1);
  });
}

function tons(elements: Element[]) {
  return elements.map((e) => (e.classList.contains("bg-sky") ? "sky" : e.classList.contains("bg-peach") ? "peach" : "?"));
}

function renderCatalogue() {
  return render(<FormationsCataloguePage />);
}

async function renderFiche(famille: string, slug: string) {
  return render(await FormationPage({ params: Promise.resolve({ famille, slug }) }));
}

// Story 4.10 (RGAA 6.1, WCAG 2.4.4 et 2.5.3, validé par Cédric) : des liens
// « Découvrir » / « Voir la fiche » identiques menaient à des pages
// différentes. Chaque lien se complète, pour les lecteurs d'écran, du nom de
// la famille ou du titre de la fiche ; texte visible et URL inchangés, aucun
// aria-label.
function texteVisible(lien: HTMLElement) {
  const copie = lien.cloneNode(true) as HTMLElement;
  copie.querySelectorAll(".sr-only").forEach((e) => e.remove());
  return copie.textContent;
}

// jsdom (dom-accessibility-api) retire l'espace en tête du sr-only en
// calculant le nom (« Voir la fiche: … ») ; Chromium donne bien « Voir la
// fiche : … » (mesuré). Le texte exact est vérifié par textContent.
function nomLien(visible: string, complement: string) {
  const echappe = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${echappe(visible)} ?: ${echappe(complement)}$`);
}

function verifieComplement(liens: HTMLElement[], visible: string) {
  liens.forEach((lien) => {
    expect(texteVisible(lien)).toBe(visible);
    expect(lien.querySelector(".sr-only")?.textContent).toMatch(/^ : /);
    expect(lien).not.toHaveAttribute("aria-label");
  });
}

describe("/formations — liens explicites (Story 4.10)", () => {
  it("nomme la famille dans chaque lien « Découvrir » des tuiles, texte visible et URL inchangés", async () => {
    await renderCatalogue();
    const region = screen.getByRole("region", { name: "Explorer les formations par famille" });
    const liens = within(region).getAllByRole("link", { name: /^Découvrir/ });
    expect(liens.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      ["Découvrir : Cadre légal, droits et éthique", "/formations/cadre-legal-etablissements-sante"],
      ["Découvrir : Prévention des RPS et QVCT", "/formations/prevention-rps-qvct-etablissements-sante"],
      ["Découvrir : Accompagnement et pratiques professionnelles", "/formations/accompagnement-professionnel-etablissements-sante"],
      ["Découvrir : Dynamique d'équipe et développement professionnel", "/formations/dynamique-equipe-etablissements-sante"],
    ]);
    expect(screen.getByRole("link", { name: nomLien("Découvrir", "Prévention des RPS et QVCT") })).toHaveAttribute(
      "href",
      "/formations/prevention-rps-qvct-etablissements-sante",
    );
    verifieComplement(liens, "Découvrir");
  });
});

const HUBS = [
  {
    nom: "Prévention",
    medaillon: "soignante-stressee.jpg",
    rendu: () => render(<PreventionPage />),
    meta: metaPrevention,
    title: "Formations QVCT, RPS, gestion du stress et des émotions",
    h1: "Formations professionnelles.",
    sections: [
      "Formations disponibles",
      "Une formation pensée pour la réalité du terrain",
      "Une pédagogie ancrée dans le réel",
      "Un cycle structuré & cohérent",
      "À qui s’adressent ces formations ?",
    ],
    fiches: 1,
  },
  {
    nom: "Cadre légal",
    medaillon: "presse-papiers-coche.jpg",
    rendu: () => render(<CadreLegalPage />),
    meta: metaCadreLegal,
    title: "Formations cadre légal, droits et éthique en établissements de santé",
    h1: "Cadre légal, droits et éthique.",
    sections: [
      "Formations disponibles",
      "Un cadre légal exigeant, rarement outillé au quotidien",
      "Une approche juridique rendue opérationnelle",
      "À qui s'adressent ces formations ?",
    ],
    fiches: 1,
  },
  {
    nom: "Accompagnement",
    medaillon: "soignante-explique.jpg",
    rendu: () => render(<AccompagnementPage />),
    meta: metaAccompagnement,
    title: "Formations accompagnement et pratiques professionnelles",
    h1: "Accompagnement et pratiques professionnelles.",
    sections: [
      "Formations disponibles",
      "Accompagner sans improviser",
      "Une approche centrée sur les situations réelles",
      "À qui s'adressent ces formations ?",
    ],
    fiches: 0,
  },
  {
    nom: "Dynamique d'équipe",
    medaillon: "collegues-en-tension.jpg",
    rendu: () => render(<DynamiquePage />),
    meta: metaDynamique,
    title: "Formations dynamique d'équipe et développement professionnel",
    h1: "Dynamique d'équipe et développement professionnel.",
    sections: [
      "Formations disponibles",
      "Une équipe qui fonctionne se construit",
      "Une approche collective et concrète",
      "À qui s'adressent ces formations ?",
    ],
    fiches: 0,
  },
];

describe.each(HUBS)("Hub Famille $nom", ({ rendu, meta, title, h1, sections, fiches, medaillon }) => {
  it("garde son title, son H1 et une hiérarchie Hn sans saut", () => {
    expect(meta.title).toBe(title);
    const { container } = rendu();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(h1);
    sansSaut(container);
  });

  // Mesuré à 320 px : « professionnelles » / « développement » en 48 px
  // débordaient de l'écran.
  it("ne surcharge pas la coupure de la règle h1 globale (pas de défilement à 320 px)", () => {
    rendu();
    // break-words seul : hyphens-auto coupait à 320 px des mots qui tenaient
    // sur la ligne (« Accompagne-ment »).
    // Story 4.13 : coupure sans césure portée par la règle h1 globale.
    expectH1StyleGlobal(screen.getByRole("heading", { level: 1 }));
  });

  // À 390 px, en 48 px, le H1 se coupait en « Accompagne-ment et pra-tiques
  // profession-nelles » : taille réduite sur mobile, comme le catalogue.
  // En 36 px, « Accompagnement » ne tenait pas à 320 px (« Accompagnemen/t ») :
  // 30 px sur smartphone, sous lequel tous les mots des 4 titres tiennent.
  it("ne surcharge pas la taille de la règle h1 globale", () => {
    rendu();
    // Story 4.13 : taille réduite portée par la règle h1 globale.
    expectH1StyleGlobal(screen.getByRole("heading", { level: 1 }));
  });

  // Story 4.10 : chaque « Voir la fiche » du hub nomme sa formation.
  it("nomme la formation dans chaque lien « Voir la fiche », texte visible inchangé", () => {
    rendu();
    const liens = screen.queryAllByRole("link", { name: /^Voir la fiche/ });
    expect(liens).toHaveLength(fiches);
    liens.forEach((lien) => {
      const titre = lien.closest("li")!.querySelector("h3")!.textContent;
      expect(lien.textContent).toBe(`Voir la fiche : ${titre}`);
      expect(lien).toHaveAccessibleName(nomLien("Voir la fiche", titre!));
    });
    verifieComplement(liens, "Voir la fiche");
  });

  it("affiche dans son titre le médaillon de sa tuile du catalogue, en décor", () => {
    rendu();
    const image = document.querySelector("[data-hero] img")!;
    expect(image).toHaveAttribute("alt", "");
    expect(decodeURIComponent(image.getAttribute("src")!)).toContain(medaillon);
  });

  it("ne rend pas de <main> propre (le layout le fournit)", () => {
    const { container } = rendu();
    expect(container.querySelector("main")).toBeNull();
  });

  it("ouvre chaque section par un bandeau, « Formations disponibles » en premier (FR8)", () => {
    rendu();
    const h2 = screen
      .getAllByRole("heading", { level: 2 })
      .filter((h) => !h.closest("#formations-cta-final") && !h.closest("[data-hero]"));
    expect(h2.map((h) => h.textContent)).toEqual(sections);
    h2.forEach((h) => expect(h.closest("header")?.querySelector(".bg-petrol")).not.toBeNull());
  });

  it("présente ses formations en cartes pastel, ou un état vide dans une carte pastel", () => {
    rendu();
    const section = screen.getByRole("heading", { level: 2, name: "Formations disponibles" }).closest("section")!;
    if (fiches > 0) {
      const cartes = within(within(section).getByRole("list")).getAllByRole("listitem");
      expect(cartes).toHaveLength(fiches);
      expect(tons(cartes)).toEqual(["sky"]);
      expect(within(cartes[0]).getByRole("link", { name: /^Voir la fiche/ })).toHaveClass("bg-primary/10");
    } else {
      expect(within(section).getByText(/arrivent bientôt/).closest(".bg-sky")).not.toBeNull();
    }
  });
});

// Revue story 4.4 : branche « articles liés présents » (colonne latérale).
describe("Hub Famille avec articles de blog liés", () => {
  const ARTICLES = [{ href: "/blog/article-un", label: "Article lié" }];

  it("garde « Formations disponibles » en premier, colonne « Pour aller plus loin » dans la même section", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue(ARTICLES);
    render(<CadreLegalPage />);
    const h2 = screen.getAllByRole("heading", { level: 2 }).filter((h) => !h.closest("[data-hero]"));
    expect(h2[0]).toHaveTextContent("Formations disponibles");
    expect(h2[1]).toHaveTextContent("Pour aller plus loin");
    expect(h2[1].closest("section")).toBe(h2[0].closest("section"));
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  it("resserre la grille des cartes à côté de la colonne (pas de 3 colonnes de 120 px)", () => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue(ARTICLES);
    render(<CadreLegalPage />);
    const section = screen.getByRole("heading", { level: 2, name: "Formations disponibles" }).closest("section")!;
    const grille = section.querySelector("ul")!;
    expect(grille).not.toHaveClass("lg:grid-cols-3");
    expect(grille).not.toHaveClass("sm:grid-cols-2");
    expect(within(grille).getByRole("heading", { level: 3 })).toHaveClass("break-words");
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });

  // overflow-hidden sur un ancêtre neutralise position: sticky.
  it.each(HUBS)("$nom : aucun ancêtre en overflow-hidden ne bloque la colonne sticky", ({ rendu }) => {
    vi.mocked(getRelatedArticleLinks).mockReturnValue(ARTICLES);
    const { container } = rendu();
    let el: HTMLElement | null = container.querySelector("aside");
    expect(el).not.toBeNull();
    while (el && el !== container) {
      expect(el).not.toHaveClass("overflow-hidden");
      el = el.parentElement;
    }
    vi.mocked(getRelatedArticleLinks).mockReturnValue([]);
  });
});

describe("Hub Prévention — « Un cycle structuré & cohérent »", () => {
  it("abandonne l'ancien fond gris et la grande icône en filigrane", () => {
    render(<PreventionPage />);
    const section = document.getElementById("formations-contenu")!;
    expect(section.className).not.toMatch(/muted/);
    expect(section.querySelector(".opacity-10")).toBeNull();
  });

  it("range les 6 thèmes dans une carte ciel et le kit dans une carte pêche, titres inchangés", () => {
    render(<PreventionPage />);
    const section = document.getElementById("formations-contenu")!;
    const items = within(section).getAllByRole("listitem");
    expect(items).toHaveLength(6);
    expect(items[0]).toHaveTextContent("Mécanismes du stress et de la charge émotionnelle");
    expect(items[0].closest(".bg-sky")).not.toBeNull();
    // « Le Kit de Prévention » : ancien h4 (saut de niveau), désormais un
    // paragraphe en exergue, texte inchangé.
    const kit = within(section).getByText("Le Kit de Prévention");
    expect(kit.tagName).toBe("P");
    expect(kit.closest(".bg-peach")).not.toBeNull();
    expect(within(section).getByRole("heading", { level: 3, name: "Assimilation durable" })).toBeInTheDocument();
  });
});

describe("Fiche formation", () => {
  const FICHE = ["prevention-rps-qvct-etablissements-sante", "diagnostic-plan-action-qvct"] as const;

  it("garde son H1 et une hiérarchie Hn sans saut", async () => {
    const { container } = await renderFiche(...FICHE);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Diagnostic et plan d'action QVCT");
    sansSaut(container);
  });

  // Mesuré à 320 px : « établissements », en 48 px, ne tenait pas dans la
  // colonne (344 px pour 320) et créait un défilement horizontal.
  it("ne surcharge pas la règle h1 globale et laisse la colonne de lecture rétrécir (pas de défilement à 320 px)", async () => {
    await renderFiche("cadre-legal-etablissements-sante", "obligations-legales-des-etablissements");
    const h1 = screen.getByRole("heading", { level: 1 });
    // 30 px sur smartphone comme les hubs : en 36 px, « Accompagnement » ne
    // tient pas à 320 px (revue).
    // Story 4.13 : taille et coupure portées par la règle h1 globale.
    expectH1StyleGlobal(h1);
    expect(h1.parentElement).toHaveClass("min-w-0");
  });

  it("présente le programme en étapes ordonnées, un h3 par module (Steps)", async () => {
    await renderFiche(...FICHE);
    const section = screen.getByRole("heading", { level: 2, name: "Programme" }).closest("section")!;
    const liste = section.querySelector("ol")!;
    expect(liste).toHaveAttribute("role", "list");
    expect(within(liste).getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Comprendre la QVCT",
      "Diagnostiquer les leviers d'action",
      "Construire un plan d'action partagé",
    ]);
    expect(within(liste).getByText(/Organisation, autonomie, sens du travail/)).toBeInTheDocument();
  });

  it("ouvre chaque section par un titre de la charte (barre orange décorative)", async () => {
    await renderFiche(...FICHE);
    const titres = screen.getAllByRole("heading", { level: 2 });
    expect(titres.map((h) => h.textContent)).toEqual([
      "Objectifs pédagogiques",
      "Programme",
      "Public visé",
      "Modalités pédagogiques et d’évaluation",
    ]);
    titres.forEach((h) => expect(h.querySelector("[aria-hidden='true'].bg-orange")).not.toBeNull());
  });

  it("affiche le public visé en pastilles pétrole, dans une liste", async () => {
    await renderFiche(...FICHE);
    const section = screen.getByRole("heading", { level: 2, name: "Public visé" }).closest("section")!;
    const items = within(within(section).getByRole("list")).getAllByRole("listitem");
    expect(items.map((li) => li.textContent)).toEqual(["Direction", "Encadrement", "Référents QVCT/RH", "CSE"]);
    items.forEach((li) => expect(li.querySelector(".bg-petrol")).not.toBeNull());
  });

  // Règle « UI d'abord, efficace sur smartphone » (Cédric, 2026-10-31) : en
  // une colonne, la fiche pratique et son CTA suivent l'introduction au lieu
  // d'attendre la fin de la page ; le CTA ouvre la carte (visible même sur
  // un écran de portable peu haut).
  it("place la fiche pratique juste après l'introduction, avant les objectifs (ordre mobile)", async () => {
    const { container } = await renderFiche(...FICHE);
    const fiche = container.querySelector(".lg\\:sticky")!;
    const objectifs = screen.getByRole("heading", { level: 2, name: "Objectifs pédagogiques" });
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.compareDocumentPosition(fiche) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(fiche.compareDocumentPosition(objectifs) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    // Classes de placement desktop (colonne de droite, deux lignes) : jsdom
    // ne calcule pas la grille, le rendu réel est vérifié en capture Playwright.
    expect(fiche).toHaveClass("lg:col-start-2", "lg:row-start-1", "lg:row-span-2");
  });

  it("ouvre la fiche pratique par le CTA « Demander un devis »", async () => {
    const { container } = await renderFiche(...FICHE);
    const carte = container.querySelector(".lg\\:sticky .bg-sky")!;
    expect(carte.firstElementChild).toHaveTextContent("Demander un devis");
  });

  it("illustre les objectifs pédagogiques de la cible, en décor", async () => {
    await renderFiche(...FICHE);
    const section = screen.getByRole("heading", { level: 2, name: "Objectifs pédagogiques" }).closest("section")!;
    const image = section.querySelector("img")!;
    expect(image).toHaveAttribute("alt", "");
    expect(decodeURIComponent(image.getAttribute("src")!)).toContain("cible-flechee.jpg");
  });

  it("garde la fiche pratique Qualiopi visible, en carte ciel, avec le CTA « Demander un devis »", async () => {
    const { container } = await renderFiche(...FICHE);
    const fiche = container.querySelector(".lg\\:sticky .bg-sky")!;
    expect(fiche).not.toBeNull();
    expect(within(fiche as HTMLElement).getByText("2 jours")).toBeInTheDocument();
    expect(within(fiche as HTMLElement).getByRole("link", { name: "Demander un devis" })).toHaveClass("bg-accent");
  });

  it("garde les placeholders Qualiopi distincts sans la couleur seule (NFR3)", async () => {
    await renderFiche(...FICHE);
    const placeholders = screen.getAllByText("[À confirmer]");
    // tarif, référent handicap, indicateurs de résultats : non renseignés.
    expect(placeholders).toHaveLength(3);
    placeholders.forEach((p) => expect(p).toHaveClass("italic", "border-dashed", "border-accent"));
  });
});

const FICHIERS = [
  "app/formations/page.tsx",
  "app/formations/[famille]/[slug]/page.tsx",
  "app/formations/prevention-rps-qvct-etablissements-sante/page.tsx",
  "app/formations/cadre-legal-etablissements-sante/page.tsx",
  "app/formations/accompagnement-professionnel-etablissements-sante/page.tsx",
  "app/formations/dynamique-equipe-etablissements-sante/page.tsx",
  "components/FormationsDisponiblesBloc.tsx",
  "components/FormationsEtArticlesLiesBloc.tsx",
  "components/ArticlesBlogLiesBloc.tsx",
];

describe("Anciennes couleurs retirées (Story 4.4)", () => {
  it.each(FICHIERS)("%s n'utilise ni secondary, ni muted, ni pastel", (fichier) => {
    expect(readFileSync(join(root, fichier), "utf8")).not.toMatch(/\b[a-z]+(?:\/\d+)?-(?:secondary|muted|pastel)\b|-(?:secondary|muted|pastel)(?:\/\d+)?\b/);
  });

  // stone-500 tombe à 4.3:1 sur les pastels : sous le seuil de 4.5:1.
  it.each(FICHIERS)("%s n'utilise pas text-stone-500", (fichier) => {
    expect(readFileSync(join(root, fichier), "utf8")).not.toMatch(/text-stone-500/);
  });
});
