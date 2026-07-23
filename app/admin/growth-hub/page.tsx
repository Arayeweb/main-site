import Link from "next/link";
import { Building2, Users, MailPlus, Plus } from "lucide-react";
import { getGrowthHubStaffAccess } from "@/lib/growth-hub/staffAuth";
import { StaffDenied } from "@/components/growth-hub/admin/StaffDenied";

export const dynamic = "force-dynamic";

export default async function GrowthHubAdminDashboard() {
  const access = getGrowthHubStaffAccess();
  if (!access) return <StaffDenied />;
  const { service } = access;

  const [wsCount, memberCount, inviteCount] = await Promise.all([
    service
      .from("gh_workspaces")
      .select("id", { count: "exact", head: true })
      .neq("status", "archived"),
    service
      .from("gh_workspace_members")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    service
      .from("gh_workspace_invites")
      .select("id", { count: "exact", head: true })
      .is("accepted_at", null)
      .is("revoked_at", null),
  ]);

  const cards = [
    { label: "فضاهای کاری فعال", value: wsCount.count ?? 0, icon: Building2 },
    { label: "اعضای فعال", value: memberCount.count ?? 0, icon: Users },
    { label: "دعوت‌های در انتظار", value: inviteCount.count ?? 0, icon: MailPlus },
  ];

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">مرکز رشد آرایه</h1>
          <p className="mt-1 text-sm text-slate-500">
            مدیریت فضاهای کاری مشتریان، اعضا و دعوت‌ها.
          </p>
        </div>
        <Link
          href="/admin/growth-hub/workspaces/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          فضای کاری جدید
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">
              {value.toLocaleString("fa-IR")}
            </p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <Link
        href="/admin/growth-hub/workspaces"
        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800"
      >
        مشاهده همه فضاهای کاری ←
      </Link>
    </div>
  );
}
