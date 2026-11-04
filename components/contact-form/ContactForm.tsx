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

import { submit_contact_form } from "./action";
import { contactFormSchema, ContactFormValues } from "./validation";

// Pastilles des étapes du formulaire, mêmes couleurs tournantes que Steps
// (charte : orange foncé, pétrole, bleu nuit ; blanc dessus ≥ 5.7:1).
// Paragraphes et non titres : le plan Hn de la page reste inchangé.
function EtapeFormulaire({
  numero,
  fond,
  children,
}: {
  numero: number;
  fond: "bg-accent" | "bg-petrol" | "bg-primary";
  children: ReactNode;
}) {
  return (
    <p className="flex items-center gap-3 font-display text-lg font-extrabold text-primary">
      <span
        aria-hidden="true"
        className={`flex size-8 shrink-0 items-center justify-center rounded-full font-black text-white ${fond}`}
      >
        {numero}
      </span>
      {children}
    </p>
  );
}

// Carte blanche une fois sélectionnée (story 4.12) : seule la bordure bleu
// nuit, doublée de la pastille du bouton radio, signale le choix. Pas
// d'ombre (DESIGN.md : profondeur par les aplats).
const CARTE_PROJET =
  "relative flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-white bg-white p-5 transition-colors focus:outline-none hover:border-stone-600 has-[[data-state=checked]]:border-primary";

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
              <EtapeFormulaire numero={1} fond="bg-accent">
                Votre projet
              </EtapeFormulaire>
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
                  className={CARTE_PROJET}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky text-petrol"
                  >
                    <BuildingOffice2Icon aria-hidden="true" className="size-6" />
                  </span>
                  <RadioGroupItem
                    value="institution"
                    id="project-type-institution"
                  />
                  <FieldLabel
                    htmlFor="project-type-institution"
                    className="font-display text-base font-extrabold text-primary flex-col items-start gap-1"
                  >
                    Établissement / DRH
                    <span className="block text-xs text-stone-600 font-normal">
                      Formation, Coaching d&apos;équipe ou individuel, GAPP
                    </span>
                  </FieldLabel>
                </Field>
                <Field
                  orientation="horizontal"
                  className={CARTE_PROJET}
                >
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-peach text-accent"
                  >
                    <UserIcon aria-hidden="true" className="size-6" />
                  </span>
                  <RadioGroupItem
                    value="particulier"
                    id="project-type-particulier"
                  />
                  <FieldLabel
                    htmlFor="project-type-particulier"
                    className="font-display text-base font-extrabold text-primary flex-col items-start gap-1"
                  >
                    Particulier
                    <span className="block text-xs text-stone-600 font-normal">
                      Equilibre vie pro/perso, Confiance en soi, Stress
                    </span>
                  </FieldLabel>
                </Field>
              </RadioGroup>
            </FieldSet>
          )}
        />
        <EtapeFormulaire numero={2} fond="bg-petrol">
          Vos coordonnées
        </EtapeFormulaire>
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
                    placeholder="ex. : jean.dupont@exemple.fr"
                    className={CHAMP}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <EtapeFormulaire numero={3} fond="bg-primary">
          Votre message
        </EtapeFormulaire>
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
                    className="textarea textarea-bordered rounded-md w-full px-4 py-3 text-base"
                    placeholder="ex. : Bonjour, je souhaite discuter de…"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                className="size-5 transition-transform motion-safe:group-hover:translate-x-1"
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
