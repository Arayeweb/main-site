"use client";

import { useState } from "react";
import Link from "next/link";
import { pushGtmEvent } from "@/lib/gtm";
import ChatOpenButton from "@/components/home/ChatOpenButton";
import { restaurantStats, restaurantTrustLogos, RESTAURANT_PAGE_PATH } from "@/lib/restaurantData";
import { normalizeContact } from "@/lib/validateContact";

const ACCENT = "#3157F6";

const isValidLeadContact = (value: string): boolean => {
  const kind = normalizeContact(value).kind;
  return kind === "phone" || kind === "email";
};

function RestaurantOrderPreview() {
  return (
    <div
      className="overflow-hidden rounded-[12px] border border-navy-100/90 bg-white shadow-soft"
      role="img"
      aria-label="نمونه سایت رستوران با منوی دیجیتال و سفارش آنلاین"
    >
      <div className="flex items-center gap-2 border-b border-navy-100 bg-navy-50/60 px-3 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <span className="ms-2 flex-1 truncate rounded-md bg-white px-2.5 py-1 text-[10px] font-medium text-navy-400">
          saffron-resto.ir
        </span>
      </div>
      <div className="grid gap-0 sm:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-navy-900">زعفران</span>
            <span className="text-[10px] font-bold text-navy-400">منو · سفارش · رزرو</span>
          </div>
          <div>
            <p className="text-lg font-extrabold leading-snug text-navy-900">سفارش مستقیم، بدون کمیسیون</p>
            <p className="mt-1 text-[12px] leading-relaxed text-navy-500">
              منوی دیجیتال + پرداخت آنلاین به حساب رستوران
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className="inline-flex rounded-lg px-3 py-1.5 text-[11px] font-bold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              سفارش آنلاین
            </span>
            <span className="inline-flex rounded-lg border border-navy-100 px-3 py-1.5 text-[11px] font-bold text-navy-600">
              رزرو میز
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            {["چلوکباب", "قورمه", "سالاد"].map((name) => (
              <div key={name} className="rounded-xl border border-navy-100 bg-navy-50/50 p-2.5">
                <div className="mb-2 aspect-square rounded-lg bg-gradient-to-br from-navy-100 to-navy-50" />
                <p className="text-[10px] font-bold text-navy-800">{name}</p>
                <p className="mt-0.5 text-[9px] font-semibold text-navy-400">از منو</p>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-navy-100 bg-[#F4F6FF] p-4 sm:border-t-0 sm:border-s sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              آ
            </span>
            <div>
              <p className="text-[12px] font-extrabold text-navy-900">دستیار رستوران</p>
              <p className="text-[10px] font-medium text-emerald-600">آنلاین</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="max-w-[90%] rounded-2xl rounded-ss-md bg-white px-3 py-2 text-[11px] leading-relaxed text-navy-700 shadow-sm">
              سلام! چی میل دارید سفارش بدید؟
            </div>
            <div
              className="ms-auto max-w-[85%] rounded-2xl rounded-se-md px-3 py-2 text-[11px] leading-relaxed text-white"
              style={{ backgroundColor: ACCENT }}
            >
              دو پرس چلوکباب مخصوص
            </div>
            <div className="max-w-[90%] rounded-2xl rounded-ss-md bg-white px-3 py-2 text-[11px] leading-relaxed text-navy-700 shadow-sm">
              ثبت شد. لینک پرداخت آماده است ✓
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RestaurantHero() {
  const [contact, setContact] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!isValidLeadContact(contact)) {
      setError("ایمیل یا شماره موبایل را درست وارد کنید.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "restaurant_hero",
          page: RESTAURANT_PAGE_PATH,
          contact: contact.trim(),
          channel: "restaurant_hero",
          goal: "consultation",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          company: "",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(
          data.error === "rate_limited"
            ? "درخواست‌های زیاد. چند دقیقه بعد دوباره تلاش کنید."
            : "ثبت درخواست ناموفق بود. دوباره تلاش کنید.",
        );
        return;
      }
      pushGtmEvent("lead_submit", { source: "restaurant_hero", page: "restaurant" });
      setSuccess(true);
      setContact("");
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative overflow-hidden pb-12 pt-28 sm:pb-16 sm:pt-32" style={{ backgroundColor: "#F4F6FF" }}>
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 45% at 80% 10%, rgba(49,87,246,0.14), transparent), radial-gradient(ellipse 40% 30% at 0% 80%, rgba(14,26,43,0.04), transparent)",
        }}
      />

      <div className="container-mx container-px relative">
        <nav className="mb-6 text-[12px] text-navy-500" aria-label="مسیر صفحه">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-navy-800">
                آرایه
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/website-design" className="hover:text-navy-800">
                طراحی سایت
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-bold text-navy-800">رستوران و کافه</li>
          </ol>
        </nav>

        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          <div className="text-right">
            <p className="mb-3 text-sm font-bold tracking-wide sm:text-base" style={{ color: ACCENT }}>
              شرکت آرایه
            </p>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-navy-700 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ACCENT }} />
              طراحی سایت برای رستوران و کافه
            </span>
            <h1 className="max-w-xl text-3xl font-extrabold leading-tight text-navy-900 sm:text-4xl lg:text-[2.6rem]">
              سایتی که مستقیم سفارش می‌گیرد؛{" "}
              <span style={{ color: ACCENT }}>بدون کمیسیونِ</span> واسطه‌ها
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-navy-500 sm:text-base">
              منوی دیجیتال، سفارش آنلاین، رزرو میز، چت‌بات سفارش‌گیری، دامنه، سرور و درگاه پرداخت —
              همه با آرایه. شما فقط آشپزی کنید.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ChatOpenButton
                location="restaurant_hero_demo"
                className="inline-flex items-center justify-center rounded-xl bg-[#3157F6] px-6 py-3.5 text-sm font-bold text-white shadow-soft transition hover:bg-[#2746d4] active:scale-[0.98]"
              >
                دموی زنده سفارش‌گیری
              </ChatOpenButton>
              <a
                href="#leadform"
                onClick={() =>
                  pushGtmEvent("cta_click", {
                    location: "restaurant_hero_consult",
                    page: "restaurant",
                  })
                }
                className="inline-flex items-center justify-center rounded-xl border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-700 transition hover:border-[#3157F6]/40 hover:text-[#3157F6]"
              >
                دریافت مشاوره رایگان
              </a>
            </div>

            {success ? (
              <div
                className="mt-5 max-w-md rounded-2xl border border-green-100 bg-white p-4 shadow-soft"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm font-medium text-green-700">
                  دریافت شد. کارشناسان آرایه خیلی زود با شما تماس می‌گیرند.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-5 flex max-w-md flex-col gap-2 rounded-2xl border border-navy-100 bg-white p-2 shadow-soft sm:flex-row sm:items-center"
                noValidate
                aria-label="دریافت مشاوره سریع رستوران"
              >
                <label htmlFor="restaurant-hero-contact" className="sr-only">
                  ایمیل یا شماره موبایل
                </label>
                <input
                  id="restaurant-hero-contact"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="ایمیل یا ۰۹۱۲…"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={loading}
                  className="w-full flex-1 rounded-xl bg-navy-50/50 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-400 outline-none transition-colors focus:bg-white focus:ring-2 focus:ring-[#3157F6]/30 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  style={{ backgroundColor: ACCENT }}
                >
                  {loading ? "…" : "ارسال"}
                </button>
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />
              </form>
            )}
            {error ? (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              {restaurantStats.map((s) => (
                <div
                  key={s.lbl}
                  className="rounded-xl border border-navy-100 bg-white/90 px-3.5 py-2.5 shadow-soft"
                >
                  <div className="text-lg font-extrabold" style={{ color: ACCENT }}>
                    {s.num}
                  </div>
                  <div className="mt-0.5 text-[11px] font-bold text-navy-500">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <RestaurantOrderPreview />
            <div className="absolute -bottom-3 start-3 rounded-xl border border-navy-100 bg-white px-3 py-2 text-[11px] font-bold text-navy-700 shadow-soft sm:start-4">
              <span className="me-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              سفارش جدید ثبت شد
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-navy-100/80 pt-8">
          <p className="mb-4 text-center text-xs font-bold text-navy-400">
            رستوران‌ها و کافه‌هایی که با آرایه مستقل شدند
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            {restaurantTrustLogos.map((name) => (
              <span
                key={name}
                className="rounded-full border border-navy-100 bg-white px-4 py-2 text-xs font-bold text-navy-500"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-5 text-center text-[12px] text-navy-400">
            تعرفه و مقایسه پکیج‌ها؟{" "}
            <Link
              href="/website-design/cost"
              className="font-bold hover:underline"
              style={{ color: ACCENT }}
            >
              قیمت طراحی سایت ←
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
