import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/contact-form/action", () => ({
  submit_contact_form: vi.fn(),
}));

import About from "../a-propos/page";
import ContactPage from "../contact/page";
import MentionsLegales from "../mentions-legales/page";

import type { ReactElement } from "react";

// Story 4.13 : fil d'Ariane posé page par page (libellés du menu et du pied
// de page), avec la page courante en aria-current et son JSON-LD.
const PAGES: [string, () => Promise<ReactElement>][] = [
  ["À propos", async () => <About />],
  [
    "Contact",
    async () => ContactPage({ searchParams: Promise.resolve({}) }),
  ],
  ["Mentions légales", async () => <MentionsLegales />],
];

function breadcrumbJsonLd() {
  const scripts = [
    ...document.querySelectorAll('script[type="application/ld+json"]'),
  ].map((s) => JSON.parse(s.innerHTML));
  return scripts.filter((d) => d["@type"] === "BreadcrumbList");
}

// Padding ou marge haute (y compris négative) ; les marges basses sont libres.
const ESPACE_HAUT = /^(?:[\w-]+:)*-?(?:p[ty]|m[ty])-(?!0$)/;

describe("ESPACE_HAUT", () => {
  it("repère paddings et marges hautes, négatives comprises", () => {
    for (const c of ["pt-4", "py-2", "mt-6", "my-1", "-mt-4", "sm:-mt-2", "lg:pt-px"]) {
      expect(c).toMatch(ESPACE_HAUT);
    }
    for (const c of ["mb-8", "pb-20", "mt-0", "px-4", "mx-auto"]) {
      expect(c).not.toMatch(ESPACE_HAUT);
    }
  });
});

describe.each(PAGES)("Fil d'Ariane — %s", (label, renderPage) => {
  it(`affiche « Accueil / ${label} », page courante en aria-current`, async () => {
    render(await renderPage());
    const nav = screen.getByRole("navigation", { name: "Fil d'Ariane" });

    expect(within(nav).getByRole("link", { name: "Accueil" })).toHaveAttribute(
      "href",
      "/",
    );
    const courant = within(nav).getByText(label);
    expect(courant).toHaveAttribute("aria-current", "page");
  });

  it("précède le H1", async () => {
    render(await renderPage());
    const nav = screen.getByRole("navigation", { name: "Fil d'Ariane" });
    const h1 = screen.getByRole("heading", { level: 1 });

    expect(
      nav.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // Modèle unique de haut de page (story 4.11, catalogue /formations) : le
  // blanc est au-dessus du fil d'Ariane, puis le H1 suit dans un .container,
  // sans autre padding haut entre les deux.
  it("suit le modèle de haut de page : blanc au-dessus du fil d'Ariane, H1 juste après", async () => {
    render(await renderPage());
    const nav = screen.getByRole("navigation", { name: "Fil d'Ariane" });
    const enTete = nav.parentElement!;
    const h1 = screen.getByRole("heading", { level: 1 });

    expect(enTete).toHaveClass("pt-6", "sm:pt-20");
    expect(
      [...enTete.children].find((e) => e.tagName !== "SCRIPT"),
    ).toBe(nav);
    expect(enTete.contains(h1)).toBe(true);
    expect(h1.closest(".container")).not.toBeNull();
    // Ni padding ni marge haute entre le fil d'Ariane et le H1, H1 compris
    // (les marges basses restent libres).
    for (let e: Element | null = h1; e && e !== enTete; e = e.parentElement) {
      for (const classe of e.classList) {
        expect(classe).not.toMatch(ESPACE_HAUT);
      }
    }
  });

  it("émet un JSON-LD BreadcrumbList à deux éléments", async () => {
    render(await renderPage());
    const listes = breadcrumbJsonLd();

    expect(listes).toHaveLength(1);
    expect(
      listes[0].itemListElement.map((i: { name: string }) => i.name),
    ).toEqual(["Accueil", label]);
  });
});
