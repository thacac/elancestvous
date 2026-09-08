import { describe, expect, it, vi } from "vitest";

import {
  buildDraftMarkdown,
  generateDraft,
  queueApprovedActualite,
  runVeilleScan,
  SYSTEM_PROMPT,
  type GenerateDraftDeps,
} from "../generateDraft";
import { deriveActualiteProposalId } from "../githubBlogRepo";
import { PILLARS } from "../pillars";

import type { ActualiteCandidate } from "../actualiteWatch";
import type { BlogDraft } from "../draftSchema";
import type { PublishedPost } from "../githubBlogRepo";

const validDraft: BlogDraft = {
  title: "Un titre valide",
  slug: "un-titre-valide",
  description: "Description",
  excerpt: "Extrait",
  tags: ["QVCT"],
  bodyMarkdown: "## Section\n\nContenu de l'article.",
  imagePrompts: [
    { purpose: "cover", prompt: "a calm office illustration", altText: "Illustration" },
  ],
  pillar: "C",
  localAngle: false,
};

const pillarD = { id: "D" as const, label: "GAPP", targetPage: "/gapp", theme: "theme", weight: 3 };

function makeActualiteCandidate(overrides: Partial<ActualiteCandidate> = {}): ActualiteCandidate {
  return {
    title: "Nouvelle obligation QVCT",
    summary: "Résumé factuel vérifiable.",
    sourceUrl: "https://source.example/actu-1",
    pillar: pillarD,
    ...overrides,
  };
}

function makePublishedPost(overrides: Partial<PublishedPost> = {}): PublishedPost {
  return {
    title: "Un autre article",
    publishedAt: "2026-01-01",
    pillar: "C",
    localAngle: false,
    sourceUrl: null,
    tags: ["QVCT"],
    ...overrides,
  };
}

function makeDeps(overrides: Partial<GenerateDraftDeps> = {}): GenerateDraftDeps {
  return {
    anthropic: {
      parseDraft: vi.fn().mockResolvedValue({
        stop_reason: "end_turn",
        parsed_output: validDraft,
      }),
    },
    imageGenerator: {
      generateCoverImage: vi.fn().mockResolvedValue(Buffer.from("fake-image")),
    },
    github: {
      listPublishedPosts: vi.fn().mockResolvedValue([makePublishedPost()]),
      getNextQueuedTopic: vi.fn().mockResolvedValue(null),
      commitDraftBranch: vi.fn().mockResolvedValue({
        branch: "blog-draft/un-titre-valide",
        url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
      }),
      queueActualiteProposal: vi.fn().mockResolvedValue({ id: "abc123def456" }),
      queueActualiteTopic: vi.fn().mockResolvedValue(undefined),
      getActualiteProposal: vi.fn().mockResolvedValue(null),
      listProposedActualiteSourceUrls: vi.fn().mockResolvedValue([]),
    },
    discord: {
      notifyDraftReady: vi.fn().mockResolvedValue({ messageId: "message-id-123" }),
      notifyActualiteProposal: vi.fn().mockResolvedValue({ messageId: "message-id-456" }),
    },
    ...overrides,
  };
}

describe("SYSTEM_PROMPT", () => {
  it("lists every service page's exact URL and requires a Markdown link to one of them (#74)", () => {
    for (const pillar of PILLARS) {
      expect(SYSTEM_PROMPT).toContain(pillar.targetPage);
    }
    expect(SYSTEM_PROMPT).toMatch(/lien\s+markdown/i);
  });
});

