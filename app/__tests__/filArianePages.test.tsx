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

  it("émet un JSON-LD BreadcrumbList à deux éléments", async () => {
    render(await renderPage());
    const listes = breadcrumbJsonLd();

    expect(listes).toHaveLength(1);
    expect(
      listes[0].itemListElement.map((i: { name: string }) => i.name),
    ).toEqual(["Accueil", label]);
  });
});
