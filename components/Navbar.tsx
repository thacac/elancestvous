"use client";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Bars3BottomRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";

import Socials from "./Socials";
import { buttonVariants } from "./ui";

const baseLinks = [
  { href: "/", label: "Accueil" },
  { href: "/professionnels-etablissements-de-soins/formations-rps-qvct", label: "Formations" },
  { href: "/professionnels-etablissements-de-soins/coaching", label: "Coaching" },
  {
    href: "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    label: "GAPP",
  },
];

const trailingLinks = [
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

type NavbarProps = {
  // Calculé côté serveur (cf. app/layout.tsx) à partir de
  // lib/featureFlags.ts. Un composant client ne doit pas lire cette
  // variable d'environnement lui-même : sans préfixe `NEXT_PUBLIC_`, elle ne
  // serait de toute façon pas disponible dans le bundle navigateur.
  blogEnabled?: boolean;
};

export const Navbar: FC<NavbarProps> = ({ blogEnabled = false }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = [
    ...baseLinks,
    // Le blog n'apparaît dans la navigation qu'une fois lancé publiquement,
    // cf. lib/featureFlags.ts.
    ...(blogEnabled ? [{ href: "/blog", label: "Blog" }] : []),
    ...trailingLinks,
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link
            href="/"
            className="font-serif italic font-extrabold text-primary text-xl"
          >
            <span>
              <Image
                src="/logo_elancestvous_small.png"
                alt="Élan C’est Vous logo"
                width={32}
                height={32}
                className="inline-block mr-2 align-middle"
              />
              ÉlanC’estVous
            </span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu-panel"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200 touch-manipulation active:bg-primary/10 active:scale-95 transition-transform"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3BottomRightIcon
              aria-hidden="true"
              className="size-6 text-primary cursor-pointer"
            />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {links.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm/6 font-semibold text-primary link-custom"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end align-baseline">
          <Link
            href="/particuliers/coaching-individuel"
            className={
              buttonVariants({ variant: "outline", size: "sm" }) + " text-sm"
            }
          >
            Particuliers
          </Link>
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel
          id="mobile-menu-panel"
          className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-pastel p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10"
        >
          <div className="flex items-center justify-between">
            <Image
              alt="logo Élan C’est Vous"
              src="/logo_elancestvous_small.png"
              width={80}
              height={80}
              className="w-auto"
              priority
            />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-primary touch-manipulation active:bg-primary/10 active:scale-95 transition-transform"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon
                aria-hidden="true"
                className="text-primary size-6 cursor-pointer"
              />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-primary/10">
              <div className="space-y-2 py-6">
                {links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-primary touch-manipulation hover:bg-primary hover:text-white active:bg-primary active:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div>
                <Link
                  href="/particuliers/coaching-individuel"
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    buttonVariants({ variant: "outline", size: "sm" }) +
                    " text-sm touch-manipulation active:scale-95 transition-transform"
                  }
                >
                  Particuliers, découvrez mes solutions.
                </Link>
              </div>
              <Socials className="mt-6" />
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Navbar;
