import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Chip, PastelCard, Steps } from "@/components/charte";
import GabaritPage from "@/components/GabaritPage";
import { Button } from "@/components/ui/button";
import { FORMATION_FAMILLES, getAllFormationsMeta, getFormationBySlug } from "@/lib/formations";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export function generateStaticParams() {
  return getAllFormationsMeta().map((formation) => ({
    famille: formation.famille,
    slug: formation.slug,
  }));
}

// Audit SEO (docs/seo-audit-architecture-formations.md, finding #1) : cette
// route dynamique ne déclarait aucune metadata, donc chaque fiche héritait
// du canonical "/" du layout racine — un signal qui dit à Google que la
// fiche est un doublon de l'accueil. Même modèle que app/blog/[slug]/page.tsx :
// `{}` (pas de metadata dédiée) quand la fiche n'existe pas ou que l'URL ne
// correspond pas à sa famille réelle — le 404 reste géré par la page elle-même.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ famille: string; slug: string }>;
}): Promise<Metadata> {
  const { famille, slug } = await params;

  let formationData;
  try {
    formationData = await getFormationBySlug(slug);
  } catch {
    return {};
  }

  if (formationData.famille !== famille) {
    return {};
  }

  // Non-null : famille est déjà validé par le schéma zod contre
  // FORMATION_FAMILLE_IDS, dérivé de ce même tableau — toujours trouvé.
  const familleLabel = FORMATION_FAMILLES.find(
    (f) => f.id === formationData.famille
  )!.label;
  const canonicalPath = `/formations/${formationData.famille}/${formationData.slug}`;
  const description = `Formation « ${formationData.titre} » (${familleLabel}) pour les établissements de santé : ${formationData.objectifsPedagogiques[0]}.`;
  // SEO first : titre court s'il existe, et `absolute` pour ne pas ajouter
  // le suffixe « | Élan C'est Vous » du layout (titre coupé par Google).
  const titreSeo = formationData.titreSeo ?? formationData.titre;

  return {
    title: { absolute: titreSeo },
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: titreSeo,
      description,
      url: `https://elancestvous.fr${canonicalPath}`,
      type: "website",
      images: OG_BANNER_IMAGES,
    },
  };
}

function ChampQualiopi({
  label,
  valeur,
  complement,
}: {
  label: string;
  valeur: string | null;
  complement?: ReactNode;
}) {
  return (
    <div>
      <div className="texte-mention font-semibold uppercase tracking-wide text-primary/80 mb-1">
        {label}
      </div>
      <div className="font-semibold text-primary">
        {/* NFR3 : placeholder distinct d'une vraie valeur par l'italique et
            un cadre pointillé, pas seulement par la couleur (accent : 5.1:1
            sur le ciel). */}
        {valeur ?? (
          <span className="inline-block rounded-md border-2 border-dashed border-accent px-2 italic text-accent">
            [À confirmer]
          </span>
        )}
      </div>
      {valeur !== null && complement}
    </div>
  );
}

// Titre de section de la fiche (Story 4.4) : un bandeau pleine largeur ne
// tient pas dans la colonne de lecture, à côté de la fiche pratique sticky ;
// on garde donc la barre orange et le Nunito des bandeaux, sans l'aplat
// pétrole. Taille h2 de l'échelle globale (globals.css), marge propre en `!`.
function TitreSection({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-stretch gap-3 font-black! tracking-normal! mb-6!">
      <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-orange" />
      <span>{children}</span>
    </h2>
  );
}

// CTA de la fiche, pré-rempli avec la formation (provenance) : un seul
// rendu pour le haut de la fiche pratique et la répétition de bas de fiche.
// Référent handicap : la demande d'adaptation passe par le formulaire du
// site, pré-rempli avec la fiche (même modèle que le CTA devis). Cible d'au
// moins 24 × 24 px (WCAG 2.2, 2.5.8).
function LienContactHandicap({ titre }: { titre: string }) {
  return (
    <Link
      href={`/contact?${new URLSearchParams({
        type: "institution",
        sujet: `Adaptation handicap – formation « ${titre} »`,
      }).toString()}`}
      className="mt-1 inline-flex min-h-6 items-center font-semibold text-primary underline underline-offset-4 hover:decoration-2"
    >
      Formulaire de contact
    </Link>
  );
}

function CtaDevis({ titre }: { titre: string }) {
  return (
    <Button asChild variant="accent" size="lg">
      <Link
        href={`/contact?${new URLSearchParams({
          type: "institution",
          sujet: `Devis pour la formation « ${titre} »`,
        }).toString()}`}
      >
        Demander un devis
      </Link>
    </Button>
  );
}

