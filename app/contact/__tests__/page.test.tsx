import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/contact-form/action", () => ({
  submit_contact_form: vi.fn(),
}));

import ContactPage from "../page";

describe("ContactPage — provenance de la demande (searchParams)", () => {
  it("présélectionne Particulier et pré-remplit le message à partir de ?type=&sujet=", async () => {
    const jsx = await ContactPage({
      searchParams: Promise.resolve({
        type: "particulier",
        sujet: "Coaching individuel",
      }),
    });
    render(jsx);

    expect(screen.getByRole("radio", { name: /particulier/i })).toBeChecked();
    expect(screen.getByLabelText(/exprimez votre besoin/i)).toHaveValue(
      "Coaching individuel"
    );
  });

  it("présélectionne Établissement / DRH par défaut sans searchParams", async () => {
    const jsx = await ContactPage({ searchParams: Promise.resolve({}) });
    render(jsx);

    expect(
      screen.getByRole("radio", { name: /établissement.*drh/i })
    ).toBeChecked();
    expect(screen.getByLabelText(/exprimez votre besoin/i)).toHaveValue("");
  });

  it("retombe sur Établissement / DRH pour un ?type= inconnu plutôt que de planter", async () => {
    const jsx = await ContactPage({
      searchParams: Promise.resolve({ type: "autre-chose" }),
    });
    render(jsx);

    expect(
      screen.getByRole("radio", { name: /établissement.*drh/i })
    ).toBeChecked();
  });
});
