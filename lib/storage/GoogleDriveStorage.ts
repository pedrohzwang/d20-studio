import { StorageProvider } from "./StorageProvider";
import { DriveFile } from "./types";

const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_API = "https://www.googleapis.com/upload/drive/v3";

export class GoogleDriveStorage implements StorageProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetch<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err?.error?.message ?? `Drive API error: ${res.status}`);
    }

    return res.json() as Promise<T>;
  }

  async listFiles(folderId?: string): Promise<DriveFile[]> {
    const parentQuery = folderId ? `'${folderId}' in parents` : "'root' in parents";
    const query = `${parentQuery} and mimeType='text/markdown' and trashed=false`;
    const params = new URLSearchParams({
      q: query,
      fields: "files(id,name,mimeType,modifiedTime,parents)",
      orderBy: "name",
    });

    const data = await this.fetch<{ files: DriveFile[] }>(
      `${DRIVE_API}/files?${params}`
    );
    return data.files ?? [];
  }

  async listFolders(parentId?: string): Promise<DriveFile[]> {
    const parentQuery = parentId ? `'${parentId}' in parents` : "'root' in parents";
    const query = `${parentQuery} and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const params = new URLSearchParams({
      q: query,
      fields: "files(id,name,mimeType,modifiedTime,parents)",
      orderBy: "name",
    });

    const data = await this.fetch<{ files: DriveFile[] }>(
      `${DRIVE_API}/files?${params}`
    );
    return data.files ?? [];
  }

  async readFile(fileId: string): Promise<string> {
    const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to read file: ${res.statusText}`);
    }

    return res.text();
  }

  async writeFile(fileId: string, content: string): Promise<void> {
    const res = await fetch(
      `${DRIVE_UPLOAD_API}/files/${fileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "text/markdown",
        },
        body: content,
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
      throw new Error(err?.error?.message ?? `Failed to write file: ${res.status}`);
    }
  }

  async createFile(name: string, content: string, folderId?: string, mimeType?: string): Promise<DriveFile> {
    // If name has no extension, default to .md
    const finalName = /\.[a-z0-9]+$/i.test(name) ? name : `${name}.md`;
    const finalMime = mimeType ?? (finalName.endsWith(".json") ? "application/json" : "text/markdown");
    const metadata: Record<string, unknown> = {
      name: finalName,
      mimeType: finalMime,
    };

    if (folderId) {
      metadata.parents = [folderId];
    }

    // 1. Create metadata
    const created = await this.fetch<DriveFile>(`${DRIVE_API}/files`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    });

    // 2. Upload content
    await this.writeFile(created.id, content);

    return created;
  }

  async deleteFile(fileId: string): Promise<void> {
    const res = await fetch(`${DRIVE_API}/files/${fileId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });

    if (!res.ok && res.status !== 204) {
      throw new Error(`Failed to delete file: ${res.statusText}`);
    }
  }

  async renameFile(fileId: string, name: string): Promise<void> {
    await this.fetch(`${DRIVE_API}/files/${fileId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  }
}