describe("generateDraft", () => {
  it("commits a draft branch on the nominal path", async () => {
    const deps = makeDeps();
    const result = await generateDraft(deps);

    expect(result).toEqual({
      status: "committed",
      slug: "un-titre-valide",
      title: "Un titre valide",
      branch: "blog-draft/un-titre-valide",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-titre-valide",
    });
    expect(deps.github.listPublishedPosts).toHaveBeenCalled();
    expect(deps.imageGenerator?.generateCoverImage).toHaveBeenCalledWith(
      "a calm office illustration"
    );
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ slug: "un-titre-valide" })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith({
      slug: "un-titre-valide",
      title: "Un titre valide",
      excerpt: "Extrait",
      coverImage: Buffer.from("fake-image"),
      sourceUrl: null,
      missingServiceLink: true,
    });
  });

  it("flags missingServiceLink when the draft's body has no link to a service page (#74)", async () => {
    const deps = makeDeps();

    await generateDraft(deps);

    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({ missingServiceLink: true })
    );
  });

  it("does not flag missingServiceLink when the draft's body links to a known service page (#74)", async () => {
    const deps = makeDeps({
      anthropic: {
        parseDraft: vi.fn().mockResolvedValue({
          stop_reason: "end_turn",
          parsed_output: {
            ...validDraft,
            bodyMarkdown:
              "## Section\n\nDécouvrez nos [formations QVCT/RPS](/professionnels-etablissements-de-soins/formations-rps-qvct).",
          },
        }),
      },
    });

    await generateDraft(deps);

    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({ missingServiceLink: false })
    );
  });

  it("returns a refused status without calling image generation or committing anything", async () => {
    const deps = makeDeps({
      anthropic: {
        parseDraft: vi.fn().mockResolvedValue({
          stop_reason: "refusal",
          stop_details: { category: "frontier_llm" },
          parsed_output: null,
        }),
      },
    });

    const result = await generateDraft(deps);

    expect(result).toEqual({ status: "refused", category: "frontier_llm" });
    expect(deps.imageGenerator?.generateCoverImage).not.toHaveBeenCalled();
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    expect(deps.discord.notifyDraftReady).not.toHaveBeenCalled();
  });

  it("returns generation_failed when structured output fails validation", async () => {
    const deps = makeDeps({
      anthropic: {
        parseDraft: vi.fn().mockResolvedValue({
          stop_reason: "end_turn",
          parsed_output: { title: "incomplet" },
        }),
      },
    });

    const result = await generateDraft(deps);

    expect(result.status).toBe("generation_failed");
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    expect(deps.discord.notifyDraftReady).not.toHaveBeenCalled();
  });

  it("skips image generation and commits without a cover image when imageGenerator is not configured", async () => {
    const deps = makeDeps({ imageGenerator: undefined });

    const result = await generateDraft(deps);

    expect(result.status).toBe("committed");
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: null })
    );
    expect(deps.discord.notifyDraftReady).toHaveBeenCalledWith(
      expect.objectContaining({ coverImage: null })
    );
  });

  it("passes a pillar suggestion computed from publication history to parseDraft", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([
          makePublishedPost({
            title: "Article C1",
            publishedAt: "2026-01-01",
            pillar: "C",
            localAngle: true,
            tags: ["RPS"],
          }),
          makePublishedPost({
            title: "Article D1",
            publishedAt: "2026-01-08",
            pillar: "D",
            localAngle: false,
            tags: ["GAPP"],
          }),
        ]),
      },
    });

    await generateDraft(deps);

    expect(deps.anthropic.parseDraft).toHaveBeenCalledWith(
      ["Article C1", "Article D1"],
      expect.objectContaining({ recentTags: expect.arrayContaining(["RPS", "GAPP"]) })
    );
    // Dernier pilier publié = D : jamais choisi deux fois de suite.
    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.pillar.id).not.toBe("D");
  });

  it("suggests injecting the local angle when no recent article carried it", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([makePublishedPost({ localAngle: false })]),
      },
    });

    await generateDraft(deps);

    expect(deps.anthropic.parseDraft).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ injectLocalAngle: true })
    );
  });

  it("proposes each of the actualité watch's candidates on Discord without blocking this run's generation", async () => {
    const findActualite = vi.fn().mockResolvedValue([makeActualiteCandidate()]);
    const deps = makeDeps({
      actualiteWatch: { findActualite },
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([
          makePublishedPost({ sourceUrl: "https://source.example/deja-cite" }),
        ]),
        listProposedActualiteSourceUrls: vi.fn().mockResolvedValue(["https://source.example/deja-propose"]),
      },
    });

    const result = await generateDraft(deps);
    const expectedId = deriveActualiteProposalId("https://source.example/actu-1");

    expect(findActualite).toHaveBeenCalledWith([
      "https://source.example/deja-cite",
      "https://source.example/deja-propose",
    ]);
    expect(deps.github.queueActualiteProposal).toHaveBeenCalledWith(makeActualiteCandidate());
    expect(deps.discord.notifyActualiteProposal).toHaveBeenCalledWith({
      id: expectedId,
      title: "Nouvelle obligation QVCT",
      sourceUrl: "https://source.example/actu-1",
    });
    // La veille ne doit plus prendre le pas sur la génération de la semaine
    // (#66 bis) : la proposition est un effet de bord, la file étant vide,
    // generateDraft() retombe sur la rotation de piliers dans le même appel.
    expect(deps.anthropic.parseDraft).toHaveBeenCalled();
    expect(result.status).toBe("committed");
  });

  it("notifies each candidate as an independent Discord message (one per pillar, cf. runVeilleScan)", async () => {
    const candidateA = makeActualiteCandidate({
      title: "Candidat A",
      sourceUrl: "https://source.example/a",
      pillar: { id: "A", label: "Pilier A", targetPage: "/a", theme: "theme", weight: 2 },
    });
    const candidateB = makeActualiteCandidate({
      title: "Candidat B",
      sourceUrl: "https://source.example/b",
      pillar: { id: "B", label: "Pilier B", targetPage: "/b", theme: "theme", weight: 2 },
    });
    const findActualite = vi.fn().mockResolvedValue([candidateA, candidateB]);
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    await generateDraft(deps);

    expect(deps.discord.notifyActualiteProposal).toHaveBeenCalledTimes(2);
    expect(deps.github.queueActualiteProposal).toHaveBeenCalledWith(candidateA);
    expect(deps.github.queueActualiteProposal).toHaveBeenCalledWith(candidateB);
  });

  it("notifies Discord before persisting each proposal, so a failed notification never orphans that candidate", async () => {
    const findActualite = vi.fn().mockResolvedValue([makeActualiteCandidate()]);
    const callOrder: string[] = [];
    const deps = makeDeps({
      actualiteWatch: { findActualite },
      discord: {
        ...makeDeps().discord,
        notifyActualiteProposal: vi.fn().mockImplementation(async () => {
          callOrder.push("notify");
          return { messageId: "message-id-456" };
        }),
      },
      github: {
        ...makeDeps().github,
        queueActualiteProposal: vi.fn().mockImplementation(async () => {
          callOrder.push("queue");
          return { id: "abc123def456" };
        }),
      },
    });

    await generateDraft(deps);

    expect(callOrder).toEqual(["notify", "queue"]);
  });

  it("never persists a candidate (so it stays rediscoverable) when notifying Discord fails for it, but still generates this run's article (best-effort)", async () => {
    const findActualite = vi.fn().mockResolvedValue([makeActualiteCandidate()]);
    const deps = makeDeps({
      actualiteWatch: { findActualite },
      discord: {
        ...makeDeps().discord,
        notifyActualiteProposal: vi.fn().mockRejectedValue(new Error("Discord indisponible")),
      },
    });

    const result = await generateDraft(deps);

    expect(deps.github.queueActualiteProposal).not.toHaveBeenCalled();
    expect(result.status).toBe("committed");
  });

  it("keeps proposing the remaining candidates when one candidate's notification fails (best-effort per candidate)", async () => {
    const candidateA = makeActualiteCandidate({ title: "Candidat A", sourceUrl: "https://source.example/a" });
    const candidateB = makeActualiteCandidate({ title: "Candidat B", sourceUrl: "https://source.example/b" });
    const findActualite = vi.fn().mockResolvedValue([candidateA, candidateB]);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const deps = makeDeps({
      actualiteWatch: { findActualite },
      discord: {
        ...makeDeps().discord,
        notifyActualiteProposal: vi
          .fn()
          .mockRejectedValueOnce(new Error("Discord indisponible"))
          .mockResolvedValueOnce({ messageId: "message-id-456" }),
      },
    });

    await generateDraft(deps);

    expect(deps.github.queueActualiteProposal).toHaveBeenCalledTimes(1);
    expect(deps.github.queueActualiteProposal).toHaveBeenCalledWith(candidateB);
    consoleError.mockRestore();
  });

  it("falls back to the weighted pillar rotation when the actualité watch finds nothing", async () => {
    const findActualite = vi.fn().mockResolvedValue([]);
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    const result = await generateDraft(deps);

    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.actualite).toBeUndefined();
    expect(result.status).toBe("committed");
  });

  it("prioritizes a pending Discord topic (from the shared queue) over the pillar rotation suggestion", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([makePublishedPost()]),
        getNextQueuedTopic: vi.fn().mockResolvedValue({
          type: "discord_topic",
          topic: "La nouvelle obligation RPS",
          notes: "Source officielle",
          submittedAt: "2026-01-01T00:00:00.000Z",
          status: "a_publier",
        }),
      },
    });

    await generateDraft(deps);

    expect(deps.anthropic.parseDraft).toHaveBeenCalledWith(
      ["Un autre article"],
      undefined,
      { topic: "La nouvelle obligation RPS", notes: "Source officielle" }
    );
  });

  it("consumes a queued actualité entry (prio 2) ahead of the pillar rotation, passing its articleText as context", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([makePublishedPost()]),
        getNextQueuedTopic: vi.fn().mockResolvedValue({
          type: "actualite",
          title: "Nouvelle obligation QVCT",
          summary: "Résumé RSS.",
          sourceUrl: "https://source.example/actu-1",
          articleText: "Texte intégral de la page source.",
          pillarId: "D",
          submittedAt: "2026-01-01T00:00:00.000Z",
          status: "a_publier",
        }),
      },
    });

    const result = await generateDraft(deps);

    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.pillar.id).toBe("D");
    expect(suggestion.actualite).toEqual({
      title: "Nouvelle obligation QVCT",
      summary: "Résumé RSS.",
      sourceUrl: "https://source.example/actu-1",
      articleText: "Texte intégral de la page source.",
    });
    expect(deps.github.commitDraftBranch).toHaveBeenCalledWith(
      expect.objectContaining({
        postMarkdown: expect.stringContaining("sourceUrl: 'https://source.example/actu-1'"),
      })
    );
    expect(result.status).toBe("committed");
  });

  it("falls back to the pillar rotation (never generation_failed) when a queued actualité's pillarId no longer exists in PILLARS", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([makePublishedPost()]),
        getNextQueuedTopic: vi.fn().mockResolvedValue({
          type: "actualite",
          title: "Actualité orpheline",
          summary: "s",
          sourceUrl: "https://source.example/actu-1",
          articleText: null,
          pillarId: "Z",
          submittedAt: "2026-01-01T00:00:00.000Z",
          status: "a_publier",
        }),
      },
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await generateDraft(deps);

    expect(result.status).toBe("committed");
    const suggestion = (deps.anthropic.parseDraft as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(suggestion.actualite).toBeUndefined();
    consoleError.mockRestore();
  });

  it("still requires the pillar field in the structured output when the topic comes from Discord", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockResolvedValue([]),
        getNextQueuedTopic: vi.fn().mockResolvedValue({
          type: "discord_topic",
          topic: "Un sujet Discord",
          notes: null,
          submittedAt: "2026-01-01T00:00:00.000Z",
          status: "a_publier",
        }),
      },
      anthropic: {
        parseDraft: vi.fn().mockResolvedValue({
          stop_reason: "end_turn",
          // Sortie sans champ "pillar" — doit être rejetée même quand le
          // sujet vient de Discord (mitigation 1 de #67).
          parsed_output: { ...validDraft, pillar: undefined },
        }),
      },
    });

    const result = await generateDraft(deps);

    expect(result.status).toBe("generation_failed");
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
  });

  it("returns generation_failed and does not commit when image generation fails", async () => {
    const deps = makeDeps({
      imageGenerator: {
        generateCoverImage: vi.fn().mockRejectedValue(new Error("quota exceeded")),
      },
    });

    const result = await generateDraft(deps);

    expect(result).toEqual({
      status: "generation_failed",
      reason: expect.stringContaining("quota exceeded"),
    });
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    expect(deps.discord.notifyDraftReady).not.toHaveBeenCalled();
  });
});

