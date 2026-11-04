import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/contact-form/ContactForm", () => ({
  default: () => <form aria-label="formulaire de contact" />,
}));

import ContactPage from "../page";

describe("Page contact", () => {
  it("présente les étapes du premier échange à côté du formulaire", () => {
    render(<ContactPage />);
    expect(screen.getByText(/un premier pas/i)).toBeInTheDocument();
    // Accroche décorative : ne doit pas polluer le plan de titres.
    expect(
      screen.queryByRole("heading", { name: /un premier pas/i }),
    ).not.toBeInTheDocument();
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("Vous m'écrivez");
    expect(steps[1]).toHaveTextContent("Je vous réponds personnellement");
    expect(steps[2]).toHaveTextContent("On construit ensemble");
    expect(
      screen.getByRole("form", { name: "formulaire de contact" }),
    ).toBeInTheDocument();
  });

  it("garde le numéro de téléphone cliquable", () => {
    render(<ContactPage />);
    expect(
      screen.getAllByRole("link", { name: /06 95 99 19 22/ })[0],
    ).toHaveAttribute("href", "tel:+33695991922");
  });
});
