"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type ProjectItem = {
  id: string;
  threadId: string;
  prompt: string;
  preview: string;
  createdAt: string;
};

export default function CodeProjectsGallery() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/ai/gallery?tier=code_studio&limit=48")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setItems(d.items || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="ar-code-gallery-loading">در حال بارگذاری پروژه‌ها…</p>;
  }

  if (items.length === 0) {
    return (
      <p className="ar-code-gallery-empty">
        هنوز پروژه‌ای ذخیره نشده. از تب «ساخت» شروع کن.
      </p>
    );
  }

  return (
    <div className="ar-code-gallery-grid">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/ai/code/${item.threadId}`}
          className="ar-code-gallery-card"
        >
          <div className="ar-code-gallery-preview">{item.preview}</div>
          <p className="ar-code-gallery-prompt">{item.prompt}</p>
          <time className="ar-code-gallery-date">
            {new Date(item.createdAt).toLocaleDateString("fa-IR")}
          </time>
        </Link>
      ))}
    </div>
  );
}
