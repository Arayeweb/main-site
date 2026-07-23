import Link from "next/link";
import { Plus } from "lucide-react";
import { getGrowthHubStaffAccess } from "@/lib/growth-hub/staffAuth";
import { StaffDenied } from "@/components/growth-hub/admin/StaffDenied";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  active: "فعال",
  suspended: "معلق",
  archived: "بایگانی",
};

export default async function GrowthHubWorkspacesPage() {
  const access = getGrowthHubStaffAccess();
  if (!access) return <StaffDenied />;
  const { service } = access;

  const { data: workspaces } = await service
    .from("gh_workspaces")
    .select("id, name, slug, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const list = workspaces ?? [];

  return (
    <div dir="rtl" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">فضاهای کاری</h1>
        <Link
          href="/admin/growth-hub/workspaces/new"
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          فضای کاری جدید
        </Link>
      </div>

      {list.length ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">نام</th>
                <th className="px-4 py-3 font-semibold">نشانی</th>
                <th className="px-4 py-3 font-semibold">وضعیت</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((ws) => (
                <tr key={ws.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {ws.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500" dir="ltr">
                    /app/{ws.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {STATUS_LABELS[ws.status] ?? ws.status}
                  </td>
                  <td className="px-4 py-3 text-left">
                    <Link
                      href={`/admin/growth-hub/workspaces/${ws.id}`}
                      className="text-sm font-semibold text-teal-700 hover:text-teal-800"
                    >
                      مدیریت
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="mb-1 font-bold text-slate-900">اولین فضای کاری را بسازید</p>
          <p className="text-sm text-slate-500">
            هنوز هیچ فضای کاری‌ای ثبت نشده است.
          </p>
        </div>
      )}
    </div>
  );
}
