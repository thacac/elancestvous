import { ReactNode } from "react";

export interface PublicCibleCardProps {
  icon?: ReactNode;
  titre: string;
}

export interface PublicsCiblesBlocProps {
  titre: string;
  sousTitre?: string;
  cartes: PublicCibleCardProps[];
  className?: string;
}

export default function PublicsCiblesBloc({
  titre,
  sousTitre,
  cartes,
  className = "",
}: PublicsCiblesBlocProps) {
  return (
    <section className={`container py-14 ${className}`}>
      <div className="max-w-4xl mx-auto bg-white/90 rounded-2xl shadow-lg border border-stone-200 p-8 md:p-12 flex flex-col items-center text-center">
        <h2 className="text-primary text-3xl md:text-4xl font-extrabold mb-4 flex items-center gap-3">
          <span className="inline-block w-2 h-8 bg-accent rounded-full"></span>
          {titre}
        </h2>
        {sousTitre && (
          <p className="mb-8 text-lg text-stone-600 max-w-2xl mx-auto">{sousTitre}</p>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-${cartes.length > 1 ? 2 : 1} gap-6 w-full`}>
          {cartes.map((carte, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-accent/20 p-6 flex items-center gap-4 shadow-sm col-span-1"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                {carte.icon}
              </span>
              <span className="font-semibold text-primary text-left">
                {carte.titre}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
