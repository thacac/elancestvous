import { render, screen } from "@testing-library/react";
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
