import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAIToken } from "@/lib/aiAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get("ary_ai_session")?.value;
  const session = verifyAIToken(token);

  if (!session) {
    redirect("/ai/auth");
  }

  return <>{children}</>;
}
