"use client";

import {
  ArrowRightIcon,
  BuildingOffice2Icon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { BADGE_TONES } from "@/components/charte";
import {
  Button,
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
import { cn } from "@/lib/utils";

import { submit_contact_form } from "./action";
import { contactFormSchema, ContactFormValues } from "./validation";

// Légende d'étape du formulaire : pastille numérotée aux couleurs tournantes
// de Steps (charte), dans un fieldset pour que le lecteur d'écran annonce
// l'étape en entrant dans ses champs (RGAA 11.5 / 11.6). Légende et non
// titre : le plan Hn de la page reste inchangé.
function EtapeFormulaire({
  numero,
  children,
}: {
  numero: number;
  children: ReactNode;
}) {
  return (
    <legend className="mb-4 flex items-center gap-3 font-display text-lg font-extrabold text-primary">
      <span
        aria-hidden="true"
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full font-black text-white",
          BADGE_TONES[(numero - 1) % BADGE_TONES.length],
        )}
      >
        {numero}
      </span>
      {children}
    </legend>
  );
}

// Carte blanche une fois sélectionnée (story 4.12). Bord stone-600 visible
// sur le ciel (≥ 3:1) ; la sélection ajoute un anneau bleu nuit, nettement
// plus marqué que le survol. Pas d'ombre (DESIGN.md : profondeur par les
// aplats).
const CARTE_PROJET =
  "relative flex cursor-pointer items-center gap-4 rounded-2xl border border-stone-600 bg-white p-5 transition-colors focus:outline-none hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:ring-2 has-[[data-state=checked]]:ring-primary";

const TYPES_PROJET = [
  {
    value: "institution",
    titre: "Établissement / DRH",
    aide: "Formation, Coaching d'équipe ou individuel, GAPP",
    Icone: BuildingOffice2Icon,
    teinte: "bg-sky text-petrol",
  },
  {
    value: "particulier",
    titre: "Particulier",
    aide: "Equilibre vie pro/perso, Confiance en soi, Stress",
    Icone: UserIcon,
    teinte: "bg-peach text-accent",
  },
] as const;

const CHAMP = "input input-bordered rounded-md w-full h-12 px-4 text-base";

interface ContactFormProps {
  // Provenance de la demande (fiche formation, hub, page coaching…) : la
  // page /contact pré-remplit le formulaire à partir de ses searchParams
  // plutôt que de laisser toujours les mêmes valeurs par défaut.
  defaultProjectType?: ContactFormValues["projectType"];
  defaultMessage?: string;
}

export default function ContactForm({
  defaultProjectType = "institution",
  defaultMessage = "",
}: ContactFormProps = {}) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    // Story 4.12 : erreur affichée dès la sortie d'un champ, puis mise à jour
    // à la frappe ; à l'envoi, focus sur le premier champ en erreur
    // (shouldFocusError, par défaut).
    mode: "onTouched",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      message: defaultMessage,
      projectType: defaultProjectType,
    },
  });

  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
    reset,
    watch,
  } = form;

  // État de confirmation géré à la main plutôt que via isSubmitSuccessful :
  // reset() efface tout le formState par défaut, et le conserver avec
  // { keepIsSubmitSuccessful: true } le laisse collé à true jusqu'au *prochain
  // envoi* — pas jusqu'à la prochaine saisie. Sans ça, un second message en
  // cours de rédaction afficherait encore la confirmation du précédent.
  const [justSubmitted, setJustSubmitted] = useState(false);

  // watch() de react-hook-form n'est pas mémoïsable de façon sûre ; un
  // tableau vide est le pattern documenté (ne s'abonner qu'au montage).
  useEffect(() => {
    const subscription = watch(() => setJustSubmitted(false));
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitHandler = async (data: ContactFormValues) => {
    const result = await submit_contact_form(data);

    if (result && "error" in result) {
      toast.error(result.error);
      setError("root.serverError", { type: "custom", message: result.error });
      return;
    }

    toast.success("Message envoyé.");
    reset();
    setJustSubmitted(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(submitHandler)}
        className="grid gap-6"
      >
        <FormField
          control={form.control}
          name="projectType"
          render={({ field }) => (
            <FieldSet>
              <EtapeFormulaire numero={1}>Votre projet</EtapeFormulaire>
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
                {TYPES_PROJET.map(({ value, titre, aide, Icone, teinte }) => (
                  <Field
                    key={value}
                    orientation="horizontal"
                    className={CARTE_PROJET}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-xl",
                        teinte,
                      )}
                    >
                      <Icone aria-hidden="true" className="size-6" />
                    </span>
                    <RadioGroupItem value={value} id={`project-type-${value}`} />
                    <FieldLabel
                      htmlFor={`project-type-${value}`}
                      className="font-display text-base font-extrabold text-primary flex-col items-start gap-1"
                    >
                      {titre}
                      <span className="block text-xs text-stone-600 font-normal">
                        {aide}
                      </span>
                    </FieldLabel>
                  </Field>
                ))}
              </RadioGroup>
            </FieldSet>
          )}
        />
        <fieldset className="grid gap-4">
          <EtapeFormulaire numero={2}>Vos coordonnées</EtapeFormulaire>
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
                    className={CHAMP}
                  />
                </FormControl>
                <FormMessage />
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
                    className={CHAMP}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>
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
                    placeholder="ex. : jean.dupont@exemple.fr"
                    className={CHAMP}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <fieldset>
          <EtapeFormulaire numero={3}>Votre message</EtapeFormulaire>
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
                    className="textarea textarea-bordered rounded-md w-full px-4 py-3 text-base"
                    placeholder="ex. : Bonjour, je souhaite discuter de…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        <Button
          type="submit"
          // Story 4.12 : toujours actif (sinon ni focalisable ni explicite) ;
          // un envoi incomplet affiche les erreurs. Désactivé seulement
          // pendant « Envoi… » : fond stone-600 opaque (blanc dessus 7.6:1).
          disabled={isSubmitting}
          variant="accent"
          size="lg"
          className="group w-full h-auto min-h-14 py-4 whitespace-normal font-display text-lg font-extrabold disabled:bg-stone-600 disabled:opacity-100"
        >
          {isSubmitting ? (
            "Envoi…"
          ) : justSubmitted ? (
            <>
              <CheckCircleIcon aria-hidden="true" className="size-4" />
              Message envoyé
            </>
          ) : (
            <>
              Envoyer ma demande
              <ArrowRightIcon
                aria-hidden="true"
                className="size-4 transition-transform motion-safe:group-hover:translate-x-1"
              />
            </>
          )}
        </Button>
        <p className="text-xs text-stone-600">
          En soumettant ce formulaire, vous acceptez d’être recontacté(e).
          Aucune donnée n’est partagée.
        </p>
      </form>
    </Form>
  );
}
