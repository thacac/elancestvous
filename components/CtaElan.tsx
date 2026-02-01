import Link from "next/link";

export default function CtaElan() {
  return (
    <section
      id="formations-cta-final"
      className="py-15 bg-accent relative overflow-hidden"
    >
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-white font-serif font-black text-5xl lg:text-7xl mb-12!">
          Prêt à mettre <br />
          vos équipes en mouvement ?
        </h2>
        <Link
          href="/contact"
          className="bg-primary text-white px-12 py-5 rounded-full font-black text-xl transition shadow-2xl uppercase tracking-tighter active:scale-95! hover:scale-110!"
        >
          Prendre contact
        </Link>
        <p className="text-white/80 mt-8 font-medium">
          Premier échange pour comprendre votre contexte.
        </p>
      </div>
      {/* Motif en arrière-plan */}
      <div className="absolute inset-0 opacity-30 flex items-center justify-center text-[20vw] font-black text-white select-none">
        ELAN
      </div>
    </section>
  );
}
