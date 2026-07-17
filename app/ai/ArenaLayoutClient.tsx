"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import AiPostHogIdentify from "@/components/analytics/AiPostHogIdentify";
import { ArenaAuthProvider } from "./ArenaAuthContext";
import ArenaAuthSheet from "./ArenaAuthSheet";
import ArenaShell from "./ArenaShell";

/** قاب مشترک /ai — بدون شل برای لندینگ‌های فروش */
export default function ArenaLayoutClient({
  children,
  initialAuthed,
  initialUserId,
  initialPlan,
}: {
  children: React.ReactNode;
  initialAuthed: boolean;
  initialUserId: string | null;
  initialPlan: string;
}) {
  const pathname = usePathname();
  const isContentIntent =
    pathname === "/ai/content" || pathname.startsWith("/ai/content/");
  if (
    pathname.startsWith("/ai/content-sales") ||
    pathname.startsWith("/ai/features") ||
    pathname.startsWith("/ai/better-than-one-ai") ||
    pathname.startsWith("/ai/compare") ||
    pathname.startsWith("/ai/chatgpt") ||
    pathname.startsWith("/ai/claude") ||
    pathname.startsWith("/ai/programming") ||
    pathname.startsWith("/ai/students") ||
    isContentIntent
  ) {
    return <>{children}</>;
  }
  return (
    <ArenaAuthProvider
      initialAuthed={initialAuthed}
      initialUserId={initialUserId}
      initialPlan={initialPlan}
    >
      <AiPostHogIdentify />
      <ArenaAuthSheet />
      <Suspense fallback={<div className="ar-shell"><main className="ar-main">{children}</main></div>}>
        <ArenaShell>{children}</ArenaShell>
      </Suspense>
    </ArenaAuthProvider>
  );
}
