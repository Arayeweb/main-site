"use client";

import { useState } from "react";
import { pushGtmEvent } from "@/lib/gtm";
import { getUtmParams } from "@/lib/utm";
import { IconCheck } from "@/components/icons";
import {
  CONTACT_TOPICS,
  type ContactTopicId,
} from "@/lib/contactPageData";

function toLatinDigits(s: string) {
  return s
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
}

function normalizeIranPhone(value: string): string | null {
  const digits = toLatinDigits(value).replace(/\D/g, "");
  return /^09\d{9}$/.test(digits) ? digits : null;
}

const inputClass =
  "w-full rounded-[16px] border border-navy-100 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition-colors placeholder:text-navy-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

const labelClass = "mb-1.5 block text-sm font-semibold text-navy-800";

export default function ContactConversationForm() {
  const [topic, setTopic] = useState<ContactTopicId | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [link, setLink] = useState("");
  const [detail, setDetail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedTopic = CONTACT_TOPICS.find((item) => item.id === topic);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!topic || !selectedTopic) {
      setError("لطفاً موضوع گفت‌وگو را انتخاب کنید.");
      return;
    }

    const normalizedPhone = normalizeIranPhone(phone);
    if (!name.trim()) {
      setError("نام و نام خانوادگی را وارد کنید.");
      return;
    }
    if (!normalizedPhone) {
      setError("شماره موبایل را درست وارد کنید.");
      return;
    }
    if (!detail.trim()) {
      setError("یک توضیح کوتاه درباره نیازتان بنویسید.");
      return;
    }

    const detailParts = [
      `topic=${selectedTopic.label}`,
      business.trim() ? `business=${business.trim()}` : null,
      link.trim() ? `link=${link.trim()}` : null,
      `message=${detail.trim()}`,
    ].filter(Boolean);

    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "contact_page",
          page: "/contact",
          name: name.trim(),
          contact: normalizedPhone,
          intent: selectedTopic.intent,
          channel: "contact_form",
          goal: selectedTopic.routeTeam,
          detail: detailParts.join(" | "),
          company: "",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          ...getUtmParams(),
        }),
      });

      const data = (await res.json()) as { ok?: boolean };
      if (!res.ok || !data.ok) {
        setError("ارسال درخواست ناموفق بود. دوباره تلاش کنید.");
        return;
      }

      pushGtmEvent("generate_lead", {
        source: "contact_page",
        page: "contact",
        intent: selectedTopic.intent,
      });
      setSuccess(true);
    } catch {
      setError("خطایی رخ داد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div
        id="start-conversation"
        className="rounded-[20px] border border-emerald-100 bg-emerald-50/40 p-8 text-center sm:p-10"
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <IconCheck size={24} />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-navy-900">درخواست شما ثبت شد</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-navy-500">
          {selectedTopic?.id === "ai"
            ? "برای مشکل حساب یا پرداخت Araaye AI، از داخل حساب کاربری در بخش پشتیبانی هم می‌توانید تیکت ثبت کنید."
            : "درخواست به بخش مرتبط ارسال شد. به‌زودی با شما تماس می‌گیریم."}
        </p>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-brand-600 hover:text-brand-700"
          onClick={() => {
            setSuccess(false);
            setTopic(null);
            setName("");
            setPhone("");
            setBusiness("");
            setLink("");
            setDetail("");
          }}
        >
          ارسال درخواست دیگر
        </button>
      </div>
    );
  }

  return (
    <div
      id="start-conversation"
      className="rounded-[20px] border border-navy-100 bg-white p-6 shadow-soft sm:p-8 lg:p-10"
    >
      <h2 className="text-xl font-extrabold text-navy-900 sm:text-[1.35rem]">
        درباره چه موضوعی می‌خواهید صحبت کنیم؟
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {CONTACT_TOPICS.map((item) => {
          const selected = topic === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTopic(item.id)}
              className={`rounded-[16px] border px-4 py-3.5 text-right text-sm font-semibold leading-relaxed transition-all ${
                selected
                  ? "border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100"
                  : "border-navy-100 bg-navy-50/30 text-navy-700 hover:border-navy-200 hover:bg-white"
              }`}
              aria-pressed={selected}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {topic ? (
        <form onSubmit={handleSubmit} className="mt-8 border-t border-navy-50 pt-8">
          <p className="mb-6 text-sm text-navy-500">
            موضوع انتخاب‌شده:{" "}
            <span className="font-bold text-navy-800">{selectedTopic?.label}</span>
            <button
              type="button"
              className="mr-3 text-xs font-semibold text-brand-600 hover:text-brand-700"
              onClick={() => setTopic(null)}
            >
              تغییر موضوع
            </button>
          </p>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label htmlFor="contact-name" className={labelClass}>
                نام و نام خانوادگی
              </label>
              <input
                id="contact-name"
                type="text"
                required
                autoComplete="name"
                className={inputClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="contact-phone" className={labelClass}>
                شماره موبایل
              </label>
              <input
                id="contact-phone"
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                className={`${inputClass} text-left`}
                placeholder="09xxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="contact-business" className={labelClass}>
                نام کسب‌وکار
                <span className="mr-1 text-xs font-normal text-navy-400">— اختیاری</span>
              </label>
              <input
                id="contact-business"
                type="text"
                className={inputClass}
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="contact-link" className={labelClass}>
                آدرس سایت یا صفحه اینستاگرام
                <span className="mr-1 text-xs font-normal text-navy-400">— اختیاری</span>
              </label>
              <input
                id="contact-link"
                type="text"
                dir="ltr"
                className={`${inputClass} text-left`}
                placeholder="example.com یا instagram.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contact-detail" className={labelClass}>
                توضیح کوتاه درباره نیاز
              </label>
              <textarea
                id="contact-detail"
                required
                rows={4}
                className={`${inputClass} resize-y`}
                placeholder="مثلاً یک کلینیک دارم و می‌خواهم از گوگل درخواست نوبت بیشتری دریافت کنم."
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
              />
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="mt-6">
            <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? "در حال ارسال..." : "ارسال و شروع گفت‌وگو"}
            </button>
            <p className="mt-3 text-xs leading-relaxed text-navy-400">
              اطلاعات شما فقط برای بررسی درخواست و تماس با شما استفاده می‌شود.
            </p>
          </div>

          {/* honeypot */}
          <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />
        </form>
      ) : (
        <p className="mt-6 text-sm text-navy-400">
          یکی از گزینه‌ها را انتخاب کنید تا فیلدهای بعدی نمایش داده شود.
        </p>
      )}
    </div>
  );
}
