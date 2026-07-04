"use client";

import { openPromptInAi } from "@/lib/contentSalesOpenInAi";

type Props = {
  title: string;
  body: string;
  copyText?: string;
  tags?: string[];
  showOpenInAi?: boolean;
};

export default function PromptCard({
  title,
  body,
  copyText,
  tags,
  showOpenInAi = true,
}: Props) {
  const text = copyText ?? body;

  return (
    <article className="cs-card" style={{ marginBottom: 12 }}>
      <h3>{title}</h3>
      {tags && tags.length > 0 && (
        <div className="cs-prompt-meta">
          {tags.map((t) => (
            <span key={t} className="cs-prompt-tag">
              {t}
            </span>
          ))}
        </div>
      )}
      <pre className="cs-sample-pre">{body}</pre>
      <div className="cs-card-actions">
        <CopyBtn text={text} />
        {showOpenInAi && (
          <button type="button" className="cs-ai-btn" onClick={() => openPromptInAi(text)}>
            استفاده در AI
          </button>
        )}
      </div>
    </article>
  );
}

function CopyBtn({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="cs-copy-btn"
      onClick={() => navigator.clipboard.writeText(text)}
    >
      کپی
    </button>
  );
}
