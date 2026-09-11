import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/featureFlags", () => ({
  isBlogPublic: () => true,
}));

vi.mock("@/lib/blog", () => ({
  getAllPostsMeta: vi.fn(),
  getPostBySlug: vi.fn(),
  getPostSlugs: vi.fn(() => []),
}));

import { getPostBySlug } from "@/lib/blog";
import type { Post, PostMeta } from "@/lib/blog";

import BlogPost from "../page";

function meta(overrides: Partial<PostMeta>): PostMeta {
  return {
    title: "Autre article",
    slug: "autre-article",
    description: "Description",
    excerpt: "Extrait",
    publishedAt: "2026-01-01",
    coverImage: "/og-banner.jpg",
    coverImageAlt: "Illustration",
    tags: [],
    pillar: "C",
    readingTime: "2 min de lecture",
    ...overrides,
  };
}

function post(overrides: Partial<Post>): Post {
  return {
    title: "Article courant",
    slug: "article-courant",
    description: "Description",
    excerpt: "Extrait",
    publishedAt: "2026-02-01",
    coverImage: "/og-banner.jpg",
    coverImageAlt: "Illustration",
    tags: ["QVCT"],
    pillar: "C",
    readingTime: "3 min de lecture",
    html: "<p>Contenu de l'article.</p>",
    relatedPosts: [],
    ...overrides,
  };
}

describe("BlogPost — liens du cocon sémantique (issue #73)", () => {
  it("affiche des liens vers les autres articles du même pilier", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(
      post({
        relatedPosts: [
          meta({ slug: "autre-article-du-cocon", title: "Autre article du cocon" }),
        ],
      })
    );

    const jsx = await BlogPost({ params: Promise.resolve({ slug: "article-courant" }) });
    render(jsx);

    expect(
      screen.getByRole("link", { name: /autre article du cocon/i })
    ).toHaveAttribute("href", "/blog/autre-article-du-cocon");
    expect(screen.getByText(/à lire aussi/i)).toBeInTheDocument();
  });

  it("n'affiche aucune section quand aucun article ne partage le même pilier", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(post({ relatedPosts: [] }));

    const jsx = await BlogPost({ params: Promise.resolve({ slug: "article-courant" }) });
    render(jsx);

    expect(screen.queryByText(/à lire aussi/i)).not.toBeInTheDocument();
  });
});

describe("BlogPost — fil d'Ariane (cocon sémantique, #73)", () => {
  it("insère le pilier de l'article entre Blog et le titre, lié à la page de service correspondante", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(
      post({ title: "Article courant", pillar: "C" })
    );

    const jsx = await BlogPost({ params: Promise.resolve({ slug: "article-courant" }) });
    render(jsx);

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(screen.getByRole("link", { name: "Formations QVCT / RPS" })).toHaveAttribute(
      "href",
      "/professionnels-etablissements-de-soins/formations-rps-qvct"
    );
    // Le titre de l'article est la page courante : jamais un lien.
    expect(screen.queryByRole("link", { name: "Article courant" })).toBeNull();
    expect(screen.getAllByText("Article courant").length).toBeGreaterThan(0);
  });

  it("omet le niveau pilier pour un article publié avant #73 (pillar: null, rétrocompatibilité)", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(
      post({ title: "Vieil article", pillar: null })
    );

    const jsx = await BlogPost({ params: Promise.resolve({ slug: "vieil-article" }) });
    render(jsx);

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    // Aucun des 4 libellés de pilier ne doit apparaître comme lien de fil d'Ariane.
    expect(screen.queryByRole("link", { name: "Formations QVCT / RPS" })).toBeNull();
  });
});

describe("BlogPost — boutons de partage", () => {
  it("affiche des boutons de partage pointant vers l'URL canonique de l'article", async () => {
    vi.mocked(getPostBySlug).mockResolvedValue(post({ slug: "article-courant" }));

    const jsx = await BlogPost({ params: Promise.resolve({ slug: "article-courant" }) });
    render(jsx);

    const canonicalUrl = "https://elancestvous.fr/blog/article-courant";
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`
    );
  });
});
