import { cn } from "@/lib/utils";

import { LOGO_LETTER_PATH } from "./logoPath";

interface LogoProps {
  /** "mark" : cercle seul (petites tailles) ; "sparkles" : avec les étincelles des slides. */
  variant?: "mark" | "sparkles";
  /** Fait scintiller les étincelles (désactivé si mouvement réduit demandé). */
  animated?: boolean;
  /** Nom accessible ; sans titre le logo est décoratif (ex. à côté du nom en texte). */
  title?: string;
  className?: string;
}

// Étincelles : chacune part du bord du cercle vers l'extérieur ; le
// scintillement les réduit vers leur extrémité intérieure (bas-gauche).
const SPARKLES = [
  { x1: 470, y1: 40, x2: 500, y2: 0 },
  { x1: 505, y1: 85, x2: 555, y2: 55 },
  { x1: 515, y1: 140, x2: 560, y2: 130 },
];

// Logo Élan C'est Vous, variante C : lettre et flèche blanches sur le cercle
// turquoise, point du « é » orange, étincelles orange en grand format.
// Couleurs via les tokens de app/globals.css.
export function Logo({ variant = "mark", animated = false, title, className }: LogoProps) {
  const withSparkles = variant === "sparkles";
  return (
    <svg
      viewBox={withSparkles ? "0 -12 580 580" : "0 0 521 521"}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true, focusable: "false" })}
    >
      <circle data-logo-circle cx="260" cy="259.5" r="256" className="fill-logo" />
      <path d={LOGO_LETTER_PATH} fillRule="evenodd" className="fill-white" />
      <circle data-logo-dot cx="313" cy="147.5" r="22" className="fill-orange" />
      {withSparkles &&
        SPARKLES.map((line, index) => (
          <line
            key={index}
            data-sparkle
            {...line}
            strokeWidth="16"
            strokeLinecap="round"
            className={cn(
              "stroke-orange origin-bottom-left [transform-box:fill-box]",
              animated && "motion-safe:animate-elan-sparkle",
            )}
            style={animated ? { animationDelay: `${index * 0.25}s` } : undefined}
          />
        ))}
    </svg>
  );
}
