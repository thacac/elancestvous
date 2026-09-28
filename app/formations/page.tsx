import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { FORMATION_FAMILLES, getAllFormationsMeta } from "@/lib/formations";
import { cn } from "@/lib/utils";

export default async function FormationsCataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ famille?: string }>;
}) {
  const { famille } = await searchParams;

  // Un ?famille= inconnu (lien cassé, param mal formé) restaure la liste
  // complète plutôt que d'afficher une grille vide ou de planter — AD-5, le
  // filtre vit dans l'URL mais ne doit jamais devenir un état invalide.
  const activeFamille = FORMATION_FAMILLES.some((f) => f.id === famille)
    ? famille
    : undefined;

  const toutesFormations = getAllFormationsMeta();
  const formationsAffichees = activeFamille
    ? toutesFormations.filter((formation) => formation.famille === activeFamille)
    : toutesFormations;

  return (
    <div className="pt-20 mb-40">
      <div className="container mb-10">
        <h1 className="mb-4">Formations professionnelles</h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Un catalogue de formations sur-mesure pour les établissements de
          santé, conçues et animées par une ancienne soignante.
        </p>
      </div>

      <nav
        aria-label="Filtre par catégorie"
        className="container flex flex-wrap gap-2 mb-10"
      >
        <Link
          href="/formations"
          className={cn(
            buttonVariants({ variant: activeFamille ? "tinted" : "default" }),
            "rounded-full"
          )}
        >
          Toutes
        </Link>
        {FORMATION_FAMILLES.map((f) => (
          <Link
            key={f.id}
            href={`/formations?famille=${f.id}`}
            className={cn(
              buttonVariants({ variant: activeFamille === f.id ? "default" : "tinted" }),
              "rounded-full"
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>

      <div className="container grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {formationsAffichees.map((formation) => {
          const familleLabel = FORMATION_FAMILLES.find(
            (f) => f.id === formation.famille
          )!.label;
          return (
            <div
              key={formation.slug}
              className="border border-stone-200 rounded-xl p-6 flex flex-col gap-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wide bg-pastel text-primary rounded-full px-3 py-1 w-fit">
                {familleLabel}
              </span>
              <h2 className="text-lg font-bold text-primary">{formation.titre}</h2>
              <p className="text-xs text-stone-500 mt-auto">{formation.duree}</p>
              <Link
                href={`/formations/${formation.famille}/${formation.slug}`}
                className={buttonVariants({ variant: "tinted" })}
              >
                Voir la fiche
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
