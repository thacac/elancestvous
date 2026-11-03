import Breadcrumbs, { type BreadcrumbItem } from "@/components/Breadcrumbs";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface GabaritPageProps {
  /** Fil d'Ariane de la page, sans « Accueil » (ajouté par Breadcrumbs). */
  filAriane: BreadcrumbItem[];
  children: ReactNode;
  /** Balise du cadre de la page : "div" par défaut. */
  as?: "div" | "section" | "article";
  id?: string;
  /** Classes propres à la page (hauteur, débordement, marge du bas…). */
  className?: string;
}

// Story 4.13 : seul endroit qui pose le haut de page de toutes les pages
// publiques (hors accueil) — le blanc sous le menu, puis le fil d'Ariane et
// son JSON-LD. Le contenu de la page suit directement, H1 en tête, sans
// padding ni marge haute intermédiaire (modèle du catalogue, story 4.11).
export default function GabaritPage({
  filAriane,
  children,
  as: Element = "div",
  id,
  className,
}: GabaritPageProps) {
  return (
    <Element id={id} className={cn("pt-6 sm:pt-20", className)}>
      <Breadcrumbs items={filAriane} />
      {children}
    </Element>
  );
}
