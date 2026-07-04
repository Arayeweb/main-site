"use client";

import { usePathname } from "next/navigation";
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
      <ArenaShell>{children}</ArenaShell>
    </ArenaAuthProvider>
  );
}
