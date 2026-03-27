"use client";

import { useRef, useState } from "react";
import { Button, Textarea } from "@heroui/react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
      <Textarea
        ref={textareaRef}
        value={value}
        onValueChange={setValue}
        onKeyDown={handleKeyDown}
        placeholder="Ask your DM assistant..."
        minRows={1}
        maxRows={4}
        isDisabled={disabled}
        className="flex-1 text-sm"
        classNames={{ input: "text-sm" }}
      />
      <Button
        isIconOnly
        color="secondary"
        variant="solid"
        size="sm"
        isDisabled={!value.trim() || disabled}
        onPress={handleSend}
        className="self-end h-10 w-10 min-w-10"
        aria-label="Send message"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      </Button>
    </div>
  );
}
