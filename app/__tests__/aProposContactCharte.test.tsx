import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/contact-form/action", () => ({
  submit_contact_form: vi.fn(),
}));

import About, { metadata as metaAPropos } from "../a-propos/page";
import ContactPage, { metadata as metaContact } from "../contact/page";

import { expectH1StyleGlobal } from "./outils/h1";

// Story 4.9 : /a-propos et /contact dans la charte des slides, sans toucher
// au SEO (UX-DR6) : title, description, H1, sous-titres, textes, alt et URL
// inchangés ; un seul titre ajouté (bandeau « Mon parcours », validé par
// Cédric le 2026-11-02).
const root = join(__dirname, "..", "..");
const source = (chemin: string) => readFileSync(join(root, chemin), "utf8");

function sansSaut(container: HTMLElement) {
  const n = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
  expect(n[0]).toBe(1);
  expect(n.filter((niveau) => niveau === 1)).toHaveLength(1);
  n.forEach((niveau, i) => {
    if (i > 0) expect(niveau - n[i - 1]).toBeLessThanOrEqual(1);
  });
}

// Gris sous le seuil de la charte (stone-500 et plus clair) : interdits.
const GRIS_TROP_CLAIR = /\b(?:text|border)-stone-(?:[1-5]00|50)\b/;

async function renderContact(searchParams: { type?: string; sujet?: string } = {}) {
  const jsx = await ContactPage({ searchParams: Promise.resolve(searchParams) });
  return render(jsx);
}

describe("/a-propos — SEO inchangé (UX-DR6)", () => {
  it("garde le title et la description", () => {
    expect(metaAPropos.title).toBe("À propos – Coach certifiée à Toulouse");
    expect(metaAPropos.description).toMatch(/^Découvrez le parcours de Coralie Mathorel, ancienne soignante/);
    expect(metaAPropos.alternates?.canonical).toBe("/a-propos");
  });

  it("garde le H1, le sous-titre et l'alt de la photo", () => {
    render(<About />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Coralie Mathorel – Coach certifiée à Toulouse");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Ancienne soignante, j'accompagne aujourd'hui la santé de ceux qui soignent.",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByAltText("Coralie Mathorel, coach professionnelle certifiée et ancienne soignante, à Toulouse"),
    ).toBeInTheDocument();
  });

  it("ne surcharge pas la règle h1 globale", () => {
    render(<About />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expectH1StyleGlobal(h1);
  });

  it("garde une hiérarchie Hn sans saut", () => {
    const { container } = render(<About />);
    sansSaut(container);
  });
});

describe("/a-propos — charte des slides", () => {
  it("ouvre la biographie sur un bandeau h2 « Mon parcours » (titre ajouté, validé)", () => {
    render(<About />);
    const titre = screen.getByRole("heading", { level: 2, name: "Mon parcours" });
    expect(titre.closest(".bg-petrol")).not.toBeNull();
  });

  it("présente la photo en médaillon rond, sans ombre ni valeur arbitraire", () => {
    render(<About />);
    const photo = screen.getByAltText(/^Coralie Mathorel, coach professionnelle/);
    expect(photo.className).toContain("rounded-full");
    expect(photo.className).not.toMatch(/shadow|-\[/);
  });

  it("met « Accompagnement humain. » en annotation manuscrite (Kalam)", () => {
    render(<About />);
    expect(screen.getByText(/Accompagnement humain\./).className).toContain("font-hand");
  });

  it("passe les encarts « 10+ » et « Coach » en cartes pastel alternées, libellés en stone-600", () => {
    render(<About />);
    const dix = screen.getByText("10+").closest(".rounded-3xl");
    const coach = screen.getByText("Coach", { selector: "span" }).closest(".rounded-3xl");
    expect(dix?.className).toContain("bg-sky");
    expect(coach?.className).toContain("bg-peach");
    expect(screen.getByText("Années d'expérience").className).toContain("text-stone-600");
    expect(screen.getByText("Certifiée d'État").className).toContain("text-stone-600");
  });

  it("met la phrase finale dans un message clé, texte inchangé", () => {
    render(<About />);
    expect(screen.getByRole("note", { name: "À retenir" })).toHaveTextContent(
      "Former, accompagner, soutenir dans la durée : c'est le fil conducteur de mon engagement professionnel.",
    );
  });

  it("ne justifie plus les paragraphes et n'utilise aucun gris trop clair", () => {
    const { container } = render(<About />);
    expect(container.innerHTML).not.toContain("text-justify");
    expect(container.innerHTML).not.toMatch(GRIS_TROP_CLAIR);
  });

  it("n'a ni classe invalide ni valeur arbitraire, ni grand blanc avant le CTA final", () => {
    const page = source("app/a-propos/page.tsx");
    expect(page).not.toContain("grid-cols-&");
    expect(page).not.toMatch(/\b[\w:-]+-\[[^\]]+\]/);
    const { container } = render(<About />);
    expect(container.querySelector("#apropos")?.className).not.toContain("mb-40");
  });
});

describe("/contact — SEO inchangé (UX-DR6)", () => {
  it("garde le title et la description", () => {
    expect(metaContact.title).toBe("Contact – Parlons de vos besoins");
    expect(metaContact.description).toMatch(/^Contactez Élan C'est Vous pour discuter de vos besoins/);
    expect(metaContact.alternates?.canonical).toBe("/contact");
  });

  it("garde le H1, le sous-titre et une hiérarchie sans saut", async () => {
    const { container } = await renderContact();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Parlons de vos besoins");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Un premier échange pour comprendre votre situation et définir ensemble la réponse la plus adaptée.",
      }),
    ).toBeInTheDocument();
    sansSaut(container);
  });
});

