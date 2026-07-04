"use client";

import { SandpackProvider, SandpackPreview } from "@codesandbox/sandpack-react";
import { toSandpackFiles, sandpackPreviewKey } from "@/lib/codeSandpack";
import type { CodeFileMap } from "@/lib/codeStudio";

export default function SandpackPreviewPane({
  files,
  loading,
}: {
  files: CodeFileMap;
  loading?: boolean;
}) {
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
        template="react"
        files={sandpackFiles}
        theme="light"
        options={{
          visibleFiles: ["/App.js"],
          activeFile: "/App.js",
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
