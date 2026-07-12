"use client";

import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import {
  detectPreviewKind,
  toSandpackFiles,
  sandpackPreviewKey,
  SANDPACK_APP,
} from "@/lib/codeSandpack";
import type { CodeFileMap } from "@/lib/codeStudio";

function PreviewFallback({ kind }: { kind: "python" | "none" }) {
  const title =
    kind === "python"
      ? "پیش‌نمایش زنده برای پایتون پشتیبانی نمی‌شود"
      : "پیش‌نمایش زنده فقط برای UI React است";
  const body =
    kind === "python"
      ? "کد در ادیتور ذخیره شده — «دانلود پروژه» را بزن و محلی اجرا کن (python main.py)."
      : "برای دیدن پیش‌نمایش، از مدل UI وب با React بخواه (مثلاً فرم، لندینگ، داشبورد).";

  return (
    <div className="ar-code-preview-fallback">
      <p className="ar-code-preview-fallback-title">{title}</p>
      <p className="ar-code-preview-fallback-body">{body}</p>
    </div>
  );
}

export default function SandpackPreviewPane({
  files,
  loading,
}: {
  files: CodeFileMap;
  loading?: boolean;
}) {
  const previewKind = detectPreviewKind(files);

  if (previewKind !== "react") {
    return (
      <div className="ar-code-sandpack-wrap">
        {loading && (
          <div className="ar-code-sandpack-loading" aria-live="polite">
            <span className="ar-spinner" />
            <span>در حال تولید…</span>
          </div>
        )}
        <PreviewFallback kind={previewKind === "python" ? "python" : "none"} />
      </div>
    );
  }

  const sandpackFiles = toSandpackFiles(files);
  const key = sandpackPreviewKey(files);

  return (
    <div className="ar-code-sandpack-wrap">
      {loading && (
        <div className="ar-code-sandpack-loading" aria-live="polite">
          <span className="ar-spinner" />
          <span>در حال تولید…</span>
        </div>
      )}
      <SandpackProvider
        key={key}
        template="react-ts"
        files={sandpackFiles}
        theme="light"
        options={{
          visibleFiles: [SANDPACK_APP],
          activeFile: SANDPACK_APP,
          recompileMode: "immediate",
        }}
      >
        <SandpackPreview
          showNavigator={false}
          showRefreshButton
          showOpenInCodeSandbox={false}
          style={{ height: "100%", flex: 1 }}
        />
      </SandpackProvider>
    </div>
  );
}
