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
}

// Bloc partagé par les hubs Famille (Story 2.2/2.3) : liste les fiches
// réelles de la famille, ou un état vide honnête tant qu'aucune n'existe
// encore (cf. edge case UJ-1 du PRD) plutôt qu'une liste tronquée ou une
// erreur. Story 4.4 : cartes pastel ciel / pêche alternées, état vide dans
// une carte ciel.
export default function FormationsDisponiblesBloc({
  famille,
  bare = false,
}: FormationsDisponiblesBlocProps) {
  const formations = getAllFormationsMeta().filter((f) => f.famille === famille);

  const content =
    formations.length === 0 ? (
      <PastelCard as="div" tone="sky" className="p-8">
        <p className="text-lg text-primary">
          Les formations de cette famille arrivent bientôt. Revenez prochainement,
          ou contactez-nous pour en discuter dès maintenant.
        </p>
      </PastelCard>
    ) : (
      <ul role="list" className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {formations.map((formation, i) => (
          <PastelCard
            key={formation.slug}
            as="li"
            tone={i % 2 === 0 ? "sky" : "peach"}
            className="flex flex-col gap-3"
          >
            {/* Styles globaux h3 hors @layer (gris, centré) : modificateurs `!`. */}
            <h3 className="font-display! text-lg! font-black! text-primary! m-0! max-w-none! leading-snug">
              {formation.titre}
            </h3>
            <p className="text-sm text-primary/80 mt-auto">{formation.duree}</p>
            <Link
              href={`/formations/${formation.famille}/${formation.slug}`}
              className={buttonVariants({ variant: "tinted" })}
            >
              Voir la fiche
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
