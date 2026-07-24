import Link from "next/link";
import { notFound } from "next/navigation";
import { getGrowthHubStaffAccess } from "@/lib/growth-hub/staffAuth";
import { StaffDenied } from "@/components/growth-hub/admin/StaffDenied";
import { InviteMemberForm } from "@/components/growth-hub/admin/InviteMemberForm";
import { CreateServiceForm } from "@/components/growth-hub/admin/CreateServiceForm";
import { RowActionButton } from "@/components/growth-hub/admin/RowActionButton";
import { ROLE_LABELS_FA } from "@/lib/growth-hub/permissions";
import { SERVICE_STATUS_LABELS_FA } from "@/lib/growth-hub/services/status";
import { listActiveTemplates } from "@/lib/growth-hub/services/mutations";
import { uuidSchema } from "@/lib/growth-hub/validation";
import type {
  GrowthHubMemberRole,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";

export const dynamic = "force-dynamic";

const MEMBER_STATUS_LABELS: Record<string, string> = {
  invited: "دعوت‌شده",
  active: "فعال",
  removed: "حذف‌شده",
};

function inviteState(inv: {
  accepted_at: string | null;
  revoked_at: string | null;
  expires_at: string;
}): string {
  if (inv.accepted_at) return "پذیرفته‌شده";
  if (inv.revoked_at) return "لغو‌شده";
  if (new Date(inv.expires_at) <= new Date()) return "منقضی";
  return "در انتظار";
}

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { workspaceId: string };
}) {
  const access = getGrowthHubStaffAccess();
  if (!access) return <StaffDenied />;
  const { service } = access;

  if (!uuidSchema.safeParse(params.workspaceId).success) notFound();

  const { data: workspace } = await service
    .from("gh_workspaces")
    .select("id, name, slug, status, industry, website_url, created_at")
    .eq("id", params.workspaceId)
    .maybeSingle();
  if (!workspace) notFound();

  const [{ data: members }, { data: invites }, { data: services }, templates] =
    await Promise.all([
      service
        .from("gh_workspace_members")
        .select("id, role, status, joined_at, user:gh_profiles(full_name)")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: true }),
      service
        .from("gh_workspace_invites")
        .select(
          "id, email, phone, invited_phone_e164, role, expires_at, accepted_at, revoked_at, created_at",
        )
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false }),
      service
        .from("gh_services")
        .select("id, title, status, progress, updated_at")
        .eq("workspace_id", workspace.id)
        .order("created_at", { ascending: false }),
      listActiveTemplates(service),
    ]);

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <Link
          href="/admin/growth-hub/workspaces"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          → بازگشت به فهرست
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{workspace.name}</h1>
        <p className="mt-1 font-mono text-xs text-slate-500" dir="ltr">
          /app/{workspace.slug}/home
        </p>
      </div>

      {/* Members */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">اعضا</h2>
        {members && members.length ? (
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="pb-2 font-semibold">نام</th>
                <th className="pb-2 font-semibold">نقش</th>
                <th className="pb-2 font-semibold">وضعیت</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => {
                const profile = m.user as unknown as { full_name: string | null } | null;
                return (
                  <tr key={m.id}>
                    <td className="py-2.5 font-medium text-slate-800">
                      {profile?.full_name || "—"}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {ROLE_LABELS_FA[m.role as GrowthHubMemberRole]}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {MEMBER_STATUS_LABELS[m.status] ?? m.status}
                    </td>
                    <td className="py-2.5 text-left">
                      {m.status === "active" ? (
                        <RowActionButton
                          kind="deactivateMember"
                          workspaceId={workspace.id}
                          targetId={m.id}
                          label="غیرفعال‌سازی"
                          confirmText="این عضو غیرفعال شود؟ دسترسی او قطع می‌شود."
                        />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">هنوز عضوی ندارد.</p>
        )}
      </section>

      {/* Services */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-slate-900">خدمات</h2>
          <Link
            href="/admin/growth-hub/services"
            className="text-xs text-teal-700 hover:underline"
          >
            همه خدمات
          </Link>
        </div>
        {services && services.length ? (
          <ul className="mb-5 space-y-2">
            {services.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/growth-hub/services/${s.id}`}
                    className="font-medium text-slate-800 hover:underline"
                  >
                    {s.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {SERVICE_STATUS_LABELS_FA[s.status as GrowthHubServiceStatus]} ·{" "}
                    {s.progress}٪
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-5 text-sm text-slate-500">هنوز خدمتی برای این فضا ثبت نشده.</p>
        )}
        <h3 className="mb-3 text-xs font-bold text-slate-700">ساخت خدمت از قالب</h3>
        <CreateServiceForm
          workspaceId={workspace.id}
          templates={templates.map((t) => ({
            id: t.id,
            key: t.key,
            title: t.title,
          }))}
        />
      </section>

      {/* Invite form */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">دعوت عضو جدید</h2>
        <InviteMemberForm workspaceId={workspace.id} />
      </section>

      {/* Invites */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-900">دعوت‌ها</h2>
        {invites && invites.length ? (
          <table className="w-full text-right text-sm">
            <thead className="text-xs text-slate-500">
              <tr>
                <th className="pb-2 font-semibold">مخاطب</th>
                <th className="pb-2 font-semibold">نقش</th>
                <th className="pb-2 font-semibold">وضعیت</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invites.map((inv) => {
                const state = inviteState(inv);
                const pending = state === "در انتظار";
                return (
                  <tr key={inv.id}>
                    <td className="py-2.5 text-slate-800" dir="ltr">
                      {inv.invited_phone_e164
                        ? `${String(inv.invited_phone_e164).replace(/\D/g, "").slice(-10, -6) || "****"}•••${String(inv.invited_phone_e164).slice(-4)}`
                        : inv.phone ?? inv.email ?? "—"}
                    </td>
                    <td className="py-2.5 text-slate-600">
                      {ROLE_LABELS_FA[inv.role as GrowthHubMemberRole]}
                    </td>
                    <td className="py-2.5 text-slate-600">{state}</td>
                    <td className="py-2.5 text-left">
                      {pending ? (
                        <RowActionButton
                          kind="revokeInvite"
                          workspaceId={workspace.id}
                          targetId={inv.id}
                          label="لغو"
                          confirmText="این دعوت لغو شود؟"
                        />
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-sm text-slate-500">دعوتی ثبت نشده است.</p>
        )}
      </section>
    </div>
  );
}
