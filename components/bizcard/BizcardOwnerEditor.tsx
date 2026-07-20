"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ExternalLink, Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import BizcardPreview from "@/components/bizcard/BizcardPreview";
import { bizcardThemes, type BizcardTheme } from "@/lib/bizcardData";

type OwnerCard = {
  id: string;
  slug: string;
  business_name: string;
  category: string | null;
  phone: string | null;
  whatsapp: string | null;
  maps_url: string | null;
  neshan_url: string | null;
  balad_url: string | null;
  snap_url: string | null;
  osm_url: string | null;
  address: string | null;
  instagram: string | null;
  telegram: string | null;
  website: string | null;
  hours: string | null;
  logo_url: string | null;
  theme_color: string | null;
  is_active: boolean;
};

type FormState = {
  business_name: string;
  category: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  maps_url: string;
  neshan_url: string;
  balad_url: string;
  snap_url: string;
  osm_url: string;
  instagram: string;
  telegram: string;
  website: string;
  logo_url: string;
  theme_color: string;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0F4C5C] focus:ring-2 focus:ring-[#0F4C5C]/15";

const labelClass = "mb-1.5 block text-xs font-bold text-slate-600";

function emptyForm(): FormState {
  return {
    business_name: "",
    category: "",
    phone: "",
    whatsapp: "",
    address: "",
    hours: "",
    maps_url: "",
    neshan_url: "",
    balad_url: "",
    snap_url: "",
    osm_url: "",
    instagram: "",
    telegram: "",
    website: "",
    logo_url: "",
    theme_color: "blue",
  };
}

function cardToForm(card: OwnerCard): FormState {
  return {
    business_name: card.business_name || "",
    category: card.category || "",
    phone: card.phone || "",
    whatsapp: card.whatsapp || "",
    address: card.address || "",
    hours: card.hours || "",
    maps_url: card.maps_url || "",
    neshan_url: card.neshan_url || "",
    balad_url: card.balad_url || "",
    snap_url: card.snap_url || "",
    osm_url: card.osm_url || "",
    instagram: card.instagram || "",
    telegram: card.telegram || "",
    website: card.website || "",
    logo_url: card.logo_url || "",
    theme_color: card.theme_color || "blue",
  };
}

function themeByKey(key: string): BizcardTheme {
  return bizcardThemes.find((t) => t.key === key) ?? bizcardThemes[0];
}

export default function BizcardOwnerEditor({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function redeemToken(token: string): Promise<boolean> {
    const res = await fetch("/api/bizcard-owner/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ slug, token }),
    });
    const data = (await res.json()) as { ok?: boolean };
    return res.ok && !!data.ok;
  }

  async function loadCard(token?: string | null) {
    setLoading(true);
    setError(null);
    try {
      const qs = token ? `?token=${encodeURIComponent(token)}` : "";
      const res = await fetch(`/api/bizcard-owner/${encodeURIComponent(slug)}${qs}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        card?: OwnerCard;
      };
      if (!res.ok || !data.ok || !data.card) {
        setAuthed(false);
        setError(
          data.error === "unauthorized" || res.status === 401
            ? "برای ویرایش کارت به لینک خصوصی که از آرایه دریافت کرده‌اید نیاز دارید."
            : "کارت یافت نشد یا لینک نامعتبر است."
        );
        return;
      }
      setAuthed(true);
      setForm(cardToForm(data.card));
      setLogoPreview(data.card.logo_url || null);
    } catch {
      setAuthed(false);
      setError("خطا در بارگذاری کارت.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = searchParams.get("token");
      if (token) {
        const ok = await redeemToken(token);
        if (cancelled) return;
        if (ok) {
          router.replace(`/dashboard/bizcard/${encodeURIComponent(slug)}`, {
            scroll: false,
          });
        }
        await loadCard(ok ? null : token);
        return;
      }
      await loadCard(null);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function onUpload(file: File) {
    if (file.size > 3 * 1024 * 1024) {
      setError("حجم فایل بیش از ۳ مگابایت است.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(String(e.target?.result || ""));
    reader.readAsDataURL(file);

    setUploading(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(
        `/api/bizcard-owner/${encodeURIComponent(slug)}/upload`,
        { method: "POST", body: fd, credentials: "include" }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.url) {
        setError("آپلود تصویر ناموفق بود.");
        return;
      }
      setField("logo_url", data.url);
      setLogoPreview(data.url);
      setMessage("تصویر آپلود شد — فراموش نکنید ذخیره کنید.");
    } catch {
      setError("خطا در آپلود تصویر.");
    } finally {
      setUploading(false);
    }
  }

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!form.business_name.trim()) {
      setError("نام کسب‌وکار الزامی است.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/bizcard-owner/${encodeURIComponent(slug)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        card?: OwnerCard;
      };
      if (!res.ok || !data.ok || !data.card) {
        setError(
          data.error === "unauthorized"
            ? "نشست منقضی شده — دوباره از لینک خصوصی وارد شوید."
            : "ذخیره ممکن نشد."
        );
        return;
      }
      setForm(cardToForm(data.card));
      setLogoPreview(data.card.logo_url || null);
      setMessage("تغییرات ذخیره شد و روی کارت عمومی اعمال شد.");
    } catch {
      setError("خطا در ذخیره.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#F4F7F8]"
        dir="rtl"
      >
        <Loader2 className="h-6 w-6 animate-spin text-[#0F4C5C]" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#F4F7F8] px-4 py-16" dir="rtl">
        <div className="mx-auto max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <Logo />
          <p className="mt-6 text-slate-700">
            {error || "دسترسی غیرمجاز."}
          </p>
          <Link
            href={`/b/${encodeURIComponent(slug)}`}
            className="mt-6 inline-block text-sm text-[#0F4C5C] underline"
          >
            مشاهده کارت عمومی
          </Link>
        </div>
      </div>
    );
  }

  const theme = themeByKey(form.theme_color);

  return (
    <div className="min-h-screen bg-[#F4F7F8] text-slate-900" dir="rtl">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium text-slate-600">
              پنل ویرایش کارت ویزیت
            </span>
          </div>
          <Link
            href={`/b/${encodeURIComponent(slug)}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-[#0F4C5C]"
          >
            مشاهده کارت
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <form
          onSubmit={onSave}
          className="space-y-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/80 sm:p-6"
        >
          <div>
            <h1 className="text-xl font-bold">ویرایش اطلاعات کارت</h1>
            <p className="mt-1 text-sm text-slate-500">
              آدرس عمومی:{" "}
              <span className="font-mono text-xs" dir="ltr">
                /b/{slug}
              </span>
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          ) : null}
          {message ? (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
              {message}
            </div>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-sm font-bold text-slate-800">هویت</h2>
            <div>
              <label className={labelClass} htmlFor="bc_name">
                نام کسب‌وکار *
              </label>
              <input
                id="bc_name"
                className={inputClass}
                value={form.business_name}
                onChange={(e) => setField("business_name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="bc_cat">
                دسته‌بندی
              </label>
              <input
                id="bc_cat"
                className={inputClass}
                value={form.category}
                onChange={(e) => setField("category", e.target.value)}
                placeholder="مثلاً رستوران باربیکیو"
              />
            </div>
            <div>
              <span className={labelClass}>رنگ تم</span>
              <div className="flex flex-wrap gap-2">
                {bizcardThemes.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    title={t.label}
                    onClick={() => setField("theme_color", t.key)}
                    className="h-9 w-9 rounded-full border-2 transition"
                    style={{
                      background: t.brand,
                      borderColor:
                        form.theme_color === t.key ? "#0f172a" : "transparent",
                      transform:
                        form.theme_color === t.key ? "scale(1.1)" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
            <div>
              <span className={labelClass}>لوگو / تصویر</span>
              <div className="flex flex-wrap items-center gap-3">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt=""
                    className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                  />
                ) : null}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onUpload(f);
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"
                >
                  {uploading ? "در حال آپلود…" : "انتخاب تصویر"}
                </button>
                {form.logo_url ? (
                  <button
                    type="button"
                    onClick={() => {
                      setField("logo_url", "");
                      setLogoPreview(null);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="text-sm text-red-600"
                  >
                    حذف
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-bold text-slate-800">آدرس و ساعت</h2>
            <div>
              <label className={labelClass} htmlFor="bc_address">
                آدرس
              </label>
              <textarea
                id="bc_address"
                className={inputClass}
                rows={2}
                value={form.address}
                onChange={(e) => setField("address", e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="bc_hours">
                ساعت کاری
              </label>
              <input
                id="bc_hours"
                className={inputClass}
                value={form.hours}
                onChange={(e) => setField("hours", e.target.value)}
                placeholder="مثلاً ۷ صبح تا ۱۲ شب"
              />
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-bold text-slate-800">تماس</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="bc_phone">
                  تلفن
                </label>
                <input
                  id="bc_phone"
                  className={inputClass}
                  dir="ltr"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="bc_wa">
                  واتساپ
                </label>
                <input
                  id="bc_wa"
                  className={inputClass}
                  dir="ltr"
                  value={form.whatsapp}
                  onChange={(e) => setField("whatsapp", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-bold text-slate-800">مسیریابی</h2>
            {(
              [
                ["maps_url", "لینک گوگل مپ"],
                ["neshan_url", "لینک نشان"],
                ["balad_url", "لینک بلد"],
                ["snap_url", "لینک اسنپ"],
                ["osm_url", "لینک OpenStreetMap"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className={labelClass} htmlFor={`bc_${key}`}>
                  {label}
                </label>
                <input
                  id={`bc_${key}`}
                  className={inputClass}
                  dir="ltr"
                  type="url"
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  placeholder="https://"
                />
              </div>
            ))}
          </section>

          <section className="space-y-3 border-t border-slate-100 pt-5">
            <h2 className="text-sm font-bold text-slate-800">شبکه‌های اجتماعی</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="bc_ig">
                  اینستاگرام (بدون @)
                </label>
                <input
                  id="bc_ig"
                  className={inputClass}
                  dir="ltr"
                  value={form.instagram}
                  onChange={(e) => setField("instagram", e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="bc_tg">
                  تلگرام (بدون @)
                </label>
                <input
                  id="bc_tg"
                  className={inputClass}
                  dir="ltr"
                  value={form.telegram}
                  onChange={(e) => setField("telegram", e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} htmlFor="bc_web">
                وب‌سایت
              </label>
              <input
                id="bc_web"
                className={inputClass}
                dir="ltr"
                type="url"
                value={form.website}
                onChange={(e) => setField("website", e.target.value)}
                placeholder="https://"
              />
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl bg-[#0F4C5C] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال ذخیره…
                </>
              ) : (
                "ذخیره تغییرات"
              )}
            </button>
            <Link
              href={`/b/${encodeURIComponent(slug)}`}
              target="_blank"
              className="text-sm text-slate-600 underline"
            >
              پیش‌نمایش زنده کارت
            </Link>
          </div>
        </form>

        <aside className="hidden lg:block">
          <BizcardPreview
            data={{
              businessName: form.business_name,
              category: form.category,
              phone: form.phone,
              address: form.address,
              mapsUrl: form.maps_url,
              logoPreview,
              theme,
            }}
          />
        </aside>
      </main>
    </div>
  );
}
