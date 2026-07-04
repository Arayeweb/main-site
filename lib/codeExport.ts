import type { CodeFileMap } from "./codeStudio";
import { sortedFilePaths } from "./codeStudio";

export async function downloadProjectZip(files: CodeFileMap, projectName = "araaye-app") {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  for (const path of sortedFilePaths(files)) {
    zip.file(path, files[path] ?? "");
  }

  zip.file(
    "README.md",
    `# ${projectName}\n\nGenerated with Araaye AI Code Studio.\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n`
  );

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
