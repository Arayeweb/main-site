"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QR_COLORS } from "@/lib/qrData";
import { buildQrDataUrl } from "@/lib/qrcodeClient";
import { trackFreeToolEvent } from "@/lib/analytics/freeToolTracking";

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
  const started = useRef(false);
  const completedValue = useRef("");

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
          if (completedValue.current !== value) {
            completedValue.current = value;
            trackFreeToolEvent("qr", "complete", { input_length: value.length });
          }
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
    <section id="tool" className="-mt-12 scroll-mt-24 pb-12 sm:-mt-14 sm:pb-16">
      <div className="container-mx container-px">
        <div className="tool-panel mx-auto grid max-w-4xl gap-8 p-6 sm:grid-cols-[1fr_240px] sm:p-8">
          <div>
            <ol className="mb-6 grid grid-cols-3 border-y border-navy-200 text-[11px] font-bold text-navy-500">
              <li className="border-l border-navy-200 py-2 text-brand-700">۰۱ / محتوا</li>
              <li className="border-l border-navy-200 px-3 py-2">۰۲ / رنگ</li>
              <li className="px-3 py-2">۰۳ / دانلود</li>
            </ol>
            <label htmlFor="qr-text" className="mb-1.5 block text-sm font-bold text-navy-800">
              لینک یا متن را وارد کنید؛ QR همان لحظه ساخته می‌شود
            </label>
            <textarea
              id="qr-text"
              value={text}
              onChange={(e) => {
                const nextValue = e.target.value;
                setText(nextValue);
                if (!started.current && nextValue.trim()) {
                  started.current = true;
                  trackFreeToolEvent("qr", "start");
                }
              }}
              placeholder="https://araaye.com یا هر متنی..."
              rows={5}
              className="w-full resize-y rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-2 text-[11px] font-semibold text-navy-400">
              بدون ثبت‌نام · نتیجه فوری · اطلاعات در مرورگر شما پردازش می‌شود
            </p>
            <div className="mt-5 border-t border-navy-200 pt-4">
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
            <div className="flex h-[216px] w-[216px] items-center justify-center overflow-hidden border border-navy-300 bg-navy-50 p-3">
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
              onClick={() => {
                if (previewUrl) trackFreeToolEvent("qr", "download");
              }}
              className={`w-full px-4 py-3 text-center text-sm font-bold transition ${
                previewUrl
                  ? "bg-brand-600 text-white shadow-soft hover:bg-brand-700"
                  : "pointer-events-none bg-navy-200 text-navy-500"
              }`}
            >
              {previewUrl ? "دانلود رایگان QR کد" : "ابتدا لینک یا متن را وارد کنید"}
            </a>
            {status === "ready" ? (
              <p className="text-center text-[11px] font-semibold text-emerald-700">
                آماده شد — بدون واترمارک و قابل چاپ
              </p>
            ) : null}
          </div>
        </div>
        {status === "ready" ? (
          <div className="mx-auto mt-4 max-w-3xl rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-center text-xs leading-relaxed text-navy-600">
            مقصدی می‌خواهید که بعداً بدون چاپ دوباره QR قابل ویرایش باشد؟{" "}
            <Link
              href="/bizcard#builder"
              onClick={() => trackFreeToolEvent("qr", "next_step", { destination: "bizcard" })}
              className="font-extrabold text-brand-700 hover:underline"
            >
              کارت ویزیت دیجیتال رایگان بسازید
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
