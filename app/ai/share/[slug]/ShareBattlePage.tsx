"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconSwords, IconCheck, ModelAvatar } from "../../icons";
import MarkdownMessage from "../../MarkdownMessage";

type PublicModel = { id: string; name: string; poweredBy?: string; brand: string };

export default function ShareBattlePage({ slug }: { slug: string }) {
  const [data, setData] = useState<{
    prompt: string;
    responseA: string;
    responseB: string;
    winner: string | null;
    tier: string;
    modelA: PublicModel | null;
    modelB: PublicModel | null;
  } | null>(null);
  const [err, setErr] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/ai/share/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d?.ok) setErr(true);
        else setData(d);
      })
      .catch(() => setErr(true));
  }, [slug]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  if (err) {
    return (
      <main className="ar-container ar-share-page">
        <h1>نبرد پیدا نشد</h1>
        <Link href="/ai?mode=battle" className="ar-btn ar-btn-primary">
          تو هم تست کن
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="ar-container ar-share-page">
        <div className="ar-loading-note">
          <span className="ar-spinner" />
          در حال بارگذاری…
        </div>
      </main>
    );
  }

  const waText = encodeURIComponent(`کدوم مدل بهتر جواب داد؟\n${shareUrl}`);
  const tgText = encodeURIComponent(shareUrl);

  return (
    <main className="ar-container-wide ar-share-page">
      <div className="ar-share-hero">
        <h1>کدوم مدل بهتر جواب داد؟</h1>
        <p>یک نبرد واقعی از آرایه AI — دو مدل، یک سؤال.</p>
      </div>

      <div className="ar-battle-prompt">
        <div className="label">سؤال</div>
        <div className="text">{data.prompt}</div>
      </div>

      <div className="ar-battle-grid">
        {(["a", "b"] as const).map((side) => {
          const response = side === "a" ? data.responseA : data.responseB;
          const model = side === "a" ? data.modelA : data.modelB;
          const isWinner = data.winner === side;
          return (
            <div key={side} className={`ar-answer-card${isWinner ? " winner" : ""}`}>
              <div className="ar-answer-head">
                {model ? (
                  <>
                    <ModelAvatar modelId={model.id} size={34} />
                    <div>
                      <div className="name">{model.name}</div>
                      {model.poweredBy && (
                        <div className="powered-by">{model.poweredBy}</div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="ar-anon-badge">{side.toUpperCase()}</span>
                    <div>
                      <div className="name">مدل {side.toUpperCase()}</div>
                    </div>
                  </>
                )}
                {isWinner && (
                  <span className="ar-win-tag">
                    <IconCheck size={12} />
                    برنده
                  </span>
                )}
              </div>
              <div className="ar-answer-body">
                <MarkdownMessage text={response} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="ar-share-actions">
        <Link href="/ai?mode=battle" className="ar-btn ar-btn-primary">
          <IconSwords size={15} />
          تو هم تست کن
        </Link>
        <button type="button" className="ar-btn ar-btn-ghost" onClick={copyLink}>
          {copied ? "کپی شد" : "کپی لینک"}
        </button>
        <a
          className="ar-btn ar-btn-ghost"
          href={`https://wa.me/?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          واتساپ
        </a>
        <a
          className="ar-btn ar-btn-ghost"
          href={`https://t.me/share/url?url=${tgText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          تلگرام
        </a>
      </div>
    </main>
  );
}