describe("queueApprovedActualite", () => {
  it("fetches the source article's full text and queues it instead of generating anything directly", async () => {
    const candidate = makeActualiteCandidate();
    const fetchArticleText = vi.fn().mockResolvedValue("Texte intégral de la page source.");
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        getActualiteProposal: vi.fn().mockResolvedValue(candidate),
      },
      articleTextFetcher: { fetchArticleText },
    });

    const result = await queueApprovedActualite("abc123def456", deps);

    expect(deps.github.getActualiteProposal).toHaveBeenCalledWith("abc123def456");
    expect(fetchArticleText).toHaveBeenCalledWith(candidate.sourceUrl);
    expect(deps.github.queueActualiteTopic).toHaveBeenCalledWith({
      title: candidate.title,
      summary: candidate.summary,
      sourceUrl: candidate.sourceUrl,
      articleText: "Texte intégral de la page source.",
      pillarId: "D",
    });
    expect(result).toEqual({ status: "queued", title: candidate.title });
    // Ne génère jamais directement : la file s'en charge au prochain passage
    // de generateDraft() (planifié ou déclenché manuellement).
    expect(deps.anthropic.parseDraft).not.toHaveBeenCalled();
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
    // Ne consulte jamais la veille elle-même : le sujet a déjà été décidé.
    expect(deps.github.queueActualiteProposal).not.toHaveBeenCalled();
  });

  it("queues a null articleText when no articleTextFetcher is configured", async () => {
    const candidate = makeActualiteCandidate();
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        getActualiteProposal: vi.fn().mockResolvedValue(candidate),
      },
    });

    await queueApprovedActualite("abc123def456", deps);

    expect(deps.github.queueActualiteTopic).toHaveBeenCalledWith(
      expect.objectContaining({ articleText: null })
    );
  });

  it("returns proposal_not_found without queueing anything when the proposal is gone", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        getActualiteProposal: vi.fn().mockResolvedValue(null),
      },
    });

    const result = await queueApprovedActualite("disparu", deps);

    expect(result).toEqual({ status: "proposal_not_found" });
    expect(deps.github.queueActualiteTopic).not.toHaveBeenCalled();
  });

  it("returns generation_failed when writing to the queue fails", async () => {
    const candidate = makeActualiteCandidate();
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        getActualiteProposal: vi.fn().mockResolvedValue(candidate),
        queueActualiteTopic: vi.fn().mockRejectedValue(new Error("GitHub indisponible")),
      },
    });

    const result = await queueApprovedActualite("abc123def456", deps);

    expect(result).toEqual({
      status: "generation_failed",
      reason: expect.stringContaining("GitHub indisponible"),
    });
  });
});

