"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { submit_contact_form } from "./action";
import { ContactFormValues, schema } from "./validation";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [result, setResult] = useState<{ error?: string } | null>(null);

  const submitHandler = async (data: ContactFormValues) => {
    setStatus("loading");
    const result = await submit_contact_form(data);
    setResult(result);

    if (result && "error" in result) {
      // client shows toast
      toast.error(result.error);
      setStatus("idle");
      return;
    }

    // success
    toast.success("Message envoyé.");
    setStatus("sent");
    reset();
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form
      onSubmit={handleSubmit(submitHandler)}
      className="grid gap-4 max-w-2xl"
    >
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <span className="label-text">Prénom</span>
          </label>
          <input
            {...register("firstName")}
            className="input input-bordered rounded-md w-full"
          />
          {errors.firstName && (
            <span className="text-error text-xs">
              {errors.firstName.message}
            </span>
          )}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Nom</span>
          </label>
          <input
            {...register("lastName")}
            className="input input-bordered rounded-md w-full"
          />
          {errors.lastName && (
            <span className="text-error text-xs">
              {errors.lastName.message}
            </span>
          )}
        </div>
      </div>
      <div>
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          {...register("email")}
          className="input input-bordered rounded-md w-full"
        />
        {errors.email && (
          <span className="text-error text-xs">{errors.email.message}</span>
        )}
      </div>
      <div>
        <label className="label">
          <span className="label-text">Exprimez votre besoin</span>
        </label>
        <textarea
          rows={6}
          {...register("message")}
          className="textarea textarea-bordered rounded-md w-full"
        />
        {errors.message && (
          <span className="text-error text-xs">{errors.message.message}</span>
        )}
      </div>
      <button
        disabled={isSubmitting || status !== "idle"}
        className="btn-brand"
      >
        {isSubmitting
          ? "Envoi…"
          : status === "sent"
          ? "Message envoyé ✔"
          : "Envoyer"}
      </button>
      <p className="text-xs opacity-70">
        En soumettant ce formulaire, vous acceptez d’être recontacté·e. Aucune
        donnée n’est partagée.
      </p>
      {/* Example error feedback */}
      {status === "idle" && result?.error && (
        <p className="text-error text-xs mt-2">{result.error}</p>
      )}
    </form>
  );
}
