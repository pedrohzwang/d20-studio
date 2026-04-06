import { DocumentMetadata, DocumentType } from "@/lib/metadata/types";

export class ContextBuilder {
  private index: DocumentMetadata[] = [];

  /**
   * Load all metadata from the /api/metadata endpoint.
   * Should be called once per chat session (or on demand).
   */
  async loadFromAPI(folderId?: string): Promise<void> {
    const url = folderId
      ? `/api/metadata?folderId=${encodeURIComponent(folderId)}`
      : "/api/metadata";
    const res = await fetch(url);
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data)) this.index = data;
  }

  /** Replace the in-memory index directly (e.g. when data is already fetched). */
  setIndex(data: DocumentMetadata[]): void {
    this.index = data;
  }

  findByType(type: DocumentType): DocumentMetadata[] {
    return this.index.filter((d) => d.type === type);
  }

  findByTags(tags: string[]): DocumentMetadata[] {
    const lower = tags.map((t) => t.toLowerCase());
    return this.index.filter((d) => d.tags.some((tag) => lower.includes(tag)));
  }

  searchText(query: string): DocumentMetadata[] {
    const q = query.toLowerCase();
    return this.index.filter((d) => {
      if (d.title.toLowerCase().includes(q)) return true;
      if (d.summary?.toLowerCase().includes(q)) return true;
      if (d.tags.some((t) => t.includes(q))) return true;
      const sectionText = Object.values(d.sections).join(" ").toLowerCase();
      return sectionText.includes(q);
    });
  }

  /**
   * Build a context string for a given user query.
   * Selects the most relevant documents and formats them for Claude, staying within
   * an approximate character budget (default ~8000 chars ≈ ~2500 tokens).
   */
  buildContextForQuery(query: string, charBudget = 8000): string {
    if (this.index.length === 0) return "";

    // Score each document by how many query terms it matches
    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
    const scored = this.index.map((doc) => {
      const text = [
        doc.title,
        doc.summary ?? "",
        doc.tags.join(" "),
        Object.values(doc.sections).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const score = terms.reduce((acc, term) => {
        const matches = text.split(term).length - 1;
        return acc + matches;
      }, 0);

      return { doc, score };
    });

    // Sort by score descending, then by type priority (npcs > locations > items > sessions > generic)
    const typePriority: Record<string, number> = {
      npc: 4,
      location: 3,
      item: 2,
      session: 1,
      generic: 0,
    };

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (typePriority[b.doc.type] ?? 0) - (typePriority[a.doc.type] ?? 0);
    });

    const parts: string[] = ["# Campaign Context\n"];
    let used = parts[0].length;

    for (const { doc } of scored) {
      const chunk = this.formatDocument(doc);
      if (used + chunk.length > charBudget) break;
      parts.push(chunk);
      used += chunk.length;
    }

    return parts.join("\n---\n");
  }

  private formatDocument(doc: DocumentMetadata): string {
    const lines: string[] = [`## ${doc.title} (${doc.type})`];

    if (doc.summary) lines.push(doc.summary);
    if (doc.tags.length > 0) lines.push(`Tags: ${doc.tags.join(", ")}`);

    // Key type-specific fields
    const relevantFields = Object.entries(doc.fields)
      .slice(0, 6)
      .map(([k, v]) => `- **${k}**: ${v}`);
    if (relevantFields.length > 0) lines.push(...relevantFields);

    // First 2 sections
    const sections = Object.entries(doc.sections).slice(0, 2);
    for (const [heading, body] of sections) {
      lines.push(`### ${heading}`);
      lines.push(body.slice(0, 500));
    }

    return lines.join("\n");
  }
}
