"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="hero flex items-center">
      <div className="flex flex-col md:flex-row justify-between items-center mx-auto max-w-5xl">
        <div className="order-last flex-1 flex flex-col justify-center text-center md:order-first md:text-left">
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-primary">
            ÉlanC’estVous
          </h1>
          <h2 className="text-primary te"> - Coaching & Formation -</h2>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-400 px-8 md:px-0">
            Prévention des Risques Psycho-Sociaux (RPS), gestion du stress et des émotions.
          </p>
          <p className="mt-3 text-lg font-medium text-pretty text-gray-400 px-8 md:px-0">
            Accompagnement des professionnels de la santé.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link  href="#" className={buttonVariants({ variant:"accent", size: "lg" })}>
              Je m&#39;élance
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center md:flex">
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
    </section>
  );
}