import { afterEach, describe, expect, it, vi } from "vitest";

const { imagesGenerate } = vi.hoisted(() => ({ imagesGenerate: vi.fn() }));
vi.mock("openai", () => ({
  default: function OpenAI() {
    return { images: { generate: imagesGenerate } };
  },
}));

import { createOpenAiImageGenerator } from "../openaiImageGenerator";

const ORIGINAL_MODEL = process.env.IMAGE_GEN_MODEL;

function mockImageResponse() {
  imagesGenerate.mockReset().mockResolvedValue({
    data: [{ b64_json: Buffer.from("jpeg-bytes").toString("base64") }],
  });
}

afterEach(() => {
  if (ORIGINAL_MODEL === undefined) delete process.env.IMAGE_GEN_MODEL;
  else process.env.IMAGE_GEN_MODEL = ORIGINAL_MODEL;
});

describe("createOpenAiImageGenerator", () => {
  it("uses gpt-image-2.6-sunburst by default (gpt-image-1 shut down on 2026-10-23)", async () => {
    delete process.env.IMAGE_GEN_MODEL;
    mockImageResponse();

    await createOpenAiImageGenerator({ apiKey: "key" }).generateCoverImage("prompt");

    expect(imagesGenerate.mock.calls[0][0].model).toBe("gpt-image-2.6-sunburst");
  });

  it("uses IMAGE_GEN_MODEL when set, so a future rename needs no code change", async () => {
    process.env.IMAGE_GEN_MODEL = "gpt-image-9-test";
    mockImageResponse();

    await createOpenAiImageGenerator({ apiKey: "key" }).generateCoverImage("prompt");

    expect(imagesGenerate.mock.calls[0][0].model).toBe("gpt-image-9-test");
  });

  it("falls back to the default model when IMAGE_GEN_MODEL is an empty string (unset secret written by deploy.yml)", async () => {
    process.env.IMAGE_GEN_MODEL = "";
    mockImageResponse();

    await createOpenAiImageGenerator({ apiKey: "key" }).generateCoverImage("prompt");

    expect(imagesGenerate.mock.calls[0][0].model).toBe("gpt-image-2.6-sunburst");
  });

  it("keeps requesting a compressed JPEG to bound the weight committed in git", async () => {
    mockImageResponse();

    const image = await createOpenAiImageGenerator({ apiKey: "key" }).generateCoverImage(
      "prompt"
    );

    expect(imagesGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: "prompt",
        size: "1536x1024",
        n: 1,
        output_format: "jpeg",
        output_compression: 75,
        quality: "medium",
      })
    );
    expect(image.toString()).toBe("jpeg-bytes");
  });
});
