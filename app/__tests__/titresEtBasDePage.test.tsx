import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/relatedArticles", () => ({ getRelatedArticleLinks: vi.fn(() => []) }));
vi.mock("@/components/contact-form/action", () => ({ submit_contact_form: vi.fn() }));
vi.mock("@/lib/featureFlags", () => ({ isBlogPublic: () => true }));
vi.mock("@/lib/blog", () => ({ getAllPostsMeta: vi.fn(() => []) }));

import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import ArticulationBloc from "@/components/ArticulationBloc";
import CartesContrastBloc from "@/components/CartesContrastBloc";
import Accompagnement from "@/components/home/Accompagnement";
import Axes from "@/components/home/Axes";

import About from "../a-propos/page";
import BlogIndex from "../blog/page";
import CoachingEtablissementsPage from "../coaching/etablissements/page";
import CoachingHubPage from "../coaching/page";
import CoachingParticuliersPage from "../coaching/particuliers/page";
import ContactPage from "../contact/page";
import AccompagnementPage from "../formations/accompagnement-professionnel-etablissements-sante/page";
import CadreLegalPage from "../formations/cadre-legal-etablissements-sante/page";
import DynamiqueEquipePage from "../formations/dynamique-equipe-etablissements-sante/page";
import FormationsCataloguePage from "../formations/page";
import PreventionRpsPage from "../formations/prevention-rps-qvct-etablissements-sante/page";
import GappPage from "../gapp-analyse-pratiques-professionnelles/page";
import MentionsLegales from "../mentions-legales/page";

import type { ReactElement } from "react";

// Harmonisation des titres de page (validé par Cédric le 2026-11-03) : sur
// toutes les pages hors accueil, le haut de page est aligné à gauche (plus
// lisible sur plusieurs lignes, cohérent avec le fil d'Ariane et les
// bandeaux) et le mot clé du H1 est en orange, souligné du trait de pinceau.
const PAGES: [string, () => ReactElement | Promise<ReactElement>][] = [
  ["/blog", () => <BlogIndex />],
  ["/formations", () => FormationsCataloguePage({ searchParams: Promise.resolve({}) })],
  ["/coaching", () => <CoachingHubPage />],
  ["/coaching/particuliers", () => <CoachingParticuliersPage />],
  ["/coaching/etablissements", () => <CoachingEtablissementsPage />],
  ["GAPP", () => <GappPage />],
  ["le hub Prévention RPS/QVCT", () => <PreventionRpsPage />],
  ["le hub Cadre légal", () => <CadreLegalPage />],
  ["le hub Dynamique d'équipe", () => <DynamiqueEquipePage />],
  ["le hub Accompagnement", () => <AccompagnementPage />],
  ["/contact", () => ContactPage({ searchParams: Promise.resolve({}) })],
  ["/a-propos", () => <About />],
  ["les mentions légales", () => <MentionsLegales />],
];

describe("Titres de page harmonisés", () => {
  it.each(PAGES)("aligne le haut de page à gauche sur %s", async (_page, rendu) => {
    render(await rendu());
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.closest(".text-center")).toBeNull();
  });

  it.each(PAGES)("ne recentre pas le sous-titre du haut de page sur %s", async (_page, rendu) => {
    render(await rendu());
    const h1 = screen.getByRole("heading", { level: 1 });
    // Le style global h3/.h3-like centre le bloc (mx-auto max-w-2xl) : le
    // sous-titre du haut de page doit l'annuler pour rester aligné au titre.
    const sousTitres = h1.parentElement!.querySelectorAll("h3, .h3-like");
    for (const sousTitre of sousTitres) expect(sousTitre).toHaveClass("mx-0!");
  });

  it.each(PAGES)("souligne d'un trait de pinceau orange le mot clé du H1 sur %s", async (_page, rendu) => {
    render(await rendu());
    const h1 = screen.getByRole("heading", { level: 1 });
    const motCle = h1.querySelector(".brush-underline");
    expect(motCle).not.toBeNull();
    expect(motCle).toHaveClass("text-accent");
  });
});

