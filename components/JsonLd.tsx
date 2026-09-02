const SITE = "https://elancestvous.fr";

const ORG_ID = `${SITE}/#organization`;
const PERSON_ID = `${SITE}/#coralie-mathorel`;
const WEBSITE_ID = `${SITE}/#website`;

export default function JsonLd() {
  const graph = [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: SITE,
      name: "Élan C'est Vous",
      inLanguage: "fr-FR",
      publisher: { "@id": ORG_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Coralie Mathorel",
      url: `${SITE}/a-propos`,
      image: {
        "@type": "ImageObject",
        url: `${SITE}/coralie.png`,
        width: 241,
        height: 244,
      },
      jobTitle: "Coach professionnelle certifiée",
      description:
        "Ancienne soignante et coach certifiée, spécialisée dans l'accompagnement des professionnels et établissements de santé.",
      knowsAbout: [
        "Coaching professionnel",
        "Qualité de vie et des conditions de travail (QVCT)",
        "Prévention des risques psycho-sociaux (RPS)",
        "Prévention de l'épuisement professionnel des soignants",
        "Analyse des pratiques professionnelles (GAPP)",
      ],
      sameAs: ["https://www.linkedin.com/in/coralie-mathorel-852b44360"],
      worksFor: { "@id": ORG_ID },
    },
    {
      "@type": "ProfessionalService",
      "@id": ORG_ID,
      name: "Élan C'est Vous",
      url: SITE,
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/logo_elancestvous.png`,
        width: 521,
        height: 521,
      },
      image: {
        "@type": "ImageObject",
        url: `${SITE}/og-banner.jpg`,
        width: 1200,
        height: 630,
      },
      description:
        "Coaching individuel et collectif, formations QVCT/RPS et groupes d'analyse des pratiques professionnelles pour les établissements et professionnels de santé, à Toulouse et en Occitanie.",
      slogan: "Préserver la santé de ceux qui soignent.",
      founder: { "@id": PERSON_ID },
      email: "contact@elancestvous.fr",
      telephone: "+33695991922",
      priceRange: "€€",
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
        { "@type": "Country", name: "France" },
      ],
      availableLanguage: "French",
      sameAs: ["https://www.linkedin.com/in/coralie-mathorel-852b44360"],
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
              url: `${SITE}/particuliers/coaching-individuel`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Coaching en établissements de soins",
              url: `${SITE}/professionnels-etablissements-de-soins/coaching`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Formations QVCT / RPS",
              url: `${SITE}/professionnels-etablissements-de-soins/formations-rps-qvct`,
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "Groupe d'analyse des pratiques professionnelles (GAPP)",
              url: `${SITE}/professionnels-etablissements-de-soins/gapp-groupe-analyse-pratiques-professionnelles`,
            },
          },
        ],
      },
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": graph,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
