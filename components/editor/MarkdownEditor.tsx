"use client";

import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useTheme } from "next-themes";

const lightTheme = EditorView.theme({
  "&": {
    backgroundColor: "#ffffff",
    color: "#1f2937",
    fontSize: "15px",
    height: "100%",
  },
  ".cm-content": { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: "16px 0" },
  ".cm-line": { padding: "0 20px" },
  ".cm-gutters": { backgroundColor: "#f8f9fa", borderRight: "1px solid #e5e7eb", color: "#9ca3af" },
  ".cm-lineNumbers": { minWidth: "3em" },
});

const darkTheme = EditorView.theme({
  "&": {
    backgroundColor: "#0a0a0a",
    color: "#e5e7eb",
    fontSize: "15px",
    height: "100%",
  },
  ".cm-content": { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", padding: "16px 0" },
  ".cm-line": { padding: "0 20px" },
  ".cm-gutters": { backgroundColor: "#111111", borderRight: "1px solid #1f2937", color: "#6b7280" },
});

interface MarkdownEditorProps {
  content: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <CodeMirror
        value={content}
        height="100%"
        extensions={[markdown(), resolvedTheme === "dark" ? darkTheme : lightTheme]}
        theme={resolvedTheme === "dark" ? oneDark : "light"}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          autocompletion: false,
          foldGutter: false,
          tabSize: 2,
        }}
        style={{ height: "100%" }}
      />
    </div>
  );
}
