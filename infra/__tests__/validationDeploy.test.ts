import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

// Garde-fous sur l'environnement de validation (val.elancestvous.fr) : il
// tourne sur le même VPS/Traefik que la prod, une erreur de copier-coller
// ici peut donc écraser le conteneur, l'image ou le routage de la prod, ou
// réveiller le pipeline blog (Discord/commits sur master) depuis la Val.
const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("docker-compose.validation.yaml", () => {
  const compose = read("docker-compose.validation.yaml");

  it("utilise l'image et le conteneur dédiés à la validation, jamais ceux de la prod", () => {
    expect(compose).toMatch(/image: ghcr\.io\/thacac\/elancestvous-nextjs-16:validation\b/);
    expect(compose).not.toMatch(/elancestvous-nextjs-16:latest/);
    expect(compose).toMatch(/container_name: elancestvous-validation\b/);
  });

  it("route uniquement val.elancestvous.fr via des routers/middlewares Traefik propres", () => {
    expect(compose).toMatch(/Host\(`val\.elancestvous\.fr`\)/);
    expect(compose).not.toMatch(/Host\(`(www\.)?elancestvous\.fr`\)/);
    // Aucun label ne doit réutiliser un nom de router/service/middleware de
    // la prod (Traefik fusionnerait les définitions).
    const names = [...compose.matchAll(/traefik\.http\.(?:routers|services|middlewares)\.([\w-]+)\./g)].map(
      (m) => m[1]
    );
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) expect(name).toMatch(/^elancestvous-validation/);
  });

  it("protège l'accès par basic auth et ajoute X-Robots-Tag noindex", () => {
    expect(compose).toMatch(/middlewares\.elancestvous-validation-auth\.basicauth\.users=\$\{VAL_BASIC_AUTH/);
    expect(compose).toMatch(
      /middlewares\.elancestvous-validation-noindex\.headers\.customresponseheaders\.X-Robots-Tag=noindex, nofollow/
    );
    expect(compose).toMatch(
      /routers\.elancestvous-validation\.middlewares=elancestvous-validation-auth,elancestvous-validation-noindex/
    );
  });
});

describe(".github/workflows/deploy-validation.yml", () => {
  const yml = read(".github/workflows/deploy-validation.yml");

  it("ne se déclenche que sur la branche validation", () => {
    expect(yml).toMatch(/branches:\s*\n\s*- validation\n/);
    expect(yml).toMatch(/github\.ref == 'refs\/heads\/validation'/);
    expect(yml).not.toMatch(/- master\n/);
  });

  it("ne publie jamais les tags d'image de la prod (latest ni <sha> nu)", () => {
    expect(yml).toMatch(/type=raw,value=validation/);
    expect(yml).toMatch(/type=sha,prefix=val-,format=long/);
    expect(yml).not.toMatch(/value=latest/);
    expect(yml).not.toMatch(/prefix=,/);
  });

  it("déploie dans un dossier dédié, jamais dans celui de la prod", () => {
    expect(yml).toMatch(/VAL_DIR: elancestvous-validation\n/);
    expect(yml).toMatch(/target: "\/home\/\$\{\{ secrets\.VPS_USR \}\}\/\$\{\{ env\.VAL_DIR \}\}\/"/);
    expect(yml).not.toMatch(/\/elancestvous\/"/);
    expect(yml).toMatch(/-p elancestvous-validation/);
  });

  it("ne transmet aucun secret du pipeline blog (Discord, GitHub, cron)", () => {
    for (const secret of [
      "DISCORD_BOT_TOKEN",
      "DISCORD_PUBLIC_KEY",
      "GH_PAT_TOKEN",
      "BLOG_CRON_SECRET",
      "BLOG_REVIEW_SECRET",
      "ANTHROPIC_API_KEY",
      "IMAGE_GEN_API_KEY",
    ]) {
      expect(yml).not.toContain(`secrets.${secret}`);
    }
  });

  it("ne pousse l'image :validation que depuis la branche validation (hors PR)", () => {
    expect(yml).toMatch(
      /push: \$\{\{ github\.ref == 'refs\/heads\/validation' && github\.event_name != 'pull_request' \}\}/
    );
  });

  it("isole la concurrence par événement/ref (une PR ne peut pas annuler un déploiement en attente)", () => {
    expect(yml).toMatch(/group: deploy-validation-\$\{\{ github\.event_name \}\}-\$\{\{ github\.ref \}\}/);
  });

  it("retire les retours à la ligne du secret VAL_BASIC_AUTH avant de l'écrire", () => {
    expect(yml).toMatch(/tr -d '\\r\\n'/);
  });
});
