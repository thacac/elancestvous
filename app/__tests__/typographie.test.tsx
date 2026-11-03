import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/relatedArticles", () => ({
  getRelatedArticleLinks: vi.fn(() => [{ href: "/blog/un-article", label: "Un article" }]),
}));
vi.mock("@/components/contact-form/action", () => ({ submit_contact_form: vi.fn() }));
vi.mock("@/lib/featureFlags", () => ({ isBlogPublic: () => true }));
vi.mock("@/lib/blog", () => {
  const meta = {
    title: "Un article",
    slug: "un-article",
    description: "Description",
    excerpt: "Extrait de l'article",
    publishedAt: "2026-01-01",
    coverImage: "/og-banner.jpg",
    coverImageAlt: "Illustration",
    tags: ["QVCT"],
    pillar: "C",
    readingTime: "2 min de lecture",
  };
  return {
    getAllPostsMeta: vi.fn(() => [meta, { ...meta, slug: "deux" }]),
    getPostBySlug: vi.fn(async () => ({
      ...meta,
      html: "<h2>Une partie</h2><h3>Un détail</h3><p>Contenu.</p>",
      relatedPosts: [{ ...meta, slug: "autre" }],
      keyMessage: "Le message clé",
    })),
    getPostSlugs: vi.fn(() => []),
    renderMarkdownToSafeHtml: async () => "<h2>Une partie</h2><h3>Un détail</h3><p>Contenu.</p>",
  };
});

import About from "../a-propos/page";
import BlogPost from "../blog/[slug]/page";
import BlogIndex from "../blog/page";
import CoachingEtablissementsPage from "../coaching/etablissements/page";
import CoachingHubPage from "../coaching/page";
import CoachingParticuliersPage from "../coaching/particuliers/page";
import ContactPage from "../contact/page";
import FormationPage from "../formations/[famille]/[slug]/page";
import AccompagnementPage from "../formations/accompagnement-professionnel-etablissements-sante/page";
import CadreLegalPage from "../formations/cadre-legal-etablissements-sante/page";
import DynamiqueEquipePage from "../formations/dynamique-equipe-etablissements-sante/page";
import FormationsCataloguePage from "../formations/page";
import PreventionRpsPage from "../formations/prevention-rps-qvct-etablissements-sante/page";
import GappPage from "../gapp-analyse-pratiques-professionnelles/page";
import MentionsLegales from "../mentions-legales/page";
import Home from "../page";

import type { ReactElement } from "react";

// Cédric, 2026-11-03 : « je ne veux pas 50 tailles de texte, suis les
// recommandations SEO h1 h2 h3 p et basta ». Une taille par niveau, définie
// une seule fois dans app/globals.css : h1, h2 (sections), h3 (cartes et
// sous-parties), p (tout le contenu). Seules exceptions, nommées : la
// mention (`texte-mention`, petites infos : sources, dates, étiquettes) et le
// chiffre clé (`chiffre-cle`). Interface hors contenu (menu, fil d'Ariane,
// boutons, formulaire, pied de page) non concernée.
const PAGES: [string, () => ReactElement | Promise<ReactElement>][] = [
  ["l'accueil", () => <Home />],
  ["/blog", () => <BlogIndex />],
  ["un article de blog", () => BlogPost({ params: Promise.resolve({ slug: "un-article" }) })],
  ["/formations", () => <FormationsCataloguePage />],
  ["le hub Prévention RPS/QVCT", () => <PreventionRpsPage />],
  ["le hub Cadre légal", () => <CadreLegalPage />],
  ["le hub Dynamique d'équipe", () => <DynamiqueEquipePage />],
  ["le hub Accompagnement", () => <AccompagnementPage />],
  [
    "une fiche formation",
    () =>
      FormationPage({
        params: Promise.resolve({
          famille: "prevention-rps-qvct-etablissements-sante",
          slug: "diagnostic-plan-action-qvct",
        }),
      }),
  ],
  ["/coaching", () => <CoachingHubPage />],
  ["/coaching/particuliers", () => <CoachingParticuliersPage />],
  ["/coaching/etablissements", () => <CoachingEtablissementsPage />],
  ["GAPP", () => <GappPage />],
  ["/contact", () => ContactPage({ searchParams: Promise.resolve({}) })],
  ["/a-propos", () => <About />],
  ["les mentions légales", () => <MentionsLegales />],
];

const TAILLE = /^(?:[a-z0-9]+:)*text-(?:xs|sm|base|md|lg|[2-9]?xl|\[[^\]]*\]|\([^)]*\))(?:\/\d+)?!?$/;

