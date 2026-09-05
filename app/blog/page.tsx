import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui";
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
    <section className="pt-20 mb-40">
      <div className="container text-center mb-16">
        <h1>Le blog</h1>
        <h2 className="h3-like">
          Ressources et réflexions autour de la santé au travail et de
          l&apos;accompagnement des soignants.
        </h2>
      </div>

      {posts.length === 0 ? (
        <p className="container text-center text-stone-500">
          Les premiers articles arrivent bientôt.
        </p>
      ) : (
        <div className="container wide grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={post.coverImage}
                    alt={post.coverImageAlt}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-primary font-serif text-xl">
                    {post.title}
                  </CardTitle>
                  <CardDescription>{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent className="text-xs text-stone-500">
                  {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                  {" · "}
                  {post.readingTime}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
