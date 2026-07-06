"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import AiPostHogIdentify from "@/components/analytics/AiPostHogIdentify";
import { ArenaAuthProvider } from "./ArenaAuthContext";
import ArenaShell from "./ArenaShell";

/** قاب مشترک /ai — بدون شل برای لندینگ‌های فروش */
export default function ArenaLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/ai/content-sales")) {
    return <>{children}</>;
  }
  return (
    <ArenaAuthProvider>
      <AiPostHogIdentify />
      <Suspense fallback={<div className="ar-shell"><main className="ar-main">{children}</main></div>}>
        <ArenaShell>{children}</ArenaShell>
      </Suspense>
    </ArenaAuthProvider>
  );
}
