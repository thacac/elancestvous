"use client";
import { Dialog, DialogPanel } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Bars3BottomRightIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/formations-rps-qvct.html", label: "Fomations" },
  { href: "/coaching.html", label: "Coaching" },
  { href: "/a-propos.html", label: "À propos" },
  { href: "/contact.html", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // <header className="sticky top-0 z-50 bg-brand-pastel/90 bg-(--header,var(--color-brand-pastel))/90 backdrop-blur-sm border-b border-gray-100">
    //   <div className="container-p h-16 flex items-center justify-between">
    //     <Link href="/" className="font-extrabold text-xl">
    //       <span className="text-brand.primary">Élan</span>C’est<span className="text-brand.accent">Vous</span>
    //     </Link>
    //     <nav className="hidden md:flex items-center gap-1">
    //       {links.map((l) => (
    //         <Link
    //           key={l.href}
    //           href={l.href}
    //           className={`px-4 py-2 rounded-xl hover:bg-brand.light transition ${
    //             pathname === l.href ? "text-brand.accent font-semibold" : "opacity-90"
    //           }`}
    //         >
    //           {l.label}
    //         </Link>
    //       ))}
    //     </nav>
    //     <Link href="/contact" className="btn btn-sm btn-primary rounded-xl md:inline-flex hidden">
    //       Prendre RDV
    //     </Link>
    //   </div>
    // </header>
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b">
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-6 lg:px-8"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="font-extrabold text-primary text-xl">
            <span className="text-brand.primary">Élan</span>C’est
            <span className="text-brand.accent">Vous</span>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-200"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3BottomRightIcon aria-hidden="true" className="size-6 text-primary cursor-pointer" />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm/6 font-semibold text-primary"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-100/10">
          <div className="flex items-center justify-between">
            <a href="#" className="-m-1.5 p-1.5 text-primary">
              <Image
                alt=""
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                width={32}
                height={32}
                className="h-8 w-auto"
                priority
              />
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-primary"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="text-primary size-6 cursor-pointer" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="space-y-2 py-6">
                {links.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white hover:bg-white/5"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <div className="py-6">
                <a
                  href="#"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white hover:bg-white/5"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  );
}
