"use client";

import { useState, type FormEvent } from "react";
import { kordianContact } from "@/lib/showdemoto/dr-kordian/config";
import { getKordianMessages, t as tl } from "@/lib/showdemoto/dr-kordian/i18n";
import type { KordianLocale } from "@/lib/showdemoto/dr-kordian/types";

export default function KordianContactForm({ locale }: { locale: KordianLocale }) {
  const t = getKordianMessages(locale);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    await new Promise((r) => setTimeout(r, 600));
    setStatus("success");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="text-xl font-semibold text-navy-900">{t.contact.formTitle}</h2>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-navy-700">{t.contact.name}</span>
            <input
              required
              name="name"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-navy-700">{t.contact.email}</span>
            <input
              required
              type="email"
              name="email"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-navy-700">{t.contact.phone}</span>
            <input
              name="phone"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-navy-700">{t.contact.preferredLanguage}</span>
            <select
              name="language"
              defaultValue={locale}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
            >
              <option value="en">English</option>
              <option value="ru">Русский</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-navy-700">{t.contact.travelDates}</span>
            <input
              name="travelDates"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-navy-700">{t.contact.message}</span>
            <textarea
              required
              name="message"
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-teal-500 focus:ring-2"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={status === "submitting" || status === "success"}
          className="mt-6 w-full rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {status === "submitting" ? t.contact.submitting : t.contact.submit}
        </button>
        {status === "success" && (
          <p className="mt-4 rounded-xl bg-teal-50 p-3 text-sm text-teal-800">{t.contact.success}</p>
        )}
        {status === "error" && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{t.contact.error}</p>
        )}
      </form>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy-900">{t.contact.infoTitle}</h2>
        <dl className="mt-6 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-navy-700">{t.contact.emailLabel}</dt>
            <dd className="mt-1 text-navy-600">{kordianContact.email}</dd>
          </div>
          <div>
            <dt className="font-medium text-navy-700">{t.contact.phoneLabel}</dt>
            <dd className="mt-1 text-navy-600">{kordianContact.phone}</dd>
          </div>
          <div>
            <dt className="font-medium text-navy-700">{t.contact.addressLabel}</dt>
            <dd className="mt-1 text-navy-600">{tl(kordianContact.address, locale)}</dd>
          </div>
          <div>
            <dt className="font-medium text-navy-700">{t.contact.hoursLabel}</dt>
            <dd className="mt-1 text-navy-600">{tl(kordianContact.hours, locale)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
