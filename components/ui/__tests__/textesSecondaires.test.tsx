import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CardDescription } from "../card";
import { FieldDescription, FieldSeparator } from "../field";
import { Input } from "../input";
import { Textarea } from "../textarea";

// Story 4.6 : l'ancien gris `muted-foreground` (≈ 4.5:1 sur stone-50, 4.2:1
// sur pastel) laisse place à stone-600 (7.3:1 sur stone-50, 6.8:1 sur
// pastel) pour les placeholders et les textes d'aide (validé par Cédric).
describe("components/ui — textes secondaires lisibles (Story 4.6)", () => {
  it("écrit le placeholder des champs texte en stone-600", () => {
    render(<Input placeholder="Jean" />);
    const classes = screen.getByPlaceholderText("Jean").className;
    expect(classes).toMatch(/\bplaceholder:text-stone-600\b/);
    expect(classes).not.toMatch(/muted-foreground/);
  });

  it("écrit le placeholder des zones de texte en stone-600", () => {
    render(<Textarea placeholder="Bonjour" />);
    const classes = screen.getByPlaceholderText("Bonjour").className;
    expect(classes).toMatch(/\bplaceholder:text-stone-600\b/);
    expect(classes).not.toMatch(/muted-foreground/);
  });

  it("écrit l'aide d'un groupe de champs en stone-600", () => {
    render(<FieldDescription>Aide</FieldDescription>);
    expect(screen.getByText("Aide")).toHaveClass("text-stone-600");
    expect(screen.getByText("Aide").className).not.toMatch(/muted-foreground/);
  });

  it("écrit le libellé d'un séparateur de champs en stone-600", () => {
    render(<FieldSeparator>ou</FieldSeparator>);
    expect(screen.getByText("ou")).toHaveClass("text-stone-600");
  });

  it("écrit la description d'une carte en stone-600", () => {
    render(<CardDescription>Détail</CardDescription>);
    expect(screen.getByText("Détail")).toHaveClass("text-stone-600");
  });
});
