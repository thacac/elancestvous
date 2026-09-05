import { NextRequest, NextResponse } from "next/server";
import { verifyDiscordSignature } from "@/lib/discordSignature";
import { handleDiscordInteraction } from "@/services/blog/discordInteractionHandler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Corps brut obligatoire pour la vérification de signature — jamais
  // request.json() puis re-sérialisation, ça invaliderait silencieusement
  // la signature envoyée par Discord.
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!publicKey || !verifyDiscordSignature(rawBody, signature, timestamp, publicKey)) {
    return NextResponse.json({ error: "invalid request signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const result = handleDiscordInteraction(payload);
  return NextResponse.json(result);
}
