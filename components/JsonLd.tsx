export default function JsonLd() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Coralie Mathorel",
    url: "https://elancestvous.fr",
    image: "https://elancestvous.fr/coralie.png",
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
    logo: "https://elancestvous.fr/logo_elancestvous.png",
    image: "https://elancestvous.fr/logo_elancestvous.png",
    description:
      "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour les établissements de santé.",
    founder: { "@type": "Person", name: "Coralie Mathorel" },
    areaServed: { "@type": "Country", name: "France" },
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
