import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import GabaritPage from "@/components/GabaritPage";
import { getAllPostsMeta } from "@/lib/blog";
import { isBlogPublic } from "@/lib/featureFlags";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Conseils, retours d'expérience et ressources sur la QVCT, la prévention des RPS et le coaching des professionnels de santé.",
  alternates: {
    canonical: "/blog",
    types: {
      "application/rss+xml": "/blog/feed.xml",
    },
  },
  openGraph: {
    title: "Blog | Élan C'est Vous",
    description:
      "Conseils, retours d'expérience et ressources sur la QVCT, la prévention des RPS et le coaching des professionnels de santé.",
    url: "https://elancestvous.fr/blog",
    images: OG_BANNER_IMAGES,
  },
};

export default function BlogIndex() {
  if (!isBlogPublic()) notFound();

  const posts = getAllPostsMeta();

  return (
    <GabaritPage as="section" className="mb-40" filAriane={[{ label: "Blog" }]}>
      <div className="container mb-16">
        <h1>
          Le <BrushUnderline className="text-accent">blog</BrushUnderline>
        </h1>
        <p className="mt-5 text-primary/80">
          Ressources et réflexions autour de la santé au travail et de
          l&apos;accompagnement des soignants.
        </p>
      </div>

      {posts.length === 0 ? (
        <p className="container text-stone-600">
          Les premiers articles arrivent bientôt.
        </p>
      ) : (
        // Bandeau h2 ajouté (Cédric, 2026-11-03 : h1 h2 h3 sans saut) : les
        // titres d'article des cartes passent en h3 sous lui.
        <section aria-labelledby="tous-les-articles">
          <SectionBanner id="tous-les-articles" title="Tous les articles" className="mb-8" />
          <div className="container wide grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              {/* Cartes pastel alternées ciel / pêche (UX-DR2), sans ombre. */}
              <PastelCard
                as="div"
                tone={i % 2 === 0 ? "sky" : "peach"}
                className="h-full overflow-hidden p-0"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={post.coverImage}
                    alt={post.coverImageAlt}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="m-0 break-words group-hover:underline">{post.title}</h3>
                  <p className="mt-2 text-primary">{post.excerpt}</p>
                  <p className="mt-4 texte-mention text-stone-600">
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {" · "}
                    {post.readingTime}
                  </p>
                </div>
              </PastelCard>
            </Link>
          ))}
          </div>
        </section>
      )}
    </GabaritPage>
  );
}
