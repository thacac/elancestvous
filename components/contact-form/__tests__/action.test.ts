import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { submit_contact_form } from "../action";

const sendMailToUsMock = vi.fn(async () => ({
  accepted: ["test@example.com"],
  rejected: [],
  response: "250 OK",
}));

vi.mock("@/services/mailer/mailer", () => {
  return {
    default: class {
      sendMailToUs = sendMailToUsMock;
    },
  };
});

describe("submit_contact_form", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.SMTP_USR = "test@example.com";
    sendMailToUsMock.mockClear();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  // La validation zod (contactFormSchema) ne s'exécute que côté client, dans
  // ContactForm.tsx (zodResolver) — une Server Action Next.js reste un
  // endpoint POST appelable directement, en contournant le formulaire. Sans
  // revalidation ici, un "email" arbitraire (pas nécessairement une adresse
  // valide) atteint tel quel Mailer.sendMailToUs, qui ne le sanitize pas
  // avant de l'interpoler dans le HTML de l'email — cf. issue #75.
  it("refuse un email invalide sans jamais appeler le mailer", async () => {
    const result = await submit_contact_form({
      firstName: "John",
      lastName: "Doe",
      email: "<img src=x onerror=alert(1)>evil@example.com",
      message: "Bonjour",
      projectType: "particulier",
    });

    expect(result).toEqual({ error: expect.any(String) });
    expect(sendMailToUsMock).not.toHaveBeenCalled();
  });

  it("refuse un message vide sans jamais appeler le mailer", async () => {
    const result = await submit_contact_form({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      message: "",
      projectType: "particulier",
    });

    expect(result).toEqual({ error: expect.any(String) });
    expect(sendMailToUsMock).not.toHaveBeenCalled();
  });

  it("envoie le mail quand les données sont valides", async () => {
    const result = await submit_contact_form({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      message: "Bonjour, je souhaite en savoir plus.",
      projectType: "particulier",
    });

    expect(result).toEqual(
      expect.objectContaining({ accepted: ["test@example.com"] })
    );
    expect(sendMailToUsMock).toHaveBeenCalledTimes(1);
  });
});
