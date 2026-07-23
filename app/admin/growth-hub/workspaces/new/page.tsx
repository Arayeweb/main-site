import Link from "next/link";
import { getGrowthHubStaffAccess } from "@/lib/growth-hub/staffAuth";
import { StaffDenied } from "@/components/growth-hub/admin/StaffDenied";
import { CreateWorkspaceForm } from "@/components/growth-hub/admin/CreateWorkspaceForm";

export const dynamic = "force-dynamic";

export default function NewWorkspacePage() {
  const access = getGrowthHubStaffAccess();
  if (!access) return <StaffDenied />;

  return (
    <div dir="rtl" className="space-y-6">
      <div>
        <Link
          href="/admin/growth-hub/workspaces"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          → بازگشت به فهرست
        </Link>
        <h1 className="mt-2 text-xl font-bold text-slate-900">فضای کاری جدید</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <CreateWorkspaceForm />
      </div>
    </div>
  );
}
