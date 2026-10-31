import { readFileSync } from "node:fs";
import { join } from "node:path";

import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/featureFlags", () => ({ isBlogPublic: () => true }));

vi.mock("@/lib/reviewToken", () => ({ verifyReviewToken: () => true }));

vi.mock("@/services/blog/githubBlogRepo", () => ({
  createGithubBlogRepo: () => ({
    getDraftContent: async () => ({ markdown: "raw", coverImage: null }),
  }),
  parseGithubRepoEnv: () => ({ owner: "thacac", repo: "elancestvous" }),
}));

vi.mock("@/lib/blog", () => ({
  getAllPostsMeta: vi.fn(() => []),
  getPostBySlug: vi.fn(),
  getPostSlugs: vi.fn(() => []),
  parseDraftContent: vi.fn(),
  renderMarkdownToSafeHtml: async () => "<h2>Une partie</h2><h3>Un détail</h3><p>Contenu.</p>",
}));

import { getAllPostsMeta, getPostBySlug, parseDraftContent } from "@/lib/blog";
import type { Post, PostMeta } from "@/lib/blog";

import BlogPost from "../blog/[slug]/page";
import BlogIndex, { metadata as metaBlog } from "../blog/page";
import BlogReviewPage from "../blog-review/[slug]/page";

// Story 4.5 : la charte des slides habille le blog (liste, article, aperçu
// de relecture Discord) sans toucher au SEO ni au pipeline de génération.
const root = join(__dirname, "..", "..");

function meta(overrides: Partial<PostMeta> = {}): PostMeta {
  return {
    title: "Un article",
    slug: "un-article",
    description: "Description",
    excerpt: "Extrait de l'article",
    publishedAt: "2026-01-01",
    coverImage: "/og-banner.jpg",
    coverImageAlt: "Illustration",
    tags: [],
    pillar: "C",
    readingTime: "2 min de lecture",
    ...overrides,
  };
}

function post(overrides: Partial<Post> = {}): Post {
  return {
    ...meta({ title: "Article courant", slug: "article-courant", tags: ["QVCT", "RPS"] }),
    html: "<h2>Une partie</h2><h3>Un détail</h3><p>Contenu de l'article.</p>",
    relatedPosts: [],
    ...overrides,
  };
}

function sansSaut(container: HTMLElement) {
  const n = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((h) => Number(h.tagName[1]));
  expect(n[0]).toBe(1);
  expect(n.filter((niveau) => niveau === 1)).toHaveLength(1);
  n.forEach((niveau, i) => {
    if (i > 0) expect(niveau - n[i - 1]).toBeLessThanOrEqual(1);
  });
}

function classesInterdites(container: HTMLElement) {
  container.querySelectorAll("[class]").forEach((el) => {
    expect(el.getAttribute("class")).not.toMatch(/(?:^|[\s:-])(?:secondary|muted|pastel|amber)(?:-|\b)/);
  });
}

async function renderArticle(p: Post) {
  vi.mocked(getPostBySlug).mockResolvedValue(p);
  const jsx = await BlogPost({ params: Promise.resolve({ slug: p.slug }) });
  return render(jsx);
}

async function renderRelecture(frontmatter: Record<string, unknown> = {}) {
  process.env.GITHUB_REPO = "thacac/elancestvous";
  process.env.GH_PAT_TOKEN = "token";
  process.env.BLOG_REVIEW_SECRET = "secret";
  vi.mocked(parseDraftContent).mockReturnValue({
    frontmatter: {
      title: "Brouillon en relecture",
      slug: "brouillon",
      description: "Description",
      excerpt: "Extrait",
      publishedAt: "2026-01-01",
      tags: ["GAPP"],
      pillar: "D",
      ...frontmatter,
    },
    content: "Contenu.",
  });
  const jsx = await BlogReviewPage({
    params: Promise.resolve({ slug: "brouillon" }),
    searchParams: Promise.resolve({ token: "valide" }),
  });
  return render(jsx);
}

function h1Reduit() {
  const h1 = screen.getByRole("heading", { level: 1 });
  expect(h1).toHaveClass("text-3xl!", "sm:text-5xl!", "lg:text-6xl!", "break-words");
  expect(h1).not.toHaveClass("hyphens-auto");
}

