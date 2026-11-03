import Image from "next/image";
import Link from "next/link";

import { BrushUnderline, PastelCard, SectionBanner } from "@/components/charte";
import GabaritPage from "@/components/GabaritPage";
import { buttonVariants } from "@/components/ui/button";
import { FORMATION_FAMILLES, type FormationFamilleId } from "@/lib/formations";
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

// Médaillons dessinés des tuiles (Story 4.3) : tirés des slides de
// formation, décoratifs (le titre de la tuile porte l'information).
const FAMILLE_TUILE_ILLUSTRATIONS: Record<FormationFamilleId, string> = {
  "cadre-legal-etablissements-sante": "/illustrations/presse-papiers-coche.jpg",
  "prevention-rps-qvct-etablissements-sante": "/illustrations/soignante-stressee.jpg",
  "accompagnement-professionnel-etablissements-sante": "/illustrations/soignante-explique.jpg",
  "dynamique-equipe-etablissements-sante": "/illustrations/collegues-en-tension.jpg",
};

// Descriptions courtes pour les tuiles familles (Story 2.4) : propres à cet
// usage, distinctes du seul `label` de FORMATION_FAMILLES.
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

// Cédric, 2026-11-03 : la double sélection (barre de filtres + tuiles) est
// abandonnée. Le catalogue ne présente que les 4 familles ; chaque hub
// Famille liste ses propres fiches. Un ancien lien ?famille= affiche
// simplement cette page (canonical inchangé, /formations).
export default function FormationsCataloguePage() {
  return (
    <GabaritPage className="mb-40" filAriane={[{ label: "Formations" }]}>
      <div className="container mb-10">
        <h1 className="mb-4">
          Formations <BrushUnderline className="text-accent">professionnelles</BrushUnderline>
        </h1>
        <p className="text-primary/80 max-w-2xl">
          Un catalogue de formations sur-mesure pour les établissements de
          santé, conçues et animées par une ancienne soignante.
        </p>
      </div>

      {/* Revue : la région prend le nom de son titre visible. */}
      <section aria-labelledby="explorer-par-famille">
        <SectionBanner id="explorer-par-famille" title="Explorer les formations par famille" />
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
                  <h3 className="m-0 break-words min-w-0">
                    {f.label}
                  </h3>
                </div>
                <p className="text-primary/80 mb-4 leading-relaxed">
                  {FAMILLE_TUILE_DESCRIPTIONS[f.id]}
                </p>
                <Link href={`/formations/${f.id}`} className={cn(buttonVariants({ variant: "tinted" }), "mt-auto w-fit")}>
                  {/* Story 4.10 : famille ajoutée pour les lecteurs d'écran. */}
                  Découvrir<span className="sr-only"> : {f.label}</span>
                </Link>
              </PastelCard>
            ))}
          </div>
        </div>
      </section>
    </GabaritPage>
  );
}
