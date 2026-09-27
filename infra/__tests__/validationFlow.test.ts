import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

// Flux de promotion : feature → validation (recette sur la Val) →
// validation → master (prod). Seul le contenu blog automatisé (publication
// approuvée sur Discord, file d'actualités, rapport SEO) écrit directement
// sur master, via l'API GitHub et sans PR — il n'est donc pas concerné par
// le garde-fou ci-dessous, et revient sur validation par la synchro.
const read = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe(".github/workflows/guard-master.yml", () => {
  const yml = read(".github/workflows/guard-master.yml");

  it("tourne sur chaque PR vers master", () => {
    expect(yml).toMatch(/pull_request:\s*\n\s*branches:\s*\n\s*- master\n/);
  });

  it("n'accepte que la branche validation du dépôt lui-même comme source", () => {
    expect(yml).toMatch(/HEAD_REF: \$\{\{ github\.head_ref \}\}/);
    expect(yml).toMatch(/HEAD_REPO: \$\{\{ github\.event\.pull_request\.head\.repo\.full_name \}\}/);
    expect(yml).toMatch(/\[ "\$HEAD_REF" != "validation" \]/);
    expect(yml).toMatch(/\[ "\$HEAD_REPO" != "\$GITHUB_REPOSITORY" \]/);
    expect(yml).toMatch(/exit 1/);
  });

  it("n'interpole jamais le nom de branche directement dans le script (injection)", () => {
    const runBlocks = yml.split("run: |").slice(1).join("\n");
    expect(runBlocks).not.toContain("${{");
  });
});

describe(".github/workflows/sync-validation.yml", () => {
  const yml = read(".github/workflows/sync-validation.yml");

  it("se déclenche à chaque push sur master", () => {
    expect(yml).toMatch(/push:\s*\n\s*branches:\s*\n\s*- master\n/);
  });

  it("merge master dans validation sans jamais réécrire l'historique", () => {
    expect(yml).toMatch(/ref: validation/);
    expect(yml).toMatch(/git merge --no-edit origin\/master/);
    expect(yml).toMatch(/git push origin HEAD:validation/);
    expect(yml).not.toMatch(/--force|push -f|reset --hard/);
  });

  it("pousse avec GH_PAT_TOKEN pour que le push redéploie la Val", () => {
    // Un push fait avec le GITHUB_TOKEN du run ne déclenche aucun autre
    // workflow : deploy-validation.yml ne tournerait pas.
    expect(yml).toMatch(/token: \$\{\{ secrets\.GH_PAT_TOKEN \}\}/);
  });

  it("réessaie le push si validation a bougé entre-temps (merge de feature)", () => {
    expect(yml).toMatch(/for attempt in 1 2 3/);
    expect(yml).toMatch(/git reset --keep origin\/validation/);
  });

  it("sérialise les synchros", () => {
    expect(yml).toMatch(/concurrency:\s*\n\s*group: sync-validation/);
  });
});

describe(".github/workflows/blog-seo-report-trigger.yml", () => {
  const yml = read(".github/workflows/blog-seo-report-trigger.yml");

  it("pousse le rapport avec GH_PAT_TOKEN (ruleset de master + synchro vers validation)", () => {
    // Avec le GITHUB_TOKEN du run, le push direct serait refusé par le
    // ruleset de master (seul le compte du PAT est en bypass), et ne
    // déclencherait pas sync-validation.yml.
    expect(yml).toMatch(/uses: actions\/checkout@v4\n\s*with:\n(?:\s*#.*\n)*\s*token: \$\{\{ secrets\.GH_PAT_TOKEN \}\}/);
  });
});
