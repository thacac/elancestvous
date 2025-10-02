"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 bg-brand-pastel/90 bg-[color:var(--header,theme(colors.brand.pastel))]/90 backdrop-blur border-b border-gray-100">
      <div className="container-p h-16 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl">
          <span className="text-brand.primary">Élan</span>C’est<span className="text-brand.accent">Vous</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-xl hover:bg-brand.light transition ${
                pathname === l.href ? "text-brand.accent font-semibold" : "opacity-90"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/contact" className="btn btn-sm btn-primary rounded-xl md:inline-flex hidden">
          Prendre RDV
        </Link>
      </div>
    </header>
  );
}
