import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { FORMATION_FAMILLES, getAllFormationsMeta, type FormationFamilleId } from "@/lib/formations";
import { cn } from "@/lib/utils";

// Pastille de catégorie par famille (rattrapage design Chantier B) : couleur
// dédiée par famille, distincte de la pastille "Toutes" et des CTA — dérivée
// des tokens --color-cat-* de app/globals.css, jamais du hex en dur.
const FAMILLE_TAG_CLASSES: Record<FormationFamilleId, string> = {
  "cadre-legal-etablissements-sante": "bg-cat-legal text-cat-legal-foreground",
  "prevention-rps-qvct-etablissements-sante": "bg-cat-prevention text-cat-prevention-foreground",
  "accompagnement-professionnel-etablissements-sante":
    "bg-cat-accompagnement text-cat-accompagnement-foreground",
  "dynamique-equipe-etablissements-sante": "bg-cat-dynamique text-cat-dynamique-foreground",
};

// Descriptions courtes pour les tuiles familles (Story 2.4) : propres à cet
// usage, distinctes du seul `label` de FORMATION_FAMILLES qui sert aussi aux
// pastilles de filtre ci-dessous.
const FAMILLE_TUILE_DESCRIPTIONS: Record<FormationFamilleId, string> = {
  "cadre-legal-etablissements-sante":
    "Sécuriser les obligations légales de l'établissement et outiller l'encadrement sur ses responsabilités.",
  "prevention-rps-qvct-etablissements-sante":
    "Gestion du stress, des émotions et prévention de l'usure professionnelle.",
  "accompagnement-professionnel-etablissements-sante":
    "Intégration, tutorat et montée en compétences pour l'encadrement de proximité.",
  "dynamique-equipe-etablissements-sante":
    "Renforcer la coopération et la cohésion d'une équipe dans la durée.",
};

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

  // État vide honnête par famille (rattrapage design, cf. edge case UJ-1 du
  // PRD) : une famille sans fiche encore publiée affiche une carte "Bientôt
  // disponible" à sa place dans la grille, plutôt qu'être simplement absente
  // (vue Toutes) ou laisser une grille vide (famille filtrée).
  const famillesCibles = activeFamille
    ? FORMATION_FAMILLES.filter((f) => f.id === activeFamille)
    : FORMATION_FAMILLES;
  const famillesSansFormation = famillesCibles.filter(
    (f) => !formationsAffichees.some((formation) => formation.famille === f.id)
  );

  return (
    <div className="pt-6 sm:pt-20 mb-40">
      <Breadcrumbs items={[{ label: "Formations" }]} />
      <div className="container mb-10">
        <h1 className="mb-4">Formations professionnelles</h1>
        <p className="text-sm text-stone-600 max-w-2xl">
          Un catalogue de formations sur-mesure pour les établissements de
          santé, conçues et animées par une ancienne soignante.
        </p>
      </div>

      <section className="container mb-14" aria-label="Familles de formations">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FORMATION_FAMILLES.map((f) => (
            <div
              key={f.id}
              className="bg-stone-50 p-8 rounded-2xl border border-stone-100 hover:shadow-xl transition duration-300"
            >
              <h2 className="text-lg font-bold text-primary mb-3">{f.label}</h2>
              <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                {FAMILLE_TUILE_DESCRIPTIONS[f.id]}
              </p>
              <Link href={`/formations/${f.id}`} className={buttonVariants({ variant: "tinted" })}>
                Découvrir
              </Link>
            </div>
          ))}
        </div>
      </section>

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
              <span
                className={cn(
                  FAMILLE_TAG_CLASSES[formation.famille],
                  "text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 w-fit"
                )}
              >
                {familleLabel}
              </span>
              <h2 className="text-lg font-bold text-primary">{formation.titre}</h2>
              <p className="text-xs text-stone-500 mt-auto">{formation.duree}</p>
              <Link
                href={`/formations/${formation.famille}/${formation.slug}`}
                className={buttonVariants({ variant: "accent" })}
              >
                Voir la fiche
              </Link>
            </div>
          );
        })}
        {famillesSansFormation.map((f) => (
          <div
            key={f.id}
            className="border border-dashed border-stone-300 bg-stone-50/60 rounded-xl p-6 flex flex-col gap-3"
          >
            <span
              className={cn(
                FAMILLE_TAG_CLASSES[f.id],
                "text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 w-fit"
              )}
            >
              {f.label}
            </span>
            <h2 className="text-lg font-bold text-primary">Bientôt disponible</h2>
            <p className="text-xs text-stone-500 mt-auto">
              Cette famille est en cours de rédaction — aucune fiche publiée pour l&apos;instant.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
