import Link from "next/link";

interface Lien {
  href: string;
  label: string;
}

interface ArticulationProps {
  className?: string;
  titre?: string;
  textePrincipal?: string;
  texteSecondaire?: string;
  liens?: Lien[];
}

export default function ArticulationBloc({
  className = "",
  titre = "Lien avec les autres accompagnements :",
  textePrincipal = "Selon les situations et les objectifs, la formation peut être proposée seule, ou s’inscrire dans une démarche plus globale.",
  texteSecondaire = "Ces modalités sont envisagées uniquement lorsqu’elles sont pertinentes.",
  liens,
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
        {liens && liens.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
            {liens.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="text-accent font-semibold text-sm underline underline-offset-2 hover:text-primary"
                >
                  {lien.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
