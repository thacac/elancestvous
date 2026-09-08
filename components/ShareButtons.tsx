"use client";

import { FC, useEffect, useRef, useState } from "react";

type ShareButtonsProps = {
  url: string;
  title: string;
  className?: string;
};

// Icônes de marque en SVG inline, comme components/Socials.tsx — @heroicons/react
// est un jeu d'icônes génériques, sans logos LinkedIn/Facebook/WhatsApp.
const ICONS = {
  linkedin: (
    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76 0-.97.78-1.76 1.75-1.76s1.75.79 1.75 1.76c0 .97-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" />
    </svg>
  ),
  facebook: (
    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  ),
  whatsapp: (
    <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.001 2C6.478 2 2 6.477 2 12c0 1.987.577 3.84 1.573 5.4L2 22l4.71-1.55A9.94 9.94 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.001a8 8 0 01-4.278-1.234l-.307-.192-2.797.92.933-2.723-.2-.316A7.96 7.96 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8.001-8 8.001z" />
    </svg>
  ),
  link: (
    <svg className="w-6 h-6" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  ),
};

const ShareButtons: FC<ShareButtonsProps> = ({ url, title, className = "" }) => {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const links = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      icon: ICONS.linkedin,
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: ICONS.facebook,
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`,
      icon: ICONS.whatsapp,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission
      // refusée...) : pas de retour visuel plutôt qu'une exception non gérée —
      // l'utilisateur peut toujours copier l'URL depuis la barre d'adresse.
      return;
    }
    setCopied(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-xs uppercase tracking-wide text-stone-500">Partager</span>
      {links.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={`Partager sur ${link.name}`}
          className="text-primary hover:text-gray-500"
        >
          <span className="sr-only">Partager sur {link.name}</span>
          {link.icon}
        </a>
      ))}
      <button
        type="button"
        onClick={copyLink}
        title="Copier le lien"
        className="text-primary hover:text-gray-500"
      >
        <span className="sr-only">Copier le lien</span>
        {ICONS.link}
      </button>
      <span aria-live="polite" className="text-xs text-stone-500">
        {copied ? "Lien copié !" : ""}
      </span>
    </div>
  );
};

export default ShareButtons;
