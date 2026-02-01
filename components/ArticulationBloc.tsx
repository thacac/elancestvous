import { ReactNode } from "react";

interface ArticulationProps {
  className?: string;
  titre?: string;
  textePrincipal?: string;
  texteSecondaire?: string;
}

export default function ArticulationBloc({
  className = "",
  titre = "Lien avec les autres accompagnements :",
  textePrincipal = "Selon les situations et les objectifs, la formation peut être proposée seule, ou s’inscrire dans une démarche plus globale.",
  texteSecondaire = "Ces modalités sont envisagées uniquement lorsqu’elles sont pertinentes.",
}: ArticulationProps) {
  return (
    <section className={`container mb-14 ${className}`}>
      <div className="max-w-3xl mx-auto text-justify">
        <p className="text-muted text-sm md:text-md leading-relaxed">
          <span className="text-primary font-bold mr-2">{titre}</span>
          {textePrincipal}
          <br />
          <span className="text-stone-500 text-sm">{texteSecondaire}</span>
        </p>
      </div>
    </section>
  );
}
