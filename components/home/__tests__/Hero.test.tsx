import { render } from "@testing-library/react";
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
