"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { CodeFileMap } from "@/lib/codeStudio";

const SandpackPreviewPane = dynamic(
  () => import("../../components/SandpackPreviewPane"),
  { ssr: false }
);

export default function CodeSharePage({ params }: { params: { slug: string } }) {
  const [files, setFiles] = useState<CodeFileMap | null>(null);
  const [prompt, setPrompt] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/ai/share/code/${params.slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) {
          setErr("پروژه پیدا نشد.");
          return;
        }
        setFiles(d.files);
        setPrompt(d.prompt || "");
      })
      .catch(() => setErr("خطای بارگذاری"));
  }, [params.slug]);

  if (err) {
    return (
      <div className="ar-code-share-page">
        <p>{err}</p>
      </div>
    );
  }

  if (!files) {
    return (
      <div className="ar-code-share-page">
        <p>در حال بارگذاری…</p>
      </div>
    );
  }

  return (
    <div className="ar-code-share-page">
      <header className="ar-code-share-head">
        <h1>پیش‌نمایش پروژه</h1>
        {prompt && <p>{prompt}</p>}
      </header>
      <div className="ar-code-share-preview">
        <SandpackPreviewPane files={files} />
      </div>
    </div>
  );
}
