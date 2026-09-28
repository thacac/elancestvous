import Link from "next/link";

import ArticulationBloc from "@/components/ArticulationBloc";
import { getRelatedArticleLinks, type RelatedArticleLink } from "@/lib/relatedArticles";

interface ArticlesBlogLiesBlocProps {
  targetPage: string;
  // Story 3.2 : sur les hubs Famille disposant d'un pilier, ce bloc devient
  // une colonne latérale sticky (à partir de lg) plutôt que le bandeau
  // pleine largeur utilisé sur les autres pages de service.
  variant?: "default" | "sidebar";
  // Story 3.2 : quand l'appelant a déjà besoin des liens pour une décision
  // de mise en page (ex. réserver ou non la colonne latérale), il les passe
  // ici pour éviter un second appel (et une seconde lecture de
  // content/blog/) redondant avec le premier.
  liens?: RelatedArticleLink[];
}

// Maillage retour blog → page de service (issue #72) : rendu partagé par
// toutes les pages de service, chacune se limitant à déclarer sa propre
// route en prop. Ne rend rien tant qu'aucun article ne cible encore cette
// page — éviter un bloc "Pour aller plus loin" vide reste plus important
// ici que la constance visuelle entre pages.
export default function ArticlesBlogLiesBloc({
  targetPage,
  variant = "default",
  liens: liensProp,
}: ArticlesBlogLiesBlocProps) {
  const liens = liensProp ?? getRelatedArticleLinks(targetPage);
  if (liens.length === 0) return null;

  if (variant === "sidebar") {
    return (
      <aside className="lg:sticky lg:top-24">
        <div className="bg-stone-50 rounded-2xl border border-stone-100 p-6">
          <h2 className="text-primary font-bold text-lg mb-4">Pour aller plus loin</h2>
          <ul className="space-y-3">
            {liens.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="text-accent font-semibold text-sm underline underline-offset-2 hover:text-primary"
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <ArticulationBloc
      titre="Pour aller plus loin :"
      textePrincipal="Quelques articles du blog en lien avec cet accompagnement."
      texteSecondaire=""
      liens={liens}
    />
  );
}
