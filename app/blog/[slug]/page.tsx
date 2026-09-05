import Image from "next/image";
import { notFound } from "next/navigation";

import PostJsonLd from "@/components/PostJsonLd";
import { getAllPostsMeta, getPostBySlug, getPostSlugs } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";

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

  return (
    <article className="pt-20 mb-40">
      <PostJsonLd post={post} />
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
      </div>
    </article>
  );
}
