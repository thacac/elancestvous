import { readFileSync } from "node:fs";
import { join } from "node:path";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../action", () => ({
  submit_contact_form: vi.fn(),
}));

import { submit_contact_form } from "../action";
import ContactForm from "../ContactForm";

// Story 4.12 (validée par Cédric le 2026-11-02) : les erreurs du formulaire
// n'étaient jamais visibles (bouton désactivé tant que le formulaire est
// invalide, validation à l'envoi seulement). Décisions : bouton toujours
// actif, erreurs dès la sortie d'un champ (mode onTouched) et à l'envoi,
// focus sur le premier champ en erreur ; erreurs en `accent` précédées d'une
// icône décorative ; exemples sans prénom ni nom, préfixés « ex. : » ailleurs.

const champ = {
  prenom: () => screen.getByRole("textbox", { name: "Prénom" }),
  nom: () => screen.getByRole("textbox", { name: "Nom" }),
  email: () => screen.getByRole("textbox", { name: /adresse email/i }),
  message: () => screen.getByRole("textbox", { name: /exprimez votre besoin/i }),
};

function quitter(element: HTMLElement, valeur?: string) {
  fireEvent.focus(element);
  if (valeur !== undefined) fireEvent.change(element, { target: { value: valeur } });
  fireEvent.blur(element);
}

// Vérifie qu'un champ est en erreur avec exactement ce message, relié par
// aria-describedby, en couleur de la charte et avec un repère non coloré.
function attendreErreur(element: HTMLElement, texte: string) {
  expect(element).toHaveAttribute("aria-invalid", "true");
  const messages = screen.getAllByText(texte);
  expect(messages).toHaveLength(1);
  const message = messages[0].closest("p")!;
  const ids = (element.getAttribute("aria-describedby") ?? "").split(/\s+/);
  expect(ids).toContain(message.id);
  expect(message.className).toContain("text-accent");
  const icone = message.querySelector("svg");
  expect(icone).not.toBeNull();
  expect(icone).toHaveAttribute("aria-hidden", "true");
}

beforeEach(() => {
  vi.mocked(submit_contact_form).mockReset();
});

describe("ContactForm — erreurs visibles dès la sortie d'un champ (Story 4.12)", () => {
  it("affiche « Le prénom est requis » en quittant le prénom vide", async () => {
    render(<ContactForm />);
    quitter(champ.prenom());
    await waitFor(() => attendreErreur(champ.prenom(), "Le prénom est requis"));
  });

  it("affiche « Le nom est requis » en quittant le nom vide", async () => {
    render(<ContactForm />);
    quitter(champ.nom());
    await waitFor(() => attendreErreur(champ.nom(), "Le nom est requis"));
  });

  it("affiche l'erreur propre à l'e-mail, jamais celle du nom", async () => {
    render(<ContactForm />);
    quitter(champ.email(), "pasunmail");
    await waitFor(() => attendreErreur(champ.email(), "L'email n'est pas valide"));
    expect(screen.queryByText("Le nom est requis")).not.toBeInTheDocument();
  });

  it("affiche « L'email est requis » en quittant l'e-mail vide", async () => {
    render(<ContactForm />);
    quitter(champ.email());
    await waitFor(() => attendreErreur(champ.email(), "L'email est requis"));
  });

  it("affiche « Le message est requis » en quittant le message vide", async () => {
    render(<ContactForm />);
    quitter(champ.message());
    await waitFor(() => attendreErreur(champ.message(), "Le message est requis"));
  });

  it("signale un message de plus de 2000 caractères", async () => {
    render(<ContactForm />);
    quitter(champ.message(), "a".repeat(2001));
    await waitFor(() =>
      attendreErreur(champ.message(), "Le message ne peut pas dépasser 2000 caractères")
    );
  });

  it("efface l'erreur dès que le champ est corrigé", async () => {
    render(<ContactForm />);
    quitter(champ.prenom());
    await screen.findByText("Le prénom est requis");
    fireEvent.change(champ.prenom(), { target: { value: "Jean" } });
    await waitFor(() => {
      expect(screen.queryByText("Le prénom est requis")).not.toBeInTheDocument();
      expect(champ.prenom()).toHaveAttribute("aria-invalid", "false");
    });
  });

  it("ne relie aucun champ à un identifiant absent de la page", async () => {
    const { container } = render(<ContactForm />);
    const verifier = () =>
      container.querySelectorAll("[aria-describedby]").forEach((el) => {
        el.getAttribute("aria-describedby")!
          .split(/\s+/)
          .forEach((id) => expect(document.getElementById(id)).not.toBeNull());
      });
    verifier();
    quitter(champ.nom());
    await screen.findByText("Le nom est requis");
    verifier();
    // Un champ sans erreur n'a pas de description fantôme.
    expect(champ.prenom()).not.toHaveAttribute("aria-describedby");
  });
});

