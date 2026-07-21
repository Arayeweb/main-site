"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseComposerVoiceOpts = {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  guestMode?: boolean;
  onNeedAuth?: () => void;
};

const BAR_COUNT = 28;

function emptyLevels(): number[] {
  return Array.from({ length: BAR_COUNT }, () => 0.12);
}

/** ضبط کوتاه از میک → /api/ai/transcribe */
export function useComposerVoice({
  onTranscript,
  disabled = false,
  guestMode = false,
  onNeedAuth,
}: UseComposerVoiceOpts) {
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [levels, setLevels] = useState<number[]>(emptyLevels);
  const [elapsedSec, setElapsedSec] = useState(0);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const discardRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef(0);
  const startedAtRef = useRef(0);
  const elapsedTimerRef = useRef(0);
  const autoStopRef = useRef(0);

  const cleanupAudioGraph = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (elapsedTimerRef.current) {
      window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = 0;
    }
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = 0;
    }
    analyserRef.current = null;
    const ctx = audioCtxRef.current;
    audioCtxRef.current = null;
    void ctx?.close().catch(() => undefined);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setLevels(emptyLevels());
  }, []);

  useEffect(() => () => cleanupAudioGraph(), [cleanupAudioGraph]);

  const pumpLevels = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const next = Array.from({ length: BAR_COUNT }, (_, i) => {
      const idx = Math.floor((i / BAR_COUNT) * data.length);
      const v = (data[idx] ?? 0) / 255;
      return Math.max(0.12, Math.min(1, v * 1.35));
    });
    setLevels(next);
    rafRef.current = requestAnimationFrame(pumpLevels);
  }, []);

  const finishRecording = useCallback(
    (opts?: { discard?: boolean }) => {
      discardRef.current = !!opts?.discard;
      const rec = recRef.current;
      if (!rec) {
        cleanupAudioGraph();
        setRecording(false);
        return;
      }
      if (rec.state === "recording") rec.stop();
      else {
        cleanupAudioGraph();
        setRecording(false);
      }
      recRef.current = null;
    },
    [cleanupAudioGraph]
  );

  const cancel = useCallback(() => {
    if (!recording || busy) return;
    finishRecording({ discard: true });
  }, [busy, finishRecording, recording]);

  const confirm = useCallback(() => {
    if (!recording || busy) return;
    finishRecording({ discard: false });
  }, [busy, finishRecording, recording]);

  const start = useCallback(async () => {
    if (disabled || busy) return;
    if (guestMode) {
      onNeedAuth?.();
      return;
    }
    if (recording) {
      confirm();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.72;
      source.connect(analyser);
      analyserRef.current = analyser;
      rafRef.current = requestAnimationFrame(pumpLevels);

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      discardRef.current = false;
      startedAtRef.current = Date.now();
      setElapsedSec(0);
      elapsedTimerRef.current = window.setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000));
      }, 250);

      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        const discarded = discardRef.current;
        discardRef.current = false;
        const durationSec = Math.max(
          1,
          Math.round((Date.now() - startedAtRef.current) / 1000)
        );
        cleanupAudioGraph();
        setRecording(false);

        if (discarded) return;

        const blob = new Blob(chunksRef.current, { type: mime });
        if (blob.size < 800) return;

        setBusy(true);
        try {
          const fd = new FormData();
          fd.append("file", blob, "voice.webm");
          fd.append("language", "fa");
          fd.append("durationSec", String(durationSec));
          const res = await fetch("/api/ai/transcribe", { method: "POST", body: fd });
          const data = await res.json().catch(() => null);
          if (res.ok && data?.ok && data.text) {
            onTranscript(String(data.text).trim());
          }
        } catch {
          /* ignore */
        }
        setBusy(false);
        setElapsedSec(0);
      };

      recRef.current = rec;
      rec.start(120);
      setRecording(true);
      autoStopRef.current = window.setTimeout(() => {
        if (recRef.current?.state === "recording") finishRecording({ discard: false });
      }, 30_000);
    } catch {
      cleanupAudioGraph();
      setRecording(false);
    }
  }, [
    busy,
    cleanupAudioGraph,
    confirm,
    disabled,
    finishRecording,
    guestMode,
    onNeedAuth,
    onTranscript,
    pumpLevels,
    recording,
  ]);

  return {
    recording,
    busy,
    levels,
    elapsedSec,
    start,
    cancel,
    confirm,
  };
}
