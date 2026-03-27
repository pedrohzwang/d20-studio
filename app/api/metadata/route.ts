import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { MetadataExtractor } from "@/lib/metadata/MetadataExtractor";
import { GoogleDriveStorage } from "@/lib/storage/GoogleDriveStorage";

// POST /api/metadata  —  extract + save metadata for a single file
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { fileId, filename, folderId } = body as {
    fileId?: string;
    filename?: string;
    folderId?: string;
  };

  if (!fileId || !filename) {
    return NextResponse.json({ error: "fileId and filename are required" }, { status: 400 });
  }

  try {
    const storage = new GoogleDriveStorage(session.accessToken as string);
    const content = await storage.readFile(fileId);

    // Use the Drive modifiedTime from the file metadata if available
    const modifiedTime = new Date().toISOString();

    const extractor = new MetadataExtractor(session.accessToken as string);
    const metadata = await extractor.extractAndSave(fileId, filename, content, modifiedTime, folderId);

    return NextResponse.json(metadata);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// GET /api/metadata  —  list all cached metadata for a folder
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId") ?? undefined;

  try {
    const extractor = new MetadataExtractor(session.accessToken as string);
    const all = await extractor.loadAll(folderId);
    return NextResponse.json(all);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
