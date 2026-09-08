import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { isBlogPublic } from "../featureFlags";

describe("isBlogPublic", () => {
  const original = process.env.BLOG_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.BLOG_ENABLED;
    else process.env.BLOG_ENABLED = original;
  });

  it("is disabled by default (unset)", () => {
    delete process.env.BLOG_ENABLED;
    expect(isBlogPublic()).toBe(false);
  });

  it("is disabled for any value other than the literal string 'true'", () => {
    process.env.BLOG_ENABLED = "1";
    expect(isBlogPublic()).toBe(false);
    process.env.BLOG_ENABLED = "TRUE";
    expect(isBlogPublic()).toBe(false);
  });

  it("is enabled when explicitly set to 'true'", () => {
    process.env.BLOG_ENABLED = "true";
    expect(isBlogPublic()).toBe(true);
  });
});

describe("BLOG_ENABLED build-time wiring (garde-fou anti-régression)", () => {
  // Incident du 08/09 : le premier article publié était invisible — /blog
  // (page statique, sans segment dynamique) est pré-rendue une seule fois au
  // build, où `next build` (Dockerfile) tournait sans BLOG_ENABLED (seulement
  // écrit dans .env sur le VPS, chargé au démarrage du conteneur, jamais
  // transmis à `docker build` dans deploy.yml) — isBlogPublic() valait donc
  // toujours false à ce moment-là, figeant un notFound() dans le HTML
  // statique généré, quel que soit BLOG_ENABLED ensuite. /blog/[slug]
  // fonctionnait par accident : generateStaticParams() renvoyait [] au build
  // pour la même raison, mais le rendu à la demande (dynamicParams non
  // désactivé) relit l'env réel du conteneur à chaque requête.
  it("Dockerfile déclare BLOG_ENABLED comme ARG/ENV avant `yarn build`", () => {
    const dockerfile = readFileSync(resolve(process.cwd(), "Dockerfile"), "utf8");

    expect(dockerfile).toMatch(/ARG BLOG_ENABLED/);
    expect(dockerfile).toMatch(/ENV BLOG_ENABLED/);
    const argIndex = dockerfile.indexOf("ARG BLOG_ENABLED");
    const buildIndex = dockerfile.indexOf("RUN yarn build");
    expect(argIndex).toBeGreaterThan(-1);
    expect(buildIndex).toBeGreaterThan(argIndex);
  });

  it("deploy.yml transmet BLOG_ENABLED en build-arg à l'étape docker build", () => {
    const deployYml = readFileSync(
      resolve(process.cwd(), ".github/workflows/deploy.yml"),
      "utf8"
    );

    expect(deployYml).toMatch(/build-args:[^\n]*\n?[^\n]*BLOG_ENABLED/);
  });
});
