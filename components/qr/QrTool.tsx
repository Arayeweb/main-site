"use client";

import { useEffect, useRef, useState } from "react";
import { QR_COLORS } from "@/lib/qrData";
import { buildQrDataUrl } from "@/lib/qrcodeClient";

export default function QrTool({
  prefillText,
}: {
  prefillText?: string;
} = {}) {
  const [text, setText] = useState(prefillText ?? "");
  const [color, setColor] = useState<string>(QR_COLORS[0]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [status, setStatus] = useState<"empty" | "ready" | "error">("empty");
  const [errorMsg, setErrorMsg] = useState("");
  const requestId = useRef(0);

  useEffect(() => {
    if (prefillText) setText(prefillText);
  }, [prefillText]);

  useEffect(() => {
    const value = text.trim();
    if (!value) {
      setPreviewUrl("");
      setStatus("empty");
      setErrorMsg("");
      return;
    }

    const id = ++requestId.current;
    const timer = setTimeout(() => {
      void (async () => {
        try {
          const url = await buildQrDataUrl(value, color);
          if (id !== requestId.current) return;
          setPreviewUrl(url);
          setStatus("ready");
          setErrorMsg("");
        } catch {
          if (id !== requestId.current) return;
          setPreviewUrl("");
          setStatus("error");
          setErrorMsg("ساخت QR ممکن نشد — متن را کوتاه‌تر کنید یا دوباره تلاش کنید");
        }
      })();
    }, 200);

    return () => clearTimeout(timer);
  }, [text, color]);

  return (
    <section id="tool" className="pb-12 sm:pb-16">
      <div className="container-mx container-px">
        <div className="mx-auto grid max-w-3xl gap-6 rounded-2xl border border-navy-100 bg-white p-6 shadow-soft sm:grid-cols-[1fr_220px] sm:p-8">
          <div>
            <label htmlFor="qr-text" className="mb-1.5 block text-sm font-bold text-navy-800">
              لینک یا متنت را وارد کن
            </label>
            <textarea
              id="qr-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://araaye.com یا هر متنی..."
              rows={5}
              className="w-full resize-y rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold text-navy-500">رنگ QR</p>
              <div className="flex flex-wrap gap-2">
                {QR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    aria-label={`رنگ ${c}`}
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      color === c ? "scale-110 border-navy-900" : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-2xl border border-navy-100 bg-white p-2">
              {status === "ready" && previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="پیش‌نمایش QR کد"
                  width={180}
                  height={180}
                  className="h-full w-full object-contain"
                />
              ) : (
                <p className="px-3 text-center text-xs text-navy-400">
                  {status === "error"
                    ? errorMsg
                    : "QR کد اینجا نمایش داده می‌شه"}
                </p>
              )}
            </div>
            <a
              href={previewUrl || undefined}
              download="araaye-qr.png"
              className={`w-full rounded-xl px-4 py-3 text-center text-sm font-bold transition ${
                previewUrl
                  ? "bg-brand-600 text-white shadow-soft hover:bg-brand-700"
                  : "pointer-events-none bg-navy-200 text-navy-500"
              }`}
            >
              دانلود QR کد
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
