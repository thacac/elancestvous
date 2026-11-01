import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import FormationsCataloguePage from "../formations/page";

// Story 4.7 : à 390 px, la première fiche arrivait après 2,7 écrans (4 grandes
// tuiles Famille puis 4 lignes de filtres). Pistes retenues par Cédric
// (2026-11-01) : liste avant les tuiles, filtres sur une ligne défilante avec
// fondu, tuiles compactes, H1 réduit. Contenu réel de content/formations/.
async function renderCatalogue(famille?: string) {
  return render(await FormationsCataloguePage({ searchParams: Promise.resolve(famille ? { famille } : {}) }));
}

function suit(avant: Element, apres: Element) {
  return Boolean(avant.compareDocumentPosition(apres) & Node.DOCUMENT_POSITION_FOLLOWING);
}

describe("/formations — ordre de lecture (Story 4.7)", () => {
  it.each([undefined, "prevention-rps-qvct-etablissements-sante"])(
    "place la liste des fiches avant les tuiles Famille, dans le HTML (filtre : %s)",
    async (famille) => {
      const { container } = await renderCatalogue(famille);
      const liste = container.querySelector("#toutes-nos-formations")!;
      const tuiles = screen.getByRole("heading", { level: 2, name: "Explorer les formations par famille" });
      expect(suit(liste, tuiles)).toBe(true);
      // Jamais d'ordre visuel distinct de l'ordre du HTML (RGAA 10.3).
      const classesOrder = Array.from(container.querySelectorAll("[class]"))
        .flatMap((e) => Array.from(e.classList))
        .filter((c) => /^([a-z0-9]+:)*-?order-/.test(c));
      expect(classesOrder).toEqual([]);
    },
  );
});

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
    expect(within(section).getAllByRole("link", { name: "Découvrir" })).toHaveLength(4);
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

describe("/formations — filtres sur une ligne défilante (Story 4.7)", () => {
  it("défilent dans leur propre conteneur sur smartphone, sur plusieurs lignes dès sm", async () => {
    await renderCatalogue();
    const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
    const liens = within(nav).getAllByRole("link");
    const rangee = liens[0].parentElement!;
    liens.forEach((lien) => expect(lien.parentElement).toBe(rangee));
    expect(rangee).toHaveClass("flex", "overflow-x-auto", "sm:flex-wrap", "sm:overflow-x-visible");
    liens.forEach((lien) => {
      // Mesuré à 320 px : en whitespace-nowrap, « Dynamique d'équipe et
      // développement professionnel » (369 px) dépassait la rangée (288 px)
      // et ne pouvait jamais être vu en entier. Largeur bornée, libellé à la
      // ligne dans le filtre.
      expect(lien).toHaveClass("rounded-md", "shrink-0", "max-w-60", "whitespace-normal", "sm:max-w-none", "sm:shrink");
      expect(lien).not.toHaveClass("whitespace-nowrap");
      expect(lien).not.toHaveClass("rounded-full");
    });
  });

  it("signalent la suite par un fondu décoratif au bord droit, absent dès sm", async () => {
    await renderCatalogue();
    const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
    const fondu = nav.querySelector("[data-fondu]")!;
    expect(fondu).toHaveAttribute("aria-hidden", "true");
    expect(fondu).toHaveClass("pointer-events-none", "bg-linear-to-l", "from-white", "sm:hidden");
  });
});

describe("/formations — H1 réduit sur smartphone (Story 4.7)", () => {
  it("passe le H1 en text-3xl! sur smartphone, sans toucher au desktop ni au texte", async () => {
    await renderCatalogue();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent("Formations professionnelles");
    expect(h1).toHaveClass("text-3xl!", "sm:text-5xl!", "lg:text-6xl!", "break-words");
    expect(h1).not.toHaveClass("text-4xl!", "hyphens-auto");
  });
});

// Mesuré à 320 px : Chrome ne fait défiler la rangée au focus que si le
// filtre est entièrement caché ; un filtre à moitié visible restait masqué
// sous le bord ou le fondu. La rangée l'amène en entier à l'écran.
describe("/formations — filtres visibles au clavier (Story 4.7)", () => {
  it("fait défiler la rangée pour montrer en entier le filtre qui reçoit le focus", async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    await renderCatalogue();
    const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
    const lien = within(nav).getByRole("link", { name: "Accompagnement et pratiques professionnelles" });
    fireEvent.focus(lien);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
    expect(scrollIntoView.mock.contexts[0]).toBe(lien);
    expect(lien.parentElement).toHaveClass("scroll-pr-10", "scroll-pl-1");
    // L'anneau de focus (2 px + 2 px de décalage) n'est pas rogné par la
    // rangée : 4 px de marge, compensés par le conteneur pour l'alignement.
    expect(lien.parentElement).toHaveClass("py-1", "px-1");
    expect(lien.parentElement!.parentElement).toHaveClass("relative", "-mx-1");
  });
});

// Mesuré à 390 px : sur /formations?famille=prevention…, le filtre actif était
// hors de l'écran, à droite ; on ne voyait pas quel filtre s'appliquait.
describe("/formations — filtre actif visible au chargement (Story 4.7)", () => {

  it("fait défiler la rangée jusqu'au filtre actif s'il dépasse à droite", async () => {
    const offsetLeft = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft");
    const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");
    const clientWidth = Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth");
    // Géométrie à 390 px : rangée de 358 px, filtre actif à 330 px du bord.
    Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
      configurable: true,
      get(this: HTMLElement) { return this.getAttribute("aria-current") === "page" ? 330 : 0; },
    });
    Object.defineProperty(HTMLElement.prototype, "offsetWidth", { configurable: true, get: () => 220 });
    Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, get: () => 358 });
    try {
      await renderCatalogue("prevention-rps-qvct-etablissements-sante");
      const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
      const actif = within(nav).getByRole("link", { name: "Prévention des RPS et QVCT" });
      expect(actif.parentElement!.scrollLeft).toBe(330);
    } finally {
      Object.defineProperty(HTMLElement.prototype, "offsetLeft", offsetLeft!);
      Object.defineProperty(HTMLElement.prototype, "offsetWidth", offsetWidth!);
      Object.defineProperty(Element.prototype, "clientWidth", clientWidth!);
    }
  });

  it("ne bouge pas la rangée si le filtre actif est déjà visible", async () => {
    await renderCatalogue();
    const nav = screen.getByRole("navigation", { name: "Filtre par catégorie" });
    expect(within(nav).getByRole("link", { name: "Toutes" }).parentElement!.scrollLeft).toBe(0);
  });
});