describe("/contact — charte des slides", () => {
  it("remonte le formulaire sur smartphone (pt-6 sm:pt-20)", async () => {
    const { container } = await renderContact();
    const section = container.querySelector("#contact")!;
    expect(section.className).toContain("pt-6");
    expect(section.className).toContain("sm:pt-20");
  });

  it("pose le formulaire dans une carte ciel, sans ombre ni gris hors palette", async () => {
    const { container } = await renderContact();
    const carte = container.querySelector("form")!.closest(".rounded-3xl");
    expect(carte?.className).toContain("bg-sky");
    expect(carte?.className).not.toMatch(/shadow|bg-stone/);
  });

  it("souligne le lien téléphone en orange foncé (distinct du texte)", async () => {
    await renderContact();
    const tel = screen.getByRole("link", { name: "06 95 99 19 22" });
    expect(tel).toHaveAttribute("href", "tel:+33695991922");
    expect(tel.className).toMatch(/(^|\s)underline(\s|$)/);
    expect(tel.className).toContain("text-accent");
  });

  it("n'utilise aucun gris trop clair (page et formulaire)", async () => {
    const { container } = await renderContact();
    expect(container.innerHTML).not.toMatch(GRIS_TROP_CLAIR);
    expect(container.innerHTML).not.toMatch(/[\s"]opacity-70[\s"]/);
  });

  it("garde le pré-remplissage ?type=&sujet=", async () => {
    await renderContact({ type: "institution", sujet: "Coaching en établissement" });
    expect(screen.getByRole("radio", { name: /établissement.*drh/i })).toBeChecked();
    expect(screen.getByLabelText(/exprimez votre besoin/i)).toHaveValue("Coaching en établissement");
  });

  it("n'a plus le bloc commenté de prise de rendez-vous", () => {
    expect(source("app/contact/page.tsx")).not.toContain("échange de 15 min");
  });
});

describe("Formulaire de contact — charte et contrastes", () => {
  // Story 4.12 : le bouton reste actif même formulaire incomplet (l'envoi
  // affiche les erreurs) ; il n'est désactivé que pendant « Envoi… », où le
  // fond stone-600 opaque garde le libellé lisible.
  it("envoie avec le bouton orange foncé, actif, désactivé lisible pendant l'envoi (fond stone-600 opaque)", async () => {
    await renderContact();
    const bouton = screen.getByRole("button", { name: "Envoyer ma demande" });
    expect(bouton).toBeEnabled();
    expect(bouton.className).toContain("bg-accent");
    expect(bouton.className).toContain("disabled:bg-stone-600");
    expect(bouton.className).toContain("disabled:opacity-100");
    expect(bouton.className).not.toMatch(/shadow-lg|hover:bg-accent/);
    // Conflits résolus par tailwind-merge : la base du bouton ne doit pas subsister.
    const classes = bouton.className.split(/\s+/);
    expect(classes).not.toContain("disabled:opacity-50");
    expect(classes).not.toContain("h-10");
  });

  it("borde les champs en stone-600 sur fond blanc (≥ 3:1, WCAG 1.4.11)", async () => {
    await renderContact();
    for (const champ of [
      screen.getByRole("textbox", { name: "Prénom" }),
      screen.getByRole("textbox", { name: "Nom" }),
      screen.getByRole("textbox", { name: /adresse email/i }),
      screen.getByRole("textbox", { name: /exprimez votre besoin/i }),
    ]) {
      expect(champ.className).toContain("border-stone-600");
      expect(champ.className).toContain("bg-white");
    }
  });

  // Revue story 4.9 : `ring-ring` ne génère rien (pas de --color-ring) ; avec
  // des bordures sombres, le focus devenait à peine perceptible (RGAA 10.7).
  it("affiche un focus net (anneau bleu nuit détaché) sur les champs et les radios", async () => {
    await renderContact();
    for (const element of [
      screen.getByRole("textbox", { name: "Prénom" }),
      screen.getByRole("textbox", { name: /exprimez votre besoin/i }),
      screen.getByRole("radio", { name: /particulier/i }),
    ]) {
      const classes = element.className.split(/\s+/);
      expect(classes).toEqual(
        expect.arrayContaining(["focus-visible:ring-2", "focus-visible:ring-primary", "focus-visible:ring-offset-2"]),
      );
      expect(classes).not.toContain("focus-visible:ring-ring");
    }
  });

  it("contourne les boutons radio en bleu nuit et place leur aide sous le libellé", async () => {
    await renderContact();
    const radio = screen.getByRole("radio", { name: /particulier/i });
    expect(radio.className).toContain("border-primary");
    expect(radio.className).not.toContain("red-200");
    const aide = screen.getByText("Equilibre vie pro/perso, Confiance en soi, Stress");
    expect(aide.className).toContain("text-stone-600");
    expect(aide.closest("label")?.className).toContain("flex-col");
  });
});
