"use client";

import { useEffect, useState, useCallback } from "react";
import { DriveFile } from "@/lib/storage/types";
import { Button, Input, Spinner } from "@heroui/react";

interface FileSidebarProps {
  selectedFileId: string | null;
  onSelectFile: (file: DriveFile) => void;
}

export default function FileSidebar({ selectedFileId, onSelectFile }: FileSidebarProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [showNewInput, setShowNewInput] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/drive/files");
      if (!res.ok) throw new Error("Failed to load files");
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleCreate = async () => {
    const name = newFileName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch("/api/drive/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create file");
      const data = await res.json();
      setFiles((prev) => [...prev, data.file].sort((a, b) => a.name.localeCompare(b.name)));
      setNewFileName("");
      setShowNewInput(false);
      onSelectFile(data.file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create file");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (file: DriveFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    setDeletingId(file.id);
    try {
      const res = await fetch(`/api/drive/files/${file.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete file");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeletingId(null);
    }
  };

  const startRename = (file: DriveFile) => {
    setRenamingId(file.id);
    setRenameValue(file.name.replace(/\.md$/, ""));
  };

  const handleRename = async (file: DriveFile) => {
    const name = renameValue.trim();
    if (!name || name === file.name.replace(/\.md$/, "")) {
      setRenamingId(null);
      return;
    }
    try {
      const newName = name.endsWith(".md") ? name : `${name}.md`;
      const res = await fetch(`/api/drive/files/${file.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      if (!res.ok) throw new Error("Failed to rename file");
      setFiles((prev) =>
        prev
          .map((f) => (f.id === file.id ? { ...f, name: newName } : f))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename file");
    } finally {
      setRenamingId(null);
    }
  };

  return (
    <aside className="w-64 min-h-full border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Files</span>
        <Button
          size="sm"
          isIconOnly
          variant="light"
          onPress={() => setShowNewInput(true)}
          title="New file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* New file input */}
      {showNewInput && (
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-800">
          <Input
            autoFocus
            size="sm"
            placeholder="filename.md"
            value={newFileName}
            onValueChange={setNewFileName}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") {
                setShowNewInput(false);
                setNewFileName("");
              }
            }}
            endContent={
              creating ? (
                <Spinner size="sm" />
              ) : (
                <button
                  className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                  onClick={handleCreate}
                >
                  Create
                </button>
              )
            }
          />
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {loading && (
          <div className="flex justify-center py-8">
            <Spinner size="sm" />
          </div>
        )}

        {error && (
          <div className="px-4 py-3 text-xs text-red-500">
            {error}
            <button className="block mt-1 text-purple-500 underline" onClick={fetchFiles}>
              Retry
            </button>
          </div>
        )}

        {!loading && !error && files.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-gray-400">
            No .md files found.
            <br />
            Create one to get started.
          </div>
        )}

        {files.map((file) => (
          <div key={file.id} className="group relative">
            {renamingId === file.id ? (
              <div className="px-3 py-1">
                <Input
                  autoFocus
                  size="sm"
                  value={renameValue}
                  onValueChange={setRenameValue}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRename(file);
                    if (e.key === "Escape") setRenamingId(null);
                  }}
                  onBlur={() => handleRename(file)}
                />
              </div>
            ) : (
              <button
                className={`w-full text-left px-4 py-2 text-sm truncate flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                  selectedFileId === file.id
                    ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                    : "text-gray-700 dark:text-gray-300"
                }`}
                onClick={() => onSelectFile(file)}
              >
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="truncate">{file.name.replace(/\.md$/, "")}</span>

                {/* Action buttons */}
                <span className="ml-auto hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                  <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      startRename(file);
                    }}
                    title="Rename"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                  <button
                    className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    title="Delete"
                    disabled={deletingId === file.id}
                  >
                    {deletingId === file.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    )}
                  </button>
                </span>
              </button>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
