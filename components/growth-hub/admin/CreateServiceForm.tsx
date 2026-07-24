"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createServiceAction } from "@/lib/growth-hub/actions/services";
import { normalizeSlug } from "@/lib/growth-hub/slug";
import { ShamsiDateInput } from "@/components/admin/ui/ShamsiDateInput";

type TemplateOption = {
  id: string;
  key: string;
  title: string;
};

export function CreateServiceForm({
  workspaceId,
  templates,
}: {
  workspaceId: string;
  templates: TemplateOption[];
}) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [title, setTitle] = useState(templates[0]?.title ?? "");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const selected = useMemo(
    () => templates.find((t) => t.id === templateId) ?? null,
    [templates, templateId],
  );

  function onTemplateChange(id: string) {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) setTitle(t.title);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createServiceAction({
        workspace_id: workspaceId,
        template_id: templateId,
        title,
        start_date: startDate || undefined,
        due_date: dueDate || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/growth-hub/services/${result.data.serviceId}`);
      router.refresh();
    });
  }

  if (!templates.length) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        هیچ قالب فعالی برای ساخت خدمت وجود ندارد.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" dir="rtl">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">قالب خدمت</label>
        <select
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={templateId}
          onChange={(e) => onTemplateChange(e.target.value)}
          required
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} ({t.key})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-600">عنوان برای مشتری</label>
        <input
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
          maxLength={120}
        />
        {selected ? (
          <p className="mt-1 text-[11px] text-slate-400" dir="ltr">
            template:{normalizeSlug(selected.key)}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">شروع</label>
          <ShamsiDateInput value={startDate} onChange={setStartDate} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-600">سررسید</label>
          <ShamsiDateInput value={dueDate} onChange={setDueDate} />
        </div>
      </div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "در حال ساخت…" : "ساخت خدمت از قالب"}
      </button>
    </form>
  );
}
