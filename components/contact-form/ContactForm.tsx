"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from "@/components/ui";
import { IconBuilding, IconHeart } from "@/components/ui/icons-publics";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { submit_contact_form } from "./action";
import { contactFormSchema, ContactFormValues } from "./validation";

const PROJECT_TYPES = [
  {
    value: "institution",
    title: "Établissement / DRH",
    description: "Formation, coaching d'équipe ou individuel, GAPP",
    Icon: IconBuilding,
  },
  {
    value: "particulier",
    title: "Particulier",
    description: "Équilibre vie pro/perso, confiance en soi, stress",
    Icon: IconHeart,
  },
] as const;

const fieldClassName =
  "h-auto rounded-xl border-[1.5px] border-stone-200 bg-white px-4 py-3 text-base text-primary shadow-none transition placeholder:text-stone-400 focus-visible:border-logo focus-visible:ring-4 focus-visible:ring-logo/15 aria-invalid:border-rose-500 md:text-[0.95rem]";

const labelClassName = "text-sm font-semibold text-primary";
const messageClassName = "text-xs font-medium text-rose-600";

export default function ContactForm() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    // Valide un champ dès qu'il est quitté ; un clic sur "Envoyer" valide
    // tout le formulaire et affiche chaque erreur (bouton jamais désactivé
    // sans explication visible).
    mode: "onTouched",
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
    clearErrors,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = form;

  const submitHandler = async (data: ContactFormValues) => {
    const result = await submit_contact_form(data);

    if (result && "error" in result) {
      setError("root.serverError", { type: "custom", message: result.error });
      return;
    }
  };

  if (isSubmitSuccessful && !errors.root?.serverError) {
    return (
      <div className="flex flex-col items-center justify-center text-center h-full rounded-2xl bg-pastel px-6 py-12">
        <span className="grid place-items-center w-16 h-16 rounded-full bg-logo text-white mb-5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            className="w-7 h-7"
            aria-hidden="true"
          >
            <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h2 className="mb-2! text-2xl lg:text-3xl">
          Merci, votre message est bien parti&nbsp;!
        </h2>
        <p className="text-stone-600 max-w-md">
          Je reviens vers vous très vite pour convenir d&apos;un premier
          échange.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 hover:text-accent transition cursor-pointer"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        // Une erreur serveur n'a plus lieu d'être affichée dès que
        // l'utilisateur corrige sa saisie.
        onChange={() => {
          if (errors.root?.serverError) clearErrors("root.serverError");
        }}
        className="grid gap-6"
        noValidate
      >
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <fieldset>
              <legend className="font-serif text-lg font-bold text-primary">
                Vous me contactez pour…
              </legend>
              <p className="text-sm text-stone-500 mt-1 mb-3">
                Sélectionnez le type de projet pour mieux orienter votre
                demande.
              </p>
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {PROJECT_TYPES.map(({ value, title, description, Icon }) => {
                  const id = `project-type-${value}`;
                  return (
                    <label
                      key={value}
                      htmlFor={id}
                      className="group relative flex items-start gap-4 cursor-pointer rounded-2xl border-2 border-stone-200 bg-white p-4 pr-10 transition hover:border-accent/40 hover:shadow-md has-data-[state=checked]:border-accent has-data-[state=checked]:bg-accent/5 has-data-[state=checked]:shadow-lg has-data-[state=checked]:shadow-accent/15 has-focus-visible:ring-4 has-focus-visible:ring-accent/20"
                    >
                      <span className="grid place-items-center shrink-0 w-11 h-11 rounded-xl bg-pastel text-primary transition group-has-data-[state=checked]:bg-accent group-has-data-[state=checked]:text-white">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <span className="text-left">
                        <span className="block font-semibold text-primary">
                          {title}
                        </span>
                        <span className="block text-xs text-stone-500 mt-1 leading-snug">
                          {description}
                        </span>
                      </span>
                      <RadioGroupItem
                        value={value}
                        id={id}
                        className="absolute top-3 right-3 h-5 w-5 border-2 border-stone-300 bg-white shadow-none data-[state=checked]:border-accent"
                      />
                    </label>
                  );
                })}
              </RadioGroup>
            </fieldset>
          )}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel className={labelClassName}>Prénom</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="given-name"
                    className={fieldClassName}
                    placeholder="Jean"
                  />
                </FormControl>
                <FormMessage className={messageClassName} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="grid gap-2">
                <FormLabel className={labelClassName}>Nom</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="family-name"
                    className={fieldClassName}
                    placeholder="Dupont"
                  />
                </FormControl>
                <FormMessage className={messageClassName} />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel className={labelClassName}>Adresse e-mail</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  placeholder="bonjour@elancestvous.fr"
                  className={fieldClassName}
                />
              </FormControl>
              <FormMessage className={messageClassName} />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="grid gap-2">
              <FormLabel className={labelClassName}>
                Exprimez votre besoin
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={6}
                  className={`${fieldClassName} min-h-36 resize-y`}
                  placeholder="Bonjour, je souhaite discuter de…"
                />
              </FormControl>
              <FormMessage className={messageClassName} />
            </FormItem>
          )}
        />

        {errors.root?.serverError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {errors.root.serverError.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="group flex items-center justify-center gap-3 w-full rounded-full bg-accent px-8 py-5 text-base font-black uppercase tracking-tight text-white shadow-xl shadow-accent/30 transition cursor-pointer hover:bg-primary hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-accent"
        >
          {isSubmitting ? (
            "Envoi…"
          ) : (
            <>
              Envoyer ma demande
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1 group-disabled:translate-x-0"
              >
                →
              </span>
            </>
          )}
        </button>
        <p className="text-xs text-stone-500 text-center -mt-2">
          En soumettant ce formulaire, vous acceptez d’être recontacté(e).
          Aucune donnée n’est partagée.
        </p>
      </form>
    </Form>
  );
}
