import ContactForm from "@/components/contact-form/ContactForm";
import { OG_BANNER_IMAGES } from "@/lib/openGraph";

import type { Metadata } from "next";

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

const STEPS = [
  {
    title: "Vous m'écrivez",
    text: "Quelques lignes suffisent pour décrire votre situation.",
  },
  {
    title: "Je vous réponds personnellement",
    text: "Pour convenir d'un premier échange.",
  },
  {
    title: "On construit ensemble",
    text: "Une réponse adaptée à votre contexte.",
  },
];

export default function ContactPage() {
  return (
    <section id="contact" className="py-20 container">
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
        <p className="text-sm text-stone-500 mt-3">
          Coaching, formations QVCT/RPS et GAPP à{" "}
          <strong>Toulouse</strong> et en Occitanie.
        </p>
      </div>

      <div className="grid md:grid-cols-[5fr_8fr] rounded-3xl overflow-hidden border border-stone-200 shadow-2xl shadow-primary/25">
        <aside className="relative overflow-hidden bg-primary text-white px-8 py-10">
          <div className="relative z-10">
            <h2 className="text-white! text-3xl! leading-tight mb-8!">
              Un premier pas,
              <br />
              <em className="text-accent">sans engagement.</em>
            </h2>
            <ol className="grid gap-6 mb-10">
              {STEPS.map(({ title, text }, i) => (
                <li key={title} className="flex items-start gap-4">
                  <span
                    aria-hidden="true"
                    className="grid place-items-center shrink-0 w-9 h-9 rounded-full border border-accent/40 bg-accent/15 text-accent text-sm font-bold"
                  >
                    {i + 1}
                  </span>
                  <span>
                    <strong className="block text-[0.95rem]">{title}</strong>
                    <span className="block text-sm text-white/70 leading-relaxed">
                      {text}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <div className="grid gap-3 border-t border-white/15 pt-6 text-sm">
              <a
                href="tel:+33695991922"
                className="flex items-center gap-3 w-fit hover:text-accent transition"
              >
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-logo" />
                06 95 99 19 22
              </a>
              <p className="flex items-center gap-3">
                <span aria-hidden="true" className="w-2 h-2 rounded-full bg-logo" />
                Toulouse &amp; Occitanie
              </p>
            </div>
          </div>
          {/* Motif en arrière-plan, comme sur le CTA final */}
          <div
            aria-hidden="true"
            className="absolute -bottom-8 -right-5 select-none text-[140px] font-black leading-none tracking-tighter text-white opacity-[0.06]"
          >
            ELAN
          </div>
        </aside>
        <div className="bg-stone-50 px-6 py-10 sm:px-8 md:p-12">
          <ContactForm />
        </div>
      </div>

      {/* <div className="mt-8 text-center">
          <a
            href="#"
            className="text-primary font-semibold hover:underline flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Ou réservez directement un échange de 15 min
          </a>
        </div> */}
    </section>
  );
}
