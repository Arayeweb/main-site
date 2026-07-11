import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADREADY_COOKIE, verifyAdReadyToken } from "@/lib/adreadySession";
import {
  parseAdReadyAuthMode,
  resolveAdReadyAuthRedirect,
  sanitizeNextParam,
} from "@/lib/adreadyAuth";
import AdReadyAuthGate from "@/components/adready/AdReadyAuthGate";
import "../adready.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ورود | کمپین‌ساز آرایه",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function AdReadyLoginPage({ searchParams }: PageProps) {
  const modeRaw = searchParams.mode;
  const nextRaw = searchParams.next;
  const mode = parseAdReadyAuthMode(Array.isArray(modeRaw) ? modeRaw[0] : modeRaw);
  const nextPath = sanitizeNextParam(Array.isArray(nextRaw) ? nextRaw[0] : nextRaw);

  const token = cookies().get(ADREADY_COOKIE)?.value;
  const session = token ? verifyAdReadyToken(token) : null;
  if (session) {
    redirect(resolveAdReadyAuthRedirect(mode, nextPath));
  }

  return (
    <div className="adready-page adready-auth-page" dir="rtl">
      <AdReadyAuthGate initialMode={mode} nextPath={nextPath} />
    </div>
  );
}
