import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Navbar from "@/components/Navbar";

import manifest from "../manifest";

// Cédric, 2026-11-03 : barre du navigateur en pétrole (#015566, couleur des
// bandeaux et du pied de page). Safari iOS 26 ignore theme-color et teinte sa
// barre d'après le haut de la page : le menu, sticky, prend donc un fond
// pétrole plein (plus de flou transparent), texte et icônes en blanc.
const PETROLE = "#015566";
const root = join(__dirname, "..", "..");

describe("Couleur du navigateur", () => {
  it("déclare theme-color pétrole dans le viewport du layout", () => {
    const layout = readFileSync(join(root, "app/layout.tsx"), "utf8");
    expect(layout).toMatch(new RegExp(`themeColor:\\s*"${PETROLE}"`));
  });

  it("déclare theme_color pétrole dans le manifeste", () => {
    expect(manifest().theme_color).toBe(PETROLE);
  });

  it("PETROLE est bien le token --color-petrol de la charte", () => {
    const css = readFileSync(join(root, "app/globals.css"), "utf8");
    expect(css).toMatch(new RegExp(`--color-petrol:\\s*${PETROLE};`));
  });
});

// Revue : le menu opaque masquerait un élément qui reçoit le focus en haut de
// l'écran (WCAG 2.4.11) ou un titre visé par une ancre. Le défilement réserve
// la hauteur du menu (≈ 80 px sur smartphone, ≈ 92 px sur ordinateur).
describe("Rien ne se cache sous le menu opaque", () => {
  it("réserve la hauteur du menu en haut de chaque défilement", () => {
    const css = readFileSync(join(root, "app/globals.css"), "utf8");
    const html = css.match(/\nhtml\s*\{([^}]*)\}/)?.[1] ?? "";
    const valeur = html.match(/scroll-padding-top:\s*([\d.]+)rem/)?.[1];
    expect(Number(valeur)).toBeGreaterThanOrEqual(6);
  });
});

describe("Menu sur fond pétrole plein", () => {
  it("pose un fond pétrole opaque, sans flou transparent", () => {
    const { container } = render(<Navbar />);
    const header = container.querySelector("header")!;
    expect(header).toHaveClass("bg-petrol");
    expect(header.className).not.toMatch(/backdrop-blur|bg-\w+\/\d+/);
  });

  it("écrit le nom, les liens et l'icône du menu en blanc (≥ 4.5:1 sur pétrole)", () => {
    render(<Navbar />);
    const barre = screen.getByRole("navigation", { name: "Global" });
    for (const lien of within(barre).getAllByRole("link")) {
      expect(lien.className).not.toMatch(/\btext-primary\b/);
    }
    expect(within(barre).getByRole("link", { name: /élan c.est vous/i })).toHaveClass("text-white");
    expect(within(barre).getByRole("link", { name: "Formations" })).toHaveClass("text-white");
    const bouton = within(barre).getByRole("button");
    expect(bouton.querySelector("svg")).toHaveClass("text-white");
  });

  it("passe le bouton Particuliers en variante pour fond sombre", () => {
    render(<Navbar />);
    const barre = screen.getByRole("navigation", { name: "Global" });
    const cta = within(barre).getByRole("link", { name: "Particuliers" });
    expect(cta).toHaveClass("border-white", "text-white");
    expect(cta).not.toHaveClass("bg-background");
  });

  it("garde un focus visible en blanc sur le pétrole", () => {
    render(<Navbar />);
    const barre = screen.getByRole("navigation", { name: "Global" });
    for (const element of [...within(barre).getAllByRole("link"), within(barre).getByRole("button")]) {
      expect(element.className).toMatch(/focus-visible:(?:outline|ring)-white/);
    }
  });
});
