import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/relatedArticles", () => ({ getRelatedArticleLinks: vi.fn(() => []) }));
vi.mock("@/components/contact-form/action", () => ({ submit_contact_form: vi.fn() }));

import CoachingEtablissementsPage from "../coaching/etablissements/page";
import CoachingHubPage from "../coaching/page";
import CoachingParticuliersPage from "../coaching/particuliers/page";
import ContactPage from "../contact/page";
import AccompagnementPage from "../formations/accompagnement-professionnel-etablissements-sante/page";
import CadreLegalPage from "../formations/cadre-legal-etablissements-sante/page";
import DynamiqueEquipePage from "../formations/dynamique-equipe-etablissements-sante/page";
import PreventionRpsPage from "../formations/prevention-rps-qvct-etablissements-sante/page";
import GappPage from "../gapp-analyse-pratiques-professionnelles/page";
import MentionsLegales from "../mentions-legales/page";
import Home from "../page";

import { expectH1StyleGlobal } from "./outils/h1";

import type { ReactElement } from "react";

// Story 4.11 : « l'interface d'abord, efficace sur smartphone ». H1 réduits
// sur smartphone (motif du catalogue, des fiches, du blog et de /a-propos),
// sans changement de texte ni de rendu à partir de `sm`.
const H1_REDUITS: [string, () => ReactElement | Promise<ReactElement>, string][] = [
  ["l'accueil", () => <Home />, "Préserver la santé de ceux qui soignent."],
  ["/coaching", () => <CoachingHubPage />, "Coaching."],
  ["/coaching/particuliers", () => <CoachingParticuliersPage />, "Coaching individuel."],
  ["/coaching/etablissements", () => <CoachingEtablissementsPage />, "Coaching individuel ou collectif."],
  ["GAPP", () => <GappPage />, "Groupe d'analyse des pratiques professionnelles."],
  ["/contact", () => ContactPage({ searchParams: Promise.resolve({}) }), "Parlons de vos besoins"],
  ["les mentions légales", () => <MentionsLegales />, "Mentions Légales"],
];

describe("Story 4.11 — H1 réduits sur smartphone", () => {
  it.each(H1_REDUITS)("ne surcharge pas la règle h1 globale sur %s, texte inchangé", async (_page, rendu, texte) => {
    render(await rendu());
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent?.replace(/\s+/g, " ").trim()).toBe(texte);
    // Story 4.13 : taille réduite, coupure sans césure et police viennent de
    // la seule règle h1 de globals.css (titreH1Global.test.ts) ; le H1 ne
    // porte aucune classe de style concurrente.
    expectH1StyleGlobal(h1);
  });
});

// Haut de page aligné sur le catalogue /formations (modèle validé par Cédric,
// 2026-11-02) : le blanc est au-dessus du fil d'Ariane (`pt-6 sm:pt-20`) et le
// H1 le suit directement ; le hero ne garde que son blanc du bas.
const PAGES_DE_SERVICE: [string, () => ReactElement][] = [
  ["/coaching", () => <CoachingHubPage />],
  ["/coaching/particuliers", () => <CoachingParticuliersPage />],
  ["/coaching/etablissements", () => <CoachingEtablissementsPage />],
  ["GAPP", () => <GappPage />],
  ["le hub Prévention RPS/QVCT", () => <PreventionRpsPage />],
  ["le hub Cadre légal", () => <CadreLegalPage />],
  ["le hub Dynamique d'équipe", () => <DynamiqueEquipePage />],
  ["le hub Accompagnement", () => <AccompagnementPage />],
];

describe("Story 4.11 — haut de page sur le modèle du catalogue", () => {
  it.each(PAGES_DE_SERVICE)("met le blanc au-dessus du fil d'Ariane sur %s", (_page, rendu) => {
    const { container } = render(rendu());
    const ariane = screen.getByRole("navigation", { name: "Fil d'Ariane" });
    expect(ariane.parentElement).toHaveClass("pt-6", "sm:pt-20");

    const hero = container.querySelector("[data-hero]");
    expect(hero).not.toBeNull();
    expect(hero).toHaveClass("pb-20", "container");
    expect(hero?.className).not.toMatch(/\b(?:py|pt)-\d+\b/);
    // Le H1 est aligné à gauche (harmonisation des titres, 2026-11-03).
    expect(hero?.querySelector("h1")?.closest(".text-center")).toBeNull();
  });
});
