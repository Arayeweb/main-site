"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadQrcode } from "@/lib/qrcodeClient";
import { trackFreeToolEvent } from "@/lib/analytics/freeToolTracking";

const ERROR_MAP: Record<string, string> = {
  invalid_target: "لینک معتبر نیست — یک آدرس کامل وارد کنید.",
  duplicate_slug: "این آدرس دلخواه قبلاً گرفته شده — یکی دیگر امتحان کنید.",
  reserved_slug: "این آدرس رزرو شده — یکی دیگر انتخاب کنید.",
  rate_limited: "تعداد درخواست‌ها زیاد شد — یک دقیقه صبر کنید.",
};

type Prefill = { url?: string; slug?: string };

export default function ShortenerTool({ prefill }: { prefill?: Prefill } = {}) {
  const [url, setUrl] = useState(prefill?.url ?? "");
  const [slug, setSlug] = useState(prefill?.slug ?? "");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [qrSrc, setQrSrc] = useState("");
  const [copied, setCopied] = useState(false);
  const [hostPrefix, setHostPrefix] = useState("araaye.com/s/");

  useEffect(() => {
    setHostPrefix(`${window.location.host}/s/`);
  }, []);

  useEffect(() => {
    if (prefill?.url) setUrl(prefill.url);
    if (prefill?.slug) setSlug(prefill.slug);
  }, [prefill?.url, prefill?.slug]);

  async function renderQr(text: string) {
    try {
      const qrcode = await loadQrcode();
      const qr = qrcode(0, "M");
      qr.addData(text);
      qr.make();
      const html = qr.createImgTag(5, 8);
      const match = html.match(/src="([^"]+)"/);
      setQrSrc(match?.[1] ?? "");
    } catch {
      setQrSrc("");
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setShortUrl("");
    setQrSrc("");
    const trimmed = url.trim();
    if (!trimmed) return;

    trackFreeToolEvent("shortener", "start", { custom_slug: Boolean(slug.trim()) });
    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          slug: slug.trim() || undefined,
          company: company.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        short_url?: string;
        slug?: string;
      };
      if (!data.ok) {
        setError(ERROR_MAP[data.error ?? ""] || "خطا — دوباره تلاش کنید.");
        return;
      }
      const link = data.short_url || `${window.location.origin}/s/${data.slug}`;
      setShortUrl(link);
      await renderQr(link);
      trackFreeToolEvent("shortener", "complete", { custom_slug: Boolean(slug.trim()) });
    } catch {
      setError("خطا در اتصال — دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      trackFreeToolEvent("shortener", "copy");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("لینک کوتاه:", shortUrl);
    }
  }

  return (
    <section id="tool" className="-mt-12 scroll-mt-24 pb-12 sm:-mt-14 sm:pb-16">
      <div className="container-mx container-px">
        <form
          onSubmit={onSubmit}
          className="tool-panel mx-auto max-w-2xl p-6 sm:p-8"
        >
          <ol className="mb-6 grid grid-cols-3 border-y border-navy-200 text-[11px] font-bold text-navy-500">
            <li className="border-l border-navy-200 py-2 text-brand-700">۱. چسباندن لینک</li>
            <li className="border-l border-navy-200 px-3 py-2">۲. ساخت</li>
            <li className="px-3 py-2">۳. کپی</li>
          </ol>
          <div>
            <label htmlFor="short-url" className="mb-1.5 block text-sm font-bold text-navy-800">
              لینک بلند را وارد کنید
            </label>
            <input
              id="short-url"
              type="text"
              inputMode="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/link?utm=..."
              className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              dir="ltr"
              style={{ textAlign: "left" }}
            />
          </div>

          <details className="mt-4 border-y border-navy-200 bg-navy-50/40 p-3" open={Boolean(prefill?.slug)}>
            <summary className="cursor-pointer text-xs font-bold text-navy-600">
              تنظیم آدرس دلخواه (اختیاری)
            </summary>
            <div className="mt-3 flex" dir="ltr">
              <input
                id="short-slug"
                aria-label="آدرس دلخواه لینک کوتاه"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="my-link"
                maxLength={48}
                pattern="[A-Za-z0-9_-]*"
                className="min-w-0 flex-1 rounded-l-xl border border-navy-200 border-r-0 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
              <span className="flex shrink-0 items-center rounded-r-xl border border-navy-200 bg-navy-50 px-3 text-xs text-navy-500">
                {hostPrefix}
              </span>
            </div>
          </details>

          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="absolute left-[-9999px] h-px w-px opacity-0"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-navy-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-navy-300"
          >
            {loading ? "در حال ساخت..." : "ساخت رایگان لینک کوتاه"}
          </button>
          <p className="mt-2 text-center text-[11px] font-semibold text-navy-400">
            بدون ثبت‌نام · همراه QR کد · نتیجه فوری
          </p>

          {error ? (
            <p className="mt-3 text-center text-sm font-bold text-red-600">{error}</p>
          ) : null}

          {shortUrl ? (
            <div className="mt-6 border border-emerald-300 bg-emerald-50 p-5 text-center">
              <h3 className="text-base font-bold text-emerald-800">لینک کوتاهت آماده‌ست!</h3>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2.5" dir="ltr">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 break-all text-left text-sm font-bold text-brand-600"
                >
                  {shortUrl}
                </a>
                <button
                  type="button"
                  onClick={copyLink}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    copied
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                  }`}
                >
                  {copied ? "کپی شد ✓" : "کپی"}
                </button>
              </div>
              {qrSrc ? (
                <div className="mt-4 flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrSrc}
                    alt="QR کد لینک کوتاه"
                    width={150}
                    height={150}
                    className="rounded-xl bg-white p-2 shadow-soft"
                  />
                  <a
                    href={qrSrc}
                    download="qrcode.png"
                    onClick={() => trackFreeToolEvent("shortener", "download", { asset: "qr" })}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    دانلود QR کد
                  </a>
                </div>
              ) : null}
              <p className="mt-4 border-t border-emerald-200 pt-4 text-xs leading-relaxed text-emerald-800">
                چند راه تماس و شبکه اجتماعی دارید؟{" "}
                <Link
                  href="/bizcard#builder"
                  onClick={() =>
                    trackFreeToolEvent("shortener", "next_step", { destination: "bizcard" })
                  }
                  className="font-extrabold hover:underline"
                >
                  همه را در یک کارت ویزیت دیجیتال رایگان جمع کنید
                </Link>
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
