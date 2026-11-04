import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/contact-form/action", () => ({
  submit_contact_form: vi.fn(),
}));

import ContactPage from "../contact/page";

// Refonte visuelle de /contact dans la charte des slides (validée par Cédric
// le 2026-11-04) : formulaire découpé en 3 étapes numérotées, cartes de type
// de projet illustrées, bouton plus affirmé, et section ajoutée « Comment se
// passe le premier échange ? » (Steps) sous le formulaire.
const root = join(__dirname, "..", "..");
const source = (chemin: string) => readFileSync(join(root, chemin), "utf8");

async function renderContact() {
  const jsx = await ContactPage({ searchParams: Promise.resolve({}) });
  return render(jsx);
}

describe("/contact — formulaire en 3 étapes", () => {
  it.each([
    ["Votre projet", "1", "bg-accent"],
    ["Vos coordonnées", "2", "bg-petrol"],
    ["Votre message", "3", "bg-primary"],
  ])(
    "annonce l'étape « %s » par une pastille numérotée %s (%s), en légende de groupe et non en titre",
    async (libelle, numero, fond) => {
      await renderContact();
      // fieldset + legend : le lecteur d'écran annonce l'étape en entrant
      // dans ses champs (RGAA 11.5 / 11.6), sans toucher au plan Hn.
      expect(screen.getByRole("group", { name: libelle })).toBeInTheDocument();
      const etape = screen.getByText(libelle, { selector: "form legend" });
      const pastille = within(etape).getByText(numero);
      expect(pastille).toHaveAttribute("aria-hidden", "true");
      expect(pastille.className).toContain("rounded-full");
      expect(pastille.className).toContain(fond);
      expect(
        screen.queryByRole("heading", { name: libelle }),
      ).not.toBeInTheDocument();
    },
  );

  it("regroupe les coordonnées et le message sous leur étape", async () => {
    await renderContact();
    const coordonnees = screen.getByRole("group", { name: "Vos coordonnées" });
    for (const nom of ["Prénom", "Nom", /adresse email/i]) {
      expect(within(coordonnees).getByRole("textbox", { name: nom })).toBeInTheDocument();
    }
    expect(
      within(screen.getByRole("group", { name: "Votre message" })).getByRole("textbox", {
        name: /exprimez votre besoin/i,
      }),
    ).toBeInTheDocument();
  });

  it("garde les libellés existants du formulaire", async () => {
    await renderContact();
    expect(screen.getByText("Vous me contactez pour :")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /exprimez votre besoin/i }),
    ).toBeInTheDocument();
  });

  it("illustre chaque carte de type de projet d'une icône décorative, sans ombre", async () => {
    await renderContact();
    for (const nom of [/établissement.*drh/i, /particulier/i]) {
      const carte = screen.getByRole("radio", { name: nom }).closest("[data-slot=field]")!;
      expect(carte.className).not.toMatch(/shadow/);
      // Bord visible sur le ciel (stone-600 ≥ 3:1) ; la sélection ajoute un
      // anneau bleu nuit, distinct du simple survol.
      expect(carte.className).toContain("border-stone-600");
      expect(carte.className).toContain("has-[[data-state=checked]]:ring-2");
      expect(carte.className).toContain("has-[[data-state=checked]]:ring-primary");
      expect(carte.className).not.toContain("hover:border-stone-600");
      const icone = carte.querySelector("svg[aria-hidden=true]");
      expect(icone).not.toBeNull();
    }
  });

  it("agrandit les champs (h-12, texte de base)", async () => {
    await renderContact();
    for (const nom of ["Prénom", "Nom"]) {
      const champ = screen.getByRole("textbox", { name: nom });
      expect(champ.className).toContain("h-12");
      expect(champ.className).toContain("text-base");
    }
  });

  it("affirme le bouton d'envoi (Nunito extra-gras, flèche décorative sans mouvement imposé)", async () => {
    await renderContact();
    const bouton = screen.getByRole("button", { name: "Envoyer ma demande" });
    expect(bouton.className).toContain("font-display");
    expect(bouton.className).toContain("rounded-md");
    expect(bouton.className).not.toContain("rounded-full");
    const fleche = bouton.querySelector("svg[aria-hidden=true]");
    expect(fleche).not.toBeNull();
    expect(fleche!.getAttribute("class")).toContain(
      "motion-safe:group-hover:translate-x-1",
    );
    // Même taille que l'icône de confirmation (size-4, base du bouton).
    expect(fleche!.getAttribute("class")).toContain("size-4");
  });
});

describe("/contact — section « Comment se passe le premier échange ? »", () => {
  it("ajoute un h2 suivi de 3 étapes en h3, après le formulaire", async () => {
    const { container } = await renderContact();
    const titre = screen.getByRole("heading", {
      level: 2,
      name: /comment se passe le premier échange/i,
    });
    const form = container.querySelector("form")!;
    expect(
      form.compareDocumentPosition(titre) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    const etapes = within(titre.parentElement!).getAllByRole("listitem");
    expect(etapes).toHaveLength(3);
    expect(
      etapes.map((li) => within(li).getByRole("heading", { level: 3 }).textContent),
    ).toEqual(["Vous m'écrivez", "Je vous recontacte", "On construit ensemble"]);
  });
});

describe("/contact — décor et charte", () => {
  it("pose une étincelle décorative au coin de la carte, masquée sur smartphone", async () => {
    const { container } = await renderContact();
    const carte = container.querySelector("form")!.closest(".rounded-3xl")!;
    const etincelle = carte.parentElement!.querySelector(
      ":scope > svg[aria-hidden=true]",
    );
    expect(etincelle).not.toBeNull();
    expect(etincelle!.getAttribute("class")).toMatch(/(^|\s)hidden(\s|$)/);
    expect(etincelle!.getAttribute("class")).toContain("lg:block");
  });

  it("n'introduit aucune valeur arbitraire dans la page", () => {
    expect(source("app/contact/page.tsx")).not.toMatch(/\b[\w:-]+-\[[^\]]+\]/);
  });
});
