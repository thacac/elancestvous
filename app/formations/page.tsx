import Image from "next/image";
import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import { buttonVariants } from "@/components/ui/button";
import { FORMATION_FAMILLES, getAllFormationsMeta, type FormationFamilleId } from "@/lib/formations";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";
import { cn } from "@/lib/utils";

import type { Metadata } from "next";

// Audit SEO (docs/seo-audit-architecture-formations.md, finding #1) : cette
// page héritait intégralement de la metadata du layout racine (canonical
// "/", titre et description génériques) faute de déclarer la sienne — même
// modèle que les 4 hubs famille.
export const metadata: Metadata = {
  title: "Formations professionnelles pour établissements de santé",
  description:
    "Catalogue de formations sur-mesure pour les établissements de santé, conçues et animées par une ancienne soignante.",
  alternates: {
    canonical: "/formations",
  },
  openGraph: {
    title: "Formations professionnelles pour établissements de santé | Élan C'est Vous",
    description:
      "Catalogue de formations sur-mesure pour les établissements de santé, conçues et animées par une ancienne soignante.",
    url: "https://elancestvous.fr/formations",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

// Pastille de catégorie par famille (rattrapage design Chantier B) : couleur
// dédiée par famille, distincte de la pastille "Toutes" et des CTA — dérivée
// des tokens --color-cat-* de app/globals.css, jamais du hex en dur.
// Story 4.4 : sur carte pastel, le fond cat-* se confond avec le ciel ou la
// pêche (≈ 1:1) ; la bordure dans la couleur de texte (≥ 5:1) garde la
// pastille visible.
const FAMILLE_TAG_CLASSES: Record<FormationFamilleId, string> = {
  "cadre-legal-etablissements-sante":
    "bg-cat-legal text-cat-legal-foreground border border-cat-legal-foreground",
  "prevention-rps-qvct-etablissements-sante":
    "bg-cat-prevention text-cat-prevention-foreground border border-cat-prevention-foreground",
  "accompagnement-professionnel-etablissements-sante":
    "bg-cat-accompagnement text-cat-accompagnement-foreground border border-cat-accompagnement-foreground",
  "dynamique-equipe-etablissements-sante":
    "bg-cat-dynamique text-cat-dynamique-foreground border border-cat-dynamique-foreground",
};

// Médaillons dessinés des tuiles (Story 4.3) : tirés des slides de
// formation, décoratifs (le titre de la tuile porte l'information).
const FAMILLE_TUILE_ILLUSTRATIONS: Record<FormationFamilleId, string> = {
  "cadre-legal-etablissements-sante": "/illustrations/presse-papiers-coche.jpg",
  "prevention-rps-qvct-etablissements-sante": "/illustrations/soignante-stressee.jpg",
  "accompagnement-professionnel-etablissements-sante": "/illustrations/soignante-explique.jpg",
  "dynamique-equipe-etablissements-sante": "/illustrations/collegues-en-tension.jpg",
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

// Filtre en forme de bouton du site, libellé autorisé à passer à la ligne.
const FILTRE_CLASSES = "h-auto min-h-9 whitespace-normal px-4 py-2 text-center";
const TAG_CLASSES = "text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1 w-fit";
// Styles globaux h3 hors @layer (gris, centré, globals.css) : modificateurs `!`.
const TITRE_CARTE_CLASSES =
  "font-display! text-lg! font-black! text-primary! m-0! max-w-none! leading-snug break-words hyphens-auto";

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
        <h1 className="mb-4 text-4xl! sm:text-5xl! lg:text-6xl!">
          Formations <BrushUnderline>professionnelles</BrushUnderline>
        </h1>
        <p className="text-sm text-primary/80 max-w-2xl">
          Un catalogue de formations sur-mesure pour les établissements de
          santé, conçues et animées par une ancienne soignante.
        </p>
      </div>

      <section className="container mb-14" aria-label="Familles de formations">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Story 4.3 : tuiles en cartes pastel ciel / pêche alternées. */}
          {FORMATION_FAMILLES.map((f, i) => (
            <PastelCard
              key={f.id}
              as="div"
              tone={i % 2 === 0 ? "sky" : "peach"}
              className="flex flex-col p-8"
            >
              <Image
                src={FAMILLE_TUILE_ILLUSTRATIONS[f.id]}
                alt=""
                width={128}
                height={128}
                sizes="128px"
                className="mb-4 size-32 rounded-full border-4 border-white object-cover"
              />
              <h2 className="font-display! text-xl! font-black! text-primary! mb-3! break-words">{f.label}</h2>
              <p className="text-primary/80 mb-4 text-sm leading-relaxed">
                {FAMILLE_TUILE_DESCRIPTIONS[f.id]}
              </p>
              <Link href={`/formations/${f.id}`} className={cn(buttonVariants({ variant: "tinted" }), "mt-auto w-fit")}>
                Découvrir
              </Link>
            </PastelCard>
          ))}
        </div>
      </section>

      {/* Story 4.4 : les filtres restent des liens (AD-5), en forme de
          bouton (rounded-md, jamais de pilule : PRD §4.7). Le libellé peut
          passer à la ligne : en whitespace-nowrap, « Dynamique d'équipe et
          développement professionnel » débordait à 320 px. Le filtre actif
          est signalé par aria-current, pas seulement par sa couleur. */}
      {/* Story 4.4 : la liste des fiches s'ouvre par un bandeau (titre
          ajouté, validé par Cédric : « le SEO, c'est d'abord le contenu »),
          filtres et cartes dans la même section. */}
      <section id="toutes-nos-formations" className="scroll-mt-20">
        <SectionBanner title="Toutes nos formations" />
        <nav
          aria-label="Filtre par catégorie"
          className="container flex flex-wrap gap-2 mt-8 mb-10"
        >
          <Link
            href="/formations"
            aria-current={activeFamille ? undefined : "page"}
            className={cn(
              buttonVariants({ variant: activeFamille ? "tinted" : "default" }),
              FILTRE_CLASSES
            )}
          >
            Toutes
          </Link>
          {FORMATION_FAMILLES.map((f) => (
            <Link
              key={f.id}
              href={`/formations?famille=${f.id}`}
              aria-current={activeFamille === f.id ? "page" : undefined}
              className={cn(
                buttonVariants({ variant: activeFamille === f.id ? "default" : "tinted" }),
                FILTRE_CLASSES
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>

        {/* Story 4.4 : cartes pastel ciel / pêche alternées, fiches puis
            familles encore vides. */}
        <div className="container">
          <ul
            role="list"
            aria-label="Formations du catalogue"
            className="grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3"
          >
            {formationsAffichees.map((formation, i) => {
              const familleLabel = FORMATION_FAMILLES.find(
                (f) => f.id === formation.famille
              )!.label;
              return (
                <PastelCard
                  key={formation.slug}
                  as="li"
                  tone={i % 2 === 0 ? "sky" : "peach"}
                  className="flex flex-col gap-3"
                >
                  <span className={cn(FAMILLE_TAG_CLASSES[formation.famille], TAG_CLASSES)}>
                    {familleLabel}
                  </span>
                  <h3 className={TITRE_CARTE_CLASSES}>{formation.titre}</h3>
                  <p className="text-sm text-primary/80 mt-auto">{formation.duree}</p>
                  <Link
                    href={`/formations/${formation.famille}/${formation.slug}`}
                    className={buttonVariants({ variant: "accent" })}
                  >
                    Voir la fiche
                  </Link>
                </PastelCard>
              );
            })}
            {famillesSansFormation.map((f, j) => (
              <PastelCard
                key={f.id}
                as="li"
                tone={(formationsAffichees.length + j) % 2 === 0 ? "sky" : "peach"}
                className="flex flex-col gap-3 border-2 border-dashed border-petrol"
              >
                <span className={cn(FAMILLE_TAG_CLASSES[f.id], TAG_CLASSES)}>
                  {f.label}
                </span>
                {/* Dessin décoratif (bloc-notes des slides) : « en cours de rédaction ». */}
                <Image
                  src="/illustrations/bloc-notes-stylo.jpg"
                  alt=""
                  width={80}
                  height={80}
                  sizes="80px"
                  className="size-20 rounded-full border-4 border-white object-cover"
                />
                <h3 className={TITRE_CARTE_CLASSES}>Bientôt disponible</h3>
                <p className="text-sm text-primary/80 mt-auto">
                  Cette famille est en cours de rédaction — aucune fiche publiée pour l&apos;instant.
                </p>
              </PastelCard>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
