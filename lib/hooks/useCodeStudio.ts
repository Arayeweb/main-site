"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { replaceThreadUrl } from "@/lib/aiThreadUrl";
import {
  CODE_STARTER_FILES,
  type CodeFileMap,
} from "@/lib/codeStudio";
import {
  applyEditsToFiles,
  editPathsLabel,
  parseCodeEdits,
  parseCompleteCodeEdits,
  type CodeEdit,
} from "@/lib/codeEdits";

export type CodeTurn = {
  id: string;
  prompt: string;
  response: string;
  streaming?: boolean;
};

export type CodeStudioStatus =
  | { kind: "idle" }
  | { kind: "streaming" }
  | { kind: "applied"; label: string }
  | { kind: "error"; message: string };

const QUICK_PROMPTS = [
  "یک فرم لاگین ساده بساز",
  "صفحه لندینگ برای استارتاپ",
  "داشبورد با کارت آمار",
];

export function useCodeStudio({
  initialThreadId = null,
  initialTurns = [],
  initialFiles,
  initialActiveFile = "src/app/page.tsx",
  onCreditsChange,
}: {
  initialThreadId?: string | null;
  initialTurns?: CodeTurn[];
  initialFiles?: CodeFileMap;
  initialActiveFile?: string;
  onCreditsChange?: (n: number) => void;
}) {
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [files, setFiles] = useState<CodeFileMap>(
    () => initialFiles ?? { ...CODE_STARTER_FILES }
  );
  const [activeFile, setActiveFile] = useState(initialActiveFile);
  const [turns, setTurns] = useState<CodeTurn[]>(initialTurns);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatModel, setChatModel] = useState("economy");
  const [status, setStatus] = useState<CodeStudioStatus>({ kind: "idle" });
  const [err, setErr] = useState("");
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  const [highlightFiles, setHighlightFiles] = useState<Set<string>>(new Set());
  const [lastBattleId, setLastBattleId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    if (initialTurns.length > 0) {
      setLastBattleId(initialTurns[initialTurns.length - 1].id);
    }
  }, [initialTurns]);

  const filesRef = useRef(files);
  filesRef.current = files;
  const undoRef = useRef<CodeFileMap | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const appliedDuringStreamRef = useRef<string>("");

  const flashFiles = useCallback((paths: string[]) => {
    setHighlightFiles(new Set(paths));
    window.setTimeout(() => setHighlightFiles(new Set()), 2000);
  }, []);

  const applyEdits = useCallback(
    (text: string, opts?: { saveUndo?: boolean; fromStream?: boolean }) => {
      const edits = parseCodeEdits(text, activeFile, filesRef.current);
      if (edits.length === 0) return false;

      if (opts?.saveUndo !== false) {
        undoRef.current = { ...filesRef.current };
        setCanUndo(true);
      }

      setFiles((prev) => applyEditsToFiles(prev, edits));
      if (edits[0]) setActiveFile(edits[0].path);
      setDirtyFiles((prev) => {
        const next = new Set(prev);
        for (const e of edits) next.add(e.path);
        return next;
      });
      flashFiles(edits.map((e) => e.path));

      if (!opts?.fromStream) {
        setStatus({ kind: "applied", label: editPathsLabel(edits) });
      }
      return true;
    },
    [activeFile, flashFiles]
  );

  const applyStreamingPartial = useCallback(
    (full: string) => {
      const edits = parseCompleteCodeEdits(full, activeFile, filesRef.current);
      if (edits.length === 0) return;
      const key = edits.map((e) => `${e.path}:${e.content.length}`).join("|");
      if (key === appliedDuringStreamRef.current) return;
      appliedDuringStreamRef.current = key;
      applyEdits(full, { saveUndo: false, fromStream: true });
    },
    [activeFile, applyEdits]
  );

  const undoLastAiEdit = useCallback(() => {
    if (!undoRef.current) return false;
    setFiles(undoRef.current);
    undoRef.current = null;
    setCanUndo(false);
    setStatus({ kind: "idle" });
    return true;
  }, []);

  const updateFileContent = useCallback((path: string, content: string) => {
    setFiles((prev) => ({ ...prev, [path]: content }));
    setDirtyFiles((prev) => new Set(prev).add(path));
  }, []);

  const sendMessage = useCallback(
    async (q: string) => {
      if (streaming || !q.trim()) return;
      setStreaming(true);
      setErr("");
      setStatus({ kind: "streaming" });
      appliedDuringStreamRef.current = "";

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      undoRef.current = { ...filesRef.current };
      setCanUndo(false);

      const tmpId = `tmp-${Date.now()}`;
      setTurns((t) => [...t, { id: tmpId, prompt: q.trim(), response: "", streaming: true }]);
      setInput("");

      try {
        const res = await fetch("/api/ai/code", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: ac.signal,
          body: JSON.stringify({
            prompt: q.trim(),
            model: chatModel,
            threadId,
            activeFile,
            files: filesRef.current,
          }),
        });

        if (res.status === 401) {
          setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("برای استودیو کد وارد شو.");
          setStatus({ kind: "error", message: "ورود لازم است" });
          setStreaming(false);
          return;
        }
        if (res.status === 402) {
          setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("کردیت تمام شد — پکیج بخر.");
          setStatus({ kind: "error", message: "کردیت تمام شد" });
          setStreaming(false);
          return;
        }
        if (res.status === 403) {
          setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("برای استودیو کد پلن starter لازم است.");
          setStatus({ kind: "error", message: "ارتقای پلن لازم است" });
          setStreaming(false);
          return;
        }
        if (!res.ok || !res.body) {
          setTurns((t) => t.filter((x) => x.id !== tmpId));
          setErr("خطای سرور");
          setStatus({ kind: "error", message: "خطای سرور" });
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let full = "";
        let finished = false;

        const finishTurn = (data: Record<string, unknown>) => {
          if (finished) return;
          finished = true;
          const response = String(data.responseA ?? full);
          setTurns((t) =>
            t.map((x) =>
              x.id === tmpId
                ? { id: String(data.id ?? tmpId), prompt: q.trim(), response, streaming: false }
                : x
            )
          );

          const battleId = String(data.id ?? tmpId);
          setLastBattleId(battleId);

          if (data.isNewThread) {
            const tid = String(data.threadId);
            setThreadId(tid);
            replaceThreadUrl(`/ai/code/${tid}`);
          }

          if (typeof data.creditsRemaining === "number") {
            onCreditsChange?.(data.creditsRemaining);
          }

          if (data.files && typeof data.files === "object") {
            setFiles(data.files as CodeFileMap);
            if (typeof data.activeFile === "string") {
              setActiveFile(data.activeFile);
            }
            const serverEdits = (data.edits as CodeEdit[] | undefined) ?? [];
            const paths =
              serverEdits.length > 0
                ? serverEdits.map((e) => e.path)
                : parseCodeEdits(response, activeFile, filesRef.current).map((e) => e.path);
            flashFiles(paths);
            setStatus({ kind: "applied", label: editPathsLabel(
              paths.map((p) => ({ path: p, content: "" }))
            ) });
            setCanUndo(true);
          } else {
            applyEdits(response);
            setCanUndo(true);
          }

          setStreaming(false);
        };

        const processChunk = (chunk: string) => {
          const line = chunk.trim();
          if (!line.startsWith("data:")) return;
          let data: Record<string, unknown>;
          try {
            data = JSON.parse(line.slice(5).trim());
          } catch {
            return;
          }

          if (data.type === "delta" && typeof data.text === "string") {
            full += data.text;
            setTurns((t) =>
              t.map((x) => (x.id === tmpId ? { ...x, response: full } : x))
            );
            applyStreamingPartial(full);
          } else if (data.type === "done") {
            finishTurn(data);
          } else if (data.type === "error") {
            if (!finished) {
              finished = true;
              setTurns((t) => t.filter((x) => x.id !== tmpId));
              setErr("مدل پاسخ نداد");
              setStatus({ kind: "error", message: "مدل پاسخ نداد" });
              setStreaming(false);
            }
          }
        };

        while (true) {
          if (ac.signal.aborted) break;
          const { done, value } = await reader.read();
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const chunks = buffer.split("\n\n");
            buffer = chunks.pop() || "";
            for (const c of chunks) processChunk(c);
          }
          if (done) {
            buffer += decoder.decode();
            break;
          }
        }

        if (!finished && buffer.trim()) {
          for (const c of buffer.split("\n\n")) processChunk(c);
        }

        if (finished) {
          if (abortRef.current === ac) abortRef.current = null;
          return;
        }

        if (full.trim()) {
          finished = true;
          setTurns((t) =>
            t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
          );
          applyEdits(full);
          setStreaming(false);
        }
      } catch {
        if (ac.signal.aborted) {
          setTurns((t) =>
            t.map((x) => (x.id === tmpId ? { ...x, streaming: false } : x))
          );
          setStreaming(false);
          setStatus({ kind: "idle" });
          if (abortRef.current === ac) abortRef.current = null;
          return;
        }
        setTurns((t) => t.filter((x) => x.id !== tmpId));
        setErr("خطای شبکه");
        setStatus({ kind: "error", message: "خطای شبکه" });
      }
      setStreaming(false);
      if (abortRef.current === ac) abortRef.current = null;
    },
    [
      activeFile,
      applyEdits,
      applyStreamingPartial,
      chatModel,
      flashFiles,
      onCreditsChange,
      streaming,
      threadId,
    ]
  );

  const stopStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const shareProject = useCallback(async () => {
    const id = lastBattleId || threadId;
    if (!id) return null;
    const res = await fetch("/api/ai/code/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ battleId: id }),
    });
    const data = await res.json();
    if (!data.ok) return null;
    return data.shareUrl as string;
  }, [lastBattleId, threadId]);

  return {
    threadId,
    files,
    activeFile,
    setActiveFile,
    turns,
    input,
    setInput,
    streaming,
    chatModel,
    setChatModel,
    status,
    err,
    dirtyFiles,
    highlightFiles,
    quickPrompts: QUICK_PROMPTS,
    sendMessage,
    stopStream,
    updateFileContent,
    undoLastAiEdit,
    canUndo,
    shareProject,
  };
}
