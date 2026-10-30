import { describe, expect, it, vi } from "vitest";

// next/font/google n'est utilisable qu'à la compilation Next : on le simule
// pour vérifier la configuration passée à chaque police.
const calls = vi.hoisted(() => [] as Array<{ name: string; options: Record<string, unknown> }>);

vi.mock("next/font/google", () => {
  const factory = (name: string) => (options: Record<string, unknown>) => {
    calls.push({ name, options });
    return { className: `${name}-class`, variable: `${name}-variable`, style: {} };
  };
  return {
    Nunito: factory("Nunito"),
    Nunito_Sans: factory("Nunito_Sans"),
    Kalam: factory("Kalam"),
  };
});

const { fontVariables } = await import("../fonts");

function optionsOf(name: string) {
  return calls.find((call) => call.name === name)?.options;
}

describe("app/fonts — polices auto-hébergées (next/font)", () => {
  it.each([
    ["Nunito", "--font-nunito"],
    ["Nunito_Sans", "--font-nunito-sans"],
    ["Kalam", "--font-kalam"],
  ])("%s expose la variable CSS %s", (name, variable) => {
    expect(optionsOf(name)).toMatchObject({ variable });
  });

  it.each(["Nunito", "Nunito_Sans", "Kalam"])(
    "%s charge le sous-ensemble latin et s'affiche sans bloquer le texte (display: swap)",
    (name) => {
      expect(optionsOf(name)).toMatchObject({ subsets: ["latin"], display: "swap" });
    },
  );

  it("précharge les polices de titre et de texte, pas la manuscrite (décorative)", () => {
    expect(optionsOf("Nunito")).not.toHaveProperty("preload", false);
    expect(optionsOf("Nunito_Sans")).not.toHaveProperty("preload", false);
    expect(optionsOf("Kalam")).toMatchObject({ preload: false });
  });

  it("charge l'italique de Nunito (mots mis en avant dans les titres)", () => {
    expect(optionsOf("Nunito")).toMatchObject({ style: ["normal", "italic"] });
  });

  it("regroupe les trois variables dans une seule classe à poser sur <html>", () => {
    expect(fontVariables.split(" ").sort()).toEqual(
      ["Kalam-variable", "Nunito-variable", "Nunito_Sans-variable"].sort(),
    );
  });
});
