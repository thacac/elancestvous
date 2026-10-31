import Link from "next/link";

import { Bubble, Wave } from "@/components/charte";
import { buttonVariants } from "@/components/ui/button";

interface CtaElanProps {
  // Provenance de la demande (hub formation, page coaching, GAPP…) :
  // transmise à /contact en query params pour pré-remplir le formulaire.
  // Sans provenance (page générique, audience mixte), le lien reste nu —
  // comportement historique inchangé.
  contactType?: "institution" | "particulier";
  contactSujet?: string;
}

// Story 4.3 : CTA final aux couleurs des slides. La question devient une
// bulle (vrai h2, texte inchangé), le bouton est le bouton orange foncé de
// la charte (blanc dessus 5.7:1, jamais une pilule — PRD §4.7) et une vague
// fait la transition vers le pied de page pétrole.
export default function CtaElan({ contactType, contactSujet }: CtaElanProps = {}) {
  const params = new URLSearchParams();
  if (contactType) params.set("type", contactType);
  if (contactSujet) params.set("sujet", contactSujet);
  const contactHref = params.size > 0 ? `/contact?${params.toString()}` : "/contact";

  return (
    <section id="formations-cta-final" className="relative overflow-hidden bg-white pt-15">
      {/* Motif en arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-center text-[20vw] font-black text-primary opacity-10 select-none">
        ELAN
      </div>
      <div className="container relative z-10 flex flex-col items-center gap-6 pb-12 text-center">
        <Bubble as="h2" className="mx-auto">
          Prêt à mettre <br />
          vos équipes en mouvement ?
        </Bubble>
        <Link href={contactHref} className={buttonVariants({ variant: "accent", size: "lg" })}>
          Prendre contact
        </Link>
        <p className="font-medium text-primary">Premier échange pour comprendre votre contexte.</p>
      </div>
      <Wave className="relative z-10" />
    </section>
  );
}
