import { describe, expect, it } from "vitest";
import {
  buildCodePrompt,
  isPreviewableFile,
  galleryPreviewFromFiles,
  extractCodeSnapshot,
  type CodeFileMap,
} from "@/lib/codeStudio";
import { parseCodeEdits } from "@/lib/codeEdits";
import { toSandpackFiles, pageSourceToAppJs } from "@/lib/codeSandpack";

describe("codeStudio — prompt and edit parsing", () => {
  it("builds a prompt with active file content and project file list", () => {
    const files: CodeFileMap = {
      "src/app/page.tsx": "export default function Home() { return <main />; }",
      "src/app/globals.css": "main { color: red; }",
    };

    const prompt = buildCodePrompt("make it better", "src/app/page.tsx", files);

    expect(prompt).toContain("src/app/page.tsx");
    expect(prompt).toContain("export default function Home()");
    expect(prompt).toContain("src/app/globals.css");
    expect(prompt).toContain("make it better");
    expect(prompt).toContain("```tsx:src/app/page.tsx");
  });

  it("parses multiple fenced code edits with explicit file paths", () => {
    const response = [
      "Here are the files:",
      "```tsx:src/app/page.tsx",
      "export default function Home() {",
      "  return <main className=\"page\">Hello</main>;",
      "}",
      "```",
      "```css:src/app/globals.css",
      ".page { color: blue; }",
      "```",
    ].join("\n");

    const edits = parseCodeEdits(response, "src/app/page.tsx");

    expect(edits).toEqual([
      {
        path: "src/app/page.tsx",
        content:
          'export default function Home() {\n  return <main className="page">Hello</main>;\n}',
      },
      { path: "src/app/globals.css", content: ".page { color: blue; }" },
    ]);
  });

  it("parses space-separated file paths in fence headers", () => {
    const files: CodeFileMap = { "src/app/page.tsx": "" };
    const edits = parseCodeEdits(
      "```tsx src/app/page.tsx\nexport default function Home() { return <main />; }\n```",
      "src/app/page.tsx",
      files
    );

    expect(edits[0]?.path).toBe("src/app/page.tsx");
  });

  it("normalizes short paths like app/page.tsx to project files", () => {
    const files: CodeFileMap = {
      "src/app/page.tsx": "old",
      "src/app/globals.css": "",
    };
    const edits = parseCodeEdits(
      "```tsx:app/page.tsx\nexport default function Home() { return <main />; }\n```",
      "src/app/page.tsx",
      files
    );

    expect(edits[0]?.path).toBe("src/app/page.tsx");
  });
});

describe("codeStudio — sandpack and snapshots", () => {
  it("maps project files to sandpack App.js and styles", () => {
    const sp = toSandpackFiles({
      "src/app/page.tsx": 'export default function Home() { return <main>Hi</main>; }',
      "src/app/globals.css": ".page { color: red; }",
    });

    expect(sp["/App.js"]).toContain("export default function Home");
    expect(sp["/App.js"]).toContain('import "./styles.css"');
    expect(sp["/styles.css"]).toContain("color: red");
  });

  it("extracts code snapshot from attachments", () => {
    const snap = extractCodeSnapshot([
      { kind: "code_snapshot", files: { "src/app/page.tsx": "x" }, activeFile: "src/app/page.tsx" },
    ]);
    expect(snap?.files["src/app/page.tsx"]).toBe("x");
  });

  it("builds gallery preview label from page source", () => {
    const label = galleryPreviewFromFiles({
      "src/app/page.tsx": "export default function Home() { return <main><h1>سلام</h1></main>; }",
    });
    expect(label).toBe("سلام");
  });

  it("detects previewable files", () => {
    expect(isPreviewableFile("src/app/page.tsx")).toBe(true);
    expect(isPreviewableFile("package.json")).toBe(false);
  });
});
