import OpenAI from "openai";

const DEFAULT_MODEL = "gpt-image-1";

export function createOpenAiImageGenerator(options?: {
  apiKey?: string;
  model?: string;
}) {
  const client = new OpenAI({ apiKey: options?.apiKey });
  const model = options?.model ?? DEFAULT_MODEL;

  return {
    async generateCoverImage(prompt: string): Promise<Buffer> {
      const response = await client.images.generate({
        model,
        prompt,
        size: "1536x1024",
        n: 1,
      });

      const image = response.data?.[0];
      if (!image?.b64_json) {
        throw new Error("l'API image n'a renvoyé aucune donnée d'image (b64_json)");
      }

      return Buffer.from(image.b64_json, "base64");
    },
  };
}
