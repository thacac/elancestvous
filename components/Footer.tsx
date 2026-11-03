import Link from "next/link";

import { Wave } from "@/components/charte";

import Socials from "./Socials";

// Story 4.8 : la vague de transition fait partie du pied de page, posé une
// seule fois dans le layout, pour apparaître sur toutes les pages. Le <footer>
// n'a pas de fond : la vague prend celui de la page au-dessus, et seul le
// contenu repose sur l'aplat pétrole.
export default function Footer() {
  return (
    <footer>
      <Wave />
      <div className="bg-petrol">
        <div className="max-w-7xl px-4 py-8 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
          <nav className="flex flex-wrap justify-center">
            <div className="px-5 py-2">
              <Link
                href="/mentions-legales#protection-des-donnees-personnelles"
                className="leading-6 texte-mention text-white hover:text-sky"
              >
                Politique de confidentialité
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link
                href="/mentions-legales"
                className="leading-6 texte-mention text-white hover:text-sky"
              >
                Mentions légales
              </Link>
            </div>
            <Socials
              className="px-5 py-2 -mt-1"
              linkClassName="text-white hover:text-sky"
            />
          </nav>

          <p className="mt-2 texte-mention leading-6 text-center text-sky">
            Toulouse (31) · Haute-Garonne · Occitanie ·{" "}
            <a href="tel:+33695991922" className="hover:underline">
              06 95 99 19 22
            </a>
          </p>
          <p className="mt-2 texte-mention leading-6 text-center text-sky">
            {`${new Date().getFullYear()} - Élan C’est Vous - Coaching & Formations - Tous droits réservés.`}
          </p>
        </div>
      </div>
    </footer>
  );
}
