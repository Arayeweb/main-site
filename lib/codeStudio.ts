export type CodeFileMap = Record<string, string>;
export type { CodeEdit } from "./codeEdits";
export {
  parseCodeEdits,
  parseCompleteCodeEdits,
  resolveEditPath,
  applyEditsToFiles,
  editPathsLabel,
} from "./codeEdits";
export { toSandpackFiles, sandpackPreviewKey, pageSourceToAppJs } from "./codeSandpack";
export { downloadProjectZip } from "./codeExport";

export const CODE_STARTER_FILES: CodeFileMap = {
  "src/app/page.tsx": `export default function Home() {
  return (
    <main className="page">
      <h1>سلام از آرایه AI</h1>
      <p>از چت بگو چه بسازی — کد اینجا ظاهر می‌شود.</p>
    </main>
  );
}`,
  "src/app/globals.css": `.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 2rem;
  font-family: system-ui, sans-serif;
  background: #f7f5ef;
  color: #201f1a;
}

.page h1 {
  font-size: 1.75rem;
  margin: 0 0 0.5rem;
}`,
  "src/app/layout.tsx": `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}`,
  "package.json": `{
  "name": "my-araaye-app",
  "private": true,
  "scripts": {
    "dev": "next dev"
  },
  "dependencies": {
    "next": "14",
    "react": "18",
    "react-dom": "18"
  }
}`,
};

export function sortedFilePaths(files: CodeFileMap): string[] {
  return Object.keys(files).sort((a, b) => a.localeCompare(b));
}

export function buildCodePrompt(
  userMessage: string,
  activeFile: string,
  files: CodeFileMap
): string {
  const content = files[activeFile] ?? "";
  return `تو در استودیو کد آرایه AI هستی. کاربر روی فایل «${activeFile}» کار می‌کند.

محتوای فعلی فایل:
\`\`\`
${content}
\`\`\`

فایل‌های پروژه: ${sortedFilePaths(files).join(", ")}

درخواست: ${userMessage}

اگر UI می‌سازی، حتماً \`src/app/page.tsx\` و در صورت نیاز \`src/app/globals.css\` را به‌روز کن.
از این قالب استفاده کن:
\`\`\`tsx:src/app/page.tsx
// کد کامل فایل
\`\`\``;
}

export function isPreviewableFile(path: string): boolean {
  return /\.(tsx|jsx|html|css)$/i.test(path);
}

export function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.split("/").pop() || "file.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export type CodeSnapshotAttachment = {
  kind: "code_snapshot";
  files: CodeFileMap;
  activeFile: string;
};

export function extractCodeSnapshot(
  attachments: unknown
): CodeSnapshotAttachment | null {
  if (!Array.isArray(attachments)) return null;
  for (let i = attachments.length - 1; i >= 0; i--) {
    const a = attachments[i] as Record<string, unknown>;
    if (a?.kind === "code_snapshot" && a.files && typeof a.files === "object") {
      return {
        kind: "code_snapshot",
        files: a.files as CodeFileMap,
        activeFile: String(a.activeFile || "src/app/page.tsx"),
      };
    }
  }
  return null;
}

export function galleryPreviewFromFiles(files: CodeFileMap): string {
  const page =
    files["src/app/page.tsx"] ||
    Object.entries(files).find(([p]) => /page\.tsx$/i.test(p))?.[1] ||
    "";
  const h1 = page.match(/<h1[^>]*>([^<]+)</);
  if (h1) return h1[1].trim();
  return page.slice(0, 80).replace(/\s+/g, " ").trim() || "پروژه کد";
}