describe("Liste du blog", () => {
  beforeEach(() => {
    vi.mocked(getAllPostsMeta).mockReturnValue([
      meta({ slug: "premier", title: "Premier article" }),
      meta({ slug: "deuxieme", title: "Deuxième article" }),
      meta({ slug: "troisieme", title: "Troisième article" }),
    ]);
  });

  it("garde son title, sa description et son H1 (SEO d'abord)", () => {
    expect(metaBlog.title).toBe("Blog");
    expect(metaBlog.description).toMatch(/^Conseils, retours d'expérience et ressources sur la QVCT/);
    const { container } = render(<BlogIndex />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Le blog");
    sansSaut(container);
  });

  it("réduit son H1 sur smartphone sans césure", () => {
    render(<BlogIndex />);
    h1Reduit();
  });

  it("garde les titres et les URLs des articles", () => {
    render(<BlogIndex />);
    expect(screen.getByRole("link", { name: /Premier article/ })).toHaveAttribute("href", "/blog/premier");
    expect(screen.getByRole("link", { name: /Deuxième article/ })).toHaveAttribute("href", "/blog/deuxieme");
    expect(screen.getByRole("link", { name: /Troisième article/ })).toHaveAttribute("href", "/blog/troisieme");
  });

  it("alterne les pastels ciel et pêche sur les cartes (UX-DR2)", () => {
    render(<BlogIndex />);
    const cartes = ["Premier article", "Deuxième article", "Troisième article"].map(
      (titre) => screen.getByText(titre).closest(".rounded-3xl")!,
    );
    expect(cartes[0]).toHaveClass("bg-sky");
    expect(cartes[1]).toHaveClass("bg-peach");
    expect(cartes[2]).toHaveClass("bg-sky");
  });

  it("garde un focus clavier visible sur chaque carte-lien", () => {
    render(<BlogIndex />);
    expect(screen.getByRole("link", { name: /Premier article/ })).toHaveClass("focus-visible:outline-2");
  });

  it("n'utilise aucune ancienne couleur dans le rendu", () => {
    const { container } = render(<BlogIndex />);
    classesInterdites(container);
  });
});

describe("Article", () => {
  it("garde son H1 et une hiérarchie Hn sans saut", async () => {
    const { container } = await renderArticle(post());
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Article courant");
    sansSaut(container);
  });

  it("réduit son H1 sur smartphone sans césure", async () => {
    await renderArticle(post());
    h1Reduit();
  });

  it("lit le corps en Nunito Sans, titres internes en bleu nuit alignés à gauche", async () => {
    await renderArticle(post());
    const corps = screen.getByText("Contenu de l'article.").parentElement!;
    expect(corps).toHaveClass("prose", "font-sans");
    // La règle globale h3 (hors @layer) centre et grise : modificateurs `!`.
    expect(corps).toHaveClass("prose-h3:text-primary!", "prose-h3:mx-0!", "prose-h3:max-w-none!");
  });

  it("clôt l'article par un message clé quand l'en-tête en fournit un", async () => {
    await renderArticle(post({ keyMessage: "Une attention qu'on installe." }));
    const note = screen.getByRole("note", { name: "À retenir" });
    expect(note).toHaveTextContent("Une attention qu'on installe.");
    // Après le corps de l'article.
    const corps = screen.getByText("Contenu de l'article.").parentElement!;
    expect(corps.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("n'affiche aucun message clé sans keyMessage", async () => {
    await renderArticle(post());
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("affiche les étiquettes en pastilles ciel, simples éléments de liste", async () => {
    await renderArticle(post());
    const tag = screen.getByText("QVCT");
    expect(tag.tagName).toBe("LI");
    expect(tag).toHaveClass("bg-sky", "text-primary", "rounded-full");
  });

  it("garde le titre « À lire aussi » et présente les liens en cartes pastel alternées", async () => {
    await renderArticle(
      post({
        relatedPosts: [meta({ slug: "a", title: "Article A" }), meta({ slug: "b", title: "Article B" })],
      }),
    );
    const titre = screen.getByRole("heading", { level: 2, name: "À lire aussi — Formations QVCT / RPS" });
    const section = titre.parentElement!;
    const items = within(section).getAllByRole("listitem");
    expect(items[0]).toHaveClass("bg-sky");
    expect(items[1]).toHaveClass("bg-peach");
    expect(within(items[0]).getByRole("link", { name: "Article A" })).toHaveAttribute("href", "/blog/a");
  });

  it("n'utilise aucune ancienne couleur dans le rendu", async () => {
    const { container } = await renderArticle(
      post({ keyMessage: "Message.", relatedPosts: [meta({ slug: "a", title: "Article A" })] }),
    );
    classesInterdites(container);
  });
});

describe("Aperçu de relecture (Discord)", () => {
  it("partage le rendu de l'article : corps, message clé et étiquettes", async () => {
    await renderRelecture({ keyMessage: "Idée clé du brouillon." });
    expect(screen.getByText("Contenu.").parentElement).toHaveClass("prose", "font-sans", "prose-h3:text-primary!");
    expect(screen.getByRole("note", { name: "À retenir" })).toHaveTextContent("Idée clé du brouillon.");
    expect(screen.getByText("GAPP")).toHaveClass("bg-sky", "text-primary");
  });

  it("garde le texte du bandeau privé, sur fond pêche", async () => {
    await renderRelecture();
    const bandeau = screen.getByText(/Aperçu privé — brouillon non publié/);
    expect(bandeau).toHaveClass("bg-peach", "text-primary");
  });

  it("garde un seul H1, réduit sur smartphone", async () => {
    const { container } = await renderRelecture();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Brouillon en relecture");
    h1Reduit();
    sansSaut(container);
  });

  it("n'utilise aucune ancienne couleur dans le rendu", async () => {
    const { container } = await renderRelecture({ keyMessage: "Message." });
    classesInterdites(container);
  });
});

describe("Sources du blog", () => {
  const FICHIERS = [
    "app/blog/page.tsx",
    "app/blog/[slug]/page.tsx",
    "app/blog-review/[slug]/page.tsx",
    "components/blog/ArticleBody.tsx",
    "components/ShareButtons.tsx",
  ];

  // gray-* et amber-* sont hors palette (DESIGN.md).
  it.each(FICHIERS)("%s n'utilise ni gray-*, ni amber-*, ni ancienne couleur", (fichier) => {
    const source = readFileSync(join(root, fichier), "utf8");
    expect(source).not.toMatch(/-(?:secondary|muted|pastel)\b/);
    expect(source).not.toMatch(/\bgray-\d/);
    expect(source).not.toMatch(/\bamber-\d/);
  });

  it("la liste n'utilise plus CardDescription (texte muted-foreground, 4.2:1 sur pastel)", () => {
    expect(readFileSync(join(root, "app/blog/page.tsx"), "utf8")).not.toMatch(/CardDescription/);
  });
});
