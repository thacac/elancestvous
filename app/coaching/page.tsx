import Image from "next/image";
import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
import { BrushUnderline, PastelCard } from "@/components/charte";
import { Button } from "@/components/ui/button";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

export const metadata = {
  title: "Coaching individuel et collectif | Élan C'est Vous",
  description:
    "Coaching individuel pour particuliers ou coaching individuel et collectif pour les équipes et professionnels des établissements de santé.",
  alternates: {
    canonical: "/coaching",
  },
  openGraph: {
    title: "Coaching individuel et collectif | Élan C'est Vous",
    description:
      "Un accompagnement sur-mesure, pour les particuliers comme pour les équipes en établissement de santé.",
    url: "https://elancestvous.fr/coaching",
    type: "website",
    images: OG_BANNER_IMAGES,
  },
};

// Story 4.3 : hub aux couleurs des slides. H1 et textes inchangés ; les
// deux publics passent en cartes pastel ciel / pêche (contraste du texte
// bleu nuit ≥ 9:1), boutons orange foncé de la charte.
export default function CoachingHubPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      <Breadcrumbs items={[{ label: "Coaching" }]} />
      <section data-hero className="py-20 container">
        <div className="text-center mb-12">
          <h1>
            <BrushUnderline>Coaching</BrushUnderline>.
          </h1>
          <h2 className="py-5">
            Un accompagnement <span className="text-accent"><strong>individuel</strong></span> ou{" "}
            <span className="text-accent"><strong>collectif</strong></span>, adapté à votre situation.
          </h2>
        </div>

        <ul role="list" className="grid list-none gap-8 p-0 md:grid-cols-2 max-w-4xl mx-auto">
          <PastelCard as="li" tone="sky" className="p-10 text-center flex flex-col items-center gap-4">
            <Image
              src="/illustrations/soignante-pensive-coaching.jpg"
              alt=""
              width={160}
              height={160}
              sizes="160px"
              className="size-40 rounded-full border-4 border-white object-cover"
            />
            <h3 className="font-display! text-2xl! font-black! text-primary! m-0! max-w-none!">Particuliers</h3>
            <p className="text-primary/80">
              Un espace pour faire le point, prendre du recul et avancer à
              partir de votre situation.
            </p>
            <Button asChild variant="accent" size="lg" className="mt-auto">
              <Link href="/coaching/particuliers">Coaching particuliers</Link>
            </Button>
          </PastelCard>

          <PastelCard as="li" tone="peach" className="p-10 text-center flex flex-col items-center gap-4">
            <Image
              src="/illustrations/responsable-et-soignante.jpg"
              alt=""
              width={160}
              height={160}
              sizes="160px"
              className="size-40 rounded-full border-4 border-white object-cover"
            />
            <h3 className="font-display! text-2xl! font-black! text-primary! m-0! max-w-none!">Établissements</h3>
            <p className="text-primary/80">
              Un accompagnement pour soutenir les dynamiques d&apos;équipe et
              les professionnels des établissements de santé.
            </p>
            <Button asChild variant="accent" size="lg" className="mt-auto">
              <Link href="/coaching/etablissements">Coaching établissements</Link>
            </Button>
          </PastelCard>
        </ul>
      </section>
    </div>
  );
}
