
export interface CarteContrastProps {
  numero?: string;
  titre: string;
  texte: string;
}

export interface CartesContrastBlocProps {
  titre: string;
  sousTitre?: string;
  cartes: CarteContrastProps[];
  className?: string;
}

export default function CartesContrastBloc({
  titre,
  sousTitre,
  cartes,
  className = "",
}: CartesContrastBlocProps) {
  return (
    <section className={`py-20 bg-primary ${className}`}>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <h2 className="text-3xl lg:text-5xl !text-white font-serif font-bold max-w-xl">
            {titre}
          </h2>
          {sousTitre && (
            <p className="text-pastel/60 max-w-xs italic text-sm">{sousTitre}</p>
          )}
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-${cartes.length} gap-1`}>
          {cartes.map((carte, i) => (
            <div
              key={i}
              className="group bg-white/5 p-12 hover:bg-accent transition-colors duration-500 cursor-default border border-white/10"
            >
              {carte.numero && (
                <span className="text-accent group-hover:text-primary text-5xl font-black mb-6 block">
                  {carte.numero}
                </span>
              )}
              <h3 className="text-2xl font-bold mb-4">{carte.titre}</h3>
              <p className="text-pastel/70 group-hover:text-white">{carte.texte}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
