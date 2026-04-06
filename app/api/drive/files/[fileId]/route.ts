import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { GoogleDriveStorage } from "@/lib/storage/GoogleDriveStorage";

type Params = { params: { fileId: string } };

// GET /api/drive/files/[fileId]  — read file content
export async function GET(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const storage = new GoogleDriveStorage(session.accessToken);
    const content = await storage.readFile(params.fileId);
    return NextResponse.json({ content });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/drive/files/[fileId]  — write content or rename
export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, name } = body as { content?: string; name?: string };

  if (content === undefined && !name) {
    return NextResponse.json({ error: "Provide content or name" }, { status: 400 });
  }

  try {
    const storage = new GoogleDriveStorage(session.accessToken);

    if (content !== undefined) {
      await storage.writeFile(params.fileId, content);
    }

    if (name) {
      await storage.renameFile(params.fileId, name);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/drive/files/[fileId]  — delete file
export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const storage = new GoogleDriveStorage(session.accessToken);
    await storage.deleteFile(params.fileId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete file";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
