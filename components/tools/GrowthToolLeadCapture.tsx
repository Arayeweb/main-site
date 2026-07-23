"use client";

import { useState } from "react";
import { getUtmParams } from "@/lib/utm";
import { pushGtmEvent } from "@/lib/gtm";
import {
  trackGrowthToolEvent,
  type GrowthToolName,
} from "@/lib/analytics/growthToolsEvents";

function normalizePhone(value: string): string | null {
  const digits = value
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/\D/g, "");
  return /^09\d{9}$/.test(digits) ? digits : null;
}

export default function GrowthToolLeadCapture({
  tool,
  industry,
  detail,
  onSuccess,
}: {
  tool: GrowthToolName;
  industry: string;
  detail: string;
  onSuccess?: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const contact = normalizePhone(phone);
    if (!contact) {
      setStatus("error");
      return;
    }

    const page = typeof window !== "undefined" ? window.location.pathname : "";
    const source = `free-tool-${tool}`;
    setStatus("loading");
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          page,
          name: name.trim() || null,
          contact,
          company,
          goal: "free_tool_report",
          plan: tool,
          channel: "free_tool",
          intent: industry,
          detail,
          consent: true,
          referrer: typeof document !== "undefined" ? document.referrer || null : null,
          ...getUtmParams(),
        }),
      });
      const result = (await response.json()) as { ok?: boolean };
      if (!response.ok || !result.ok) throw new Error("lead_failed");
      setStatus("success");
      trackGrowthToolEvent("lead_submit", tool, industry);
      pushGtmEvent("generate_lead", {
        source,
        page,
        tool,
        industry,
        channel: "free_tool",
      });
      onSuccess?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm font-bold text-emerald-800">
        درخواست ثبت شد. گزارش کامل همین حالا برای شما باز شد و تیم آرایه برای بررسی دقیق‌تر تماس می‌گیرد.
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
      <p className="text-sm font-extrabold text-navy-900">دریافت گزارش کامل و مشاوره اولیه رایگان</p>
      <p className="mt-1 text-xs leading-relaxed text-navy-500">
        نتیجه اصلی رایگان است؛ برای باز کردن جزئیات اجرایی فقط شماره تماس را وارد کنید.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="نام (اختیاری)"
          className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-500"
        />
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="09xxxxxxxxx"
          inputMode="tel"
          dir="ltr"
          required
          className="rounded-xl border border-navy-200 bg-white px-4 py-3 text-left text-sm outline-none focus:border-brand-500"
        />
      </div>
      <input
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {status === "error" ? (
        <p className="mt-2 text-xs font-bold text-red-600">شماره موبایل را بررسی و دوباره تلاش کنید.</p>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-3 w-full rounded-xl bg-brand-600 px-5 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {status === "loading" ? "در حال ثبت..." : "باز کردن گزارش کامل"}
      </button>
    </form>
  );
}
