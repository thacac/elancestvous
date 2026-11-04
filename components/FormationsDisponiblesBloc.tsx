import Link from "next/link";

import { PastelCard, SectionBanner } from "@/components/charte";
import { buttonVariants } from "@/components/ui/button";
import { getAllFormationsMeta, type FormationFamilleId } from "@/lib/formations";

interface FormationsDisponiblesBlocProps {
  famille: FormationFamilleId;
  // Story 3.2 : sur les hubs avec pilier blog, ce bloc s'intègre dans une
  // grille parente aux côtés d'une colonne latérale d'articles liés. Story
  // 4.4 : le parent porte alors la section et le bandeau « Formations
  // disponibles » (pleine largeur, au-dessus des deux colonnes) ; ce bloc ne
  // rend plus que les cartes.
  bare?: boolean;
  // Revue story 4.4 : à côté de la colonne d'articles liés (320 px), la
  // grille n'a plus la place pour 2 ou 3 cartes par ligne avant xl.
  compact?: boolean;
}

// Bloc partagé par les hubs Famille (Story 2.2/2.3) : liste les fiches
// réelles de la famille, ou un état vide honnête tant qu'aucune n'existe
// encore (cf. edge case UJ-1 du PRD) plutôt qu'une liste tronquée ou une
// erreur. Story 4.4 : cartes pastel ciel / pêche alternées, état vide dans
// une carte ciel.
export default function FormationsDisponiblesBloc({
  famille,
  bare = false,
  compact = false,
}: FormationsDisponiblesBlocProps) {
  const formations = getAllFormationsMeta().filter((f) => f.famille === famille);

  const content =
    formations.length === 0 ? (
      <PastelCard as="div" tone="sky" className="p-8">
        <p className="text-primary">
          Les formations de cette famille arrivent bientôt. Revenez prochainement,
          ou contactez-nous pour en discuter dès maintenant.
        </p>
      </PastelCard>
    ) : (
      <ul
        role="list"
        className={
          compact
            ? "grid list-none gap-6 p-0 xl:grid-cols-2"
            : "grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {formations.map((formation, i) => (
          <PastelCard
            key={formation.slug}
            as="li"
            tone={i % 2 === 0 ? "sky" : "peach"}
            className="flex flex-col gap-3"
          >
            <h3 className="m-0 break-words">
              {formation.titre}
            </h3>
            <p className="texte-mention text-primary/80 mt-auto">{formation.duree}</p>
            <Link
              href={`/formations/${formation.famille}/${formation.slug}`}
              className={buttonVariants({ variant: "tinted" })}
            >
              {/* Story 4.10 (RGAA 6.1, validé par Cédric) : titre de la fiche
                  ajouté pour les lecteurs d'écran, texte visible inchangé. */}
              Voir la fiche<span className="sr-only"> : {formation.titre}</span>
            </Link>
          </PastelCard>
        ))}
      </ul>
    );

  if (bare) return content;

  return (
    <section id="formations-disponibles" className="scroll-mt-20 bg-white py-15">
      <SectionBanner title="Formations disponibles" />
      <div className="container wide mt-8">{content}</div>
    </section>
  );
}
