"use client";

import Image from "next/image";

export default function Hero() {
  return (
    <div className="hero">
      <div className="flex flex-col md:flex-row justify-between mx-auto max-w-5xl">
        <div className="flex-1 flex flex-col justify-center text-center md:text-left">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-primary">
            ÉlanC’estVous
          </h1>
          <h2 className="text-primary te"> - Coaching & Formation -</h2>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
            Prévention des Risques Psycho-Sociaux (RPS), gestion du stress et des émotions.
          </p>
          <p className="mt-3 text-lg font-medium text-pretty text-gray-400 sm:text-xl/8">
            Accompagnement des professionnels de la santé.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="btn-brand">
              Je m&#39;élance
            </a>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center hidden md:flex">
          <Image
            src="/logo_elancestvous.png"
            width={0}
            height={0}
            sizes="100vw"
            style={{ width: "100%", height: "auto" }}
            alt="Logo ÉlanC’estVous"
          />
        </div>
      </div>
    </div>
  );
}