describe("runVeilleScan", () => {
  it("scans for new actualité candidates and reports proposed:true with their count on success", async () => {
    const findActualite = vi.fn().mockResolvedValue([makeActualiteCandidate()]);
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    const result = await runVeilleScan(deps);

    expect(deps.github.listPublishedPosts).toHaveBeenCalled();
    expect(findActualite).toHaveBeenCalled();
    expect(deps.discord.notifyActualiteProposal).toHaveBeenCalled();
    expect(deps.github.queueActualiteProposal).toHaveBeenCalled();
    expect(result).toEqual({ proposed: true, count: 1 });
  });

  it("reports the exact number of candidates proposed when more than one pillar matched", async () => {
    const candidateA = makeActualiteCandidate({ sourceUrl: "https://source.example/a" });
    const candidateB = makeActualiteCandidate({ sourceUrl: "https://source.example/b" });
    const findActualite = vi.fn().mockResolvedValue([candidateA, candidateB]);
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    const result = await runVeilleScan(deps);

    expect(result).toEqual({ proposed: true, count: 2 });
  });

  it("reports proposed:false without touching the queue/generation when nothing is found", async () => {
    const findActualite = vi.fn().mockResolvedValue([]);
    const deps = makeDeps({ actualiteWatch: { findActualite } });

    const result = await runVeilleScan(deps);

    // Incident du 08/09 : sans distinction entre "rien trouvé" et "une
    // erreur a été avalée", {"proposed":false} dans les logs du cron
    // (seule trace disponible côté GitHub Actions, pas d'accès SSH au VPS)
    // ne permettait pas de savoir si le scan avait vraiment cherché ou
    // échoué silencieusement (Discord, GitHub...) — `reason` distingue les
    // deux cas désormais, y compris quand tout se passe bien côté recherche
    // mais qu'aucun candidat n'a été retenu.
    expect(result).toEqual({
      proposed: false,
      count: 0,
      reason: expect.stringContaining("aucune actualité"),
    });
    expect(deps.anthropic.parseDraft).not.toHaveBeenCalled();
    expect(deps.github.commitDraftBranch).not.toHaveBeenCalled();
  });

  it("reports proposed:false when every candidate failed to be notified/persisted", async () => {
    const findActualite = vi.fn().mockResolvedValue([makeActualiteCandidate()]);
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const deps = makeDeps({
      actualiteWatch: { findActualite },
      discord: {
        ...makeDeps().discord,
        notifyActualiteProposal: vi.fn().mockRejectedValue(new Error("Discord indisponible")),
      },
    });

    const result = await runVeilleScan(deps);

    expect(result).toEqual({
      proposed: false,
      count: 0,
      reason: expect.stringContaining("Discord indisponible"),
    });
    consoleError.mockRestore();
  });

  it("reports proposed:false with the underlying error in `reason` (never throws) when the scan fails", async () => {
    const findActualite = vi.fn().mockRejectedValue(new Error("Claude indisponible"));
    const deps = makeDeps({ actualiteWatch: { findActualite } });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await runVeilleScan(deps);

    expect(result).toEqual({
      proposed: false,
      count: 0,
      reason: expect.stringContaining("Claude indisponible"),
    });
    consoleError.mockRestore();
  });

  it("reports proposed:false with the underlying error in `reason` (never throws) when listPublishedPosts itself fails", async () => {
    const deps = makeDeps({
      github: {
        ...makeDeps().github,
        listPublishedPosts: vi.fn().mockRejectedValue(new Error("GitHub indisponible")),
      },
    });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = await runVeilleScan(deps);

    expect(result).toEqual({
      proposed: false,
      count: 0,
      reason: expect.stringContaining("GitHub indisponible"),
    });
    consoleError.mockRestore();
  });
});

