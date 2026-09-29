import Link from "next/link";
import { notFound } from "next/navigation";

import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { FORMATION_FAMILLES, getAllFormationsMeta, getFormationBySlug } from "@/lib/formations";

export function generateStaticParams() {
  return getAllFormationsMeta().map((formation) => ({
    famille: formation.famille,
    slug: formation.slug,
  }));
}

function ChampQualiopi({
  label,
  valeur,
}: {
  label: string;
  valeur: string | null;
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 mb-1">
        {label}
      </div>
      <div className="text-sm font-semibold text-primary">
        {valeur ?? <span className="italic text-accent">[À confirmer]</span>}
      </div>
    </div>
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
    <article className="pt-20 mb-40">
      <Breadcrumbs
        items={[
          { label: "Formations", href: "/formations" },
          { label: familleLabel },
          { label: formationDetail.titre },
        ]}
      />
      <div className="container grid gap-12 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <h1 className="mb-6">{formationDetail.titre}</h1>
          <div
            className="prose prose-stone max-w-none mb-10"
            dangerouslySetInnerHTML={{ __html: formationDetail.html }}
          />

          <section className="mb-10">
            <h2 className="text-xl font-bold text-primary mb-4">
              Objectifs pédagogiques
            </h2>
            <ul className="space-y-2">
              {formationDetail.objectifsPedagogiques.map((objectif) => (
                <li key={objectif} className="flex gap-2 text-sm text-stone-700">
                  <span aria-hidden="true" className="text-accent">
                    —
                  </span>
                  {objectif}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-primary mb-4">Programme</h2>
            <div className="flex flex-col">
              {formationDetail.programme.map((module, i) => (
                <div
                  key={i}
                  className="flex gap-5 py-4 border-t border-stone-200 last:border-b"
                >
                  <span className="font-serif font-semibold text-lg text-logo w-8 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <strong className="text-primary">{module.titre}</strong>
                    <p className="mt-1.5 text-sm text-stone-600">{module.texte}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-bold text-primary mb-4">Public visé</h2>
            <div className="flex flex-wrap gap-2">
              {formationDetail.publicVise.map((public_) => (
                <span
                  key={public_}
                  className="text-xs bg-pastel text-primary rounded-full px-3 py-1"
                >
                  {public_}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary mb-4">
              Modalités pédagogiques et d&rsquo;évaluation
            </h2>
            <p className="text-sm text-stone-700">
              {formationDetail.modalitesEvaluation}
            </p>
          </section>
        </div>

        <div className="sticky top-24 self-start">
          <div className="border border-stone-200 rounded-xl p-8 flex flex-col gap-6">
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
            />
            <ChampQualiopi
              label="Indicateurs de résultats"
              valeur={formationDetail.indicateursResultats}
            />
            <Button asChild variant="accent" size="lg">
              <Link href="/contact">Demander un devis</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container border-t border-stone-200 mt-14 pt-8">
        <Link
          href="/formations"
          className="text-sm font-semibold text-primary hover:underline underline-offset-2"
        >
          &larr; Retour au catalogue des formations
        </Link>
      </div>
    </article>
  );
}