export default async function FormationPage({
  params,
}: {
  params: Promise<{ famille: string; slug: string }>;
}) {
  const { famille, slug } = await params;

  let formationData;
  try {
    formationData = await getFormationBySlug(slug);
  } catch {
    notFound();
  }

  // L'URL déclare la famille (AD-4, app/formations/[famille]/[slug]) : une
  // fiche visitée sous la mauvaise famille est une 404, pas un rendu
  // silencieux sous une URL qui ne correspond pas à son contenu réel.
  if (formationData.famille !== famille) {
    notFound();
  }

  const formationDetail = formationData;
  // Non-null : famille est déjà validé par le schéma zod contre
  // FORMATION_FAMILLE_IDS, dérivé de ce même tableau — toujours trouvé.
  const familleLabel = FORMATION_FAMILLES.find(
    (f) => f.id === formationDetail.famille
  )!.label;

  return (
    <GabaritPage
      as="article"
      className="mb-40"
      filAriane={[
        { label: "Formations", href: "/formations" },
        { label: familleLabel },
        { label: formationDetail.titre },
      ]}
    >
      <div className="container grid gap-x-12 gap-y-10 lg:grid-cols-[1.7fr_1fr]">
        {/* min-w-0 : un mot long du titre (« établissements ») débordait à
            320 px de large ; la taille réduite et la coupure du H1 viennent
            de la règle h1 globale (story 4.13). */}
        <div className="min-w-0 lg:col-start-1">
          <h1 className="mb-6">{formationDetail.titre}</h1>
          <div
            className="prose prose-lg prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: formationDetail.html }}
          />
        </div>

        {/* Fiche pratique Qualiopi en carte ciel (Story 4.4). Règle « UI
            d'abord, efficace sur smartphone » : en une colonne, elle suit
            l'introduction (au lieu d'attendre la fin de la page) et s'ouvre
            par le CTA ; sur desktop, colonne de droite sur toute la hauteur,
            sticky. */}
        <div className="self-start lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:row-span-2">
          <PastelCard as="div" tone="sky" className="p-6 sm:p-8 flex flex-col gap-5">
            <CtaDevis titre={formationDetail.titre} />
            <ChampQualiopi label="Durée" valeur={formationDetail.duree} />
            <ChampQualiopi label="Format" valeur={formationDetail.format} />
            <ChampQualiopi label="Délai d'accès" valeur={formationDetail.delaiAcces} />
            <ChampQualiopi label="Prérequis" valeur={formationDetail.prerequis} />
            <ChampQualiopi label="Tarif" valeur={formationDetail.tarif} />
            <ChampQualiopi
              label="Accessibilité"
              valeur={formationDetail.accessibilite}
            />
            <ChampQualiopi
              label="Référent handicap"
              valeur={formationDetail.referentHandicap}
              complement={<LienContactHandicap titre={formationDetail.titre} />}
            />
            <ChampQualiopi
              label="Indicateurs de résultats"
              valeur={formationDetail.indicateursResultats}
            />
          </PastelCard>
        </div>

        <div className="min-w-0 lg:col-start-1">

          <section className="mb-12">
            {/* Dessin décoratif des slides (cible), le titre porte l'information. */}
            <div className="flex items-start justify-between gap-4">
              <TitreSection>Objectifs pédagogiques</TitreSection>
              <Image
                src="/illustrations/cible-flechee.jpg"
                alt=""
                width={96}
                height={96}
                sizes="(min-width: 640px) 96px, 64px"
                className="size-16 shrink-0 rounded-full border-4 border-sky object-cover sm:size-24"
              />
            </div>
            <ul role="list" className="list-none space-y-3 p-0">
              {formationDetail.objectifsPedagogiques.map((objectif) => (
                <li key={objectif} className="flex items-start gap-3 text-primary">
                  <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-accent" />
                  {objectif}
                </li>
              ))}
            </ul>
          </section>

          {/* Story 4.4 : modules enchaînés dans l'ordre → étapes numérotées
              (Steps), un h3 par module (choix « structure d'abord » de
              Cédric). */}
          <section className="mb-12">
            <TitreSection>Programme</TitreSection>
            <Steps
              steps={formationDetail.programme.map((module) => ({
                title: module.titre,
                description: module.texte,
              }))}
              // La colonne de lecture (≈ 574 px) loge 3 étapes en ligne, pas
              // plus : au-delà, grille de 2 colonnes.
              layout={formationDetail.programme.length > 3 ? "grid" : "row"}
            />
          </section>

          <section className="mb-12">
            <TitreSection>Public visé</TitreSection>
            <ul role="list" className="flex list-none flex-wrap gap-2 p-0">
              {formationDetail.publicVise.map((public_) => (
                <li key={public_}>
                  <Chip tone="petrol">
                    {public_}
                  </Chip>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <TitreSection>Modalités pédagogiques et d&rsquo;évaluation</TitreSection>
            <p className="text-primary">{formationDetail.modalitesEvaluation}</p>
          </section>

          {/* Sur mobile, la fiche pratique (et son CTA) est loin au-dessus une
              fois la lecture finie : on répète le CTA ici. Inutile sur
              desktop, où la fiche pratique sticky reste à l'écran. */}
          <div className="mt-12 flex justify-center lg:hidden">
            <CtaDevis titre={formationDetail.titre} />
          </div>
        </div>

      </div>

      <div className="container border-t border-stone-200 mt-14 pt-8">
        <Link
          href="/formations"
          className="font-semibold text-primary hover:underline underline-offset-2"
        >
          &larr; Retour au catalogue des formations
        </Link>
      </div>
    </GabaritPage>
  );
}
