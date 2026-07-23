import Link from "next/link";
import type { GrowthToolName } from "@/lib/analytics/growthToolsEvents";

const CTA_BY_TOOL: Record<
  GrowthToolName,
  { title: string; body: string; primary: { href: string; label: string }; secondary: { href: string; label: string } }
> = {
  review_link: {
    title: "بعد از لینک نظر، پروفایل را کامل کنید",
    body: "لینک نظر فقط یکی از پایه‌هاست. برای ثبت، اصلاح و بهینه‌سازی گوگل مپ می‌توانید از سرویس آرایه استفاده کنید.",
    primary: { href: "/googlesabt", label: "پکیج ثبت گوگل مپ" },
    secondary: { href: "/local-seo-check", label: "تست سئو محلی" },
  },
  local_seo_check: {
    title: "می‌خواهید اصلاحات را تیم آرایه انجام دهد؟",
    body: "اگر امتیاز پایین است یا زمان اجرا ندارید، تحلیل رایگان سایت و مسیر ثبت/سئو محلی را ببینید.",
    primary: { href: "/free-seo-audit", label: "تحلیل رایگان سایت" },
    secondary: { href: "/googlesabt", label: "ثبت و بهینه‌سازی گوگل مپ" },
  },
  seo_roi: {
    title: "اگر ROI مثبت بود، قدم بعدی مشخص است",
    body: "با تحلیل رایگان وضعیت فعلی سایت را ببینید یا صفحه سئو صنف خود را برای مسیر اجرایی باز کنید.",
    primary: { href: "/free-seo-audit", label: "درخواست تحلیل رایگان" },
    secondary: { href: "/seo", label: "خدمات سئو آرایه" },
  },
};

export default function GrowthToolServiceCta({
  tool,
  industry,
}: {
  tool: GrowthToolName;
  industry?: string;
}) {
  const copy = CTA_BY_TOOL[tool];
  const primaryHref =
    tool === "seo_roi" &&
    industry &&
    ["doctor", "clinic", "dentist", "lawyer", "beauty-clinic"].includes(industry)
      ? `/seo/${industry}`
      : copy.primary.href;
  const secondaryHref =
    tool === "review_link" && industry && industry !== "general"
      ? `/local-seo-check/${industry}`
      : copy.secondary.href;

  return (
    <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
      <p className="text-sm font-extrabold text-navy-900">{copy.title}</p>
      <p className="mt-2 text-xs leading-6 text-navy-600">{copy.body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={primaryHref}
          className="inline-flex rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700"
        >
          {copy.primary.label}
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-700 hover:border-brand-300"
        >
          {copy.secondary.label}
        </Link>
      </div>
    </div>
  );
}
