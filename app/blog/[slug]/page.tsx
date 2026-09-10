import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import PostJsonLd from "@/components/PostJsonLd";
import ShareButtons from "@/components/ShareButtons";
import { getAllPostsMeta, getPostBySlug, getPostSlugs } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";
import { SITE } from "@/lib/siteIdentifiers";
import { PILLARS } from "@/services/blog/pillars";

import type { Metadata } from "next";

export function generateStaticParams() {
  // Tant que le blog n'est pas lancé publiquement, aucune page n'est
  // pré-générée — cf. lib/featureFlags.ts.
  if (!isBlogPublic()) return [];
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!isBlogPublic()) return {};

  const { slug } = await params;
  const post = getAllPostsMeta().find((p) => p.slug === slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} | Élan C'est Vous`,
      description: post.description,
      url: `https://elancestvous.fr/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: post.coverImage }],
    },
  };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!isBlogPublic()) notFound();

  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  const pillar = PILLARS.find((p) => p.id === post.pillar);
  const pillarLabel = pillar?.label;

  return (
    <article className="pt-20 mb-40">
      <PostJsonLd post={post} />
      <Breadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          // Un article publié avant #73 peut ne pas avoir de pilier connu
          // (pillar: null, rétrocompatibilité, cf. lib/blog.ts) — dans ce
          // cas, pas de niveau intermédiaire plutôt qu'un lien absent.
          ...(pillar ? [{ label: pillar.label, href: pillar.targetPage }] : []),
          { label: post.title },
        ]}
      />
      <div className="container max-w-3xl">
        <p className="text-xs text-stone-500 uppercase tracking-wide mb-2">
          {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {" · "}
          {post.readingTime}
        </p>
        <h1 className="mb-6">{post.title}</h1>
        <ShareButtons
          url={`${SITE}/blog/${post.slug}`}
          title={post.title}
          className="mb-8"
        />
        <div className="relative aspect-[16/9] mb-8 rounded-xl overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div
          className="prose prose-stone max-w-none"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-10">
            {post.tags.map((tag) => (
              <li
                key={tag}
                className="text-xs bg-pastel text-primary rounded-full px-3 py-1"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}
        {post.relatedPosts.length > 0 && (
          <div className="mt-12 border-t border-stone-200 pt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500 mb-4">
              À lire aussi{pillarLabel ? ` — ${pillarLabel}` : ""}
            </h2>
            <ul className="space-y-2">
              {post.relatedPosts.map((relatedPost) => (
                <li key={relatedPost.slug}>
                  <Link
                    href={`/blog/${relatedPost.slug}`}
                    className="text-primary underline underline-offset-2"
                  >
                    {relatedPost.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
