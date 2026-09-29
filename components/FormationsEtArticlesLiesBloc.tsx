import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import FormationsDisponiblesBloc from "@/components/FormationsDisponiblesBloc";
import type { FormationFamilleId } from "@/lib/formations";
import { getRelatedArticleLinks } from "@/lib/relatedArticles";

interface FormationsEtArticlesLiesBlocProps {
  famille: FormationFamilleId;
  targetPage: string;
}

// Bloc partagé par les 4 hubs Famille (Story 2.2/2.3/3.2) : une seule et
// même mise en page — formations de la famille, articles de blog liés en
// colonne latérale sticky dès md quand au moins un article cible cette
// page — plutôt qu'une version dupliquée par page. Un hub sans pilier actif
// n'a besoin d'aucun code spécial : ArticlesBlogLiesBloc ne rend rien tant
// qu'aucun article ne le cible, et ce même hub adopte automatiquement la
// colonne latérale le jour où son pilier démarre.
export default function FormationsEtArticlesLiesBloc({
  famille,
  targetPage,
}: FormationsEtArticlesLiesBlocProps) {
  const articlesLies = getRelatedArticleLinks(targetPage);
  const hasRelatedArticles = articlesLies.length > 0;

  return (
    <div
      className={
        hasRelatedArticles
          ? "container py-14 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10 items-start"
          : "container py-14"
      }
    >
      <div>
        <FormationsDisponiblesBloc famille={famille} bare />
      </div>
      <ArticlesBlogLiesBloc targetPage={targetPage} variant="sidebar" liens={articlesLies} />
    </div>
  );
}
