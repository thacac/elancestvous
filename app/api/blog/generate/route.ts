import { NextRequest, NextResponse } from "next/server";
import { createBlogDraftDeps } from "@/services/blog/createBlogDraftDeps";
import { generateDraft } from "@/services/blog/generateDraft";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.BLOG_CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const deps = createBlogDraftDeps();
    const result = await generateDraft(deps);
    const status = result.status === "generation_failed" ? 500 : 200;
    return NextResponse.json(result, { status });
  } catch (err) {
    return NextResponse.json(
      {
        status: "generation_failed",
        reason: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
