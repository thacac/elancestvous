"use client";

import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-pastel flex flex-col md:flex-row md:items-center px-6 min-h-screen h-fit -top-20 pb-10 md:pb-0">
      <div className="bg-light flex flex-col lg:flex-row justify-between items-center mx-auto max-w-5xl">
        <div className="order-last flex-1 flex flex-col justify-center text-center md:my-0 lg:order-first md:text-left">
          <span className="inline-block py-1 px-3 rounded-full bg-muted text-primary text-[0.65rem] font-semibold mb-6 tracking-wide uppercase w-fit mx-auto md:mx-0">
            Santé au travail & Performance Humaine
          </span>
          <h1 className="text-5xl lg:text-6xl font-serif font-bold text-primary leading-tight mb-6">
            Préserver la santé de&nbsp;
            <span className="text-accent italic">ceux qui soignent</span>.
          </h1>
          <p className="text-lg text-secondary leading-relaxed max-w-2xl">
            Ancienne soignante, j'accompagne les établissements et les
            professionnels de santé à prévenir l'épuisement, réguler la charge
            émotionnelle et soutenir des pratiques de travail durables.
          </p>
          <div className="my-8 flex flex-col md:flex-row items-center justify-center gap-y-2 md:gap-x-6">
            <Link
              href="#"
              className={`${buttonVariants({
                variant: "accent",
                size: "wide_sm",
              })} md:${buttonVariants({
                variant: "accent",
                size: "wide_md",
              })} `}
            >
              Solutions pour les établissements
            </Link>
            <Link
              href="#"
              className={`${buttonVariants({
                variant: "outline",
                size: "wide_sm",
              })} md:${buttonVariants({
                variant: "outline",
                size: "wide_md",
              })} `}
            >
              Coaching Particuliers
            </Link>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center order-first lg:order-last mt-8 md:mt-0">
          <Image
            src="/logo_elancestvous.png"
            width={400}
            height={400}
            className="max-w-1/2 mt-20 mb-10 md:max-w-2/3 md:mt-0 xl:max-w-2xl"
            alt="Logo ÉlanC’estVous"
          />
        </div>
      </div>
    </section>
  );
}
