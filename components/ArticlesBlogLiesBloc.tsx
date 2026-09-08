import ArticulationBloc from "@/components/ArticulationBloc";
import { getRelatedArticleLinks } from "@/lib/relatedArticles";

interface ArticlesBlogLiesBlocProps {
  targetPage: string;
}

// Maillage retour blog → page de service (issue #72) : rendu partagé par
// les 4 pages de service, chacune se limitant à déclarer sa propre route en
// prop. Ne rend rien tant qu'aucun article ne cible encore cette page —
// éviter un bloc "Pour aller plus loin" vide reste plus important ici que
// la constance visuelle entre pages.
export default function ArticlesBlogLiesBloc({
  targetPage,
}: ArticlesBlogLiesBlocProps) {
  const liens = getRelatedArticleLinks(targetPage);
  if (liens.length === 0) return null;

  return (
    <ArticulationBloc
      titre="Pour aller plus loin :"
      textePrincipal="Quelques articles du blog en lien avec cet accompagnement."
      texteSecondaire=""
      liens={liens}
    />
  );
}
