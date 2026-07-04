"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownMessage({
  text,
  className = "",
  streaming = false,
}: {
  text: string;
  className?: string;
  streaming?: boolean;
}) {
  if (!text && !streaming) return null;

  const showPlain = streaming && text.length > 0;

  return (
    <div className={`ar-md${streaming ? " streaming" : ""}${className ? ` ${className}` : ""}`}>
      {showPlain ? (
        <pre className="ar-md-plain">{text}</pre>
      ) : text ? (
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
      ) : null}
      {streaming && !text && <span className="ar-md-cursor" aria-hidden />}
    </div>
  );
}