describe("ContactForm — envoi d'un formulaire incomplet (Story 4.12)", () => {
  it("garde le bouton actif avec « Envoyer ma demande » quand le formulaire est vide", () => {
    render(<ContactForm />);
    const bouton = screen.getByRole("button", { name: "Envoyer ma demande" });
    expect(bouton).toBeEnabled();
    expect(screen.queryByText(/remplissez le formulaire pour envoyer/i)).not.toBeInTheDocument();
  });

  it("affiche toutes les erreurs, place le focus sur le premier champ en erreur et n'envoie rien", async () => {
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

    await waitFor(() => {
      attendreErreur(champ.prenom(), "Le prénom est requis");
      attendreErreur(champ.nom(), "Le nom est requis");
      attendreErreur(champ.email(), "L'email est requis");
      attendreErreur(champ.message(), "Le message est requis");
    });
    await waitFor(() => expect(champ.prenom()).toHaveFocus());
    expect(submit_contact_form).not.toHaveBeenCalled();
  });

  it("place le focus sur le premier champ en erreur, pas forcément le prénom", async () => {
    render(<ContactForm />);
    fireEvent.change(champ.prenom(), { target: { value: "Jean" } });
    fireEvent.change(champ.nom(), { target: { value: "Dupont" } });
    fireEvent.change(champ.email(), { target: { value: "pasunmail" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer ma demande" }));

    await waitFor(() => expect(champ.email()).toHaveFocus());
    expect(submit_contact_form).not.toHaveBeenCalled();
  });
});

describe("ContactForm — exemples distincts des valeurs saisies (Story 4.12)", () => {
  it("n'affiche plus de prénom ni de nom en exemple", () => {
    render(<ContactForm />);
    expect(champ.prenom()).not.toHaveAttribute("placeholder");
    expect(champ.nom()).not.toHaveAttribute("placeholder");
  });

  it("préfixe les exemples de l'e-mail et du message par « ex. : »", () => {
    render(<ContactForm />);
    expect(champ.email()).toHaveAttribute("placeholder", "ex. : jean.dupont@exemple.fr");
    expect(champ.message()).toHaveAttribute(
      "placeholder",
      "ex. : Bonjour, je souhaite discuter de…"
    );
  });

  it("écrit les exemples en italique", () => {
    render(<ContactForm />);
    expect(champ.email().className.split(/\s+/)).toContain("placeholder:italic");
    expect(champ.message().className.split(/\s+/)).toContain("placeholder:italic");
  });
});

describe("Champs en erreur — charte et contrastes (Story 4.12)", () => {
  it("borde un champ en erreur en orange foncé (≥ 3:1, WCAG 1.4.11)", () => {
    render(<ContactForm />);
    for (const element of Object.values(champ).map((f) => f())) {
      expect(element.className.split(/\s+/)).toContain("aria-invalid:border-accent");
    }
  });

  it("n'utilise plus de couleur absente du thème ni de taille arbitraire", () => {
    const racine = join(__dirname, "..", "..", "..");
    const form = readFileSync(join(racine, "components/ui/form.tsx"), "utf8");
    const contact = readFileSync(join(racine, "components/contact-form/ContactForm.tsx"), "utf8");
    expect(form).not.toMatch(/text-destructive|text-\[/);
    expect(contact).not.toMatch(/text-error|text-destructive/);
  });
});
