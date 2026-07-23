"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createInviteAction } from "@/lib/growth-hub/actions/staff";
import type { GrowthHubInviteRole } from "@/lib/growth-hub/database.types";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500";

export function InviteMemberForm({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<GrowthHubInviteRole>("client_owner");
  const [expiry, setExpiry] = useState(7);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await createInviteAction({
        workspace_id: workspaceId,
        email,
        role,
        expiry_days: expiry,
      });
      if (!result.ok) {
        setMessage({ ok: false, text: result.error });
        return;
      }
      setMessage({ ok: true, text: "دعوت ارسال شد." });
      setEmail("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} dir="rtl" className="space-y-3">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-700">ایمیل</label>
          <input
            className={inputClass}
            type="email"
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
          اعتبار (روز)
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
        className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {pending ? "در حال ارسال…" : "ارسال دعوت"}
      </button>
    </form>
  );
}
