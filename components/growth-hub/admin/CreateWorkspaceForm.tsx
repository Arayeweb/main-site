"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createWorkspaceAction } from "@/lib/growth-hub/actions/staff";
import { normalizeSlug } from "@/lib/growth-hub/slug";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";
const labelClass = "mb-1.5 block text-xs font-bold text-slate-700";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(normalizeSlug(value));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createWorkspaceAction({
        name,
        slug,
        industry: industry || undefined,
        website_url: website || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/growth-hub/workspaces/${result.data.workspaceId}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} dir="rtl" className="max-w-xl space-y-4">
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div>
        <label className={labelClass}>نام کسب‌وکار</label>
        <input
          className={inputClass}
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
        />
      </div>

      <div>
        <label className={labelClass}>نشانی فضای کاری (slug)</label>
        <input
          className={inputClass}
          dir="ltr"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(normalizeSlug(e.target.value));
          }}
          placeholder="my-business"
          required
        />
        <p className="mt-1 text-xs text-slate-400">
          آدرس مشتری: /app/{slug || "my-business"}/home
        </p>
      </div>

      <div>
        <label className={labelClass}>صنعت (اختیاری)</label>
        <input
          className={inputClass}
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>وب‌سایت (اختیاری)</label>
        <input
          className={inputClass}
          dir="ltr"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "در حال ساخت…" : "ساخت فضای کاری"}
      </button>
    </form>
  );
}
