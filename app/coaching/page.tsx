import Link from "next/link";

import Breadcrumbs from "@/components/Breadcrumbs";
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

export default function CoachingHubPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <Breadcrumbs items={[{ label: "Coaching" }]} />
      <section className="py-20 container">
        <div className="text-center mb-12">
          <h1>Coaching.</h1>
          <h2 className="py-5">
            Un accompagnement <span className="text-accent"><strong>individuel</strong></span> ou{" "}
            <span className="text-accent"><strong>collectif</strong></span>, adapté à votre situation.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/5 border border-white/10 p-10 text-center flex flex-col items-center gap-4">
            <h3 className="text-2xl font-bold">Particuliers</h3>
            <p className="text-primary/80">
              Un espace pour faire le point, prendre du recul et avancer à
              partir de votre situation.
            </p>
            <Button asChild variant="accent" size="lg">
              <Link href="/coaching/particuliers">Coaching particuliers</Link>
            </Button>
          </div>

          <div className="bg-white/5 border border-white/10 p-10 text-center flex flex-col items-center gap-4">
            <h3 className="text-2xl font-bold">Établissements</h3>
            <p className="text-primary/80">
              Un accompagnement pour soutenir les dynamiques d&apos;équipe et
              les professionnels des établissements de santé.
            </p>
            <Button asChild variant="accent" size="lg">
              <Link href="/coaching/etablissements">Coaching établissements</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
