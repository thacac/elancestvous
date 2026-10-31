import Image from "next/image";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/blog/ArticleBody";
import { parseDraftContent, renderMarkdownToSafeHtml } from "@/lib/blog";
import { verifyReviewToken } from "@/lib/reviewToken";
import { createGithubBlogRepo, parseGithubRepoEnv } from "@/services/blog/githubBlogRepo";

import type { Metadata } from "next";

// Le brouillon vit uniquement sur la branche GitHub blog-draft/<slug> — le
// conteneur de production ne contient pas content/_drafts (voir
// docs/blog-architecture.md). Cette page doit donc toujours aller le
// chercher au moment de la requête, jamais au build.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Aperçu — brouillon",
  robots: { index: false, follow: false },
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable d'environnement manquante : ${name}`);
  return value;
}

async function loadDraft(slug: string) {
  const { owner, repo } = parseGithubRepoEnv(requireEnv("GITHUB_REPO"));
  const github = createGithubBlogRepo({
    auth: requireEnv("GH_PAT_TOKEN"),
    owner,
    repo,
  });
  return github.getDraftContent(slug);
}

export default async function BlogReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { slug } = await params;
  const { token } = await searchParams;

  if (!token || !verifyReviewToken(slug, token, requireEnv("BLOG_REVIEW_SECRET"))) {
    notFound();
  }

  const draft = await loadDraft(slug);
  if (!draft) notFound();

  const { frontmatter, content } = parseDraftContent(draft.markdown, slug);
  const html = await renderMarkdownToSafeHtml(content);
  const coverDataUrl = draft.coverImage
    ? `data:image/jpeg;base64,${draft.coverImage.toString("base64")}`
    : null;

  return (
    <article className="pt-6 sm:pt-20 mb-40">
      <div className="container max-w-3xl">
        <p className="mb-6 rounded-lg bg-peach px-4 py-3 text-sm text-primary">
          🔒 Aperçu privé — brouillon non publié, réservé aux personnes ayant reçu ce
          lien.
        </p>
        <p className="text-xs text-stone-600 uppercase tracking-wide mb-2">
          {new Date(frontmatter.publishedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mb-6 text-3xl! sm:text-5xl! lg:text-6xl! break-words">{frontmatter.title}</h1>
        {coverDataUrl && (
          <div className="relative aspect-[16/9] mb-8 rounded-3xl overflow-hidden">
            <Image
              src={coverDataUrl}
              alt={frontmatter.coverImageAlt ?? frontmatter.title}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        )}
        {/* Même rendu que l'article publié (components/blog/ArticleBody). */}
        <ArticleBody html={html} keyMessage={frontmatter.keyMessage} tags={frontmatter.tags} />
      </div>
    </article>
  );
}
