import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { isBlogPublic, isValidationEnv } from "../featureFlags";

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

describe("isValidationEnv", () => {
  const original = process.env.SITE_ENV;

  afterEach(() => {
    if (original === undefined) delete process.env.SITE_ENV;
    else process.env.SITE_ENV = original;
  });

  it("est désactivé par défaut (prod)", () => {
    delete process.env.SITE_ENV;
    expect(isValidationEnv()).toBe(false);
  });

  it("n'est activé que pour la valeur littérale 'validation'", () => {
    process.env.SITE_ENV = "production";
    expect(isValidationEnv()).toBe(false);
    process.env.SITE_ENV = "VALIDATION";
    expect(isValidationEnv()).toBe(false);
    process.env.SITE_ENV = "validation";
    expect(isValidationEnv()).toBe(true);
  });
});

describe("SITE_ENV build-time wiring (même piège que BLOG_ENABLED)", () => {
  // robots.ts et les métadonnées du layout sont figés au `next build` :
  // SITE_ENV doit donc être vu par le build de l'image de validation, pas
  // seulement par le .env du conteneur.
  it("Dockerfile déclare SITE_ENV comme ARG/ENV avant `yarn build`", () => {
    const dockerfile = readFileSync(resolve(process.cwd(), "Dockerfile"), "utf8");

    const argIndex = dockerfile.indexOf("ARG SITE_ENV");
    expect(argIndex).toBeGreaterThan(-1);
    expect(dockerfile).toMatch(/ENV SITE_ENV=\$SITE_ENV/);
    expect(dockerfile.indexOf("RUN yarn build")).toBeGreaterThan(argIndex);
  });

  it("deploy-validation.yml construit l'image avec SITE_ENV=validation", () => {
    const yml = readFileSync(
      resolve(process.cwd(), ".github/workflows/deploy-validation.yml"),
      "utf8"
    );

    expect(yml).toMatch(/build-args:[\s\S]*SITE_ENV=validation/);
  });

  it("deploy.yml (prod) ne passe jamais SITE_ENV=validation", () => {
    const yml = readFileSync(resolve(process.cwd(), ".github/workflows/deploy.yml"), "utf8");

    expect(yml).not.toMatch(/SITE_ENV=validation/);
  });
});
