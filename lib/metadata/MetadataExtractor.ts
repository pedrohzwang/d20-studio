import { GoogleDriveStorage } from "@/lib/storage/GoogleDriveStorage";
import { MarkdownParser } from "./MarkdownParser";
import { DocumentMetadata } from "./types";

const META_SUFFIX = ".meta.json";
const parser = new MarkdownParser();

// In-process cache: fileId → metadata
const cache = new Map<string, DocumentMetadata>();

export class MetadataExtractor {
  private storage: GoogleDriveStorage;
  private accessToken: string;

  constructor(accessToken: string) {
    this.storage = new GoogleDriveStorage(accessToken);
    this.accessToken = accessToken;
  }

  /**
   * Extract metadata from content and persist it as a hidden .meta.json file
   * alongside the markdown file in Drive.
   * Skips extraction if modifiedTime hasn't changed (incremental detection).
   */
  async extractAndSave(
    fileId: string,
    filename: string,
    content: string,
    modifiedTime: string,
    folderId?: string
  ): Promise<DocumentMetadata> {
    // Incremental change detection: skip if unmodified
    const cached = cache.get(fileId);
    if (cached && cached.modifiedTime === modifiedTime) {
      return cached;
    }

    const metadata = parser.parse(content, filename, fileId, modifiedTime);
    cache.set(fileId, metadata);
    await this.saveMetaFile(metadata, folderId);
    return metadata;
  }

  /**
   * Load metadata from Drive cache file, or return null if not found.
   */
  async load(fileId: string): Promise<DocumentMetadata | null> {
    if (cache.has(fileId)) return cache.get(fileId)!;

    try {
      const metaFileId = await this.findMetaFileId(fileId);
      if (!metaFileId) return null;
      const raw = await this.storage.readFile(metaFileId);
      const meta = JSON.parse(raw) as DocumentMetadata;
      cache.set(fileId, meta);
      return meta;
    } catch {
      return null;
    }
  }

  /**
   * Load all available metadata files from Drive (root + subfolders are handled by the consumer).
   */
  async loadAll(folderId?: string): Promise<DocumentMetadata[]> {
    try {
      const files = await this.listMetaFiles(folderId);
      const results = await Promise.allSettled(
        files.map(async (f: { id: string; name: string }) => {
          const raw = await this.storage.readFile(f.id);
          return JSON.parse(raw) as DocumentMetadata;
        })
      );
      return results
        .filter((r): r is PromiseFulfilledResult<DocumentMetadata> => r.status === "fulfilled")
        .map((r) => r.value);
    } catch {
      return [];
    }
  }

  invalidate(fileId: string) {
    cache.delete(fileId);
  }

  /**
   * Sync metadata files with actual .md files in the folder.
   * - Deletes orphan .meta.json files (where the source .md no longer exists)
   * - Triggers extraction for .md files missing metadata
   */
  async syncMetadata(folderId?: string): Promise<{ extracted: number; deleted: number }> {
    const [mdFiles, metaFiles] = await Promise.all([
      this.storage.listFiles(folderId),
      this.listMetaFiles(folderId),
    ]);

    const mdFileIds = new Set(mdFiles.map((f) => f.id));
    let deleted = 0;
    let extracted = 0;

    // Delete orphan .meta.json files
    const deletePromises = metaFiles
      .filter((meta) => {
        const sourceId = meta.name.replace(META_SUFFIX, "");
        return !mdFileIds.has(sourceId);
      })
      .map(async (meta) => {
        try {
          await this.storage.deleteFile(meta.id);
          deleted++;
        } catch {
          // ignore delete failures
        }
      });
    await Promise.allSettled(deletePromises);

    // Find .md files missing metadata and extract
    const existingMetaSourceIds = new Set(
      metaFiles.map((m) => m.name.replace(META_SUFFIX, ""))
    );

    const extractPromises = mdFiles
      .filter((md) => !existingMetaSourceIds.has(md.id))
      .map(async (md) => {
        try {
          const content = await this.storage.readFile(md.id);
          await this.extractAndSave(md.id, md.name, content, md.modifiedTime ?? new Date().toISOString(), folderId);
          extracted++;
        } catch {
          // ignore extraction failures
        }
      });
    await Promise.allSettled(extractPromises);

    return { extracted, deleted };
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private metaFileName(fileId: string) {
    return `${fileId}${META_SUFFIX}`;
  }

  private async saveMetaFile(metadata: DocumentMetadata, folderId?: string) {
    const metaName = this.metaFileName(metadata.fileId);
    const content = JSON.stringify(metadata, null, 2);

    // Try to find and update existing meta file first
    const existingId = await this.findMetaFileId(metadata.fileId);
    if (existingId) {
      await this.storage.writeFile(existingId, content);
    } else {
      await this.storage.createFile(metaName, content, folderId, "application/json");
    }
  }

  private async findMetaFileId(fileId: string): Promise<string | null> {
    try {
      const metaName = this.metaFileName(fileId);
      // Search Drive for the meta file by name
      const params = new URLSearchParams({
        q: `name='${metaName}' and trashed=false`,
        fields: "files(id)",
      });
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.files?.[0]?.id ?? null;
    } catch {
      return null;
    }
  }

  private async listMetaFiles(folderId?: string): Promise<{ id: string; name: string }[]> {
    const parentQuery = folderId ? `'${folderId}' in parents` : "'root' in parents";
    const params = new URLSearchParams({
      q: `${parentQuery} and name contains '${META_SUFFIX}' and trashed=false`,
      fields: "files(id,name)",
    });
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.files ?? [];
  }
}
