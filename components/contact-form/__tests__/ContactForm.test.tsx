import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../action", () => ({
  submit_contact_form: vi.fn(),
}));

import { submit_contact_form } from "../action";
import ContactForm from "../ContactForm";

describe("ContactForm — valeurs par défaut (provenance de la demande)", () => {
  it("présélectionne « Établissement / DRH » par défaut (comportement historique inchangé)", () => {
    render(<ContactForm />);

    expect(
      screen.getByRole("radio", { name: /établissement.*drh/i })
    ).toBeChecked();
  });

  it("présélectionne « Particulier » quand defaultProjectType vaut particulier", () => {
    render(<ContactForm defaultProjectType="particulier" />);

    expect(screen.getByRole("radio", { name: /particulier/i })).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /établissement.*drh/i })
    ).not.toBeChecked();
  });

  it("pré-remplit le message quand defaultMessage est fourni", () => {
    render(
      <ContactForm defaultMessage="Je souhaite un devis pour la formation « Obligations légales des établissements »." />
    );

    expect(
      screen.getByLabelText(/exprimez votre besoin/i)
    ).toHaveValue(
      "Je souhaite un devis pour la formation « Obligations légales des établissements »."
    );
  });

  it("laisse le message vide sans defaultMessage (comportement historique inchangé)", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/exprimez votre besoin/i)).toHaveValue("");
  });
});

describe("ContactForm — UX : carte de type de projet mise en évidence à la sélection", () => {
  it("chaque carte réagit à la sélection de son radio (has-[[data-state=checked]])", () => {
    render(<ContactForm />);

    const carteEtablissement = screen.getByRole("radio", {
      name: /établissement.*drh/i,
    }).closest('[role="group"]')!;
    const carteParticulier = screen.getByRole("radio", {
      name: /particulier/i,
    }).closest('[role="group"]')!;

    expect(carteEtablissement.className).toContain("has-[[data-state=checked]]:border-primary");
    expect(carteEtablissement.className).toContain("has-[[data-state=checked]]:bg-primary/5");
    expect(carteParticulier.className).toContain("has-[[data-state=checked]]:border-primary");
    expect(carteParticulier.className).toContain("has-[[data-state=checked]]:bg-primary/5");
  });

  it("chaque carte a une transition douce au survol/à la sélection", () => {
    render(<ContactForm />);

    const carte = screen
      .getByRole("radio", { name: /particulier/i })
      .closest('[role="group"]')!;

    expect(carte.className).toContain("transition-colors");
  });
});

describe("ContactForm — UX : confirmation visuelle après envoi", () => {
  it("affiche une icône de succès à côté du texte de confirmation", async () => {
    vi.mocked(submit_contact_form).mockResolvedValue(undefined);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText(/^nom$/i), { target: { value: "Dupont" } });
    fireEvent.change(screen.getByLabelText(/votre adresse email/i), {
      target: { value: "jean@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/exprimez votre besoin/i), {
      target: { value: "Bonjour, je souhaite échanger." },
    });

    const bouton = await waitFor(() =>
      screen.getByRole("button", { name: /envoyer ma demande/i })
    );
    fireEvent.click(bouton);

    const boutonSucces = await screen.findByRole("button", {
      name: /message envoyé/i,
    });
    const icone = boutonSucces.querySelector("svg")!;
    expect(icone).not.toBeNull();
    expect(icone.getAttribute("class")).toContain("size-4");
  });

  it("efface la confirmation dès que l'utilisateur ressaisit le formulaire pour un nouveau message", async () => {
    vi.mocked(submit_contact_form).mockResolvedValue(undefined);
    render(<ContactForm />);

    fireEvent.change(screen.getByLabelText(/prénom/i), { target: { value: "Jean" } });
    fireEvent.change(screen.getByLabelText(/^nom$/i), { target: { value: "Dupont" } });
    fireEvent.change(screen.getByLabelText(/votre adresse email/i), {
      target: { value: "jean@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/exprimez votre besoin/i), {
      target: { value: "Bonjour, je souhaite échanger." },
    });

    const bouton = await waitFor(() =>
      screen.getByRole("button", { name: /envoyer ma demande/i })
    );
    fireEvent.click(bouton);
    await screen.findByRole("button", { name: /message envoyé/i });

    // L'utilisateur ressaisit un nouveau message : la confirmation du
    // précédent envoi ne doit plus s'afficher, sous peine de laisser croire
    // que ce second message est déjà parti.
    fireEvent.change(screen.getByLabelText(/exprimez votre besoin/i), {
      target: { value: "Un second message, différent." },
    });

    await waitFor(() => {
      expect(
        screen.queryByRole("button", { name: /message envoyé/i })
      ).not.toBeInTheDocument();
    });
  });
});
