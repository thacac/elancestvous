import { afterEach, describe, expect, it, vi } from "vitest";

const messagesCreate = vi.fn();
const messagesParse = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: function Anthropic() {
    return { messages: { create: messagesCreate, parse: messagesParse } };
  },
}));

import { createActualiteWatch, LEGAL_DISCLAIMER } from "../actualiteWatch";

function endTurnSearchResponse(text: string) {
  return { stop_reason: "end_turn", content: [{ type: "text", text }] };
}

function pauseTurnSearchResponse(text: string) {
  return { stop_reason: "pause_turn", content: [{ type: "text", text }] };
}

describe("createActualiteWatch", () => {
  afterEach(() => {
    messagesCreate.mockReset();
    messagesParse.mockReset();
  });

  it("returns null when the search step finds nothing relevant (found: false)", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("Rien de pertinent trouvé."));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    const result = await watch.findActualite([], []);

    expect(result).toBeNull();
  });

  it("returns a candidate combining the search findings with the rotated pillar", async () => {
    messagesCreate.mockResolvedValue(
      endTurnSearchResponse(
        "Titre : Nouvelle obligation QVCT — URL : https://source.example/actu-1 — résumé : une obligation vient d'entrer en vigueur."
      )
    );
    messagesParse.mockResolvedValue({
      parsed_output: {
        found: true,
        title: "Nouvelle obligation QVCT",
        summary: "Une obligation vient d'entrer en vigueur.",
        sourceUrl: "https://source.example/actu-1",
      },
    });
    const watch = createActualiteWatch({ apiKey: "key" });

    const result = await watch.findActualite([], ["D"]);

    expect(result).toEqual({
      title: "Nouvelle obligation QVCT",
      summary: "Une obligation vient d'entrer en vigueur.",
      sourceUrl: "https://source.example/actu-1",
      pillar: expect.objectContaining({ id: expect.not.stringMatching(/^D$/) }),
    });
  });

  it("attaches a pillar via the shared weighted rotation, never repeating the last published pillar", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("trouvé"));
    messagesParse.mockResolvedValue({
      parsed_output: {
        found: true,
        title: "Titre",
        summary: "Résumé",
        sourceUrl: "https://source.example/actu-1",
      },
    });
    const watch = createActualiteWatch({ apiKey: "key" });

    const result = await watch.findActualite([], ["D"]);

    expect(result?.pillar.id).not.toBe("D");
  });

  it("passes the already-cited/excluded URLs into the search prompt", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("rien"));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    await watch.findActualite(["https://deja-cite.example/a", "https://deja-cite.example/b"], []);

    const call = messagesCreate.mock.calls[0][0];
    const prompt = call.messages[0].content as string;
    expect(prompt).toContain("https://deja-cite.example/a");
    expect(prompt).toContain("https://deja-cite.example/b");
  });

  it("defaults to cheap models (sonnet for search, haiku for structuring) — this runs daily, not opus", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("trouvé : https://source.example/actu-1"));
    messagesParse.mockResolvedValue({
      parsed_output: {
        found: true,
        title: "Titre",
        summary: "Résumé",
        sourceUrl: "https://source.example/actu-1",
      },
    });
    const watch = createActualiteWatch({ apiKey: "key" });

    await watch.findActualite([], []);

    expect(messagesCreate.mock.calls[0][0].model).toBe("claude-sonnet-5");
    expect(messagesParse.mock.calls[0][0].model).toBe("claude-haiku-4-5");
  });

  it("uses the web_search tool", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("rien"));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    await watch.findActualite([], []);

    const call = messagesCreate.mock.calls[0][0];
    expect(call.tools).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "web_search_20260209", name: "web_search" })])
    );
  });

  it("instructs the model to treat search results as data, never as instructions (prompt-injection defense)", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("rien"));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    await watch.findActualite([], []);

    const call = messagesCreate.mock.calls[0][0];
    const prompt = call.messages[0].content as string;
    expect(prompt).toMatch(/jamais comme des instructions/i);
  });

  it("resumes on stop_reason pause_turn by pushing the assistant turn back and continuing the search", async () => {
    messagesCreate
      .mockResolvedValueOnce(pauseTurnSearchResponse("recherche en cours..."))
      .mockResolvedValueOnce(endTurnSearchResponse("trouvé : https://source.example/actu-1"));
    messagesParse.mockResolvedValue({
      parsed_output: {
        found: true,
        title: "Titre",
        summary: "Résumé",
        sourceUrl: "https://source.example/actu-1",
      },
    });
    const watch = createActualiteWatch({ apiKey: "key" });

    const result = await watch.findActualite([], []);

    expect(messagesCreate).toHaveBeenCalledTimes(2);
    const secondCall = messagesCreate.mock.calls[1][0];
    expect(secondCall.messages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: "assistant",
          content: [{ type: "text", text: "recherche en cours..." }],
        }),
      ])
    );
    expect(result?.sourceUrl).toBe("https://source.example/actu-1");
  });

  it("caps pause_turn resumes instead of looping forever on a model that never reaches end_turn", async () => {
    // Incident du 2026-09-08 : sans plafond, un modèle qui enchaîne les
    // web_search sans jamais atteindre end_turn fait tourner la boucle
    // indéfiniment — chaque relance renvoie tout l'historique (adaptive
    // thinking + effort par défaut "high"), constaté à ~1M tokens consommés
    // pour un scan censé être bien plus léger qu'une génération d'article.
    messagesCreate.mockResolvedValue(pauseTurnSearchResponse("recherche en cours..."));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    const result = await watch.findActualite([], []);

    expect(messagesCreate.mock.calls.length).toBeLessThanOrEqual(4);
    expect(result).toBeNull();
  });

  it("defaults to a low search effort — this scan runs daily and must stay cheap", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("rien"));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    await watch.findActualite([], []);

    expect(messagesCreate.mock.calls[0][0].output_config).toEqual({ effort: "low" });
  });

  it("caps the number of underlying web_search calls via max_uses", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("rien"));
    messagesParse.mockResolvedValue({ parsed_output: { found: false } });
    const watch = createActualiteWatch({ apiKey: "key" });

    await watch.findActualite([], []);

    const call = messagesCreate.mock.calls[0][0];
    expect(call.tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "web_search_20260209", name: "web_search", max_uses: expect.any(Number) }),
      ])
    );
  });

  it("returns null (never throws) when the structuring step yields no parsed_output (e.g. refusal)", async () => {
    messagesCreate.mockResolvedValue(endTurnSearchResponse("trouvé quelque chose"));
    messagesParse.mockResolvedValue({ parsed_output: null });
    const watch = createActualiteWatch({ apiKey: "key" });

    const result = await watch.findActualite([], []);

    expect(result).toBeNull();
  });
});

describe("LEGAL_DISCLAIMER", () => {
  it("mentions it is not legal advice and points to the official source or a professional", () => {
    expect(LEGAL_DISCLAIMER.toLowerCase()).toContain("pas un conseil juridique");
  });
});
