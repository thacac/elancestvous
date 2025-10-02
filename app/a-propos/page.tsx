export default function About() {
  return (
    <section className="container-p py-16">
      <h1 className="text-3xl lg:text-4xl font-extrabold">À propos</h1>
      <div className="mt-6 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <p>
            Je suis coach professionnel certifié·e et formateur·rice. Ma mission : aider
            les personnes et les équipes à révéler leur élan, clarifier leurs priorités
            et ancrer des changements durables.
          </p>
          <p>
            J’interviens auprès d’indépendants, de managers et d’organisations à taille humaine
            sur des sujets de posture, de communication et d’efficacité.
          </p>
          <ul className="list-disc ml-6">
            <li>Coaching individuel et d’équipe</li>
            <li>Ateliers et formations sur-mesure</li>
            <li>Accompagnement au changement</li>
          </ul>
        </div>
        <aside className="p-6 rounded-2xl bg-brand.light border border-gray-100">
          <h2 className="font-semibold mb-3">Approche</h2>
          <p className="opacity-90">
            Bienveillance exigeante, pragmatisme, expérimentation, et mesure des progrès.
          </p>
        </aside>
      </div>
    </section>
  );
}
