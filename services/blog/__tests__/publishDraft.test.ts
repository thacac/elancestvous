import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { BLOG_AUTO_DEPLOY_TAG, publishDraft, type PublishDraftDeps } from "../publishDraft";

function makeDeps(overrides: Partial<PublishDraftDeps["github"]> = {}): PublishDraftDeps {
  return {
    github: {
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article"',
          'slug: "un-article"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          'coverImage: "/blog/un-article/cover.jpg"',
          'coverImageAlt: "Illustration"',
          "tags: []",
          'pillar: "A"',
          "---",
          "Corps de l'article.",
        ].join("\n"),
        coverImage: Buffer.from("fake-image"),
      }),
      publishDraft: vi.fn().mockResolvedValue({
        commitUrl: "https://github.com/thacac/elancestvous/commit/abc123",
      }),
      ...overrides,
    },
  };
}

describe("publishDraft", () => {
  it("returns draft_not_found when the draft branch doesn't exist", async () => {
    const deps = makeDeps({ getDraftContent: vi.fn().mockResolvedValue(null) });

    const result = await publishDraft("inconnu", deps);

    expect(result).toEqual({ status: "draft_not_found", slug: "inconnu" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("returns slug_mismatch and does not publish when frontmatter.slug differs from the requested slug", async () => {
    // frontmatter.slug alimente le chemin de l'image publiée
    // (coverImage: /blog/<frontmatter.slug>/...) tandis que publishDraft()
    // publie le fichier réel à public/blog/<slug>/... (le slug demandé,
    // celui de la branche blog-draft/<slug>) — un écart entre les deux
    // casserait l'URL de l'image de l'article publié.
    const deps = makeDeps({
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article"',
          'slug: "autre-slug"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          'coverImage: "/blog/autre-slug/cover.jpg"',
          'coverImageAlt: "Illustration"',
          "tags: []",
          'pillar: "A"',
          "---",
          "Corps.",
        ].join("\n"),
        coverImage: Buffer.from("fake-image"),
      }),
    });

    const result = await publishDraft("un-article", deps);

    expect(result).toEqual({ status: "slug_mismatch", slug: "un-article" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("returns invalid_cover_path when frontmatter.coverImage doesn't match the path that will actually be published", async () => {
    // githubBlogRepo.publishDraft() écrit toujours l'asset à
    // public/blog/<slug>/cover.jpg — si le frontmatter référence autre
    // chose (ex. une extension différente après une édition manuelle),
    // l'article publié pointerait vers une image qui n'existe pas à
    // l'endroit indiqué.
    const deps = makeDeps({
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article"',
          'slug: "un-article"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          'coverImage: "/blog/un-article/cover.png"',
          'coverImageAlt: "Illustration"',
          "tags: []",
          'pillar: "A"',
          "---",
          "Corps.",
        ].join("\n"),
        coverImage: Buffer.from("fake-image"),
      }),
    });

    const result = await publishDraft("un-article", deps);

    expect(result).toEqual({ status: "invalid_cover_path", slug: "un-article" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("returns missing_cover_image when the frontmatter references an image but the blob itself is absent", async () => {
    const deps = makeDeps({
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article"',
          'slug: "un-article"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          'coverImage: "/blog/un-article/cover.jpg"',
          'coverImageAlt: "Illustration"',
          "tags: []",
          'pillar: "A"',
          "---",
          "Corps.",
        ].join("\n"),
        // Le frontmatter promet une image, mais le blob cover.jpg lui-même
        // est absent/corrompu sur la branche — publier quand même laisserait
        // un article pointant vers une image inexistante.
        coverImage: null,
      }),
    });

    const result = await publishDraft("un-article", deps);

    expect(result).toEqual({ status: "missing_cover_image", slug: "un-article" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("returns missing_cover_image and does not publish when the draft has no cover image", async () => {
    const deps = makeDeps({
      getDraftContent: vi.fn().mockResolvedValue({
        markdown: [
          "---",
          'title: "Un article sans image"',
          'slug: "sans-image"',
          'description: "Description"',
          'excerpt: "Extrait"',
          'publishedAt: "2026-01-01"',
          "tags: []",
          'pillar: "A"',
          "---",
          "Corps.",
        ].join("\n"),
        coverImage: null,
      }),
    });

    const result = await publishDraft("sans-image", deps);

    expect(result).toEqual({ status: "missing_cover_image", slug: "sans-image" });
    expect(deps.github.publishDraft).not.toHaveBeenCalled();
  });

  it("publishes and returns the commit URL when the draft has a cover image", async () => {
    const deps = makeDeps();

    const result = await publishDraft("un-article", deps);

    expect(result).toEqual({
      status: "published",
      slug: "un-article",
      title: "Un article",
      commitUrl: "https://github.com/thacac/elancestvous/commit/abc123",
    });
    expect(deps.github.publishDraft).toHaveBeenCalledWith({
      slug: "un-article",
      commitMessage: expect.stringContaining("Un article"),
    });
  });

  it("tags the commit message with BLOG_AUTO_DEPLOY_TAG (lu par deploy.yml pour déployer automatiquement)", async () => {
    const deps = makeDeps();

    await publishDraft("un-article", deps);

    expect(deps.github.publishDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        commitMessage: expect.stringContaining(BLOG_AUTO_DEPLOY_TAG),
      })
    );
  });

  it("keeps deploy.yml's contains(...) check in sync with BLOG_AUTO_DEPLOY_TAG (garde-fou anti-dérive)", () => {
    // .github/workflows/deploy.yml ne peut pas importer cette constante (YAML,
    // pas de build step) : il porte le même littéral en dur dans son `if:`
    // (job "deploy", contains(github.event.head_commit.message, ...)). Ce
    // test échoue si l'un des deux change sans l'autre — sans lui, changer
    // BLOG_AUTO_DEPLOY_TAG casserait silencieusement le déploiement
    // automatique d'un article approuvé sur Discord (yarn test/tsc/lint
    // resteraient tous verts).
    const deployYml = readFileSync(
      resolve(process.cwd(), ".github/workflows/deploy.yml"),
      "utf8"
    );

    expect(deployYml).toContain(BLOG_AUTO_DEPLOY_TAG);
  });
});
