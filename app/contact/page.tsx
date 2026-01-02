import ContactForm from "@/components/contact-form/ContactForm";

export const metadata = {
  title: "Contactez-nous | Coaching et accompagnement personnalisé",
  description:
    "Prenez contact pour un premier échange afin de comprendre votre situation et définir ensemble la réponse la plus adaptée à vos besoins.",
  robots: "index, follow",
  openGraph: {
    title: "Contactez-nous | Coaching et accompagnement personnalisé",
    description:
      "Un premier échange pour comprendre votre situation et définir ensemble la réponse la plus adaptée.",
    url: "https://elancestvous.fr/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <section id="contact" className="py-20 container">
      <div className="text-center mb-8">
        <h1>
          Parlons de{" "}
          <span className="text-accent">
            <strong>vos besoins</strong>
          </span>
        </h1>
        <h2 className="h3-like">
          Un premier échange pour comprendre votre situation et définir ensemble
          la réponse la plus adaptée.
        </h2>
      </div>

      <div className="bg-stone-50 rounded-2xl shadow-xl p-8 md:p-12 border border-stone-100">
        <ContactForm />
      </div>

      {/* <div className="mt-8 text-center">
          <a
            href="#"
            className="text-primary font-semibold hover:underline flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Ou réservez directement un échange de 15 min
          </a>
        </div> */}
    </section>
  );
}
