import Link from "next/link";
import { buttonVariants } from "../ui";

export default function CTA() {
  return (
    <section id="cta" className="relative">
      {/* <div className="mt-12 p-6 bg-teal-50 border-t border-t-pastel flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h4 className="font-bold text-primary">
            Vous êtes un établissement de soins ?
          </h4>
          <p className="text-sm text-stone-600">
            Découvrez mes solutions dédiées pour améliorer la gestion de vos
            ressources humaines.
          </p>
        </div>
        <Link
          href="/contact"
          className={`${buttonVariants({
            variant: "accent",
            size: "lg",
          })} font-semibold mb-4 md:mb-0`}
        >
          Echangeons sur vos besoins →
        </Link>
      </div> */}
      <div className="p-6 bg-pastel border-t border-t-pastel flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h4 className="font-bold text-primary">
            Vous êtes un établissement de soins ou un particulier ?
          </h4>
          <p className="text-sm text-stone-600">
            Découvrez mes solutions d'accompagnement.
          </p>
        </div>
        <Link
          href="/contact"
          className={`${buttonVariants({
            variant: "outline",
            size: "sm",
          })} font-semibold mb-4 md:mb-0`}
        >
          Echangeons sur vos besoins →
        </Link>
      </div>
    </section>
  );
}
