import Image from "next/image";

import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export interface Step {
  title: string;
  description: ReactNode;
  /** Dessin décoratif (médaillon) au-dessus du numéro, ex. /illustrations/… */
  image?: string;
}

interface StepsProps {
  steps: Step[];
  /** Niveau des titres d'étape, sous le titre de la section (h3 par défaut). */
  headingLevel?: "h3" | "h4";
  /**
   * « row » (défaut) : une ligne d'étapes reliées par des flèches à partir
   * de lg. « grid » : 2 colonnes au plus, sans flèches, pour une colonne
   * étroite ou une longue démarche (fiche formation à plus de 3 modules).
   */
  layout?: "row" | "grid";
  className?: string;
}

// Classes complètes (et non construites) pour que Tailwind les détecte.
const LAYOUTS = {
  row: "sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none",
  grid: "sm:grid-cols-2",
};

// Couleurs qui tournent comme dans les slides (1 orange foncé, 2 pétrole,
// 3 bleu nuit) ; blanc dessus ≥ 5.7:1.
const BADGE_TONES = ["bg-accent", "bg-petrol", "bg-primary"];
const CARD_TONES = ["bg-sky", "bg-peach"];

// Étapes numérotées reliées par des flèches, à réserver aux vraies démarches.
// L'ordre est porté par la liste ordonnée ; numéros et flèches sont décoratifs.
export function Steps({
  steps,
  headingLevel: Heading = "h3",
  layout = "row",
  className,
}: StepsProps) {
  return (
    // role="list" explicite : Safari/VoiceOver ignore la sémantique d'une liste
    // dont les puces sont retirées (list-none).
    <ol
      role="list"
      className={cn(
        "grid list-none gap-6 p-0",
        LAYOUTS[layout],
        className,
      )}
    >
      {steps.map((step, index) => (
        <li
          key={index}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-3xl px-4 py-5 text-center",
            CARD_TONES[index % CARD_TONES.length],
          )}
        >
          {index > 0 && layout === "row" && (
            <svg
              data-arrow
              aria-hidden="true"
              focusable="false"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute top-7 -left-6 hidden size-6 stroke-orange lg:block"
            >
              <path d="M5 12h13M13 6l6 6-6 6" />
            </svg>
          )}
          {step.image && (
            <Image
              src={step.image}
              alt=""
              width={80}
              height={80}
              sizes="80px"
              className="size-20 rounded-full border-4 border-white object-cover"
            />
          )}
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 items-center justify-center rounded-full font-display text-lg font-black text-white",
              BADGE_TONES[index % BADGE_TONES.length],
            )}
          >
            {index + 1}
          </span>
          <Heading className="font-display! text-lg! font-black! text-primary! m-0! max-w-none! break-words hyphens-auto">
            {step.title}
          </Heading>
          <div className="text-sm text-stone-600">{step.description}</div>
        </li>
      ))}
    </ol>
  );
}
