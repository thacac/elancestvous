import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { submitMock } = vi.hoisted(() => ({ submitMock: vi.fn() }));

vi.mock("../action", () => ({ submit_contact_form: submitMock }));
const { toastMock } = vi.hoisted(() => ({
  toastMock: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: toastMock }));

import ContactForm from "../ContactForm";

// Radix (RadioGroup) s'appuie sur ResizeObserver, absent de jsdom.
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("Prénom"), {
    target: { value: "Jean" },
  });
  fireEvent.change(screen.getByLabelText("Nom"), {
    target: { value: "Dupont" },
  });
  fireEvent.change(screen.getByLabelText("Adresse e-mail"), {
    target: { value: "jean@exemple.fr" },
  });
  fireEvent.change(screen.getByLabelText("Exprimez votre besoin"), {
    target: { value: "Bonjour, je souhaite discuter d'un coaching." },
  });
}

async function submitValidForm() {
  fillValidForm();
  fireEvent.click(screen.getByRole("button", { name: /envoyer ma demande/i }));
}

describe("ContactForm", () => {
  beforeEach(() => {
    submitMock.mockReset();
    toastMock.success.mockReset();
    toastMock.error.mockReset();
  });

  it("laisse le bouton cliquable et affiche toutes les erreurs si on envoie un formulaire incomplet", async () => {
    render(<ContactForm />);
    const button = screen.getByRole("button", { name: /envoyer ma demande/i });
    expect(button).toBeEnabled();
    fireEvent.click(button);

    expect(await screen.findByText("Le prénom est requis")).toBeInTheDocument();
    expect(screen.getByText("Le nom est requis")).toBeInTheDocument();
    expect(screen.getByText("L'email est requis")).toBeInTheDocument();
    expect(screen.getByText("Le message est requis")).toBeInTheDocument();
    expect(submitMock).not.toHaveBeenCalled();
  });

  it("affiche l'erreur propre au champ e-mail (et non celle du nom) quand l'adresse est invalide", async () => {
    render(<ContactForm />);
    const email = screen.getByLabelText("Adresse e-mail");
    fireEvent.change(email, { target: { value: "jean@" } });
    fireEvent.blur(email);

    expect(
      await screen.findByText("L'email n'est pas valide"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Le nom est requis")).not.toBeInTheDocument();
  });

  it("n'affiche chaque message d'erreur qu'une seule fois", async () => {
    render(<ContactForm />);
    const firstName = screen.getByLabelText("Prénom");
    fireEvent.focus(firstName);
    fireEvent.blur(firstName);

    await screen.findByText("Le prénom est requis");
    expect(screen.getAllByText("Le prénom est requis")).toHaveLength(1);
  });

  it("présente le type de projet sous forme de choix radio, établissement par défaut", () => {
    render(<ContactForm />);
    expect(
      screen.getByRole("radio", { name: /établissement/i }),
    ).toBeChecked();
    expect(
      screen.getByRole("radio", { name: /particulier/i }),
    ).not.toBeChecked();
  });

  it("transmet le type de projet choisi à l'envoi", async () => {
    submitMock.mockResolvedValue({ messageId: "1" });
    render(<ContactForm />);
    fireEvent.click(screen.getByRole("radio", { name: /particulier/i }));
    await submitValidForm();

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    expect(submitMock.mock.calls[0][0]).toMatchObject({
      projectType: "particulier",
      email: "jean@exemple.fr",
    });
  });

  it("remplace le formulaire par un message de confirmation après un envoi réussi", async () => {
    submitMock.mockResolvedValue({ messageId: "1" });
    render(<ContactForm />);
    await submitValidForm();

    expect(
      await screen.findByRole("heading", {
        name: /merci, votre message est bien parti/i,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Prénom")).not.toBeInTheDocument();
    // L'écran de confirmation suffit : pas de toast en doublon.
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it("permet d'écrire un nouveau message depuis l'écran de confirmation", async () => {
    submitMock.mockResolvedValue({ messageId: "1" });
    render(<ContactForm />);
    await submitValidForm();

    fireEvent.click(
      await screen.findByRole("button", { name: /envoyer un autre message/i }),
    );
    expect(screen.getByLabelText("Prénom")).toHaveValue("");
  });

  it("garde le formulaire et affiche l'erreur serveur si l'envoi échoue", async () => {
    submitMock.mockResolvedValue({ error: "Envoi impossible." });
    render(<ContactForm />);
    await submitValidForm();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Envoi impossible.",
    );
    expect(screen.getByLabelText("Prénom")).toHaveValue("Jean");
    expect(
      screen.queryByRole("heading", { name: /merci/i }),
    ).not.toBeInTheDocument();
    // L'alerte dans le formulaire suffit : pas de toast en doublon.
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it("efface l'erreur serveur dès que l'utilisateur modifie le formulaire", async () => {
    submitMock.mockResolvedValue({ error: "Envoi impossible." });
    render(<ContactForm />);
    await submitValidForm();
    await screen.findByRole("alert");

    fireEvent.change(screen.getByLabelText("Exprimez votre besoin"), {
      target: { value: "Bonjour, autre formulation." },
    });
    await waitFor(() =>
      expect(screen.queryByRole("alert")).not.toBeInTheDocument(),
    );
  });
});
