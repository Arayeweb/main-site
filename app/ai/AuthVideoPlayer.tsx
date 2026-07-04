"use client";

import { useEffect, useState } from "react";

export default function AuthVideoPlayer({
  src,
  className = "ar-video-player",
}: {
  src: string;
  className?: string;
}) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    setLoading(true);
    setFailed(false);
    setBlobUrl(null);

    void (async () => {
      try {
        const res = await fetch(src, { credentials: "same-origin" });
        const ct = res.headers.get("content-type") || "";

        // #region agent log
        fetch("http://127.0.0.1:7595/ingest/5edfe92e-8eff-41b7-9393-ff5814f12f32", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "d89e34" },
          body: JSON.stringify({
            sessionId: "d89e34",
            runId: "post-fix",
            hypothesisId: "H17",
            location: "AuthVideoPlayer.tsx:fetch",
            message: "video content fetch",
            data: {
              src: src.slice(-48),
              httpOk: res.ok,
              status: res.status,
              contentType: ct.slice(0, 40),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion

        if (!res.ok || ct.includes("application/json")) {
          throw new Error(`bad_response:${res.status}`);
        }

        const blob = await res.blob();
        if (cancelled) return;
        if (!blob.size) throw new Error("empty_blob");

        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (loading) {
    return <div className={`${className} ar-video-player-state`}>در حال بارگذاری ویدیو…</div>;
  }

  if (failed || !blobUrl) {
    return (
      <div className={`${className} ar-video-player-state ar-video-player-state--err`}>
        پخش ویدیو ناموفق بود — از دکمه دانلود استفاده کن.
      </div>
    );
  }

  return <video src={blobUrl} controls playsInline className={className} />;
}
