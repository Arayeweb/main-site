import { cookies } from "next/headers";
import { AI_COOKIE, verifyAIToken } from "@/lib/aiAuth";
import ArenaHomePage from "./ArenaHomePage";

export const dynamic = "force-dynamic";

export default function AIPage() {
  const token = cookies().get(AI_COOKIE)?.value;
  const session = verifyAIToken(token);
  const initialAuthBoot = session ? ("user" as const) : ("guest" as const);

  return <ArenaHomePage initialAuthBoot={initialAuthBoot} />;
}
