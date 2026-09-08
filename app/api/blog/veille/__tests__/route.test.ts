import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/services/blog/createBlogDraftDeps", () => ({
  createBlogDraftDeps: vi.fn().mockReturnValue({}),
}));
vi.mock("@/services/blog/generateDraft", () => ({
  runVeilleScan: vi.fn(),
}));

import { createBlogDraftDeps } from "@/services/blog/createBlogDraftDeps";
import { runVeilleScan } from "@/services/blog/generateDraft";

import { POST } from "../route";

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("https://elancestvous.fr/api/blog/veille", {
    method: "POST",
    headers,
  });
}

describe("POST /api/blog/veille", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env.BLOG_CRON_SECRET = "test-secret";
    vi.mocked(runVeilleScan).mockReset();
    vi.mocked(createBlogDraftDeps).mockClear();
    vi.mocked(createBlogDraftDeps).mockReturnValue({} as ReturnType<typeof createBlogDraftDeps>);
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("rejects requests without a valid bearer token", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(runVeilleScan).not.toHaveBeenCalled();
  });

  it("rejects requests with the wrong secret", async () => {
    const response = await POST(makeRequest({ authorization: "Bearer wrong-secret" }));

    expect(response.status).toBe(401);
    expect(runVeilleScan).not.toHaveBeenCalled();
  });

  it("returns 200 with proposed:true when the scan finds a candidate", async () => {
    vi.mocked(runVeilleScan).mockResolvedValue({ proposed: true });

    const response = await POST(makeRequest({ authorization: "Bearer test-secret" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ proposed: true });
    expect(runVeilleScan).toHaveBeenCalled();
  });

  it("returns 200 with proposed:false when the scan finds nothing (not an error)", async () => {
    vi.mocked(runVeilleScan).mockResolvedValue({ proposed: false });

    const response = await POST(makeRequest({ authorization: "Bearer test-secret" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ proposed: false });
  });

  it("returns 500 when createBlogDraftDeps fails (missing configuration)", async () => {
    vi.mocked(createBlogDraftDeps).mockImplementation(() => {
      throw new Error("Variable d'environnement manquante : ANTHROPIC_API_KEY");
    });

    const response = await POST(makeRequest({ authorization: "Bearer test-secret" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toContain("ANTHROPIC_API_KEY");
  });
});
