"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ChatOpenButton from "@/components/home/ChatOpenButton";
import { pushGtmEvent } from "@/lib/gtm";
import {
  restaurantBudgetOptions,
  restaurantChannelOptions,
  restaurantGoalOptions,
  restaurantKindOptions,
  RESTAURANT_PAGE_PATH,
} from "@/lib/restaurantData";
import { normalizeContact } from "@/lib/validateContact";

type FormState = {
  goal: string;
  channel: string;
  kind: string;
  budget: string;
  name: string;
  contact: string;
  consent: boolean;
};

const initial: FormState = {
  goal: "",
  channel: "",
  kind: "",
  budget: "",
  name: "",
  contact: "",
  consent: true,
};

function isValidLeadContact(value: string): boolean {
  const kind = normalizeContact(value).kind;
  return kind === "phone" || kind === "email";
}

export default function RestaurantLeadForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const progress = useMemo(() => (step / 4) * 100, [step]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const canContinue = (): boolean => {
    if (step === 1) return Boolean(form.goal);
    if (step === 2) {
      if (form.goal === "chatbot") return Boolean(form.channel);
      return Boolean(form.kind);
    }
    if (step === 3) return Boolean(form.budget);
    if (step === 4) {
      return Boolean(form.name.trim()) && isValidLeadContact(form.contact) && form.consent;
    }
    return false;
  };

  const submit = async () => {
    if (!canContinue()) {
      if (step === 4) {
        if (!form.name.trim()) setError("نام را وارد کنید.");
        else if (!isValidLeadContact(form.contact)) setError("ایمیل یا شماره موبایل را درست وارد کنید.");
        else if (!form.consent) setError("برای تماس، رضایت لازم است.");
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "restaurant_form",
          page: RESTAURANT_PAGE_PATH,
          name: form.name.trim(),
          contact: form.contact.trim(),
          goal: form.goal,
          channel: form.goal === "chatbot" ? form.channel : form.kind,
          budget: form.budget,
          intent: form.goal,
          consent: form.consent,
          company: "",
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
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
      pushGtmEvent("lead_submit", {
        source: "restaurant_form",
        page: "restaurant",
        goal: form.goal,
      });
      setDone(true);
    } catch {
      setError("خطا در ارتباط. اتصال اینترنت را بررسی کنید.");
    } finally {
      setLoading(false);
    }
  };

  const onNext = () => {
    if (!canContinue()) {
      setError("لطفاً یکی از گزینه‌ها را انتخاب کنید.");
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
      setError(null);
      return;
    }
    void submit();
  };

  return (
    <section className="section-py bg-navy-900" id="leadform">
      <div className="container-mx container-px">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div className="text-right">
            <span className="badge mb-4 bg-white/10 text-[#A8B9FF]">شروع کنیم</span>
            <h2 className="section-title text-white">۳۰ ثانیه تا پیشنهاد اختصاصی رستوران شما</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-navy-200">
              چند سؤال کوتاه می‌پرسیم تا نیاز رستوران‌تان را بفهمیم. بدون تعهد، بدون تماس مزاحم.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href="/website-design"
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white/90 transition hover:bg-white/10"
              >
                طراحی سایت حرفه‌ای
              </Link>
              <Link
                href="/website-design/cost"
                className="rounded-xl border border-white/20 px-4 py-2 text-xs font-bold text-white/90 transition hover:bg-white/10"
              >
                قیمت طراحی سایت
              </Link>
            </div>
            <ul className="mt-6 space-y-2.5 text-[13px] font-medium text-navy-200">
              {[
                "مشاوره و برآورد کاملاً رایگان",
                "طراحی + دامنه + سرور + درگاه، همه با ما",
                "بدون تماس مزاحم و بدون تعهد",
                "اطلاعات شما نزد ما محفوظ است",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <span className="mt-1 text-[#A8B9FF]">✓</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-card sm:p-7">
            {done ? (
              <div className="py-6 text-center" role="status" aria-live="polite">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  ✓
                </div>
                <h3 className="text-lg font-extrabold text-navy-900">دریافت شد</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-500">
                  پیشنهاد اختصاصی رستوران شما در حال آماده‌سازی است. کارشناسان آرایه طی کمتر از یک
                  روز کاری با شما تماس می‌گیرند.
                </p>
                <ChatOpenButton
                  location="restaurant_lead_success"
                  className="mt-5 inline-flex rounded-xl border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-700 transition hover:border-[#3157F6]/40 hover:text-[#3157F6]"
                >
                  تا آن موقع با دستیار آرایه گپ بزنید
                </ChatOpenButton>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-100">
                    <div
                      className="h-full rounded-full bg-[#3157F6] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-navy-400">
                    گام {step} از ۴
                  </span>
                </div>

                {step === 1 ? (
                  <fieldset>
                    <legend className="mb-3 text-sm font-extrabold text-navy-900">
                      مهم‌ترین نیاز رستوران شما چیست؟
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {restaurantGoalOptions.map((opt) => (
                        <OptionButton
                          key={opt.value}
                          selected={form.goal === opt.value}
                          onClick={() => setField("goal", opt.value)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {step === 2 ? (
                  <fieldset>
                    <legend className="mb-3 text-sm font-extrabold text-navy-900">
                      {form.goal === "chatbot"
                        ? "چت‌بات روی کدام کانال باشد؟"
                        : "نوع کسب‌وکار شما چیست؟"}
                    </legend>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {(form.goal === "chatbot"
                        ? restaurantChannelOptions
                        : restaurantKindOptions
                      ).map((opt) => (
                        <OptionButton
                          key={opt.value}
                          selected={
                            form.goal === "chatbot"
                              ? form.channel === opt.value
                              : form.kind === opt.value
                          }
                          onClick={() =>
                            form.goal === "chatbot"
                              ? setField("channel", opt.value)
                              : setField("kind", opt.value)
                          }
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {step === 3 ? (
                  <fieldset>
                    <legend className="mb-3 text-sm font-extrabold text-navy-900">
                      بودجه تقریبی شما در چه بازه‌ای است؟
                    </legend>
                    <div className="grid gap-2">
                      {restaurantBudgetOptions.map((opt) => (
                        <OptionButton
                          key={opt.value}
                          selected={form.budget === opt.value}
                          onClick={() => setField("budget", opt.value)}
                          label={opt.label}
                        />
                      ))}
                    </div>
                  </fieldset>
                ) : null}

                {step === 4 ? (
                  <fieldset className="space-y-4">
                    <legend className="mb-1 text-sm font-extrabold text-navy-900">
                      پیشنهاد اختصاصی را کجا بفرستیم؟
                    </legend>
                    <div>
                      <label
                        htmlFor="restaurant-lead-name"
                        className="mb-1.5 block text-xs font-bold text-navy-600"
                      >
                        نام شما
                      </label>
                      <input
                        id="restaurant-lead-name"
                        type="text"
                        autoComplete="name"
                        placeholder="مثلاً رضا منصوری"
                        value={form.name}
                        onChange={(e) => setField("name", e.target.value)}
                        className="w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-[#3157F6]/40 focus:ring-2 focus:ring-[#3157F6]/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="restaurant-lead-contact"
                        className="mb-1.5 block text-xs font-bold text-navy-600"
                      >
                        ایمیل یا شماره موبایل
                      </label>
                      <input
                        id="restaurant-lead-contact"
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="example@mail.com یا ۰۹۱۲…"
                        value={form.contact}
                        onChange={(e) => setField("contact", e.target.value)}
                        className="w-full rounded-xl border border-navy-100 bg-navy-50/40 px-4 py-2.5 text-sm text-navy-900 outline-none focus:border-[#3157F6]/40 focus:ring-2 focus:ring-[#3157F6]/20"
                      />
                    </div>
                    <label className="flex items-start gap-2 text-[13px] text-navy-600">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => setField("consent", e.target.checked)}
                        className="mt-0.5 rounded border-navy-200"
                      />
                      مایلم آرایه برای مشاوره با من تماس بگیرد.
                    </label>
                    <input
                      type="text"
                      name="company"
                      tabIndex={-1}
                      autoComplete="off"
                      className="hidden"
                      aria-hidden="true"
                    />
                  </fieldset>
                ) : null}

                {error ? (
                  <p className="mt-3 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="mt-6 flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setStep((s) => s - 1);
                        setError(null);
                      }}
                      className="text-sm font-bold text-navy-500 transition hover:text-navy-800"
                    >
                      بازگشت
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={loading}
                    className="rounded-xl bg-navy-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-navy-800 active:scale-[0.98] disabled:opacity-60"
                  >
                    {loading ? "در حال ارسال…" : step === 4 ? "ارسال درخواست" : "ادامه"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function OptionButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-right text-sm font-bold transition ${
        selected
          ? "border-[#3157F6] bg-[#EEF2FF] text-[#3157F6] ring-1 ring-[#3157F6]/25"
          : "border-navy-100 bg-white text-navy-700 hover:border-[#3157F6]/30 hover:bg-[#EEF2FF]/50"
      }`}
    >
      {label}
    </button>
  );
}
