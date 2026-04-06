import { DriveFile } from "./types";

export interface StorageProvider {
  listFiles(folderId?: string): Promise<DriveFile[]>;
  listFolders(parentId?: string): Promise<DriveFile[]>;
  readFile(fileId: string): Promise<string>;
  writeFile(fileId: string, content: string): Promise<void>;
  createFile(name: string, content: string, folderId?: string): Promise<DriveFile>;
  deleteFile(fileId: string): Promise<void>;
  renameFile(fileId: string, name: string): Promise<void>;
}
