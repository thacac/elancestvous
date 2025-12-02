import ContactForm from "@/components/contact/ContactForm";

export default function ContactPage() {

  return (
    <section className="container-p py-16">
      <h1 className="text-3xl lg:text-4xl font-extrabold">Contact</h1>
      <p className="mt-4 max-w-2xl">
        J'accompagne les équipes et les individus.
      </p>
      <p className="mt-4 max-w-2xl">
        Une question, un besoin d’accompagnement pou ? Écrivez-moi, je vous réponds rapidement.
      </p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </section>
  );
}
