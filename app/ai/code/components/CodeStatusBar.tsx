"use client";

import type { CodeStudioStatus } from "@/lib/hooks/useCodeStudio";

export default function CodeStatusBar({
  status,
  activeFile,
  onUndo,
  canUndo,
}: {
  status: CodeStudioStatus;
  activeFile: string;
  onUndo: () => void;
  canUndo: boolean;
}) {
  let message = "";
  if (status.kind === "streaming") message = "در حال تولید…";
  else if (status.kind === "applied") message = `اعمال شد ✓ ${status.label}`;
  else if (status.kind === "error") message = status.message;

  return (
    <div className="ar-code-statusbar" aria-live="polite">
      <span className="ar-code-statusbar-path" dir="ltr">
        {activeFile}
      </span>
      {message && <span className="ar-code-statusbar-msg">{message}</span>}
      {canUndo && (
        <button type="button" className="ar-code-undo-btn" onClick={onUndo}>
          بازگردانی
        </button>
      )}
    </div>
  );
}
