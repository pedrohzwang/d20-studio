import matter from "gray-matter";
import {
  DocumentType,
  DocumentMetadata,
  NPCMetadata,
  SessionMetadata,
  LocationMetadata,
  ItemMetadata,
  GenericMetadata,
} from "./types";

export class MarkdownParser {
  /**
   * Full parse — returns a DocumentMetadata skeleton (fileId/modifiedTime filled by caller).
   */
  parse(
    content: string,
    filename: string,
    fileId: string,
    modifiedTime: string
  ): DocumentMetadata {
    const { data: frontmatter, content: body } = matter(content);

    const title = this.extractTitle(body) ?? filename.replace(/\.md$/, "");
    const fields = { ...this.extractFields(body), ...frontmatter };
    const sections = this.extractSections(body);
    const tags = this.extractTags(body, frontmatter);
    const type = this.detectType(body, filename, frontmatter);
    const summary = this.extractSummary(body);

    const secrets = this.extractBlockquotes(body);

    const base = {
      fileId,
      name: filename,
      title,
      type,
      tags,
      modifiedTime,
      summary,
      secrets: secrets.length > 0 ? secrets : undefined,
      sections,
      fields,
    };

    switch (type) {
      case "npc":
        return {
          ...base,
          type: "npc",
          race: fields["raça"] ?? fields["race"] ?? fields["espécie"] ?? undefined,
          occupation:
            fields["ocupação"] ?? fields["occupation"] ?? fields["classe"] ?? fields["class"] ?? undefined,
          location: fields["localização"] ?? fields["location"] ?? fields["local"] ?? undefined,
          alignment: fields["alinhamento"] ?? fields["alignment"] ?? undefined,
          status: fields["status"] ?? undefined,
          relationships: this.extractListField(body, ["relações", "relationships", "relacionamentos"]),
        } as NPCMetadata;

      case "session":
        return {
          ...base,
          type: "session",
          sessionNumber: this.parseNumber(fields["sessão"] ?? fields["session"] ?? fields["número"]),
          date: fields["data"] ?? fields["date"] ?? undefined,
          location: fields["localização"] ?? fields["location"] ?? fields["local"] ?? undefined,
          keyEvents: this.extractListField(body, ["eventos", "events", "acontecimentos"]),
          npcsPresent: this.extractListField(body, ["npcs", "personagens presentes", "npcs presentes"]),
        } as SessionMetadata;

      case "location":
        return {
          ...base,
          type: "location",
          region: fields["região"] ?? fields["region"] ?? undefined,
          locationType: fields["tipo"] ?? fields["type"] ?? undefined,
          npcsPresent: this.extractListField(body, ["npcs", "habitantes", "moradores"]),
          connectedLocations: this.extractListField(body, ["conexões", "connections", "locais próximos"]),
        } as LocationMetadata;

      case "item":
        return {
          ...base,
          type: "item",
          itemType: fields["tipo"] ?? fields["type"] ?? undefined,
          rarity: fields["raridade"] ?? fields["rarity"] ?? undefined,
          owner: fields["dono"] ?? fields["owner"] ?? fields["portador"] ?? undefined,
        } as ItemMetadata;

      default:
        return { ...base, type: "generic" } as GenericMetadata;
    }
  }

  extractTitle(content: string): string | null {
    const match = content.match(/^#{1,2}\s+(.+)$/m);
    return match ? match[1].trim() : null;
  }

  extractFields(content: string): Record<string, string> {
    const fields: Record<string, string> = {};
    // Match "**Field:** Value" or "**Field**: Value"
    const pattern = /\*{1,2}([^*:]+)\*{0,2}:\*{0,2}\s*(.+)/gm;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const key = match[1].trim().toLowerCase();
      const value = match[2].trim().replace(/\*+/g, "");
      fields[key] = value;
    }
    return fields;
  }

  extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    // Split on ## headings
    const parts = content.split(/^#{2,3}\s+/m);
    for (const part of parts.slice(1)) {
      const lines = part.split("\n");
      const heading = lines[0].trim().toLowerCase();
      const body = lines.slice(1).join("\n").trim();
      if (heading) sections[heading] = body;
    }
    return sections;
  }

