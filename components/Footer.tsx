import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100">
      <div className="container-p py-10 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <p className="font-bold">ÉlanC’estVous</p>
          <p className="opacity-80 mt-2">Coaching & Formation</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Navigation</p>
          <ul className="space-y-2">
            <li><Link href="/">Accueil</Link></li>
            <li><Link href="/a-propos">À propos</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Contact</p>
          <p>contact@elancestvous.fr</p>
          <p className="mt-1">SIREN / Mentions légales — à compléter</p>
        </div>
      </div>
      <div className="text-center text-xs py-4 bg-brand.light">© {new Date().getFullYear()} ÉlanC’estVous</div>
    </footer>
  );
}