// Le médaillon des hubs Famille ne peut plus être centré au-dessus d'un titre
// aligné à gauche : il passe à droite du titre à partir de `sm`.
const HUBS_FAMILLE: [string, () => ReactElement][] = [
  ["Prévention RPS/QVCT", () => <PreventionRpsPage />],
  ["Cadre légal", () => <CadreLegalPage />],
  ["Dynamique d'équipe", () => <DynamiqueEquipePage />],
  ["Accompagnement", () => <AccompagnementPage />],
];

describe("Médaillon des hubs Famille", () => {
  it.each(HUBS_FAMILLE)("n'est plus centré au-dessus du titre sur le hub %s", (_hub, rendu) => {
    const { container } = render(rendu());
    const medaillon = container.querySelector("[data-hero] img")!;
    expect(medaillon).not.toBeNull();
    expect(medaillon).not.toHaveClass("mx-auto");
    expect(medaillon.parentElement).toHaveClass("sm:flex-row-reverse");
    // Au-dessus du titre sur smartphone : le médaillon le précède dans le DOM.
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(medaillon.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});

// Vague au-dessus de chaque bandeau pétrole, comme sur l'accueil où la vague
// du hero coiffe « Mes 3 axes » (qui n'en reçoit donc pas une seconde).
describe("Vague au-dessus des bandeaux", () => {
  it("coiffe aussi les bandeaux des pages de service", () => {
    const { container } = render(
      <CartesContrastBloc titre="Quand faire appel ?" cartes={[{ titre: "Un item", texte: "Un texte" }]} />,
    );
    expect(container.querySelector("header")?.firstElementChild?.tagName.toLowerCase()).toBe("svg");
  });


  it("ne double pas la vague du hero au-dessus de « Mes 3 axes »", () => {
    const { container } = render(<Axes />);
    expect(container.querySelector("header")?.firstElementChild).toHaveClass("bg-petrol");
  });

  it("coiffe « Comment se passe un accompagnement ? » d'une vague", () => {
    const { container } = render(<Accompagnement />);
    expect(container.querySelector("header")?.firstElementChild?.tagName.toLowerCase()).toBe("svg");
  });
});

// Revue : avec un titre aligné à gauche, un bloc recentré juste dessous
// décale les bords gauches.
describe("Bords gauches alignés sous les titres", () => {
  it("ne recentre pas les cartes du hub /coaching", () => {
    render(<CoachingHubPage />);
    const cartes = screen.getByRole("heading", { name: "Particuliers" }).closest("ul");
    expect(cartes).not.toBeNull();
    expect(cartes).not.toHaveClass("mx-auto");
  });

  it("ne recentre pas « Lien avec les autres accompagnements »", () => {
    const { container } = render(<ArticulationBloc />);
    expect(container.innerHTML).not.toContain("mx-auto");
  });
});

// Textes du bas de page à la taille du texte courant (pas de text-sm).
const PETITE_TAILLE = /\btext-(?:xs|sm)\b|md:text-md|text-justify/;

describe("Textes du bas de page à la taille du contenu", () => {
  it("« Lien avec les autres accompagnements » n'est ni réduit ni justifié", () => {
    const { container } = render(
      <ArticulationBloc liens={[{ href: "/coaching", label: "Coaching" }]} />,
    );
    expect(container.innerHTML).not.toMatch(PETITE_TAILLE);
  });

  it("la colonne « Pour aller plus loin » n'est pas réduite", () => {
    const { container } = render(
      <ArticlesBlogLiesBloc
        targetPage="/formations"
        variant="sidebar"
        liens={[{ href: "/blog/un-article", label: "Un article" }]}
      />,
    );
    expect(container.innerHTML).not.toMatch(PETITE_TAILLE);
  });

  it("le texte sur le premier échange du coaching individuel n'est pas réduit", () => {
    render(<CoachingParticuliersPage />);
    const texte = screen.getByText(/Un premier échange permet de vérifier ensemble/);
    expect(texte.className).not.toMatch(PETITE_TAILLE);
  });
});
