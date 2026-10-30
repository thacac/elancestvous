import { SectionBanner, Steps } from "@/components/charte";

// Déroulé d'un accompagnement (Story 4.2), texte validé par Cédric le
// 2026-10-30. Ne pas promettre de premier échange gratuit ou « sans
// engagement » tant que Coralie ne l'a pas confirmé.
const ETAPES = [
  {
    title: "On échange",
    description: "Un premier échange pour comprendre votre contexte, vos équipes et ce qui vous amène.",
  },
  {
    title: "On fait le point",
    description:
      "J'analyse avec vous les besoins, les sources de tension et les ressources déjà présentes dans l'équipe.",
  },
  {
    title: "On agit",
    description:
      "Je vous propose un accompagnement sur-mesure, en formation, coaching ou GAPP, adapté au rythme de votre établissement.",
  },
  {
    title: "On ancre dans la durée",
    description:
      "On fait le bilan ensemble et on définit ce qui sera suivi dans le temps, pour que les changements tiennent.",
  },
];

// Icône au trait du bandeau (bulle de dialogue).
function IconDialogue() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22c0-8 7.5-14 17-14s17 6 17 14-7.5 14-17 14c-2.5 0-5-.4-7-1.2L8 38l2.5-6.5C7.7 29 6 25.7 6 22z" />
      <path d="M16 22h.01M23 22h.01M30 22h.01" strokeWidth="4" />
    </svg>
  );
}

export default function Accompagnement() {
  return (
    <section id="comment-se-passe-un-accompagnement" className="pb-15 bg-white">
      <SectionBanner
        title="Comment se passe un accompagnement ?"
        subtitle="Une démarche simple en 4 étapes"
        icon={<IconDialogue />}
      />
      <div className="container wide mt-8">
        <Steps steps={ETAPES} />
      </div>
    </section>
  );
}
