import JsonLdScript from "@/components/JsonLdScript";
import type { Post } from "@/lib/blog";
import { SITE, ORG_ID, PERSON_ID } from "@/lib/siteIdentifiers";

export default function PostJsonLd({ post }: { post: Post }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${SITE}/blog/${post.slug}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}/blog/${post.slug}` },
    headline: post.title,
    description: post.description,
    image: `${SITE}${post.coverImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "fr-FR",
    keywords: post.tags.join(", "),
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
  };

  return <JsonLdScript data={jsonLd} />;
}
