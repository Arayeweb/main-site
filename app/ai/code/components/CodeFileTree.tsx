"use client";

import { sortedFilePaths } from "@/lib/codeStudio";

export default function CodeFileTree({
  files,
  activeFile,
  dirtyFiles,
  highlightFiles,
  onSelect,
}: {
  files: Record<string, string>;
  activeFile: string;
  dirtyFiles: Set<string>;
  highlightFiles: Set<string>;
  onSelect: (path: string) => void;
}) {
  const paths = sortedFilePaths(files);

  return (
    <aside className="ar-code-files">
      <div className="ar-code-files-label">فایل‌ها</div>
      <ul>
        {paths.map((path) => (
          <li key={path}>
            <button
              type="button"
              className={[
                path === activeFile ? "active" : "",
                highlightFiles.has(path) ? "highlight" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onSelect(path)}
              title={path}
            >
              <span className="ar-code-file-name">{path.split("/").pop()}</span>
              {dirtyFiles.has(path) && (
                <span className="ar-code-file-dot" aria-label="تغییر یافته" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
