import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button, buttonVariants } from "../button";

// FR12 : un seul système de bouton secondaire teinté, réutilisé sur toutes
// les surfaces de découverte (tuiles home, cartes catalogue, cartes hub
// Famille) — jamais un lien texte nu, jamais un fond invisible façon
// `outline`. Deux variantes du même registre visuel : `tinted` sur fond clair
// (texte/contour primary, fond primary légèrement teinté), `tintedOnDark`
// sur fond navy (texte/contour blancs, fond blanc légèrement teinté) — cf.
// tuile Coaching. Contrastes vérifiés par calcul WCAG (pas de lib
// axe-core dans ce dépôt) : navy #112e40 sur fond ~blanc (teinte 10%
// primary) ≈ 12.7:1 ; blanc sur fond ~navy (teinte 10% blanc sur #112e40)
// ≈ 10.4:1 — les deux largement au-dessus du seuil 4.5:1 (NFR2).
describe("Button — variant tinted (CTA secondaire, FR12)", () => {
  it("renders a real button element, never a styled link-only span", () => {
    render(<Button variant="tinted">Découvrir</Button>);
    expect(screen.getByRole("button", { name: "Découvrir" })).toBeInTheDocument();
  });

  it("applies a tinted fill with the primary border/text on a light surface", () => {
    render(<Button variant="tinted">Découvrir</Button>);
    const button = screen.getByRole("button", { name: "Découvrir" });
    expect(button.className).toContain("border-primary");
    expect(button.className).toContain("bg-primary/10");
    expect(button.className).toContain("text-primary");
  });

  it("applies a tinted fill with the white border/text for a dark (navy) surface", () => {
    render(<Button variant="tintedOnDark">Découvrir</Button>);
    const button = screen.getByRole("button", { name: "Découvrir" });
    expect(button.className).toContain("border-white");
    expect(button.className).toContain("bg-white/10");
    expect(button.className).toContain("text-white");
  });

  it("never uses rounded-full (registre pill déjà rejeté deux fois cette session)", () => {
    render(
      <>
        <Button variant="tinted">Découvrir</Button>
        <Button variant="tintedOnDark">Découvrir</Button>
      </>,
    );
    for (const button of screen.getAllByRole("button", { name: "Découvrir" })) {
      expect(button.className).not.toContain("rounded-full");
      expect(button.className).toContain("rounded-md");
    }
  });

  it("keeps the tinted variants on the default Tailwind spacing/size scale (no arbitrary value)", () => {
    const classes = [
      buttonVariants({ variant: "tinted" }),
      buttonVariants({ variant: "tintedOnDark" }),
    ].join(" ");
    // Valeur Tailwind arbitraire = un tiret suivi d'un crochet (ex. px-[13px]) ;
    // exclut les sélecteurs arbitraires légitimes comme [&_svg]:size-4.
    expect(classes).not.toMatch(/-\[[^\]]+\]/);
  });
});

// Charte slides : orange foncé (accent-ink) sous le texte blanc des boutons.
// L'orange accent ne fait que ≈ 3.5:1 avec le blanc, insuffisant pour du
// texte en text-sm (4.5:1 requis) ; accent-ink ≈ 5.7:1.
describe("Button — boutons orange lisibles (contraste)", () => {
  it("la variante accent utilise l'orange foncé, jamais l'orange accent", () => {
    render(<Button variant="accent">Prendre contact</Button>);
    const classes = screen.getByRole("button", { name: "Prendre contact" }).className.split(/\s+/);
    expect(classes).toContain("bg-accent-ink");
    expect(classes).not.toContain("bg-accent");
  });

  it("le survol de la variante ghost passe aussi en orange foncé", () => {
    const classes = buttonVariants({ variant: "ghost" }).split(/\s+/);
    expect(classes).toContain("hover:bg-accent-ink");
    expect(classes).not.toContain("hover:bg-accent");
  });
});

