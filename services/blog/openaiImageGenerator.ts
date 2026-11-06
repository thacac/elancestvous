import OpenAI from "openai";

// gpt-image-1 a été arrêté par OpenAI le 23/10/2026. Surchargeable via
// IMAGE_GEN_MODEL pour suivre un prochain renommage sans toucher au code
// (liste à jour : https://developers.openai.com/api/docs/deprecations).
const DEFAULT_MODEL = "gpt-image-2.6-sunburst";

export function createOpenAiImageGenerator(options?: {
  apiKey?: string;
  model?: string;
}) {
  const client = new OpenAI({ apiKey: options?.apiKey });
  const model = options?.model ?? (process.env.IMAGE_GEN_MODEL || undefined) ?? DEFAULT_MODEL;

  return {
    async generateCoverImage(prompt: string): Promise<Buffer> {
      const response = await client.images.generate({
        model,
        prompt,
        size: "1536x1024",
        n: 1,
        // JPEG compressé plutôt que le PNG par défaut (souvent plusieurs Mo) :
        // ces images sont committées dans le dépôt git (content/_drafts puis
        // public/blog) et y restent pour toujours, même remplacées — mieux
        // vaut borner leur poids à la source qu'alourdir l'historique du repo
        // chaque semaine.
        output_format: "jpeg",
        output_compression: 75,
        quality: "medium",
      });

      const image = response.data?.[0];
      if (!image?.b64_json) {
        throw new Error("l'API image n'a renvoyé aucune donnée d'image (b64_json)");
      }

      return Buffer.from(image.b64_json, "base64");
    },
  };
}
