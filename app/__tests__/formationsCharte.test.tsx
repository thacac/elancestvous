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

async function renderCatalogue(famille?: string) {
  return render(await FormationsCataloguePage({ searchParams: Promise.resolve(famille ? { famille } : {}) }));
}

async function renderFiche(famille: string, slug: string) {
  return render(await FormationPage({ params: Promise.resolve({ famille, slug }) }));
}

describe("/formations — pastilles de filtre", () => {
  it("restent des liens, sans forme de pilule, et peuvent passer à la ligne (pas de défilement horizontal à 320 px)", async () => {
    await renderCatalogue();
    const liens = within(screen.getByRole("navigation", { name: "Filtre par catégorie" })).getAllByRole("link");
    expect(liens).toHaveLength(5);
    liens.forEach((lien) => {
      expect(lien).not.toHaveClass("rounded-full", "whitespace-nowrap");
      expect(lien).toHaveClass("rounded-md", "whitespace-normal", "h-auto");
    });
  });

  it("signalent le filtre actif autrement que par la couleur (aria-current)", async () => {
    await renderCatalogue("cadre-legal-etablissements-sante");
    const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
    expect(within(nav).getByRole("link", { name: "Cadre légal, droits et éthique" })).toHaveAttribute("aria-current", "page");
    expect(within(nav).getByRole("link", { name: "Toutes" })).not.toHaveAttribute("aria-current");
  });

  it("marquent « Toutes » comme actif sans filtre", async () => {
    await renderCatalogue();
    const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
    expect(within(nav).getByRole("link", { name: "Toutes" })).toHaveAttribute("aria-current", "page");
  });
});

describe("/formations — grille en cartes pastel", () => {
  it("liste fiches et familles à venir en cartes ciel / pêche alternées", async () => {
    await renderCatalogue();
    const grille = screen.getByRole("list", { name: "Formations du catalogue" });
    const cartes = within(grille).getAllByRole("listitem");
    // 2 fiches réelles + 2 familles encore vides.
    expect(cartes).toHaveLength(4);
    expect(tons(cartes)).toEqual(["sky", "peach", "sky", "peach"]);
  });

  it("garde la pastille de famille visible sur le pastel (bordure de sa couleur de texte)", async () => {
    await renderCatalogue();
    const carte = screen.getByRole("heading", { level: 2, name: "Diagnostic et plan d'action QVCT" }).closest("li")!;
    const pastille = within(carte).getByText("Prévention des RPS et QVCT");
    expect(pastille).toHaveClass("bg-cat-prevention", "border", "border-cat-prevention-foreground");
  });

  it("affiche la durée dans une couleur lisible sur pastel (≥ 4.5:1)", async () => {
    await renderCatalogue();
    const carte = screen.getByRole("heading", { level: 2, name: "Diagnostic et plan d'action QVCT" }).closest("li")!;
    expect(within(carte).getByText("2 jours")).toHaveClass("text-primary/80");
  });

  it("distingue la carte « Bientôt disponible » d'une vraie fiche (bordure pointillée)", async () => {
    await renderCatalogue();
    const cartes = screen.getAllByRole("heading", { level: 2, name: "Bientôt disponible" }).map((h) => h.closest("li")!);
    expect(cartes).toHaveLength(2);
    cartes.forEach((carte) => expect(carte).toHaveClass("border-dashed", "border-petrol"));
  });
});

const HUBS = [
  {
    nom: "Prévention",
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

describe.each(HUBS)("Hub Famille $nom", ({ rendu, meta, title, h1, sections, fiches }) => {
  it("garde son title, son H1 et une hiérarchie Hn sans saut", () => {
    expect(meta.title).toBe(title);
    const { container } = rendu();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(h1);
    sansSaut(container);
  });

  // Mesuré à 320 px : « professionnelles » / « développement » en 48 px
  // débordaient de l'écran.
  it("laisse son H1 se couper (pas de défilement horizontal à 320 px)", () => {
    rendu();
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("break-words", "hyphens-auto");
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
      expect(within(cartes[0]).getByRole("link", { name: "Voir la fiche" })).toHaveClass("bg-primary/10");
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
    expect(within(grille).getByRole("heading", { level: 3 })).toHaveClass("break-words", "hyphens-auto");
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
    const kit = within(section).getByRole("heading", { level: 4, name: "Le Kit de Prévention" });
    expect(kit.closest(".bg-peach")).not.toBeNull();
    expect(within(section).getByRole("heading", { level: 3, name: "Assimilation durable" })).toHaveClass("text-primary!");
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
  it("laisse le H1 se couper et la colonne de lecture rétrécir (pas de défilement à 320 px)", async () => {
    await renderFiche("cadre-legal-etablissements-sante", "obligations-legales-des-etablissements");
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveClass("break-words", "hyphens-auto");
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

  it("garde la fiche pratique Qualiopi visible, en carte ciel, avec le CTA « Demander un devis »", async () => {
    const { container } = await renderFiche(...FICHE);
    const fiche = container.querySelector(".sticky .bg-sky")!;
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
