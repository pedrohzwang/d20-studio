import {
  DocumentMetadata,
  DocumentType,
  NPCMetadata,
  SessionMetadata,
  LocationMetadata,
  ItemMetadata,
} from "@/lib/metadata/types";
import { RelationshipGraph } from "./RelationshipGraph";

const CACHE_MAX_SIZE = 50;

export class ContextBuilder {
  private index: DocumentMetadata[] = [];
  private graph = new RelationshipGraph();
  private queryCache = new Map<string, { result: string; timestamp: number }>();
  private indexVersion = 0;

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
    if (Array.isArray(data)) {
      this.index = data;
      this.graph.build(this.index);
      this.invalidateCache();
    }
  }

  /** Replace the in-memory index directly (e.g. when data is already fetched). */
  setIndex(data: DocumentMetadata[]): void {
    this.index = data;
    this.graph.build(this.index);
    this.invalidateCache();
  }

  findByType(type: DocumentType): DocumentMetadata[] {
    return this.index.filter((d) => d.type === type);
  }

  findByTags(tags: string[]): DocumentMetadata[] {
    const lower = tags.map((t) => t.toLowerCase());
    return this.index.filter((d) => d.tags.some((tag) => lower.includes(tag)));
  }

  findByLocation(location: string): DocumentMetadata[] {
    const q = location.toLowerCase();
    return this.index.filter((d) => {
      switch (d.type) {
        case "npc":
          return (d as NPCMetadata).location?.toLowerCase().includes(q);
        case "session":
          return (d as SessionMetadata).location?.toLowerCase().includes(q);
        case "location":
          return (
            d.title.toLowerCase().includes(q) ||
            (d as LocationMetadata).region?.toLowerCase().includes(q)
          );
        case "item":
          return (d as ItemMetadata).owner?.toLowerCase().includes(q);
        default:
          return false;
      }
    });
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

    // Check cache
    const cacheKey = `${query}:${charBudget}`;
    const cached = this.queryCache.get(cacheKey);
    if (cached) return cached.result;

    // Score each document by how many query terms it matches
    const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

    // Collect entities mentioned in the query for graph expansion
    const relatedKeys = new Set<string>();
    for (const doc of this.index) {
      const titleLower = doc.title.toLowerCase();
      if (terms.some((t) => titleLower.includes(t))) {
        const neighbors = this.graph.findRelated(doc.title, 1);
        for (const n of neighbors) relatedKeys.add(n);
      }
    }

    const scored = this.index.map((doc) => {
      const text = [
        doc.title,
        doc.summary ?? "",
        doc.tags.join(" "),
        Object.values(doc.sections).join(" "),
      ]
        .join(" ")
        .toLowerCase();

      let score = terms.reduce((acc, term) => {
        const matches = text.split(term).length - 1;
        return acc + matches;
      }, 0);

      // Boost documents that are graph-related to a matched entity
      if (relatedKeys.has(doc.title.toLowerCase())) {
        score += 0.5;
      }

      // Recency bonus: newer documents get a small boost (max +1 for docs modified today)
      if (doc.modifiedTime) {
        const ageMs = Date.now() - new Date(doc.modifiedTime).getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        // Exponential decay: 1.0 for today, ~0.5 at 7 days, ~0.25 at 14 days
        score += Math.max(0, Math.exp(-ageDays / 10));
      }

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

    const result = parts.join("\n---\n");

    // Store in cache (LRU eviction)
    if (this.queryCache.size >= CACHE_MAX_SIZE) {
      // Remove oldest entry
      const oldest = [...this.queryCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldest) this.queryCache.delete(oldest[0]);
    }
    this.queryCache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  /** Expose the graph for external consumers. */
  getGraph(): RelationshipGraph {
    return this.graph;
  }

  private invalidateCache(): void {
    this.queryCache.clear();
    this.indexVersion++;
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
