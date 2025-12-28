import Link from "next/link";

export default function CTA() {
  return (
    <section className="relative">
      <div className="container-p py-16">
        <div className="rounded-3xl p-8 lg:p-12 bg-linear-to-br from-brand.primary to-brand.accent text-white shadow-soft">
          <h3 className="text-2xl lg:text-3xl font-extrabold">Prêt·e à donner de l’élan ?</h3>
          <p className="mt-3 opacity-95 max-w-3xl">Planifions un échange pour clarifier vos enjeux et tracer la prochaine étape.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="rounded-2xl bg-white text-brand-dark border-none">
              Discuter de votre besoin
            </Link>
            <Link href="/a-propos" className="rounded-2xl">
              Ma démarche
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
