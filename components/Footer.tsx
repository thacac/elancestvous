import Link from "next/link";

import Socials from "./Socials";

export default function Footer() {
  return (
    <footer className="bg-petrol">
      <div className="max-w-7xl px-4 py-8 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center">
          <div className="px-5 py-2">
            <Link
              href="/mentions-legales#protection-des-donnees-personnelles"
              className="leading-6 text-sm text-white hover:text-teal-soft"
            >
              Politique de confidentialité
            </Link>
          </div>
          <div className="px-5 py-2">
            <Link
              href="/mentions-legales"
              className="leading-6 text-sm text-white hover:text-teal-soft"
            >
              Mentions légales
            </Link>
          </div>
          <Socials className="px-5 py-2 -mt-1" linkClassName="text-white hover:text-teal-soft" />
        </nav>

        <p className="mt-2 text-xs leading-6 text-center text-teal-soft">
          Toulouse (31) · Haute-Garonne · Occitanie ·{" "}
          <a href="tel:+33695991922" className="hover:underline">06 95 99 19 22</a>
        </p>
        <p className="mt-2 text-xs leading-6 text-center text-teal-soft">
          {`${new Date().getFullYear()} - Élan C’est Vous - Coaching & Formations - Tous droits réservés.`}
        </p>
      </div>
    </footer>
  );
}
