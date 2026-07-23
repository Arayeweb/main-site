import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// /app → workspace selector (which redirects to login if unauthenticated).
export default function AppIndexPage() {
  redirect("/app/select-workspace");
}
