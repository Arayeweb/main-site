"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateMilestoneAction,
  updateServiceAction,
} from "@/lib/growth-hub/actions/services";
import {
  MILESTONE_STATUS_LABELS_FA,
  SERVICE_STATUS_LABELS_FA,
  SERVICE_TRANSITIONS,
} from "@/lib/growth-hub/services/status";
import type {
  GrowthHubMilestoneStatus,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";
import { ShamsiDateInput } from "@/components/admin/ui/ShamsiDateInput";

type ServiceForm = {
  id: string;
  status: GrowthHubServiceStatus;
  progress: number;
  latest_update: string | null;
  next_action: string | null;
  waiting_reason: string | null;
  start_date: string | null;
  due_date: string | null;
  renewal_date: string | null;
  updated_at: string;
};

type MilestoneForm = {
  id: string;
  title: string;
  status: GrowthHubMilestoneStatus;
  sort_order: number;
};

export function StaffServiceEditor({
  service,
  milestones,
}: {
  service: ServiceForm;
  milestones: MilestoneForm[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(service.status);
  const [latestUpdate, setLatestUpdate] = useState(service.latest_update ?? "");
  const [nextAction, setNextAction] = useState(service.next_action ?? "");
  const [waitingReason, setWaitingReason] = useState(service.waiting_reason ?? "");
  const [startDate, setStartDate] = useState(service.start_date ?? "");
  const [dueDate, setDueDate] = useState(service.due_date ?? "");
  const [renewalDate, setRenewalDate] = useState(service.renewal_date ?? "");
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState(service.updated_at);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const allowed = Array.from(
    new Set([service.status, status, ...SERVICE_TRANSITIONS[service.status]]),
  );

  function saveService(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOkMsg(null);
    startTransition(async () => {
      const result = await updateServiceAction({
        service_id: service.id,
        expected_updated_at: expectedUpdatedAt,
        status,
        latest_update: latestUpdate || null,
        next_action: status === "completed" ? null : nextAction || null,
        waiting_reason: status === "waiting_on_client" ? waitingReason : waitingReason || null,
        start_date: startDate || null,
        due_date: dueDate || null,
        renewal_date: renewalDate || null,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOkMsg("ذخیره شد.");
      router.refresh();
    });
  }

  function setMilestone(milestoneId: string, next: GrowthHubMilestoneStatus) {
    setError(null);
    startTransition(async () => {
      const result = await updateMilestoneAction({
        milestone_id: milestoneId,
        service_id: service.id,
        status: next,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6" dir="rtl">
      <form onSubmit={saveService} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-900">وضعیت و اقدام</h2>
          <p className="text-xs text-slate-500">پیشرفت: {service.progress}٪</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">وضعیت</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as GrowthHubServiceStatus)}
            >
              {allowed.map((s) => (
                <option key={s} value={s}>
                  {SERVICE_STATUS_LABELS_FA[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">آخرین به‌روزرسانی</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={latestUpdate}
              onChange={(e) => setLatestUpdate(e.target.value)}
              maxLength={2000}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">اقدام بعدی مشتری</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              maxLength={500}
              disabled={status === "completed"}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">دلیل انتظار</label>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={waitingReason}
              onChange={(e) => setWaitingReason(e.target.value)}
              maxLength={500}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">شروع</label>
            <ShamsiDateInput value={startDate} onChange={setStartDate} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">سررسید</label>
            <ShamsiDateInput value={dueDate} onChange={setDueDate} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">تمدید</label>
            <ShamsiDateInput value={renewalDate} onChange={setRenewalDate} />
          </div>
        </div>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        {okMsg ? (
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {okMsg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "در حال ذخیره…" : "ذخیره تغییرات"}
        </button>
        <input type="hidden" value={expectedUpdatedAt} readOnly />
        <button
          type="button"
          className="mr-2 text-xs text-slate-500 underline"
          onClick={() => {
            setExpectedUpdatedAt(service.updated_at);
            router.refresh();
          }}
        >
          همگام‌سازی نسخه
        </button>
      </form>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">مراحل</h2>
        <ol className="space-y-2">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-800">
                  {m.sort_order}. {m.title}
                </p>
                <p className="text-xs text-slate-500">
                  {MILESTONE_STATUS_LABELS_FA[m.status]}
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    "pending",
                    "in_progress",
                    "blocked",
                    "completed",
                    "skipped",
                  ] as GrowthHubMilestoneStatus[]
                ).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={pending || m.status === s}
                    onClick={() => setMilestone(m.id, s)}
                    className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 disabled:opacity-40"
                  >
                    {MILESTONE_STATUS_LABELS_FA[s]}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
