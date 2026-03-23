"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import FileSidebar from "@/components/editor/FileSidebar";
import Toolbar, { SaveStatus } from "@/components/editor/Toolbar";
import { DriveFile } from "@/lib/storage/types";
import { Spinner } from "@heroui/react";

// Dynamically import so CodeMirror never renders on the server
const MarkdownEditor = dynamic(() => import("@/components/editor/MarkdownEditor"), {
    ssr: false,
    loading: () => (
        <div className="flex-1 flex items-center justify-center">
            <Spinner />
        </div>
    ),
});

const AUTOSAVE_DELAY_MS = 2000;

export default function EditorPage() {
    const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
    const [content, setContent] = useState("");
    const [loadingContent, setLoadingContent] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
    const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSavedContent = useRef("");

    // ------------------------------------------------------------------
    // Load file content when selection changes
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!selectedFile) return;

        let cancelled = false;
        setLoadingContent(true);
        setSaveStatus("idle");

        fetch(`/api/drive/files/${selectedFile.id}`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load file");
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                setContent(data.content ?? "");
                lastSavedContent.current = data.content ?? "";
            })
            .catch(() => {
                if (!cancelled) setSaveStatus("error");
            })
            .finally(() => {
                if (!cancelled) setLoadingContent(false);
            });

        return () => {
            cancelled = true;
        };
    }, [selectedFile]);

    // ------------------------------------------------------------------
    // Save
    // ------------------------------------------------------------------
    const save = useCallback(
        async (contentToSave: string) => {
            if (!selectedFile) return;
            if (contentToSave === lastSavedContent.current) return;

            setSaveStatus("saving");
            try {
                const res = await fetch(`/api/drive/files/${selectedFile.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content: contentToSave }),
                });
                if (!res.ok) throw new Error("Save failed");
                lastSavedContent.current = contentToSave;
                setSaveStatus("saved");
                setTimeout(() => setSaveStatus("idle"), 2000);
            } catch {
                setSaveStatus("error");
            }
        },
        [selectedFile]
    );

    // ------------------------------------------------------------------
    // Editor change handler — triggers autosave debounce
    // ------------------------------------------------------------------
    const handleChange = useCallback(
        (value: string) => {
            setContent(value);
            setSaveStatus("idle");

            if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
            autosaveTimer.current = setTimeout(() => {
                save(value);
            }, AUTOSAVE_DELAY_MS);
        },
        [save]
    );

    // ------------------------------------------------------------------
    // Manual save (Ctrl+S)
    // ------------------------------------------------------------------
    const handleManualSave = useCallback(() => {
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
        save(content);
    }, [content, save]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleManualSave();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [handleManualSave]);

    // ------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------
    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <FileSidebar selectedFileId={selectedFile?.id ?? null} onSelectFile={setSelectedFile} />

            <div className="flex-1 flex flex-col overflow-hidden">
                {!selectedFile ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 text-gray-400 dark:text-gray-600">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-lg font-medium">Select a file to start editing</p>
                        <p className="text-sm max-w-xs">
                            Choose an existing .md file from the sidebar, or create a new one with the{" "}
                            <span className="text-purple-500">+</span> button.
                        </p>
                    </div>
                ) : loadingContent ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <Toolbar
                            fileName={selectedFile.name}
                            saveStatus={saveStatus}
                            onSave={handleManualSave}
                        />
                        <MarkdownEditor content={content} onChange={handleChange} />
                    </>
                )}
            </div>
        </div>
    );
}
