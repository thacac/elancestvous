import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Input } from "../input";

// Revue story 4.12 : une erreur sans message n'affiche rien (FormMessage
// renvoie null) ; le champ ne doit alors pas pointer vers un id absent.
function Champ({ message }: { message: string }) {
  const form = useForm<{ nom: string }>({ defaultValues: { nom: "" } });
  useEffect(() => {
    form.setError("nom", { type: "custom", message });
  }, [form, message]);
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="nom"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nom</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  );
}

describe("FormControl — aria-describedby (Story 4.12)", () => {
  it("relie le champ au message d'erreur affiché", async () => {
    render(<Champ message="Le nom est requis" />);
    const champ = screen.getByRole("textbox", { name: "Nom" });
    await waitFor(() => expect(champ).toHaveAttribute("aria-invalid", "true"));
    const id = champ.getAttribute("aria-describedby")!;
    expect(document.getElementById(id)).toHaveTextContent("Le nom est requis");
  });

  it("ne pose pas aria-describedby quand l'erreur n'a pas de message", async () => {
    render(<Champ message="" />);
    const champ = screen.getByRole("textbox", { name: "Nom" });
    await waitFor(() => expect(champ).toHaveAttribute("aria-invalid", "true"));
    expect(champ).not.toHaveAttribute("aria-describedby");
  });
});
