import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Rocket, Gauge, Users } from "lucide-react";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand.light/60 to-white pointer-events-none" />
        <div className="container-p py-20 lg:py-28 flex flex-col-reverse lg:flex-row items-center gap-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand.primary/10 text-brand-dark text-sm mb-5">
              <span className="w-2 h-2 rounded-full bg-brand.accent animate-pulse" />
              Accélérez votre impact
            </div>
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight">
              ÉlanC’estVous
              <span className="text-brand.accent"> — Coaching & Formation</span>
            </h1>
            <p className="mt-6 text-lg opacity-90">
              J’aide les professionnels et les équipes à passer de l’intention à l’action
              grâce à un accompagnement sur-mesure, pragmatique et humain.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-brand">
                Me contacter <ArrowRight size={18} />
              </Link>
              <Link href="/a-propos" className="btn rounded-2xl btn-ghost">
                En savoir plus
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-full blur-3xl opacity-30 bg-brand.primary" />
            <Image src="/logo-elancestvous.jpg" width={360} height={360} alt="Logo ÉlanC’estVous" className="drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* VALEUR */}
      <section className="container-p py-14 lg:py-20">
        <h2 className="text-2xl lg:text-3xl font-bold mb-8">Ce que nous débloquons ensemble</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card icon={<Rocket />} title="Clarté & cap" text="Objectifs clarifiés et plan d’action concret pour avancer." />
          <Card icon={<Gauge />} title="Performance durable" text="Habitudes efficaces, équilibre et progression mesurable." />
          <Card icon={<Users />} title="Leadership & posture" text="Communication, feedback et coopération renforcés." />
        </div>
      </section>

      {/* MÉTHODE */}
      <section className="bg-brand.light">
        <div className="container-p py-14 lg:py-20">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4">Méthode Élan</h2>
          <p className="max-w-3xl opacity-90">
            Une approche itérative : écoute, cadrage, expérimentation, mise en action.
            Sessions rythmées, outils simples, résultats visibles.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: 1, t: "Diagnostic" },
              { n: 2, t: "Objectifs" },
              { n: 3, t: "Expérimentations" },
              { n: 4, t: "Ancrage" },
            ].map((s) => (
              <li key={s.n} className="p-5 rounded-2xl bg-white shadow-soft border border-gray-100">
                <span className="badge badge-accent mb-3">Étape {s.n}</span>
                <p className="font-semibold">{s.t}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* PREUVE SOCIALE */}
      <section className="container-p py-14 lg:py-20">
        <h2 className="text-2xl lg:text-3xl font-bold mb-8">Ils/elles témoignent</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <article key={i} className="p-6 rounded-2xl bg-white shadow-soft border border-gray-100">
              <p className="italic">“Un accompagnement percutant qui m’a permis d’oser et d’avancer.”</p>
              <p className="mt-3 font-semibold">— Client·e {i}</p>
            </article>
          ))}
        </div>
      </section>

      <CTA />
    </>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white shadow-soft border border-gray-100">
      <div className="w-11 h-11 rounded-xl grid place-items-center bg-brand.primary/15 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="opacity-90 mt-2">{text}</p>
    </div>
  );
}
