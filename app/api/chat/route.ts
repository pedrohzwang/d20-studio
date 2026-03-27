import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ClaudeService } from "@/lib/ai/ClaudeService";
import { buildSystemPrompt, ChatMessage } from "@/lib/ai/PromptBuilder";
import { MetadataExtractor } from "@/lib/metadata/MetadataExtractor";
import { ContextBuilder } from "@/lib/context/ContextBuilder";

const claude = new ClaudeService();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const {
    message,
    history = [],
    folderId,
  } = body as {
    message?: string;
    history?: ChatMessage[];
    folderId?: string;
  };

  if (!message?.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  try {
    // Load campaign context from metadata index
    const extractor = new MetadataExtractor(session.accessToken as string);
    const allMetadata = await extractor.loadAll(folderId);

    const builder = new ContextBuilder();
    builder.setIndex(allMetadata);
    const campaignContext = builder.buildContextForQuery(message);

    const systemPrompt = buildSystemPrompt(campaignContext);
    const reply = await claude.sendMessage(systemPrompt, history, message);

    return NextResponse.json({ reply });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
