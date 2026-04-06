"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@heroui/react";
import { ChatMessage } from "@/lib/ai/PromptBuilder";
import Message from "./Message";
import ChatInput from "./ChatInput";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Pass the current file's folder ID to scope the campaign context */
  folderId?: string;
}

export default function ChatSidebar({ isOpen, onClose, folderId }: ChatSidebarProps) {
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  const handleSend = async (message: string) => {
    setError(null);
    const newHistory: ChatMessage[] = [...history, { role: "user", content: message }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, folderId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to get response");
      }

      const data = await res.json();
      setHistory([...newHistory, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Remove the optimistic user message on error
      setHistory(history);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHistory([]);
    setError(null);
  };

  return (
    <aside
      className={`flex flex-col border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-300 overflow-hidden ${
        isOpen ? "w-80" : "w-0"
      }`}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎲</span>
              <span className="font-semibold text-sm">DM Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              {history.length > 0 && (
                <Button
                  size="sm"
                  variant="light"
                  onPress={handleClear}
                  className="text-xs text-gray-500 h-7 min-w-0 px-2"
                >
                  Clear
                </Button>
              )}
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={onClose}
                className="h-7 w-7 min-w-7"
                aria-label="Close chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {history.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center text-gray-400 dark:text-gray-600 py-8">
                <span className="text-4xl">🎲</span>
                <p className="text-sm font-medium">Ask me anything about your campaign</p>
                <p className="text-xs max-w-[200px]">
                  I have access to all your campaign notes and documents.
                </p>
              </div>
            )}

            {history.map((msg, i) => (
              <Message key={i} message={msg} />
            ))}

            {loading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-3 py-2">
                  <Spinner size="sm" />
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-red-500 text-center py-2">{error}</div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={loading} />
        </>
      )}
    </aside>
  );
}
