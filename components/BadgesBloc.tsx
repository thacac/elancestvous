import { ReactNode } from "react";

export interface BadgesBlocProps {
  titre: string;
  badges: string[];
  citation?: ReactNode;
  className?: string;
}

export default function BadgesBloc({
  titre,
  badges,
  citation,
  className = "",
}: BadgesBlocProps) {
  return (
    <section className={`py-20 bg-stone-50 ${className}`}>
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-primary font-serif font-bold text-3xl mb-14!">
          {titre}
        </h2>
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="bg-white px-8 py-4 rounded-full border-2 border-primary text-primary font-bold shadow-sm hover:bg-primary hover:text-white transition cursor-default"
            >
              {badge}
            </div>
          ))}
        </div>
        {citation}
      </div>
    </section>
  );
}