describe("buildDraftMarkdown", () => {
  it("produces frontmatter compatible with lib/blog.ts's schema", () => {
    const markdown = buildDraftMarkdown(validDraft, Buffer.from("fake-image"));

    expect(markdown).toContain(`title: ${validDraft.title}`);
    expect(markdown).toContain("slug: un-titre-valide");
    expect(markdown).toContain("coverImage: /blog/un-titre-valide/cover.jpg");
    expect(markdown).toContain("pillar: C");
    expect(markdown).toContain("localAngle: false");
    expect(markdown).toContain("Contenu de l'article.");
  });

  it("omits coverImage/coverImageAlt when no cover image was generated", () => {
    const markdown = buildDraftMarkdown(validDraft, null);

    expect(markdown).not.toContain("coverImage:");
    expect(markdown).not.toContain("coverImageAlt:");
    expect(markdown).toContain("Contenu de l'article.");
  });

  it("includes sourceUrl in the frontmatter when the draft comes from the actualité watch", () => {
    const markdown = buildDraftMarkdown(validDraft, null, "https://source.example/actu-1");

    expect(markdown).toContain("sourceUrl: 'https://source.example/actu-1'");
  });

  it("omits sourceUrl from the frontmatter for a regular pillar-rotation draft", () => {
    const markdown = buildDraftMarkdown(validDraft, null);

    expect(markdown).not.toContain("sourceUrl:");
  });
});
