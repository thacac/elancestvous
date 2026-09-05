import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { parseDraftContent, renderMarkdownToSafeHtml } from "@/lib/blog";
import { verifyReviewToken } from "@/lib/reviewToken";
import { createGithubBlogRepo, parseGithubRepoEnv } from "@/services/blog/githubBlogRepo";

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
    auth: requireEnv("GITHUB_BLOG_PAT"),
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
    <article className="pt-20 mb-40">
      <div className="container max-w-3xl">
        <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          🔒 Aperçu privé — brouillon non publié, réservé aux personnes ayant reçu ce
          lien.
        </p>
        <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
          {new Date(frontmatter.publishedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 className="mb-6">{frontmatter.title}</h1>
        {coverDataUrl && (
          <div className="relative aspect-[16/9] mb-8 rounded-xl overflow-hidden">
            <Image
              src={coverDataUrl}
              alt={frontmatter.coverImageAlt ?? ""}
              fill
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        )}
        <div
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {frontmatter.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-10">
            {frontmatter.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs bg-pastel text-primary rounded-full px-3 py-1"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
