import type { CodeFileMap } from "./codeStudio";

export type CodeEdit = { path: string; content: string };

function looksLikePath(part: string): boolean {
  return part.includes("/") || /\.[a-z0-9]+$/i.test(part);
}

/** نرمال‌سازی مسیر فایل نسبت به فایل‌های موجود پروژه */
export function resolveEditPath(
  header: string,
  activeFile: string,
  knownFiles?: CodeFileMap
): string {
  let raw = activeFile;
  const trimmed = header.trim();

  const colon = trimmed.indexOf(":");
  if (colon > 0) {
    const maybePath = trimmed.slice(colon + 1).trim();
    if (looksLikePath(maybePath)) raw = maybePath;
  } else {
    const parts = trimmed.split(/\s+/);
    const pathPart = parts.find((p) => looksLikePath(p));
    if (pathPart) raw = pathPart;
    else if (trimmed.includes("/")) raw = trimmed;
    else if (/^[\w.-]+\.[a-z0-9]+$/i.test(trimmed)) raw = trimmed;
  }

  if (!knownFiles) return raw;
  if (knownFiles[raw]) return raw;

  const keys = Object.keys(knownFiles);
  const suffix = keys.find((k) => k.endsWith("/" + raw) || k === raw);
  if (suffix) return suffix;

  const base = raw.split("/").pop()!;
  const baseMatches = keys.filter((k) => k.split("/").pop() === base);
  if (baseMatches.length === 1) return baseMatches[0];
  if (baseMatches.includes(activeFile)) return activeFile;

  if (base === "page.tsx") return keys.find((k) => /page\.tsx$/i.test(k)) ?? raw;
  if (base === "globals.css") return keys.find((k) => /globals\.css$/i.test(k)) ?? raw;

  return raw;
}

/** استخراج بلوک‌های کد از پاسخ مدل */
export function parseCodeEdits(
  text: string,
  activeFile: string,
  knownFiles?: CodeFileMap
): CodeEdit[] {
  const edits: CodeEdit[] = [];
  const re = /```+([^\n]+)\n([\s\S]*?)```+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const header = m[1].trim();
    const code = m[2].replace(/\n$/, "");
    if (!code.trim()) continue;

    const path = resolveEditPath(header, activeFile, knownFiles);
    edits.push({ path, content: code });
  }

  if (edits.length === 0) {
    const fallback = extractFallbackCodeEdit(text, activeFile, knownFiles);
    if (fallback) edits.push(fallback);
  }

  return edits;
}

/** فقط fenceهای کامل — برای اعمال حین stream */
export function parseCompleteCodeEdits(
  text: string,
  activeFile: string,
  knownFiles?: CodeFileMap
): CodeEdit[] {
  const edits: CodeEdit[] = [];
  const re = /```+([^\n]+)\n([\s\S]*?)```+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const header = m[1].trim();
    const code = m[2].replace(/\n$/, "");
    if (!code.trim()) continue;
    edits.push({
      path: resolveEditPath(header, activeFile, knownFiles),
      content: code,
    });
  }
  return edits;
}

function extractFallbackCodeEdit(
  text: string,
  activeFile: string,
  knownFiles?: CodeFileMap
): CodeEdit | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed.includes("```")) return null;

  const looksLikeCode =
    /\bexport\s+(default\s+)?function\b/.test(trimmed) ||
    /\bimport\s+.+\s+from\s+['"]/.test(trimmed) ||
    (/<[A-Za-z][\s\S]*>/.test(trimmed) && /\breturn\b/.test(trimmed));

  if (!looksLikeCode) return null;

  return {
    path: resolveEditPath(activeFile, activeFile, knownFiles),
    content: trimmed,
  };
}

export function applyEditsToFiles(
  files: CodeFileMap,
  edits: CodeEdit[]
): CodeFileMap {
  if (edits.length === 0) return files;
  const next = { ...files };
  for (const e of edits) next[e.path] = e.content;
  return next;
}

export function editPathsLabel(edits: CodeEdit[]): string {
  return edits.map((e) => e.path.split("/").pop() || e.path).join(" + ");
}
