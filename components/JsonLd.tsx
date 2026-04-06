export default function JsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Coralie Mathorel",
    url: "https://elancestvous.fr",
    image: {
      "@type": "ImageObject",
      url: "https://elancestvous.fr/coralie.png",
      width: 241,
      height: 244,
    },
    jobTitle: "Coach professionnelle certifiée",
    description:
      "Ancienne soignante et coach certifiée, spécialisée dans l'accompagnement des professionnels et établissements de santé.",
    sameAs: [],
    worksFor: {
      "@type": "Organization",
      name: "Élan C'est Vous",
      url: "https://elancestvous.fr",
    },
  };

  const service = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Élan C'est Vous",
    url: "https://elancestvous.fr",
    logo: {
      "@type": "ImageObject",
      url: "https://elancestvous.fr/logo_elancestvous.png",
      width: 521,
      height: 521,
    },
    image: {
      "@type": "ImageObject",
      url: "https://elancestvous.fr/og-banner.jpg",
      width: 1200,
      height: 630,
    },
    description:
      "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour les établissements de santé.",
    founder: { "@type": "Person", name: "Coralie Mathorel" },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Toulouse",
      postalCode: "31000",
      addressRegion: "Occitanie",
      addressCountry: "FR",
    },
    areaServed: [
      { "@type": "City", name: "Toulouse" },
      { "@type": "AdministrativeArea", name: "Haute-Garonne" },
      { "@type": "AdministrativeArea", name: "Occitanie" },
    ],
    availableLanguage: "French",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@elancestvous.fr",
      telephone: "+33695991922",
      contactType: "customer service",
      availableLanguage: "French",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Accompagnements",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Coaching individuel — Particuliers",
            url: "https://elancestvous.fr/particuliers/coaching-individuel",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Coaching en établissements de soins",
            url: "https://elancestvous.fr/professionnels-etablissements-de-soins/coaching",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Formations QVCT / RPS",
            url: "https://elancestvous.fr/professionnels-etablissements-de-soins/formations-rps-qvct",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Groupe d'analyse des pratiques professionnelles (GAPP)",
            url: "https://elancestvous.fr/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles",
          },
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
    </>
  );
}
