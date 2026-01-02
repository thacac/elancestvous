"use client";
import { useIsHome } from "@/hooks/useIsHome";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Bars3BottomRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import Socials from "./Socials";
import { buttonVariants } from "./ui";

export const links = [
  { href: "/", label: "Accueil" },
  { href: "/professionnels-etablissements-de-soins/formations-rps-qvct", label: "Formations" },
  { href: "/professionnels-etablissements-de-soins/coaching", label: "Coaching" },
  {
    href: "/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
    label: "GAPP",
  },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

type NavbarProps = {};

export const Navbar: FC<NavbarProps> = () => {
  const isHome = useIsHome();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          {isHome ? (
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
          ) : (
            <span
              className="font-serif italic font-extrabold text-primary text-xl cursor-pointer"
              title="ÉlanC’estVous (ouvrir l'accueil dans un nouvel onglet)"
              tabIndex={0}
              role="button"
              aria-label="ÉlanC’estVous (ouvrir l'accueil dans un nouvel onglet)"
              onClick={() => window.open("/", "_blank", "noopener,noreferrer")}
            >
              <Image
                src="/logo_elancestvous_small.png"
                alt="Élan C’est Vous logo"
                width={32}
                height={32}
                className="inline-block mr-2 align-middle"
              />
              ÉlanC’estVous
            </span>
          )}
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3BottomRightIcon
              aria-hidden="true"
              className="size-6 text-primary cursor-pointer"
            />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {links.map((item) =>
            isHome ? (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm/6 font-semibold text-primary link-custom"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="text-sm/6 font-semibold text-primary cursor-pointer link-custom"
                title={`${item.label} `}
                tabIndex={0}
                role="button"
                aria-label={`${item.label} `}
                onClick={() =>
                  window.open(item.href, "_self", "noopener,noreferrer")
                }
              >
                {item.label}
              </span>
            )
          )}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end align-baseline">
          {isHome ? (
            <Link
              href="/particuliers/coaching-individuel"
              className={
                buttonVariants({ variant: "outline", size: "sm" }) + " text-sm"
              }
            >
              Particuliers
            </Link>
          ) : (
            <span
              className={
                buttonVariants({ variant: "outline", size: "sm" }) +
                " text-sm cursor-pointer"
              }
              title="Particuliers "
              tabIndex={0}
              role="button"
              aria-label="Particuliers "
              onClick={() =>
                window.open(
                  "/particuliers/coaching-individuel",
                  "_self",
                  "noopener,noreferrer"
                )
              }
            >
              Particuliers
            </span>
          )}
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-pastel p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
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
              className="-m-2.5 rounded-md p-2.5 text-primary"
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
                {links.map((item) =>
                  isHome ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibol text-primary hover:bg-primary hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      key={item.label}
                      className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-primary hover:bg-primary hover:text-white cursor-pointer"
                      title={`${item.label} `}
                      tabIndex={0}
                      role="button"
                      aria-label={`${item.label} `}
                      onClick={() =>
                        window.open(item.href, "_self", "noopener,noreferrer")
                      }
                    >
                      {item.label}
                    </span>
                  )
                )}
              </div>
              <div>
                {isHome ? (
                  <Link
                    href="/particuliers/coaching-individuel"
                    className={
                      buttonVariants({ variant: "outline", size: "sm" }) +
                      " text-sm"
                    }
                  >
                    Particuliers, découvrez mes solutions.
                  </Link>
                ) : (
                  <span
                    className={
                      buttonVariants({ variant: "outline", size: "sm" }) +
                      " text-sm cursor-pointer"
                    }
                    title="Particuliers, découvrez mes solutions."
                    tabIndex={0}
                    role="button"
                    aria-label="Particuliers, découvrez mes solutions."
                    onClick={() =>
                      window.open(
                        "/particuliers/coaching-individuel",
                        "_self",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Particuliers, découvrez mes solutions.
                  </span>
                )}
              </div>
              <Socials isObfuscated={!isHome} className="mt-6" />
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
};

export default Navbar;
