import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/blog/createBlogDraftDeps", () => ({
  createBlogDraftDeps: vi.fn().mockReturnValue({}),
}));
vi.mock("@/services/blog/generateDraft", () => ({
  generateDraft: vi.fn(),
}));

import { createBlogDraftDeps } from "@/services/blog/createBlogDraftDeps";
import { generateDraft } from "@/services/blog/generateDraft";

import { POST } from "../route";

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("https://elancestvous.fr/api/blog/generate", {
    method: "POST",
    headers,
  });
}

describe("POST /api/blog/generate", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.BLOG_CRON_SECRET = "test-secret";
    vi.mocked(generateDraft).mockReset();
    vi.mocked(createBlogDraftDeps).mockClear();
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("rejects requests without a valid bearer token", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(generateDraft).not.toHaveBeenCalled();
  });

  it("rejects requests with the wrong secret", async () => {
    const response = await POST(
      makeRequest({ authorization: "Bearer wrong-secret" })
    );

    expect(response.status).toBe(401);
    expect(generateDraft).not.toHaveBeenCalled();
  });

  it("returns 200 and the result when the secret matches and generation succeeds", async () => {
    vi.mocked(generateDraft).mockResolvedValue({
      status: "committed",
      slug: "un-article",
      title: "Un article",
      branch: "blog-draft/un-article",
      url: "https://github.com/thacac/elancestvous/tree/blog-draft/un-article",
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("committed");
    expect(generateDraft).toHaveBeenCalled();
  });

  it("returns 500 when generation fails", async () => {
    vi.mocked(generateDraft).mockResolvedValue({
      status: "generation_failed",
      reason: "boom",
    });

    const response = await POST(
      makeRequest({ authorization: "Bearer test-secret" })
    );

    expect(response.status).toBe(500);
  });
});
