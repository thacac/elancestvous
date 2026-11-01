import Image from "next/image";
import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import { FiltresDefilants } from "@/components/formations/FiltresDefilants";
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

// Ancre de la liste : un filtre ramène au résultat, pas en haut de page
// (règle « efficace sur smartphone »).
const ANCRE_LISTE = "toutes-nos-formations";

// Filtre en forme de bouton du site, libellé autorisé à passer à la ligne.
// Story 4.7 : sur smartphone, les filtres restent sur une ligne (la rangée
// défile) ; un libellé long passe à la ligne dans un filtre borné à 240 px,
// sinon « Dynamique d'équipe… » (369 px) dépassait la rangée à 320 px.
const FILTRE_CLASSES =
  "h-auto min-h-9 shrink-0 max-w-60 whitespace-normal px-4 py-2 text-center sm:max-w-none sm:shrink";
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
        <h1 className="mb-4 text-3xl! sm:text-5xl! lg:text-6xl! break-words">
          Formations <BrushUnderline>professionnelles</BrushUnderline>
        </h1>
        <p className="text-sm text-primary/80 max-w-2xl">
          Un catalogue de formations sur-mesure pour les établissements de
          santé, conçues et animées par une ancienne soignante.
        </p>
      </div>


      {/* Story 4.4 : les filtres restent des liens (AD-5), en forme de
          bouton (rounded-md, jamais de pilule : PRD §4.7). Le libellé peut
          passer à la ligne : en whitespace-nowrap, « Dynamique d'équipe et
          développement professionnel » débordait à 320 px. Le filtre actif
          est signalé par aria-current, pas seulement par sa couleur. */}
      {/* Story 4.4 : la liste des fiches s'ouvre par un bandeau (titre
          ajouté, validé par Cédric : « le SEO, c'est d'abord le contenu »),
          filtres et cartes dans la même section. */}
      <section id={ANCRE_LISTE} className="scroll-mt-20">
        <SectionBanner title="Toutes nos formations" />
        {/* Story 4.7 : sur smartphone, les filtres tiennent sur une ligne
            qui défile dans son propre conteneur (jamais la page), avec un
            fondu décoratif au bord droit qui signale la suite ; tabuler sur
            un filtre le fait défiler à l'écran. Plusieurs lignes dès sm. */}
        <nav aria-label="Filtre par catégorie" className="container mt-6 mb-8 sm:mt-8 sm:mb-10">
          <div className="relative -mx-1">
            <FiltresDefilants>
              <Link
                href={`/formations#${ANCRE_LISTE}`}
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
                  href={`/formations?famille=${f.id}#${ANCRE_LISTE}`}
                  aria-current={activeFamille === f.id ? "page" : undefined}
                  className={cn(
                    buttonVariants({ variant: activeFamille === f.id ? "default" : "tinted" }),
                    FILTRE_CLASSES
                  )}
                >
                  {f.label}
                </Link>
              ))}
            </FiltresDefilants>
            <span
              aria-hidden="true"
              data-fondu
              className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-white sm:hidden"
            />
          </div>
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
                {/* Famille ajoutée pour les lecteurs d'écran (RGAA 9.1, validé par
                    Cédric) : sinon plusieurs titres identiques. */}
                <h3 className={TITRE_CARTE_CLASSES}>
                  Bientôt disponible<span className="sr-only"> : {f.label}</span>
                </h3>
                <p className="text-sm text-primary/80 mt-auto">
                  Cette famille est en cours de rédaction — aucune fiche publiée pour l&apos;instant.
                </p>
              </PastelCard>
            ))}
          </ul>
        </div>
      </section>

      {/* Story 4.7 (Cédric, 2026-11-01) : les tuiles passent sous la liste,
          dans le HTML comme à l'écran (jamais par `order`, RGAA 10.3), pour
          que la première fiche arrive dans le premier écran mobile. Leur
          bandeau est un titre ajouté, validé par Cédric ; les titres des
          tuiles passent en h3 sous lui, textes inchangés. */}
      <section className="mt-16" aria-label="Familles de formations">
        <SectionBanner title="Explorer les formations par famille" />
        <div className="container mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Story 4.3 : tuiles en cartes pastel ciel / pêche alternées.
                Story 4.7 : sur smartphone, médaillon réduit à côté du titre
                (le décor se réduit sur petit écran). */}
            {FORMATION_FAMILLES.map((f, i) => (
              <PastelCard
                key={f.id}
                as="div"
                tone={i % 2 === 0 ? "sky" : "peach"}
                className="flex flex-col p-5 sm:p-8"
              >
                <div className="mb-3 flex items-center gap-4 sm:flex-col sm:items-start sm:gap-0">
                  <Image
                    src={FAMILLE_TUILE_ILLUSTRATIONS[f.id]}
                    alt=""
                    width={128}
                    height={128}
                    sizes="(min-width: 640px) 128px, 56px"
                    className="size-14 shrink-0 rounded-full border-2 border-white object-cover sm:mb-4 sm:size-32 sm:border-4"
                  />
                  <h3 className="font-display! text-xl! font-black! text-primary! m-0! max-w-none! leading-snug break-words min-w-0">
                    {f.label}
                  </h3>
                </div>
                <p className="text-primary/80 mb-4 text-sm leading-relaxed">
                  {FAMILLE_TUILE_DESCRIPTIONS[f.id]}
                </p>
                <Link href={`/formations/${f.id}`} className={cn(buttonVariants({ variant: "tinted" }), "mt-auto w-fit")}>
                  Découvrir
                </Link>
              </PastelCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
