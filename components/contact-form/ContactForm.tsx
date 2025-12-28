"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { submit_contact_form } from "./action";
import { contactFormSchema, ContactFormValues } from "./validation";
import {
  Button,
  buttonVariants,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui";
import { is } from "zod/v4/locales";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [result, setResult] = useState<{ error?: string } | null>(null);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
    },
  });
  
    const {
      handleSubmit,
      setError,
      formState: { errors, isValid, isSubmitting, isSubmitSuccessful },
      reset,
    } = form;

  const submitHandler = async (data: ContactFormValues) => {
    const result = await submit_contact_form(data);

    if (result && "error" in result) {
      toast.error(result.error);
      setError("root.serverError", { type: "custom", message: result.error });
      return;
    }

    toast.success("Message envoyé.");
    reset();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="grid gap-4 max-w-2xl"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="FormLabel">
                  <span className="FormLabel-text">Prénom</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input input-bordered rounded-md w-full"
                  />
                </FormControl>
                <FormMessage />
                {errors.firstName && (
                  <span className="text-error text-xs">
                    {errors.firstName.message}
                  </span>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="FormLabel">
                  <span className="FormLabel-text">Nom</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input input-bordered rounded-md w-full"
                  />
                </FormControl>
                <FormMessage />
                {errors.lastName && (
                  <span className="text-error text-xs">
                    {errors.lastName.message}
                  </span>
                )}
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="FormLabel">
                  <span className="FormLabel-text">Votre adresse eMail</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input input-bordered rounded-md w-full"
                  />
                </FormControl>
                <FormMessage />
                {errors.lastName && (
                  <span className="text-error text-xs">
                    {errors.lastName.message}
                  </span>
                )}
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="FormLabel">
                  <span className="FormLabel-text">Exprimez votre besoin</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={6}
                    className="textarea textarea-bordered rounded-md w-full"
                  />
                </FormControl>
                <FormMessage />
                {errors.message && (
                  <span className="text-error text-xs">
                    {errors.message.message}
                  </span>
                )}
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={buttonVariants({ size: "lg" })}
        >
          {isValid
            ? isSubmitting
              ? "Envoi…"
              : isSubmitSuccessful
              ? "Message envoyé ✔"
              : "Envoyer"
            : "Remplissez le formulaire pour envoyer"}
        </Button>
        <p className="text-xs opacity-70">
          En soumettant ce formulaire, vous acceptez d’être recontacté(e). Aucune
          donnée n’est partagée.
        </p>
        {/* Example error feedback */}
        {status === "idle" && result?.error && (
          <p className="text-error text-xs mt-2">{result.error}</p>
        )}
      </form>
    </Form>
  );
}
