import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { getAllFormationsMeta, type FormationFamilleId } from "@/lib/formations";

interface FormationsDisponiblesBlocProps {
  famille: FormationFamilleId;
  // Story 3.2 : sur les hubs avec pilier blog, ce bloc s'intègre dans une
  // grille parente aux côtés d'une colonne latérale d'articles liés — le
  // parent porte alors son propre `container`, et un second `container`
  // imbriqué ici doublerait la marge intérieure.
  bare?: boolean;
}

// Bloc partagé par les hubs Famille (Story 2.2/2.3) : liste les fiches
// réelles de la famille, ou un état vide honnête tant qu'aucune n'existe
// encore (cf. edge case UJ-1 du PRD) plutôt qu'une liste tronquée ou une
// erreur.
export default function FormationsDisponiblesBloc({
  famille,
  bare = false,
}: FormationsDisponiblesBlocProps) {
  const formations = getAllFormationsMeta().filter((f) => f.famille === famille);

  const content = (
    <>
      <h2 className="text-primary text-3xl md:text-4xl font-extrabold mb-8">
        Formations disponibles
      </h2>
      {formations.length === 0 ? (
        <p className="text-stone-600">
          Les formations de cette famille arrivent bientôt. Revenez prochainement,
          ou contactez-nous pour en discuter dès maintenant.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {formations.map((formation) => (
            <div
              key={formation.slug}
              className="border border-stone-200 rounded-xl p-6 flex flex-col gap-3"
            >
              <h3 className="text-lg font-bold text-primary">{formation.titre}</h3>
              <p className="text-xs text-stone-500 mt-auto">{formation.duree}</p>
              <Link
                href={`/formations/${formation.famille}/${formation.slug}`}
                className={buttonVariants({ variant: "tinted" })}
              >
                Voir la fiche
              </Link>
            </div>
          ))}
        </div>
      )}
    </>
  );

  if (bare) return content;

  return <section className="container py-14">{content}</section>;
}
