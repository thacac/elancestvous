import Link from "next/link";

import { SITE } from "@/lib/siteIdentifiers";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Accueil", href: "/" }, ...items];
  const lastIndex = trail.length - 1;

  const itemListElement = trail.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.label,
    ...(crumb.href ? { item: `${SITE}${crumb.href}` } : {}),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d'Ariane" className="container py-4 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-primary/70">
          {trail.map((crumb, index) => {
            const isLast = index === lastIndex;
            return (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
                {index > 0 && <span aria-hidden="true">/</span>}
                {isLast || !crumb.href ? (
                  <span aria-current={isLast ? "page" : undefined}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link href={crumb.href} className="hover:text-accent hover:underline">
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
