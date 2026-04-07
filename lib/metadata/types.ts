export type DocumentType = "npc" | "session" | "location" | "item" | "generic";

export interface BaseMetadata {
  fileId: string;
  name: string;
  title: string;
  type: DocumentType;
  tags: string[];
  modifiedTime: string;
  summary?: string;
  secrets?: string[];
  sections: Record<string, string>;
  fields: Record<string, string>;
}

export interface NPCMetadata extends BaseMetadata {
  type: "npc";
  race?: string;
  occupation?: string;
  location?: string;
  alignment?: string;
  status?: string;
  relationships?: string[];
}

export interface SessionMetadata extends BaseMetadata {
  type: "session";
  sessionNumber?: number;
  date?: string;
  location?: string;
  keyEvents?: string[];
  npcsPresent?: string[];
}

export interface LocationMetadata extends BaseMetadata {
  type: "location";
  region?: string;
  locationType?: string;
  npcsPresent?: string[];
  connectedLocations?: string[];
}

export interface ItemMetadata extends BaseMetadata {
  type: "item";
  itemType?: string;
  rarity?: string;
  owner?: string;
}

export interface GenericMetadata extends BaseMetadata {
  type: "generic";
}

export type DocumentMetadata =
  | NPCMetadata
  | SessionMetadata
  | LocationMetadata
  | ItemMetadata
  | GenericMetadata;
