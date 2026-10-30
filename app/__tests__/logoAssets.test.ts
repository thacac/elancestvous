import { readFileSync } from "node:fs";
import { join } from "node:path";
import { inflateSync } from "node:zlib";

import { render } from "@testing-library/react";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { LOGO_LETTER_PATH } from "@/components/charte/logoPath";
import JsonLd from "@/components/JsonLd";

// Les fichiers statiques du logo (données structurées, icônes d'onglet et de
// téléphone) sont générés depuis le même tracé vectoriel que le composant
// <Logo>, avec le point orange de la variante C.
const root = join(__dirname, "..", "..");

// Décodeur PNG minimal (RGBA 8 bits, non entrelacé — le format des fichiers
// générés), pour éviter une dépendance de test supplémentaire.
function readPng(buffer: Buffer) {
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const [bitDepth, colorType, , , interlace] = buffer.subarray(24, 29);
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error("PNG attendu en RGBA 8 bits non entrelacé");
  }
  const chunks: Buffer[] = [];
  for (let offset = 8; offset < buffer.length; ) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    if (type === "IDAT") chunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += 12 + length;
  }
  const raw = inflateSync(Buffer.concat(chunks));
  const stride = width * 4;
  const data = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const value = raw[y * (stride + 1) + 1 + x];
      const left = x >= 4 ? data[y * stride + x - 4] : 0;
      const up = y > 0 ? data[(y - 1) * stride + x] : 0;
      const upLeft = x >= 4 && y > 0 ? data[(y - 1) * stride + x - 4] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const [pa, pb, pc] = [Math.abs(p - left), Math.abs(p - up), Math.abs(p - upLeft)];
        predictor = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      }
      data[y * stride + x] = (value + predictor) & 0xff;
    }
  }
  return { width, height, data };
}

function pixel(file: string, xRatio: number, yRatio: number) {
  const png = readPng(readFileSync(join(root, file)));
  const x = Math.round(png.width * xRatio);
  const y = Math.round(png.height * yRatio);
  const i = (png.width * y + x) * 4;
  return { width: png.width, height: png.height, rgba: Array.from(png.data.subarray(i, i + 4)) };
}

// Centre du point du « é » dans le repère 521×521 du tracé.
const DOT = { x: 313 / 521, y: 147.5 / 521 };

describe("public/logo_elancestvous.svg", () => {
  const svg = readFileSync(join(root, "public", "logo_elancestvous.svg"), "utf8");

  it("reprend exactement le tracé du composant <Logo>", () => {
    expect(svg).toContain(LOGO_LETTER_PATH);
  });

  it("a le point orange des slides", () => {
    expect(svg).toMatch(/<circle[^>]*data-logo-dot[^>]*fill="#f28a1e"/);
  });
});

describe.each([
  ["public/logo_elancestvous.png", 512],
  ["app/android-chrome-512x512.png", 512],
  ["app/android-chrome-192x192.png", 192],
  ["app/apple-touch-icon.png", 180],
])("%s", (file, size) => {
  it(`fait ${size}×${size} px`, () => {
    const { width, height } = pixel(file, 0, 0);
    expect([width, height]).toEqual([size, size]);
  });

  it("porte le point orange (variante C)", () => {
    const [r, g, b] = pixel(file, DOT.x, DOT.y).rgba;
    expect(r).toBeGreaterThan(200);
    expect(g).toBeGreaterThan(100);
    expect(g).toBeLessThan(170);
    expect(b).toBeLessThan(80);
  });
});

describe.each([
  ["app/favicon-32x32.png", 32],
  ["app/favicon-16x16.png", 16],
])("%s", (file, size) => {
  it(`fait ${size}×${size} px`, () => {
    const { width, height } = pixel(file, 0, 0);
    expect([width, height]).toEqual([size, size]);
  });
});

// Revue : le PNG régénéré fait 512 px alors que les données structurées
// annonçaient encore 521 px → incohérence signalée à Google.
describe("JSON-LD — logo de l'organisation", () => {
  it("déclare les dimensions réelles de public/logo_elancestvous.png", () => {
    const { container } = render(createElement(JsonLd));
    const script = container.querySelector('script[type="application/ld+json"]')!;
    const graph = JSON.parse(script.innerHTML)["@graph"] as Array<Record<string, unknown>>;
    const logo = graph.find((node) => node["@type"] === "ProfessionalService")!.logo as {
      url: string;
      width: number;
      height: number;
    };
    expect(logo.url).toBe("https://elancestvous.fr/logo_elancestvous.png");
    const { width, height } = pixel("public/logo_elancestvous.png", 0, 0);
    expect([logo.width, logo.height]).toEqual([width, height]);
  });
});

