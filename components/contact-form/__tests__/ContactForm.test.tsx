import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../action", () => ({
  submit_contact_form: vi.fn(),
}));

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
