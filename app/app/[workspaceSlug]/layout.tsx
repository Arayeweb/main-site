import { requireWorkspaceMembership } from "@/lib/growth-hub/auth";

export const dynamic = "force-dynamic";

// Defense in depth: enforce active membership for the whole workspace subtree.
// RLS is the source of truth; this guarantees unauthorized users never render
// any workspace page even before a page-level check.
export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}) {
  await requireWorkspaceMembership(params.workspaceSlug);
  return children;
}
