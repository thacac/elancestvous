"use client";
import { useIsHome } from "@/hooks/useIsHome";
import Link from "next/link";
import Socials from "./Socials";

export default function Footer() {
  const isHome = useIsHome();
  return (
    // <footer classNameName="border-t border-gray-100">
    //   <div classNameName="container-p py-10 grid md:grid-cols-3 gap-6 text-sm">
    //     <div>
    //       <p classNameName="font-bold">ÉlanC’estVous</p>
    //       <p classNameName="opacity-80 mt-2">Coaching & Formation</p>
    //     </div>
    //     <div>
    //       <p classNameName="font-semibold mb-2">Navigation</p>
    //       <ul classNameName="space-y-2">
    //         <li><Link href="/">Accueil</Link></li>
    //         <li><Link href="/a-propos">À propos</Link></li>
    //         <li><Link href="/contact">Contact</Link></li>
    //       </ul>
    //     </div>
    //     <div>
    //       <p classNameName="font-semibold mb-2">Contact</p>
    //       <p>contact@elancestvous.fr</p>
    //       <p classNameName="mt-1">SIREN / Mentions légales — à compléter</p>
    //     </div>
    //   </div>
    //   <div classNameName="text-center text-xs py-4 bg-brand.light">© {new Date().getFullYear()} ÉlanC’estVous</div>
    // </footer>
    <footer className="bg-accent">
      <div className="max-w-7xl px-4 py-8 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-center">
          <div className="px-5 py-2">
            {isHome ? (
              <Link
                href="#"
                className="leading-6 text-sm text-primary hover:text-gray-900"
              >
                Politique de confidentialité
              </Link>
            ) : (
              <span
                className="leading-6 text-sm text-primary hover:text-gray-900 cursor-pointer"
                title="Politique de confidentialité"
                tabIndex={0}
                role="button"
                aria-label="Politique de confidentialité"
                onClick={() => window.open("#", "_self", "noopener,noreferrer")}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    window.open("#", "_self", "noopener,noreferrer");
                }}
              >
                Politique de confidentialité
              </span>
            )}
          </div>
          <div className="px-5 py-2">
            {isHome ? (
              <Link
                href="/mentions-legales"
                className="leading-6 text-sm text-primary hover:text-gray-900"
              >
                Mentions légales
              </Link>
            ) : (
              <span
                className="leading-6 text-sm text-primary hover:text-gray-900 cursor-pointer"
                title="Mentions légales"
                tabIndex={0}
                role="button"
                aria-label="Mentions légales"
                onClick={() =>
                  window.open(
                    "/mentions-legales",
                    "_self",
                    "noopener,noreferrer"
                  )
                }
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    window.open(
                      "/mentions-legales",
                      "_self",
                      "noopener,noreferrer"
                    );
                }}
              >
                Mentions légales
              </span>
            )}
          </div>
          <Socials isObfuscated={!isHome} className="px-5 py-2 -mt-1" />
        </nav>

        <p className="mt-2 text-xs leading-6 text-center text-primary/70">
          Toulouse (31) · Haute-Garonne · Occitanie ·{" "}
          <a href="tel:+33695991922" className="hover:underline">06 95 99 19 22</a>
        </p>
        <p className="mt-2 text-xs leading-6 text-center text-primary">
          {`${new Date().getFullYear()} - Élan C’est Vous - Coaching & Formations - Tous droits réservés.`}
        </p>
      </div>
    </footer>
  );
}
