import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Navbar from "../Navbar";

const NAV_ITEMS: [string, string][] = [
  ["Accueil", "/"],
  [
    "Formations",
    "/professionnels-etablissements-de-soins/formations-rps-qvct",
  ],
  ["Coaching", "/professionnels-etablissements-de-soins/coaching"],
  [
    "GAPP",
    "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
  ],
  ["À propos", "/a-propos"],
  ["Contact", "/contact"],
];

describe("Navbar on a non-home page (audit: crawlable navigation everywhere)", () => {
  it.each(NAV_ITEMS)(
    "renders '%s' as a real link to %s, not a JS-only button",
    (label, href) => {
      render(<Navbar />);
      const links = screen.getAllByRole("link", { name: label });
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => expect(link).toHaveAttribute("href", href));
    },
  );

  it("renders the logo as a real link to the home page", () => {
    render(<Navbar />);
    expect(
      screen.getByRole("link", { name: /élan c.est vous/i }),
    ).toHaveAttribute("href", "/");
  });

  it("renders the Particuliers CTA as a real link", () => {
    render(<Navbar />);
    const ctas = screen.getAllByRole("link", { name: /particuliers/i });
    expect(ctas.length).toBeGreaterThan(0);
    ctas.forEach((cta) =>
      expect(cta).toHaveAttribute("href", "/particuliers/coaching-individuel"),
    );
  });

  it("does not disguise any navigation item as a fake button", () => {
    render(<Navbar />);
    const fakeButtons = screen.queryAllByRole("button", {
      name: /accueil|formations|coaching|gapp|à propos|contact|particuliers|élan c.est vous/i,
    });
    expect(fakeButtons).toHaveLength(0);
  });
});

describe("Navbar mobile drawer (bug: rien ne se passe au clic/tap sur mobile)", () => {
  const openButton = () =>
    screen.getByRole("button", { name: /open main menu/i });
  // Once the drawer is open, headlessui marks the rest of the page
  // aria-hidden, so the trigger button drops out of the accessible tree.
  const openButtonEvenIfHidden = () =>
    screen.getByRole("button", { name: /open main menu/i, hidden: true });

  it("exposes aria-expanded on the burger button so state changes are announced", () => {
    render(<Navbar />);
    expect(openButton()).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the drawer and flips aria-expanded when the burger button is clicked", () => {
    render(<Navbar />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(openButton());

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(openButtonEvenIfHidden()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the drawer when the close button is clicked", () => {
    render(<Navbar />);
    fireEvent.click(openButton());
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close menu/i }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes the drawer when a navigation link inside it is activated", () => {
    render(<Navbar />);
    fireEvent.click(openButton());
    const dialog = screen.getByRole("dialog");

    fireEvent.click(
      within(dialog).getAllByRole("link", { name: "Contact" })[0],
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("gives the burger button immediate touch feedback instead of feeling unresponsive", () => {
    render(<Navbar />);
    // touch-manipulation removes the tap-delay/double-tap-to-zoom ambiguity that
    // makes a first real-device tap look like it did nothing; active: gives
    // instant visual confirmation that the tap registered.
    expect(openButton().className).toMatch(/touch-manipulation/);
    expect(openButton().className).toMatch(/active:/);
  });

  it("gives the close button the same immediate touch feedback", () => {
    render(<Navbar />);
    fireEvent.click(openButton());
    const closeButton = screen.getByRole("button", { name: /close menu/i });
    expect(closeButton.className).toMatch(/touch-manipulation/);
    expect(closeButton.className).toMatch(/active:/);
  });
});
