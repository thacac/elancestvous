import Link from "next/link";

import { KeyMessage } from "@/components/charte";
import { buttonVariants } from "@/components/ui/button";

// Fin de l'accueil (Story 4.2) : message clé validé par Cédric, appel au
// contact. La vague vers le pied de page vit dans Footer (Story 4.8).
export default function AppelContact() {
  return (
    <section className="bg-white pt-5">
      <div className="container wide flex flex-col items-center gap-8 pb-12">
        <KeyMessage>
          Prendre soin de ceux qui soignent, c&apos;est aussi prendre soin de la qualité des soins.
        </KeyMessage>
        <Link href="/contact" className={buttonVariants({ variant: "accent", size: "lg" })}>
          Prendre contact
        </Link>
      </div>
    </section>
  );
}