// Revue : du texte justifié étire les espaces (titres compris), pénible à
// lire (RGAA 10.x, WCAG 1.4.8) ; jamais dans le contenu.
describe("Typographie : pas de texte justifié", () => {
  it.each(PAGES)("n'en a pas sur %s", async (_page, rendu) => {
    const { container } = render(await rendu());
    expect(container.querySelector(".text-justify")).toBeNull();
  });
});

// Interface hors contenu : fil d'Ariane, formulaire, boutons (buttonVariants).
function horsContenu(el: Element) {
  return Boolean(el.closest("nav, form")) || (el.classList.contains("inline-flex") && el.classList.contains("rounded-md"));
}

describe("Typographie : h1, h2, h3, p et basta", () => {
  it.each(PAGES)("n'a ni saut de niveau ni titre au-delà de h3 sur %s", async (_page, rendu) => {
    const { container } = render(await rendu());
    const niveaux = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) =>
      Number(h.tagName[1]),
    );
    const plan = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(
      (h) => `${h.tagName} ${h.textContent?.trim().slice(0, 30)}`,
    );
    expect(niveaux[0], plan.join("\n")).toBe(1);
    expect(niveaux.filter((n) => n === 1)).toHaveLength(1);
    expect(niveaux.every((n) => n <= 3), plan.join("\n")).toBe(true);
    niveaux.forEach((n, i) => {
      if (i > 0) expect(n - niveaux[i - 1], plan.join("\n")).toBeLessThanOrEqual(1);
    });
  });

  // Article et fiche : le H1 est suivi directement du contenu, sans sous-titre.
  it.each(PAGES.filter(([page]) => page !== "un article de blog" && page !== "une fiche formation"))(
    "écrit les sous-titres du haut de page en paragraphes, jamais en titres, sur %s", async (_page, rendu) => {
    const { container } = render(await rendu());
    const h1 = container.querySelector("h1")!;
    expect(h1.parentElement!.querySelectorAll("h2, h3")).toHaveLength(0);
  });

  it.each(PAGES)("ne pose aucune taille de texte au cas par cas dans le contenu de %s", async (_page, rendu) => {
    const { container } = render(await rendu());
    const fautes: string[] = [];
    container.querySelectorAll("[class]").forEach((el) => {
      if (horsContenu(el)) return;
      for (const classe of el.classList) {
        if (TAILLE.test(classe)) fautes.push(`<${el.tagName.toLowerCase()}> ${classe} : ${el.textContent?.slice(0, 40)}`);
      }
    });
    expect(fautes).toEqual([]);
  });
});

describe("Typographie : une seule définition par niveau", () => {
  const css = readFileSync(join(__dirname, "..", "globals.css"), "utf8");

  it("définit h2 et h3 une fois, sans classe « h3-like » qui imite un titre", () => {
    expect(css.match(/^h2\s*\{/gm)).toHaveLength(1);
    expect(css.match(/^h3\s*\{/gm)).toHaveLength(1);
    expect(css).not.toContain("h3-like");
  });

  it("donne aux h2 et h3 la police des titres en bleu nuit", () => {
    for (const niveau of ["h2", "h3"]) {
      const regle = css.match(new RegExp(`^${niveau}\\s*\\{([^}]*)\\}`, "m"))?.[1] ?? "";
      expect(regle).toContain("font-display");
      expect(regle).toContain("text-primary");
    }
  });

  // Cédric, 2026-11-03 : texte courant à 18 px, défini une fois sur <body>.
  it("pose le texte courant à 18 px une seule fois, sur body", () => {
    const body = css.match(/^body\s*\{([^}]*)\}/m)?.[1] ?? "";
    expect(body).toMatch(/\btext-lg\b/);
  });

  it("aligne le corps des blocs `prose` (articles, fiches) sur 18 px", () => {
    const sources = [
      "components/blog/ArticleBody.tsx",
      "app/formations/[famille]/[slug]/page.tsx",
      "app/mentions-legales/page.tsx",
      "app/a-propos/page.tsx",
    ];
    for (const fichier of sources) {
      const source = readFileSync(join(__dirname, "..", "..", fichier), "utf8");
      for (const m of source.matchAll(/className="([^"]*\bprose\b[^"]*)"/g)) {
        expect(m[1], fichier).toMatch(/\bprose-lg\b/);
      }
    }
  });

  it("nomme les deux seules exceptions : la mention et le chiffre clé", () => {
    expect(css).toMatch(/@utility texte-mention\s*\{/);
    expect(css).toMatch(/@utility chiffre-cle\s*\{/);
  });
});
