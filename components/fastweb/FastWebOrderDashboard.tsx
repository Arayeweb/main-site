"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Logo from "@/components/Logo";
import FastWebSiteView from "@/components/fastweb/FastWebSiteView";
import {
  FULFILLMENT_LABELS,
  FULFILLMENT_PIPELINE,
  type FastWebFulfillmentStatus,
  type FastWebOrder,
  type FastWebPreviewContent,
} from "@/lib/fastweb";
import { hasPreviewContent } from "@/lib/fastwebContent";
import { pushGtmEvent } from "@/lib/gtm";

export default function FastWebOrderDashboard({
  orderId,
}: {
  orderId: string;
}) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<FastWebOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [domainRequest, setDomainRequest] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fastweb/orders/${orderId}`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.error === "unauthorized"
            ? "برای مشاهده سفارش به لینک پس از پرداخت نیاز دارید."
            : "سفارش یافت نشد."
        );
        setOrder(null);
        return;
      }
      const o = data.order as FastWebOrder;
      setOrder(o);
      setDomainRequest(o.domainRequest || "");
      setPhone(o.brief.contacts?.phone || o.phone || "");
      setWhatsapp(o.brief.contacts?.whatsapp || "");
      setInstagram(o.brief.contacts?.instagram || "");
    } catch {
      setError("خطا در بارگذاری سفارش.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    if (searchParams.get("paid") === "1") {
      pushGtmEvent("fastweb_payment_success", { orderId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function patch(body: Record<string, unknown>) {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(`/api/fastweb/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (data.error === "revision_limit") {
          setError("سقف مرحله اصلاح این بسته پر شده است.");
        } else {
          setError("ذخیره ممکن نشد.");
        }
        return;
      }
      setOrder(data.order);
      setMessage("ذخیره شد.");
      setRevisionNotes("");
    } finally {
      setSaving(false);
    }
  }

  function onContacts(e: FormEvent) {
    e.preventDefault();
    void patch({
      contacts: { phone, whatsapp, instagram },
    });
  }

  function onRevision(e: FormEvent) {
    e.preventDefault();
    if (!revisionNotes.trim()) return;
    void patch({ revisionNotes });
  }

  function onDomain(e: FormEvent) {
    e.preventDefault();
    void patch({ domainRequest });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F8]" dir="rtl">
        <Loader2 className="h-6 w-6 animate-spin text-[#0F4C5C]" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] px-4 py-16" dir="rtl">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <Logo />
          <p className="mt-6 text-slate-700">{error}</p>
          <Link href="/fastweb" className="mt-6 inline-block text-sm text-[#0F4C5C] underline">
            بازگشت به سایت فوری
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const status = order.fulfillmentStatus;
  const content = (
    hasPreviewContent(order.publishedContent)
      ? order.publishedContent
      : order.previewContent
  ) as FastWebPreviewContent;
  const showSite =
    hasPreviewContent(content) &&
    ["first_version", "awaiting_approval", "published"].includes(status);
  const maxRevisions = order.package === "plus" ? 2 : 1;

  return (
    <div className="min-h-screen bg-[#F4F7F8] text-slate-900" dir="rtl">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/fastweb" className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium text-slate-600">سفارش سایت فوری</span>
          </Link>
          {showSite ? (
            <Link
              href={order.publicPath}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-[#0F4C5C]"
            >
              مشاهده سایت
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        {searchParams.get("paid") === "1" ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
            پرداخت موفق بود. سفارش شما ثبت شد و تیم آرایه کار را شروع می‌کند.
          </div>
        ) : null}

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80">
          <h1 className="text-xl font-bold">
            {order.businessName || "سفارش سایت فوری"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            وضعیت فعلی:{" "}
            <strong>{FULFILLMENT_LABELS[status] || status}</strong>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            آدرس موقت: {order.temporaryHostHint} · مسیر فعلی: {order.publicPath}
          </p>

          <ol className="mt-8 space-y-3">
            {FULFILLMENT_PIPELINE.map((s, i) => {
              const currentIdx = FULFILLMENT_PIPELINE.indexOf(
                status as FastWebFulfillmentStatus
              );
              const done = currentIdx >= i;
              const active = status === s;
              return (
                <li key={s} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                      done
                        ? "bg-[#0F4C5C] text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  <div>
                    <p
                      className={`text-sm ${
                        active ? "font-bold text-[#0F4C5C]" : "text-slate-700"
                      }`}
                    >
                      {FULFILLMENT_LABELS[s]}
                    </p>
                    {i < FULFILLMENT_PIPELINE.length - 1 ? (
                      <div className="mr-3 mt-2 h-4 w-px bg-slate-200" />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {showSite && hasPreviewContent(content) ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3 text-sm font-medium">
              نسخه فعلی سایت
            </div>
            <div className="mx-auto max-w-[420px]">
              <FastWebSiteView
                content={content}
                brief={order.brief}
                mode="live"
                compact
              />
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={onRevision}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 space-y-3"
          >
            <h2 className="font-bold">ثبت اصلاحات</h2>
            <p className="text-xs text-slate-500">
              باقی‌مانده: {Math.max(0, maxRevisions - order.revisionCount)} از{" "}
              {maxRevisions} مرحله
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="همه اصلاحات را یک‌جا بنویسید…"
            />
            <button
              type="submit"
              disabled={saving || order.revisionCount >= maxRevisions}
              className="rounded-xl bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              ارسال اصلاحات
            </button>
          </form>

          <form
            onSubmit={onDomain}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 space-y-3"
          >
            <h2 className="font-bold">اتصال دامنه</h2>
            <input
              value={domainRequest}
              onChange={(e) => setDomainRequest(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="example.ir"
            />
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              ثبت درخواست دامنه
            </button>
          </form>
        </div>

        <form
          onSubmit={onContacts}
          className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 space-y-3"
        >
          <h2 className="font-bold">اطلاعات تماس</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="تلفن"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="واتساپ"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="اینستاگرام"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#0F4C5C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            ذخیره تماس
          </button>
        </form>

        {message ? <p className="text-sm text-teal-700">{message}</p> : null}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </main>
    </div>
  );
}
