import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADREADY_COOKIE, verifyAdReadyToken } from "@/lib/adreadySession";
import { buildAdReadyLoginUrl } from "@/lib/adreadyAuth";
import AdReadyWizard from "./AdReadyWizard";
import "./wizard.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "ساخت صفحه کمپین | کمپین‌ساز آرایه",
  robots: { index: false, follow: false },
};

export default function NewAdReadyCampaignPage() {
  const token = cookies().get(ADREADY_COOKIE)?.value;
  const session = token ? verifyAdReadyToken(token) : null;
  if (!session) {
    redirect(buildAdReadyLoginUrl({ mode: "register", next: "/dashboard/adready/new" }));
  }

  return <AdReadyWizard />;
}
