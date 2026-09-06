import Link from "next/link";

import JsonLdScript from "@/components/JsonLdScript";
import { SITE } from "@/lib/siteIdentifiers";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail: BreadcrumbItem[] = [{ label: "Accueil", href: "/" }, ...items];
  // Le fil d'Ariane accepte `items: []` (page de plus haut niveau) : dans ce
  // cas, "Accueil" est le seul élément et doit rester un vrai lien plutôt
  // qu'être traité comme la page courante.
  const lastIndex = items.length > 0 ? trail.length - 1 : -1;

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
      <JsonLdScript data={jsonLd} />
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
