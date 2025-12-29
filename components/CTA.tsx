import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative">
      <div className="mt-12 p-6 bg-teal-50 rounded-xl border border-teal-100 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h4 className="font-bold text-primary">
                Objectifs Opérationnels
              </h4>
              <p className="text-sm text-stone-600">
                Réduction de l'absentéisme • Optimisation du temps • Qualité de
                Vie au Travail
              </p>
            </div>
            <button className="text-primary font-semibold hover:underline">
              Télécharger le programme détaillé →
            </button>
          </div>
    </section>
  );
}
