"use client";
import { useState } from "react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form) as any);

    try {
      // À remplacer par votre endpoint (ex: /api/contact + provider email)
      await fetch("https://formspree.io/f/your-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus("sent");
      form.reset();
    } catch (e) {
      setStatus("idle");
      alert("Échec de l’envoi. Merci de réessayer.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label"><span className="label-text">Prénom</span></label>
          <input required name="prenom" className="input input-bordered rounded-2xl w-full" />
        </div>
        <div>
          <label className="label"><span className="label-text">Nom</span></label>
          <input required name="nom" className="input input-bordered rounded-2xl w-full" />
        </div>
      </div>
      <div>
        <label className="label"><span className="label-text">Email</span></label>
        <input required type="email" name="email" className="input input-bordered rounded-2xl w-full" />
      </div>
      <div>
        <label className="label"><span className="label-text">Sujet</span></label>
        <input name="sujet" className="input input-bordered rounded-2xl w-full" />
      </div>
      <div>
        <label className="label"><span className="label-text">Message</span></label>
        <textarea required name="message" rows={6} className="textarea textarea-bordered rounded-2xl w-full" />
      </div>
      <button disabled={status!=="idle"} className="btn-brand">
        {status === "loading" ? "Envoi…" : status === "sent" ? "Message envoyé ✔" : "Envoyer"}
      </button>
      <p className="text-xs opacity-70">En soumettant ce formulaire, vous acceptez d’être recontacté·e. Aucune donnée n’est partagée.</p>
    </form>
  );
}
