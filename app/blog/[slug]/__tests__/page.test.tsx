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
