"use client";

import { useState } from "react";

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
import {
  Field,
  FieldDescription,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { submit_contact_form } from "./action";
import { contactFormSchema, ContactFormValues } from "./validation";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [result, setResult] = useState<{ error?: string } | null>(null);

  const form = useForm<ContactFormValues & { projectType: string }>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: "",
      projectType: "institution",
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
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FieldSet>
              <FieldLabel className="form-label">
                Vous me contactez pour :
              </FieldLabel>
              <FieldDescription>
                Sélectionnez le type de projet pour mieux orienter votre
                demande.
              </FieldDescription>
              <RadioGroup
                defaultValue={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
              >
                <Field
                  orientation="horizontal"
                  className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                >
                  <RadioGroupItem
                    value="institution"
                    id="project-type-institution"
                  />
                  <FieldLabel
                    htmlFor="project-type-institution"
                    className="font-normal"
                  >
                    Établissement / DRH
                    <span className="block text-xs text-stone-500 font-normal ml-2">
                      Formation, Coaching d'équipe ou individuel, GAPP
                    </span>
                  </FieldLabel>
                </Field>
                <Field
                  orientation="horizontal"
                  className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none"
                >
                  <RadioGroupItem
                    value="particulier"
                    id="project-type-particulier"
                  />
                  <FieldLabel
                    htmlFor="project-type-particulier"
                    className="font-normal"
                  >
                    Particulier
                    <span className="block text-xs text-stone-500 font-normal ml-2">
                      Equilibre vie pro/perso, Confiance en soi, Stress
                    </span>
                  </FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>
          )}
        />
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="form-label">Prénom</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input input-bordered rounded-md w-full"
                    placeholder="Jean"
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
                <FormLabel className="form-label">Nom</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    className="input input-bordered rounded-md w-full"
                    placeholder="Dupont"
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
                <FormLabel className="form-label">
                  Votre adresse eMail
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="bonjour@elancestvous.fr"
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
                <FormLabel className="form-label">
                  Exprimez votre besoin
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={6}
                    className="textarea textarea-bordered rounded-md w-full"
                    placeholder="Bonjour, je souhaite discuter de..."
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
          className={`  ${buttonVariants({ size: "lg" })} w-full hover:bg-accent transition shadow-lg`}
        >
          {isValid
            ? isSubmitting
              ? "Envoi…"
              : isSubmitSuccessful
              ? "Message envoyé ✔"
              : "Envoyer ma demande"
            : "Remplissez le formulaire pour envoyer"}
        </Button>
        <p className="text-xs opacity-70">
          En soumettant ce formulaire, vous acceptez d’être recontacté(e).
          Aucune donnée n’est partagée.
        </p>
        {/* Example error feedback */}
        {status === "idle" && result?.error && (
          <p className="text-error text-xs mt-2">{result.error}</p>
        )}
      </form>
    </Form>
  );
}
