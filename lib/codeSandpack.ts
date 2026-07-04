import type { CodeFileMap } from "./codeStudio";

const SANDPACK_APP = "/App.js";
const SANDPACK_STYLES = "/styles.css";

/** تبدیل page.tsx به App.js قابل اجرا در Sandpack */
export function pageSourceToAppJs(source: string): string {
  let code = source.replace(/^["']use client["'];?\s*/m, "").trim();
  if (!code.includes('import "./styles.css"') && !code.includes("import './styles.css'")) {
    code = `import "./styles.css";\n\n${code}`;
  }
  return code;
}

export function toSandpackFiles(files: CodeFileMap): Record<string, string> {
  const pageKey =
    Object.keys(files).find((p) => /page\.(tsx|jsx)$/i.test(p)) ||
    "src/app/page.tsx";
  const cssKey =
    Object.keys(files).find((p) => /globals\.css$/i.test(p)) ||
    "src/app/globals.css";

  const page = files[pageKey] ?? "";
  const css = files[cssKey] ?? "";

  return {
    [SANDPACK_APP]: pageSourceToAppJs(page),
    [SANDPACK_STYLES]: css,
  };
}

export function sandpackPreviewKey(files: CodeFileMap): string {
  const sp = toSandpackFiles(files);
  return JSON.stringify(sp);
}

export { SANDPACK_APP, SANDPACK_STYLES };
