import { PastelCard } from "@/components/charte";
import ContactForm from "@/components/contact-form/ContactForm";
import type { ContactFormValues } from "@/components/contact-form/validation";
import GabaritPage from "@/components/GabaritPage";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

import type { Metadata } from "next";

const VALID_PROJECT_TYPES: ContactFormValues["projectType"][] = [
  "institution",
  "particulier",
];

function parseProjectType(
  type: string | undefined
): ContactFormValues["projectType"] | undefined {
  return VALID_PROJECT_TYPES.find((valeur) => valeur === type);
}

export const metadata: Metadata = {
  title: "Contact – Parlons de vos besoins",
  description:
    "Contactez Élan C'est Vous pour discuter de vos besoins en coaching, formation QVCT/RPS ou groupe d'analyse des pratiques à Toulouse.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Élan C'est Vous",
    description:
      "Un premier échange pour comprendre votre situation et définir ensemble la réponse la plus adaptée.",
    url: "https://elancestvous.fr/contact",
    images: OG_BANNER_IMAGES,
  },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; sujet?: string }>;
}) {
  const { type, sujet } = await searchParams;

  return (
    <GabaritPage as="section" id="contact" className="pb-20" filAriane={[{ label: "Contact" }]}>
      <div className="container">
        <div className="text-center mb-8">
          <h1>
            Parlons de{" "}
            <span className="text-accent">
              <strong>vos besoins</strong>
            </span>
          </h1>
          <h2 className="h3-like">
            Un premier échange pour comprendre votre situation et définir ensemble
            la réponse la plus adaptée.
          </h2>
          <p className="text-sm text-stone-600 mt-3">
            Coaching, formations QVCT/RPS et GAPP à{" "}
            <strong>Toulouse</strong> et en Occitanie.{" "}
            <span aria-hidden="true">·</span>{" "}
            <a
              href="tel:+33695991922"
              className="text-accent underline underline-offset-2 hover:text-primary"
            >
              06 95 99 19 22
            </a>
          </p>
        </div>

        {/* Story 4.9 : carte ciel de la charte, sans ombre (profondeur par
            les aplats, DESIGN.md). */}
        <PastelCard tone="sky" as="div" className="p-5 sm:p-8 md:p-12">
          <ContactForm
            defaultProjectType={parseProjectType(type)}
            defaultMessage={sujet}
          />
        </PastelCard>
      </div>
    </GabaritPage>
  );
}
