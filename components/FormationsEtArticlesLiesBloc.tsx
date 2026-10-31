import ArticlesBlogLiesBloc from "@/components/ArticlesBlogLiesBloc";
import { SectionBanner } from "@/components/charte";
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
// Story 4.4 : la section s'ouvre par le bandeau « Formations disponibles »
// (vrai h2), pleine largeur au-dessus des cartes et de la colonne latérale.
export default function FormationsEtArticlesLiesBloc({
  famille,
  targetPage,
}: FormationsEtArticlesLiesBlocProps) {
  const articlesLies = getRelatedArticleLinks(targetPage);
  const hasRelatedArticles = articlesLies.length > 0;

  return (
    <section id="formations-disponibles" className="scroll-mt-20 bg-white pb-15">
      <SectionBanner title="Formations disponibles" />
      <div
        className={
          hasRelatedArticles
            ? "container wide mt-8 grid grid-cols-1 md:grid-cols-[1fr_320px] gap-10 items-start"
            : "container wide mt-8"
        }
      >
        <div>
          <FormationsDisponiblesBloc famille={famille} bare />
        </div>
        <ArticlesBlogLiesBloc targetPage={targetPage} variant="sidebar" liens={articlesLies} />
      </div>
    </section>
  );
}
