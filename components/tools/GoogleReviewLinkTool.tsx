"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildQrDataUrl } from "@/lib/qrcodeClient";
import { trackGrowthToolEvent } from "@/lib/analytics/growthToolsEvents";
import { buildGoogleReviewUrl } from "@/lib/tools/growthToolCalculations";
import GrowthToolServiceCta from "./GrowthToolServiceCta";

const REQUEST_MESSAGES: Record<string, string> = {
  general:
    "اگر از تجربه خرید یا خدمت رضایت داشتید، لطفاً نظر خود را در گوگل ثبت کنید. بازخورد صادقانه شما به دیگران برای انتخاب بهتر کمک می‌کند.",
  doctor:
    "اگر از تجربه مراجعه رضایت داشتید، لطفاً نظر خود را در گوگل ثبت کنید. بازخورد شما به بیماران دیگر برای انتخاب آگاهانه کمک می‌کند.",
  clinic:
    "نظر شما به ما کمک می‌کند کیفیت خدمات کلینیک را بهتر کنیم. لطفاً تجربه خود را در گوگل با دیگران به اشتراک بگذارید.",
  dentist:
    "اگر از خدمات دندانپزشکی رضایت داشتید، ثبت یک نظر کوتاه در گوگل به مراجعان دیگر کمک زیادی می‌کند.",
  lawyer:
    "اگر از مشاوره یا خدمات حقوقی رضایت داشتید، ممنون می‌شویم تجربه خود را در گوگل ثبت کنید.",
  restaurant:
    "از حضورتان خوشحال شدیم. اگر غذا و سرویس را دوست داشتید، لطفاً تجربه‌تان را در گوگل بنویسید.",
};

export default function GoogleReviewLinkTool({
  industry = "doctor",
}: {
  industry?: string;
}) {
  const [input, setInput] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState<"link" | "message" | null>(null);
  const started = useRef(false);
  const reviewUrl = useMemo(() => buildGoogleReviewUrl(input), [input]);
  const message = REQUEST_MESSAGES[industry] ?? REQUEST_MESSAGES.general;

  useEffect(() => {
    if (!reviewUrl) {
      setQrUrl("");
      return;
    }
    void buildQrDataUrl(reviewUrl, "#102a43").then(setQrUrl).catch(() => setQrUrl(""));
  }, [reviewUrl]);

  function onInput(value: string) {
    setInput(value);
    if (!started.current && value.trim()) {
      started.current = true;
      trackGrowthToolEvent("start", "review_link", industry);
    }
  }

  async function copy(value: string, type: "link" | "message") {
    await navigator.clipboard.writeText(value);
    setCopied(type);
    window.setTimeout(() => setCopied(null), 1800);
    if (type === "link") trackGrowthToolEvent("complete", "review_link", industry);
  }

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-navy-100 bg-white p-5 shadow-card sm:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_240px]">
        <div>
          <label htmlFor="google-review-input" className="block text-sm font-extrabold text-navy-900">
            لینک نظر گوگل یا Place ID را وارد کنید
          </label>
          <input
            id="google-review-input"
            value={input}
            onChange={(event) => onInput(event.target.value)}
            placeholder="مثلاً ChIJ... یا لینک Share review form"
            dir="ltr"
            className="mt-2 w-full rounded-xl border border-navy-200 px-4 py-3 text-left text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <p className="mt-2 text-xs leading-relaxed text-navy-500">
            در پروفایل گوگل روی «Ask for reviews» بزنید و لینک را کپی کنید. اگر Place ID دارید، آرایه لینک مستقیم را می‌سازد.
          </p>

          {input && !reviewUrl ? (
            <p className="mt-3 text-xs font-bold text-red-600">
              یک لینک کامل با https یا Place ID معتبر وارد کنید.
            </p>
          ) : null}

          {reviewUrl ? (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-800">لینک مستقیم آماده است</p>
              <p className="mt-2 break-all text-left text-xs text-navy-600" dir="ltr">{reviewUrl}</p>
              <button
                type="button"
                onClick={() => void copy(reviewUrl, "link")}
                className="mt-3 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white"
              >
                {copied === "link" ? "کپی شد" : "کپی لینک نظر"}
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col items-center rounded-2xl border border-navy-100 bg-navy-50/40 p-4">
          <div className="flex h-48 w-48 items-center justify-center rounded-xl bg-white p-2">
            {qrUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrUrl} alt="QR لینک ثبت نظر گوگل" className="h-full w-full object-contain" />
            ) : (
              <p className="px-4 text-center text-xs text-navy-400">بعد از وارد کردن لینک، QR اینجا ساخته می‌شود.</p>
            )}
          </div>
          <a
            href={qrUrl || undefined}
            download={`araaye-google-review-${industry}.png`}
            className={`mt-3 w-full rounded-xl px-4 py-2.5 text-center text-xs font-bold ${
              qrUrl ? "bg-brand-600 text-white" : "pointer-events-none bg-navy-200 text-navy-500"
            }`}
          >
            دانلود QR نظر گوگل
          </a>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-navy-100 p-4">
        <p className="text-sm font-extrabold text-navy-900">متن آماده درخواست نظر</p>
        <p className="mt-2 text-sm leading-7 text-navy-600">{message}</p>
        <button
          type="button"
          onClick={() => void copy(`${message}${reviewUrl ? `\n${reviewUrl}` : ""}`, "message")}
          className="mt-3 rounded-xl border border-navy-200 px-4 py-2.5 text-xs font-bold text-navy-700"
        >
          {copied === "message" ? "کپی شد" : "کپی متن و لینک"}
        </button>
      </div>

      {reviewUrl ? (
        <div className="mt-6">
          <GrowthToolServiceCta tool="review_link" industry={industry} />
        </div>
      ) : null}
    </div>
  );
}
