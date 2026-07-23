"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deactivateMemberAction,
  revokeInviteAction,
} from "@/lib/growth-hub/actions/staff";

type Kind = "deactivateMember" | "revokeInvite";

export function RowActionButton({
  kind,
  workspaceId,
  targetId,
  label,
  confirmText,
}: {
  kind: Kind;
  workspaceId: string;
  targetId: string;
  label: string;
  confirmText: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const result =
        kind === "deactivateMember"
          ? await deactivateMemberAction({
              workspace_id: workspaceId,
              member_id: targetId,
            })
          : await revokeInviteAction({
              workspace_id: workspaceId,
              invite_id: targetId,
            });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        {pending ? "…" : label}
      </button>
      {error ? <span className="text-[11px] text-red-500">{error}</span> : null}
    </span>
  );
}
