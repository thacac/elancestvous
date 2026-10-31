import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Illustrations de l'accueil (Story 4.2) : uniquement des dessins tirés des
// slides de formation (choix « tout en dessin » de Cédric, 2026-10-30),
// recadrés au carré pour les médaillons ronds.
const root = join(__dirname, "..", "..");

// Lit largeur/hauteur dans l'en-tête SOF d'un JPEG (sans dépendance).
function jpegSize(file: string) {
  const buffer = readFileSync(join(root, file));
  expect(buffer.readUInt16BE(0)).toBe(0xffd8);
  for (let offset = 2; offset < buffer.length; ) {
    const marker = buffer.readUInt16BE(offset);
    const length = buffer.readUInt16BE(offset + 2);
    if (marker >= 0xffc0 && marker <= 0xffc3) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error(`Pas d'en-tête SOF dans ${file}`);
}

describe.each([
  // [fichier, taille d'affichage maximale en px CSS]
  ["soignantes-atelier-formation.jpg", 160],
  ["soignante-pensive-coaching.jpg", 160],
  ["groupe-analyse-pratiques-cercle.jpg", 160],
  ["soignante-echange.jpg", 80],
  ["soignante-reflexion.jpg", 80],
  ["soignante-affirmation.jpg", 80],
  ["soignante-apaisee.jpg", 80],
  // Story 4.3 : tuiles Famille du hub /formations (128 px) et carte
  // Établissements du hub /coaching (160 px).
  ["presse-papiers-coche.jpg", 128],
  ["soignante-stressee.jpg", 128],
  ["soignante-explique.jpg", 128],
  ["collegues-en-tension.jpg", 128],
  ["responsable-et-soignante.jpg", 160],
])("public/illustrations/%s", (fichier, affichage) => {
  const { width, height } = jpegSize(`public/illustrations/${fichier}`);

  it("est carrée (médaillon rond)", () => {
    expect(width).toBe(height);
  });

  it("reste nette sur écran haute densité (au moins 2× sa taille d'affichage)", () => {
    expect(width).toBeGreaterThanOrEqual(affichage * 2);
  });
});