  extractTags(content: string, frontmatter: Record<string, unknown> = {}): string[] {
    const tags: Set<string> = new Set();

    // From frontmatter
    const fmTags = frontmatter["tags"] ?? frontmatter["categorias"];
    if (Array.isArray(fmTags)) fmTags.forEach((t) => tags.add(String(t).toLowerCase()));
    if (typeof fmTags === "string") fmTags.split(",").forEach((t) => tags.add(t.trim().toLowerCase()));

    // #hashtag style in content
    const hashPattern = /#([a-zA-ZÀ-ÿ0-9_-]+)/g;
    let m;
    while ((m = hashPattern.exec(content)) !== null) {
      tags.add(m[1].toLowerCase());
    }

    return Array.from(tags);
  }

  detectType(
    content: string,
    filename: string,
    frontmatter: Record<string, unknown> = {}
  ): DocumentType {
    // Explicit frontmatter type
    const explicit = String(frontmatter["type"] ?? frontmatter["tipo"] ?? "").toLowerCase();
    if (explicit === "npc" || explicit === "personagem") return "npc";
    if (explicit === "session" || explicit === "sessão") return "session";
    if (explicit === "location" || explicit === "local" || explicit === "localização") return "location";
    if (explicit === "item") return "item";

    const combined = (filename + " " + content).toLowerCase();

    const npcKeywords = ["npc", "personagem", "raça:", "race:", "alinhamento:", "alignment:", "ocupação:", "occupation:"];
    const sessionKeywords = ["sessão", "session", "resumo da sessão", "session recap", "sessão #", "session #"];
    const locationKeywords = ["localização", "location", "região:", "region:", "mapa", "taverna", "floresta", "cidade", "dungeon"];
    const itemKeywords = ["item", "arma", "weapon", "armadura", "armor", "raridade:", "rarity:", "magia", "poção"];

    const score = (keywords: string[]) => keywords.filter((k) => combined.includes(k)).length;

    const scores: [DocumentType, number][] = [
      ["npc", score(npcKeywords)],
      ["session", score(sessionKeywords)],
      ["location", score(locationKeywords)],
      ["item", score(itemKeywords)],
    ];

    const best = scores.sort((a, b) => b[1] - a[1])[0];
    return best[1] > 0 ? best[0] : "generic";
  }

  extractSummary(content: string): string {
    // First non-heading paragraph
    const lines = content.split("\n");
    const paragraphLines: string[] = [];
    let started = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        if (started) break;
        continue;
      }
      if (trimmed.startsWith("**") && trimmed.includes(":")) continue; // skip field lines
      started = true;
      paragraphLines.push(trimmed);
      if (paragraphLines.length >= 3) break;
    }

    return paragraphLines.join(" ").slice(0, 300);
  }

  /**
   * Extract blockquotes as DM secrets / hidden notes.
   * Lines starting with `> ` are collected into grouped blockquotes.
   */
  extractBlockquotes(content: string): string[] {
    const secrets: string[] = [];
    let current: string[] = [];

    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("> ")) {
        current.push(trimmed.slice(2).trim());
      } else if (trimmed === ">") {
        // empty blockquote continuation line
        current.push("");
      } else {
        if (current.length > 0) {
          secrets.push(current.join(" ").trim());
          current = [];
        }
      }
    }
    if (current.length > 0) {
      secrets.push(current.join(" ").trim());
    }

    return secrets.filter((s) => s.length > 0);
  }

  private extractListField(content: string, headings: string[]): string[] {
    const lower = content.toLowerCase();
    for (const heading of headings) {
      const idx = lower.indexOf(heading);
      if (idx === -1) continue;
      const afterHeading = content.slice(idx);
      const lines = afterHeading.split("\n").slice(1);
      const items: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (trimmed.startsWith("#")) break;
        const bullet = trimmed.match(/^[-*•]\s+(.+)/);
        if (bullet) items.push(bullet[1].replace(/\*+/g, "").trim());
        else if (items.length > 0) break;
      }
      if (items.length > 0) return items;
    }
    return [];
  }

  private parseNumber(value?: string): number | undefined {
    if (!value) return undefined;
    const n = parseInt(value.replace(/\D/g, ""), 10);
    return isNaN(n) ? undefined : n;
  }
}
