import {
  DocumentMetadata,
  NPCMetadata,
  SessionMetadata,
  LocationMetadata,
  ItemMetadata,
} from "@/lib/metadata/types";

interface GraphNode {
  id: string;
  name: string;
  type: string;
}

interface GraphEdge {
  from: string;
  to: string;
  relation: string;
}

export class RelationshipGraph {
  private adjacency = new Map<string, Set<string>>();
  private nodes = new Map<string, GraphNode>();
  private edges: GraphEdge[] = [];

  /**
   * Build the graph from a list of document metadata.
   * Entities are identified by their lowercased title.
   */
  build(documents: DocumentMetadata[]): void {
    this.adjacency.clear();
    this.nodes.clear();
    this.edges = [];

    // Register all documents as nodes
    for (const doc of documents) {
      const key = doc.title.toLowerCase();
      this.nodes.set(key, { id: doc.fileId, name: doc.title, type: doc.type });
    }

    // Extract edges based on document type
    for (const doc of documents) {
      const key = doc.title.toLowerCase();

      switch (doc.type) {
        case "npc": {
          const npc = doc as NPCMetadata;
          if (npc.location) this.addEdge(key, npc.location.toLowerCase(), "located_at");
          if (npc.relationships) {
            for (const rel of npc.relationships) {
              this.addEdge(key, rel.toLowerCase(), "related_to");
            }
          }
          break;
        }
        case "session": {
          const session = doc as SessionMetadata;
          if (session.location) this.addEdge(key, session.location.toLowerCase(), "takes_place_at");
          if (session.npcsPresent) {
            for (const npc of session.npcsPresent) {
              this.addEdge(key, npc.toLowerCase(), "features");
            }
          }
          break;
        }
        case "location": {
          const loc = doc as LocationMetadata;
          if (loc.npcsPresent) {
            for (const npc of loc.npcsPresent) {
              this.addEdge(key, npc.toLowerCase(), "has_npc");
            }
          }
          if (loc.connectedLocations) {
            for (const conn of loc.connectedLocations) {
              this.addEdge(key, conn.toLowerCase(), "connected_to");
            }
          }
          break;
        }
        case "item": {
          const item = doc as ItemMetadata;
          if (item.owner) this.addEdge(key, item.owner.toLowerCase(), "owned_by");
          break;
        }
      }
    }
  }

  /**
   * Find entities related to the given name, up to `depth` hops away.
   * Returns the set of related entity keys (lowercased titles).
   */
  findRelated(entityName: string, depth = 1): Set<string> {
    const key = entityName.toLowerCase();
    const visited = new Set<string>();
    const queue: [string, number][] = [[key, 0]];

    while (queue.length > 0) {
      const [current, d] = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      if (d < depth) {
        const neighbors = this.adjacency.get(current);
        if (neighbors) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push([neighbor, d + 1]);
            }
          }
        }
      }
    }

    // Remove the starting node itself
    visited.delete(key);
    return visited;
  }

  /**
   * Resolve entity keys to their original document metadata from the provided list.
   */
  resolveToDocuments(entityKeys: Set<string>, documents: DocumentMetadata[]): DocumentMetadata[] {
    return documents.filter((d) => entityKeys.has(d.title.toLowerCase()));
  }

  /**
   * Get a human-readable debug representation of the graph.
   */
  toDebugString(): string {
    const lines: string[] = ["=== RelationshipGraph ==="];
    lines.push(`Nodes: ${this.nodes.size}`);
    lines.push(`Edges: ${this.edges.length}`);
    lines.push("");

    for (const edge of this.edges) {
      const fromNode = this.nodes.get(edge.from);
      const toNode = this.nodes.get(edge.to);
      const fromName = fromNode?.name ?? edge.from;
      const toName = toNode?.name ?? edge.to;
      lines.push(`  ${fromName} --[${edge.relation}]--> ${toName}`);
    }

    return lines.join("\n");
  }

  private addEdge(from: string, to: string, relation: string): void {
    // Bidirectional adjacency
    if (!this.adjacency.has(from)) this.adjacency.set(from, new Set());
    if (!this.adjacency.has(to)) this.adjacency.set(to, new Set());
    this.adjacency.get(from)!.add(to);
    this.adjacency.get(to)!.add(from);

    this.edges.push({ from, to, relation });
  }
}
