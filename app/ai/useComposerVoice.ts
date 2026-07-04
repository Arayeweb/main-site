"use client";

import { useCallback, useRef, useState } from "react";

type UseComposerVoiceOpts = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  guestMode?: boolean;
  onNeedAuth?: () => void;
};

/** ضبط کوتاه از میک → /api/ai/transcribe */
export function useComposerVoice({
  onTranscript,
  disabled = false,
  guestMode = false,
  onNeedAuth,
}: UseComposerVoiceOpts) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setRecording(false);
  }, []);

  const start = useCallback(async () => {
    if (disabled || busy) return;
    if (guestMode) {
      onNeedAuth?.();
      return;
    }
    if (recording) {
      stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (blob.size < 800) return;
        setBusy(true);
        try {
          const fd = new FormData();
          fd.append("file", blob, "voice.webm");
          fd.append("language", "fa");
          const res = await fetch("/api/ai/transcribe", { method: "POST", body: fd });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.ok && data.text) {
            onTranscript(String(data.text).trim());
          }
        } catch {
          /* ignore */
        }
        setBusy(false);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      window.setTimeout(() => {
        if (recRef.current?.state === "recording") stop();
      }, 30_000);
    } catch {
      /* mic denied */
    }
  }, [busy, disabled, guestMode, onNeedAuth, onTranscript, recording, stop]);

  return { recording, busy, start, stop };
}
