import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleDriveStorage } from "@/lib/storage/GoogleDriveStorage";

// GET /api/drive/files?folderId=<id>  — list .md files (+ folders if includeFolders=true)
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId") ?? undefined;
  const includeFolders = searchParams.get("includeFolders") === "true";

  try {
    const storage = new GoogleDriveStorage(session.accessToken);
    const [files, folders] = await Promise.all([
      storage.listFiles(folderId),
      includeFolders ? storage.listFolders(folderId) : Promise.resolve([]),
    ]);
    return NextResponse.json({ files, folders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to list files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/drive/files  — create a new .md file
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, content = "", folderId } = body as {
    name: string;
    content?: string;
    folderId?: string;
  };

  if (!name || typeof name !== "string" || name.trim() === "") {
    return NextResponse.json({ error: "File name is required" }, { status: 400 });
  }

  try {
    const storage = new GoogleDriveStorage(session.accessToken);
    const file = await storage.createFile(name.trim(), content, folderId);
    return NextResponse.json({ file }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
