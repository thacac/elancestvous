import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/reviewToken", () => ({
  verifyReviewToken: () => true,
}));

vi.mock("@/services/blog/githubBlogRepo", () => ({
  createGithubBlogRepo: () => ({
    getDraftContent: async () => ({ markdown: "raw", coverImage: null }),
  }),
  parseGithubRepoEnv: () => ({ owner: "thacac", repo: "elancestvous" }),
}));

vi.mock("@/lib/blog", () => ({
  parseDraftContent: () => ({
    frontmatter: {
      title: "Brouillon en relecture",
      publishedAt: "2026-01-01",
      tags: [],
    },
    content: "Contenu du brouillon.",
  }),
  renderMarkdownToSafeHtml: async () => "<p>Contenu du brouillon.</p>",
}));

import BlogReviewPage from "../page";

describe("BlogReviewPage — espacement sous la navbar (mobile)", () => {
  it("réduit le padding-top mobile plutôt que le padding desktop fixe (pt-20)", async () => {
    process.env.GITHUB_REPO = "thacac/elancestvous";
    process.env.GH_PAT_TOKEN = "token";
    process.env.BLOG_REVIEW_SECRET = "secret";

    const jsx = await BlogReviewPage({
      params: Promise.resolve({ slug: "brouillon-test" }),
      searchParams: Promise.resolve({ token: "valide" }),
    });
    const { container } = render(jsx);
    const article = container.querySelector("article")!;

    expect(article.className).toContain("pt-6");
    expect(article.className).toContain("sm:pt-20");
  });
});
