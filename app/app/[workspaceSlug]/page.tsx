import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function WorkspaceIndexPage({
  params,
}: {
  params: { workspaceSlug: string };
}) {
  redirect(`/app/${params.workspaceSlug}/home`);
}
