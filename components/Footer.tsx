import Link from "next/link";

export default function Footer() {
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
      <div className="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        {/* <nav className="flex flex-wrap justify-center -mx-5 -my-2">
                <div className="px-5 py-2">
                    <a href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                        About
                </a>
            </div>
            <div className="px-5 py-2">
                <a href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                    Blog
                </a>
            </div>
            <div className="px-5 py-2">
                <a href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                    Team
                </a>
            </div>
            <div className="px-5 py-2">
                <a href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                    Pricing
                </a>
            </div>
            <div className="px-5 py-2">
                <a href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                    Contact
                </a>
            </div>
            <div className="px-5 py-2">
                <a href="#" className="text-base leading-6 text-gray-500 hover:text-gray-900">
                    Terms
                </a>
            </div>
        </nav> */}
        <div className="flex justify-center mt-8 space-x-6">
          <Link
            target="_blank"
            title="Elancestvous Facebook official profile"
            href="https://www.facebook.com/profile.php?id=61581420003320"
            className="text-primary hover:text-gray-500"
          >
            <span className="sr-only">Facebook</span>
            <svg
              className="w-12 h-12"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              ></path>
            </svg>
          </Link>
          <Link
            target="_blank"
            title="Elancestvous LinkedIn official profile"
            href="https://www.linkedin.com/in/coralie-mathorel-852b44360"
            className="text-primary hover:text-gray-500"
          >
            <span className="sr-only">LinkedIn</span>
            <svg
              className="w-11 h-11"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76 0-.97.78-1.76 1.75-1.76s1.75.79 1.75 1.76c0 .97-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
            </svg>
          </Link>
        </div>
        <p className="mt-8 text-base leading-6 text-center text-primary">
          {`${new Date().getFullYear()} - ElanC’estVous - Coaching & Formation - Tous droits réservés.`}
        </p>
      </div>
    </footer>
  );
}
