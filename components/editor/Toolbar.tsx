"use client";

import { Button, Spinner } from "@heroui/react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface ToolbarProps {
  fileName: string;
  saveStatus: SaveStatus;
  onSave: () => void;
  chatOpen?: boolean;
  onToggleChat?: () => void;
}

export default function Toolbar({ fileName, saveStatus, onSave, chatOpen, onToggleChat }: ToolbarProps) {
  const statusLabel: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  };

  const statusColor: Record<SaveStatus, string> = {
    idle: "",
    saving: "text-gray-400",
    saved: "text-green-500",
    error: "text-red-500",
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="flex items-center gap-2 min-w-0">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
          {fileName.replace(/\.md$/, "")}
        </span>
        <span className={`text-xs ${statusColor[saveStatus]} flex-shrink-0 flex items-center gap-1`}>
          {saveStatus === "saving" && <Spinner size="sm" className="scale-75" />}
          {statusLabel[saveStatus]}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {onToggleChat && (
          <Button
            size="sm"
            variant={chatOpen ? "flat" : "light"}
            color={chatOpen ? "secondary" : "default"}
            onPress={onToggleChat}
            className="flex-shrink-0"
            aria-label="Toggle DM Assistant"
          >
            🎲 Assistant
          </Button>
        )}
        <Button
          size="sm"
          color="primary"
          variant="flat"
          onPress={onSave}
          isDisabled={saveStatus === "saving"}
          className="flex-shrink-0"
        >
          Save
        </Button>
      </div>
    </div>
  );
}
