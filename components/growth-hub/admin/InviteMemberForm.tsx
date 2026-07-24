"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  createInviteAction,
  sendInviteSmsAction,
} from "@/lib/growth-hub/actions/staff";
import type { GrowthHubInviteRole } from "@/lib/growth-hub/database.types";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";

export function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<GrowthHubInviteRole>("client_owner");
  const [expiry, setExpiry] = useState(7);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [created, setCreated] = useState<{
    inviteId: string;
    inviteUrl: string;
    phoneMasked: string;
  } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    setCreated(null);
    startTransition(async () => {
      const result = await createInviteAction({
        workspace_id: workspaceId,
        phone,
        role,
        expiry_days: expiry,
      });
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setCreated(result.data);
      setMessage({ ok: true, text: "دعوت ساخته شد." });
      setPhone("");
      router.refresh();
    });
  }

  function copyLink() {
    if (!created?.inviteUrl) return;
    void navigator.clipboard.writeText(created.inviteUrl);
    setMessage({ ok: true, text: "لینک دعوت کپی شد." });
  }

  function sendSms() {
    if (!created) return;
    setMessage(null);
    startTransition(async () => {
      const result = await sendInviteSmsAction({
        workspace_id: workspaceId,
        invite_id: created.inviteId,
        invite_url: created.inviteUrl,
      });
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setMessage({ ok: true, text: "پیامک دعوت ارسال شد." });
    });
  }

  return (
    <div dir="rtl" className="space-y-3">
      {message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            message.ok
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {created ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
          <p className="text-sm font-semibold text-slate-800">دعوت ساخته شد</p>
          <p className="text-xs text-slate-500" dir="ltr">
            {created.phoneMasked}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sendSms}
              disabled={pending}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              ارسال پیامک
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
            >
              کپی لینک
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            لینک فقط همین‌جا در دسترس است و در دیتابیس ذخیره نمی‌شود.
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">
              شماره موبایل
            </label>
            <input
              className={inputClass}
              type="tel"
              inputMode="tel"
              dir="ltr"
              placeholder="0912 968 7180"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">نقش</label>
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value as GrowthHubInviteRole)}
            >
              <option value="client_owner">مالک فضای کاری</option>
              <option value="client_member">عضو فضای کاری</option>
            </select>
          </div>
        </div>

        <div className="w-40">
          <label className="mb-1.5 block text-xs font-bold text-slate-700">
            اعتبار دعوت (روز)
          </label>
          <input
            className={inputClass}
            type="number"
            min={1}
            max={30}
            value={expiry}
            onChange={(e) => setExpiry(Number(e.target.value))}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? "در حال ساخت…" : "ساخت و ارسال دعوت"}
        </button>
      </form>
    </div>
  );
}
