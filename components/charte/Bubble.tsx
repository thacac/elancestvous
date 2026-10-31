import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface BubbleProps {
  children: ReactNode;
  /** "p" par défaut ; un titre quand la question structure la section. */
  as?: "p" | "h2" | "h3";
  className?: string;
}

// Bulle de pensée des slides, qui pose une question au visiteur. La queue
// (deux petits ronds) est un élément frère masqué, hors du texte de la bulle.
export function Bubble({
  children,
  as: Element = "p",
  className,
}: BubbleProps) {
  return (
    <div className={cn("relative mb-8 w-fit max-w-md", className)}>
      <Element className="rounded-full bg-sky px-8 py-7 text-center font-display! text-xl! font-black! tracking-normal! leading-tight text-primary! m-0! md:text-2xl!">
        {children}
      </Element>
      <span
        data-bubble-tail
        aria-hidden="true"
        className="absolute -bottom-3 left-1/5 size-6 rounded-full bg-sky"
      />
      <span
        data-bubble-tail
        aria-hidden="true"
        className="absolute -bottom-8 left-1/8 size-3 rounded-full bg-sky"
      />
    </div>
  );
}
