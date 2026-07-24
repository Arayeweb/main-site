import Link from "next/link";
import { notFound } from "next/navigation";
import { getGrowthHubStaffAccess } from "@/lib/growth-hub/staffAuth";
import { StaffDenied } from "@/components/growth-hub/admin/StaffDenied";
import { StaffServiceEditor } from "@/components/growth-hub/admin/StaffServiceEditor";
import { uuidSchema } from "@/lib/growth-hub/validation";
import type {
  GrowthHubMilestoneStatus,
  GrowthHubServiceStatus,
} from "@/lib/growth-hub/database.types";
import { formatFaDateTime } from "@/lib/adminMappers";

export const dynamic = "force-dynamic";

export default async function AdminServiceDetailPage({
  params,
}: {
  params: { serviceId: string };
}) {
  const access = getGrowthHubStaffAccess();
  if (!access) return <StaffDenied />;
  if (!uuidSchema.safeParse(params.serviceId).success) notFound();

  const { data: service } = await access.service
    .from("gh_services")
    .select(
      "*, workspace:gh_workspaces(id, name, slug), template:gh_service_templates(id, key, title)",
    )
    .eq("id", params.serviceId)
    .maybeSingle();
  if (!service) notFound();

  const workspace = Array.isArray(service.workspace)
    ? service.workspace[0]
    : service.workspace;
  const template = Array.isArray(service.template)
    ? service.template[0]
    : service.template;

  const [{ data: milestones }, { data: activity }] = await Promise.all([
    access.service
      .from("gh_service_milestones")
      .select("id, title, status, sort_order")
      .eq("service_id", service.id)
      .order("sort_order", { ascending: true }),
    access.service
      .from("gh_activity_events")
      .select("id, event_type, created_at, metadata")
      .eq("workspace_id", service.workspace_id)
      .eq("entity_id", service.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <Link
          href="/admin/growth-hub/services"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          → بازگشت به فهرست خدمات
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">{service.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {workspace ? (
            <Link
              href={`/admin/growth-hub/workspaces/${workspace.id}`}
              className="hover:underline"
            >
              {workspace.name}
            </Link>
          ) : null}
          {template ? ` · قالب: ${template.title}` : null}
        </p>
      </div>

      <StaffServiceEditor
        service={{
          id: service.id,
          status: service.status as GrowthHubServiceStatus,
          progress: service.progress,
          latest_update: service.latest_update,
          next_action: service.next_action,
          waiting_reason: service.waiting_reason,
          start_date: service.start_date,
          due_date: service.due_date,
          renewal_date: service.renewal_date,
          updated_at: service.updated_at,
        }}
        milestones={(milestones ?? []).map((m) => ({
          id: m.id,
          title: m.title,
          status: m.status as GrowthHubMilestoneStatus,
          sort_order: m.sort_order,
        }))}
      />

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-bold text-slate-900">فعالیت اخیر</h2>
        {(activity ?? []).length ? (
          <ul className="space-y-2 text-sm text-slate-600">
            {activity!.map((a) => (
              <li key={a.id} className="flex justify-between gap-3 border-b border-slate-50 pb-2">
                <span>{a.event_type}</span>
                <span className="shrink-0 text-xs text-slate-400" dir="ltr">
                  {formatFaDateTime(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">هنوز رویدادی ثبت نشده است.</p>
        )}
      </section>
    </div>
  );
}
