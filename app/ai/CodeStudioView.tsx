"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { IconCode, IconDownload, IconShare, IconEye } from "./icons";
import StudioHeader from "./StudioHeader";
import { useCodeStudio, type CodeTurn } from "@/lib/hooks/useCodeStudio";
import { downloadProjectZip } from "@/lib/codeExport";
import CodeChatPanel from "./code/components/CodeChatPanel";
import CodeFileTree from "./code/components/CodeFileTree";
import CodeStatusBar from "./code/components/CodeStatusBar";
import CodeProjectsGallery from "./code/components/CodeProjectsGallery";
import type { CodeFileMap } from "@/lib/codeStudio";

const CodeMirrorEditor = dynamic(() => import("./code/components/CodeMirrorEditor"), {
  ssr: false,
  loading: () => <div className="ar-code-cm-loading">بارگذاری ادیتور…</div>,
});

const SandpackPreviewPane = dynamic(
  () => import("./code/components/SandpackPreviewPane"),
  { ssr: false, loading: () => <div className="ar-code-cm-loading">بارگذاری پیش‌نمایش…</div> }
);

type Pane = "chat" | "code" | "preview";
type Tab = "build" | "projects";

export default function CodeStudioView({
  plan = "free",
  onCreditsChange,
  bootstrapPrompt = null,
  threadId: initialThreadId = null,
  initialTurns = [],
  initialFiles,
  initialActiveFile = "src/app/page.tsx",
}: {
  plan?: string;
  onCreditsChange?: (n: number) => void;
  bootstrapPrompt?: string | null;
  threadId?: string | null;
  initialTurns?: CodeTurn[];
  initialFiles?: CodeFileMap;
  initialActiveFile?: string;
}) {
  const studio = useCodeStudio({
    initialThreadId,
    initialTurns,
    initialFiles,
    initialActiveFile,
    onCreditsChange,
  });

  const [tab, setTab] = useState<Tab>("build");
  const [mobilePane, setMobilePane] = useState<Pane>("chat");
  const [isMobile, setIsMobile] = useState(false);
  const [splitPct, setSplitPct] = useState(52);
  const [shareMsg, setShareMsg] = useState("");
  const bootRef = useRef(false);
  const dragRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!bootstrapPrompt || bootRef.current) return;
    bootRef.current = true;
    void studio.sendMessage(bootstrapPrompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootstrapPrompt]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const workspace = document.querySelector(".ar-code-split-workspace");
      if (!workspace) return;
      const rect = workspace.getBoundingClientRect();
      const pct = ((e.clientY - rect.top) / rect.height) * 100;
      setSplitPct(Math.min(75, Math.max(25, pct)));
    };
    const onUp = () => {
      dragRef.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  async function handleShare() {
    const url = await studio.shareProject();
    if (!url) {
      setShareMsg("ابتدا یک نسل کامل انجام بده.");
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("لینک کپی شد");
    } catch {
      setShareMsg(url);
    }
    window.setTimeout(() => setShareMsg(""), 3000);
  }

  const workspace = (
    <div className="ar-code-workspace">
      <CodeFileTree
        files={studio.files}
        activeFile={studio.activeFile}
        dirtyFiles={studio.dirtyFiles}
        highlightFiles={studio.highlightFiles}
        onSelect={(path) => {
          studio.setActiveFile(path);
          if (isMobile) setMobilePane("code");
        }}
      />
      <div className="ar-code-split-workspace">
        <div className="ar-code-editor-pane" style={{ flex: `0 0 ${splitPct}%` }}>
          <div className="ar-code-editor-toolbar">
            <span className="ar-code-editor-toolbar-label">
              <IconCode size={15} /> کد
            </span>
            <div className="ar-code-editor-actions">
              <button
                type="button"
                className="ar-code-dl-btn"
                onClick={() => void downloadProjectZip(studio.files)}
              >
                <IconDownload size={15} />
                <span>دانلود پروژه</span>
              </button>
              <button type="button" className="ar-code-dl-btn" onClick={() => void handleShare()}>
                <IconShare size={15} />
                <span>اشتراک</span>
              </button>
            </div>
          </div>
          <CodeMirrorEditor
            path={studio.activeFile}
            value={studio.files[studio.activeFile] ?? ""}
            onChange={(v) => studio.updateFileContent(studio.activeFile, v)}
          />
        </div>
        <div
          className="ar-code-split-handle"
          role="separator"
          aria-orientation="horizontal"
          onMouseDown={() => {
            dragRef.current = true;
          }}
        />
        <div className="ar-code-preview-pane">
          <div className="ar-code-editor-toolbar">
            <span className="ar-code-editor-toolbar-label">
              <IconEye size={15} /> پیش‌نمایش
            </span>
          </div>
          <SandpackPreviewPane files={studio.files} loading={studio.streaming} />
        </div>
        <CodeStatusBar
          status={studio.status}
          activeFile={studio.activeFile}
          onUndo={studio.undoLastAiEdit}
          canUndo={studio.canUndo}
        />
      </div>
    </div>
  );

  return (
    <div className="ar-code-studio">
      <StudioHeader icon={IconCode} title="استودیو کد" badge="beta" />

      <div className="ar-studio-tabs">
        <div className="ar-studio-tabs-track">
          <button
            type="button"
            className={`ar-studio-tab${tab === "build" ? " active" : ""}`}
            onClick={() => setTab("build")}
          >
            ساخت
          </button>
          <button
            type="button"
            className={`ar-studio-tab${tab === "projects" ? " active" : ""}`}
            onClick={() => setTab("projects")}
          >
            پروژه‌ها
          </button>
        </div>
      </div>

      {shareMsg && <div className="ar-code-share-msg">{shareMsg}</div>}

      {tab === "projects" ? (
        <div className="ar-code-projects-pane">
          <CodeProjectsGallery />
        </div>
      ) : (
        <>
          {isMobile && (
            <div className="ar-code-mobile-tabs">
              {(
                [
                  ["chat", "چت"],
                  ["code", "کد"],
                  ["preview", "پیش‌نمایش"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={mobilePane === id ? "active" : ""}
                  onClick={() => setMobilePane(id)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="ar-code-studio-body">
            {(!isMobile || mobilePane === "chat") && (
              <CodeChatPanel
                turns={studio.turns}
                input={studio.input}
                streaming={studio.streaming}
                err={studio.err}
                chatModel={studio.chatModel}
                plan={plan}
                quickPrompts={studio.quickPrompts}
                onInputChange={studio.setInput}
                onSend={() => void studio.sendMessage(studio.input)}
                onStop={studio.stopStream}
                onQuickPrompt={(p) => void studio.sendMessage(p)}
                onModelChange={studio.setChatModel}
              />
            )}
            {isMobile ? (
              <>
                {mobilePane === "code" && (
                  <div className="ar-code-mobile-code">
                    <CodeFileTree
                      files={studio.files}
                      activeFile={studio.activeFile}
                      dirtyFiles={studio.dirtyFiles}
                      highlightFiles={studio.highlightFiles}
                      onSelect={studio.setActiveFile}
                    />
                    <CodeMirrorEditor
                      path={studio.activeFile}
                      value={studio.files[studio.activeFile] ?? ""}
                      onChange={(v) => studio.updateFileContent(studio.activeFile, v)}
                    />
                    <CodeStatusBar
                      status={studio.status}
                      activeFile={studio.activeFile}
                      onUndo={studio.undoLastAiEdit}
                      canUndo={studio.canUndo}
                    />
                  </div>
                )}
                {mobilePane === "preview" && (
                  <SandpackPreviewPane files={studio.files} loading={studio.streaming} />
                )}
              </>
            ) : (
              workspace
            )}
          </div>
        </>
      )}
    </div>
  );
}
