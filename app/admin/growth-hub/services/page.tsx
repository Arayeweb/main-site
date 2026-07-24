import Link from "next/link";
import { getGrowthHubStaffAccess } from "@/lib/growth-hub/staffAuth";
import { StaffDenied } from "@/components/growth-hub/admin/StaffDenied";
import { SERVICE_STATUS_LABELS_FA } from "@/lib/growth-hub/services/status";
import type { GrowthHubServiceStatus } from "@/lib/growth-hub/database.types";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const access = getGrowthHubStaffAccess();
  if (!access) return <StaffDenied />;

  const { data: services } = await access.service
    .from("gh_services")
    .select(
      "id, title, status, progress, updated_at, workspace:gh_workspaces(id, name, slug)",
    )
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div dir="rtl" className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">خدمات مرکز رشد</h1>
        <p className="mt-1 text-sm text-slate-500">
          مدیریت نمونه‌های خدمت مشتریان. برای ساخت خدمت جدید به صفحه فضای کاری بروید.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">عنوان</th>
              <th className="px-4 py-3 font-semibold">فضای کاری</th>
              <th className="px-4 py-3 font-semibold">وضعیت</th>
              <th className="px-4 py-3 font-semibold">پیشرفت</th>
              <th className="px-4 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody>
            {(services ?? []).map((s) => {
              const ws = Array.isArray(s.workspace) ? s.workspace[0] : s.workspace;
              return (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{s.title}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {ws ? (
                      <Link
                        href={`/admin/growth-hub/workspaces/${ws.id}`}
                        className="hover:underline"
                      >
                        {ws.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {SERVICE_STATUS_LABELS_FA[s.status as GrowthHubServiceStatus]}
                  </td>
                  <td className="px-4 py-3">{s.progress}٪</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/growth-hub/services/${s.id}`}
                      className="text-teal-700 hover:underline"
                    >
                      مدیریت
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!services?.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  هنوز خدمتی ثبت نشده است.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
