import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Hero from "../Hero";

describe("Hero — pas de décalage négatif sous la navbar sticky", () => {
  it("n'a plus de top négatif (la navbar est sticky et déjà dans le flux, aucun chevauchement à compenser)", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;

    expect(section.className).not.toMatch(/-top-\d/);
  });
});

describe("Hero — fond visible en transparence sous la navbar (effet vitre dépolie)", () => {
  it("étend son fond pastel sous la navbar via une marge négative, compensée par un padding pour que le contenu reste sous la navbar", () => {
    const { container } = render(<Hero />);
    const section = container.querySelector("section")!;

    // La marge négative ne déplace que la boîte (donc le fond) ; le padding
    // compensateur repousse tout le contenu réel d'autant, pour qu'il ne se
    // retrouve jamais derrière la navbar (contrairement à l'ancien -top-20
    // qui déplaçait aussi le contenu).
    expect(section.className).toContain("-mt-20");
    expect(section.className).toContain("pt-20");
  });
});

describe("Hero — tient dans un écran mobile sans scroll excessif avant le CTA", () => {
  it("le logo n'a plus son propre décalage mt-20 mobile, désormais redondant avec le pt-20 de la section (sinon 80px perdus deux fois)", () => {
    render(<Hero />);
    const logo = screen.getByAltText(/coaching et formations/i);

    expect(logo.className).not.toMatch(/(?<!md:)(?<!lg:)(?<!xl:)\bmt-20\b/);
  });
});

describe("Hero — bloc \"particulier\" aligné comme le reste du contenu sur mobile", () => {
  it("se centre sur mobile (comme le titre et le CTA), et repasse à gauche à partir de md", () => {
    render(<Hero />);
    const titre = screen.getByText(/vous êtes un particulier/i);
    const bloc = titre.closest("div")!;

    expect(bloc.className).toContain("text-center");
    expect(bloc.className).toContain("md:text-left");
    expect(bloc.className).not.toMatch(/(?<!md:)\btext-left\b/);
  });
});
