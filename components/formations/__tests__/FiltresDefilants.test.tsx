import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FiltresDefilants } from "../FiltresDefilants";

// Story 4.7 (revue) : jsdom ne calcule aucune géométrie. On la simule : la
// rangée mesure 300 px de large, chaque filtre porte sa position (data-x,
// mesurée depuis la rangée, positionnée) et sa largeur (data-w). jsdom ne
// calcule pas la marge intérieure (0) : « A » commence donc à 0.
const LARGEUR_RANGEE = 300;
const descripteurs = {
  offsetLeft: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft")!,
  offsetWidth: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth")!,
  clientWidth: Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth")!,
  scrollLeft: Object.getOwnPropertyDescriptor(Element.prototype, "scrollLeft")!,
};
let ecritScroll: ReturnType<typeof vi.fn<(valeur: number) => void>>;
const positions = new WeakMap<Element, number>();

beforeEach(() => {
  ecritScroll = vi.fn<(valeur: number) => void>();
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get(this: HTMLElement) { return Number(this.dataset.x ?? 0); },
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    get(this: HTMLElement) { return Number(this.dataset.w ?? 0); },
  });
  Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, get: () => LARGEUR_RANGEE });
  Object.defineProperty(Element.prototype, "scrollLeft", {
    configurable: true,
    get(this: Element) { return positions.get(this) ?? 0; },
    set(this: Element, valeur: number) { ecritScroll(valeur); positions.set(this, valeur); },
  });
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  Object.entries(descripteurs).forEach(([cle, d]) =>
    Object.defineProperty(cle === "offsetLeft" || cle === "offsetWidth" ? HTMLElement.prototype : Element.prototype, cle, d),
  );
});

// Trois filtres : « A » visible au début, « B » coupé au bord droit, « C »
// entièrement caché à droite.
function rangee(actif: string) {
  return (
    <FiltresDefilants actif={actif}>
      {[["A", 0, 80], ["B", 88, 240], ["C", 336, 240]].map(([nom, x, w]) => (
        <a key={nom} href={`#${nom}`} data-x={x} data-w={w} aria-current={actif === nom ? "page" : undefined}>
          {nom}
        </a>
      ))}
    </FiltresDefilants>
  );
}

describe("FiltresDefilants — focus", () => {
  it("amène en entier à l'écran le filtre qui reçoit le focus au clavier", () => {
    render(rangee("A"));
    const b = screen.getByRole("link", { name: "B" });
    fireEvent.focus(b);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalledWith({ block: "nearest", inline: "nearest" });
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(b);
  });

  // Revue : au clic souris, le défilement déclenché par le focus (mousedown)
  // déplaçait le filtre avant le mouseup ; le clic tombait sur la rangée et
  // le filtre ne s'appliquait pas.
  it("ne fait pas défiler la rangée quand le focus vient d'un clic ou d'un toucher", () => {
    render(rangee("A"));
    const b = screen.getByRole("link", { name: "B" });
    fireEvent.pointerDown(b);
    fireEvent.focus(b);
    expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
  });

  it("reprend le défilement au focus clavier après un clic", () => {
    render(rangee("A"));
    const [a, b, c] = ["A", "B", "C"].map((nom) => screen.getByRole("link", { name: nom }));
    fireEvent.pointerDown(a);
    fireEvent.focus(a);
    fireEvent.click(a);
    fireEvent.focus(c);
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toEqual([c]);
    // Un appui sur la rangée hors d'un filtre ne neutralise pas le clavier.
    fireEvent.pointerDown(a.parentElement!);
    fireEvent.click(a.parentElement!);
    fireEvent.focus(b);
    expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts).toEqual([c, b]);
  });
});

describe("FiltresDefilants — filtre actif", () => {
  it("se mesure depuis la rangée elle-même (positionnée), quel que soit son défilement", () => {
    render(rangee("A"));
    expect(screen.getByRole("link", { name: "A" }).parentElement).toHaveClass("relative");
  });

  it("ne touche pas au défilement si le filtre actif est déjà visible", () => {
    render(rangee("A"));
    expect(ecritScroll).not.toHaveBeenCalled();
  });

  it.each([["B", 88], ["C", 336]])(
    "amène au début de la rangée le filtre actif %s qui dépasse à droite (ou sous le fondu)",
    (actif, x) => {
      render(rangee(actif));
      expect(ecritScroll).toHaveBeenLastCalledWith(x);
    },
  );

  // Revue : le composant survit à une navigation <Link> (Retour navigateur) ;
  // le filtre actif peut alors être caché à gauche.
  it("se recale quand le filtre actif change, y compris s'il est caché à gauche", () => {
    const { rerender } = render(rangee("C"));
    expect(ecritScroll).toHaveBeenLastCalledWith(336);
    rerender(rangee("A"));
    expect(ecritScroll).toHaveBeenLastCalledWith(0);
  });
});
