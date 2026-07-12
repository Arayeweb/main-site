import { sendEmail } from "@/lib/resend";
import { recommendedServiceLabels } from "./constants";
import type { RecommendedService, WebsiteBriefInput } from "./types";
import { primaryConversionGoalOptions, primaryBusinessProblemOptions } from "./constants";

const NOTIFY_TO = process.env.WEBSITE_BRIEF_NOTIFY_EMAIL ?? process.env.ADMIN_NOTIFY_EMAIL ?? "support@araaye.com";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://araaye.com";

function labelForGoal(value: string): string {
  return primaryConversionGoalOptions.find((o) => o.value === value)?.label ?? value;
}

function labelForProblem(value: string): string {
  return primaryBusinessProblemOptions.find((o) => o.value === value)?.label ?? value;
}

export async function notifyWebsiteBriefSubmitted(opts: {
  submissionId: string;
  input: WebsiteBriefInput;
  recommendedService: RecommendedService;
}): Promise<void> {
  const { submissionId, input, recommendedService } = opts;
  const adminUrl = `${SITE_URL}/admin/sales/website-briefs/${submissionId}`;

  const html = `
    <div dir="rtl" style="font-family:Tahoma,sans-serif;line-height:1.7">
      <h2>فرم جدید شروع پروژه طراحی سایت</h2>
      <p><strong>نام مشتری:</strong> ${escapeHtml(input.contact_name)}</p>
      <p><strong>شماره تماس:</strong> ${escapeHtml(input.contact_phone)}</p>
      <p><strong>نام کسب‌وکار:</strong> ${escapeHtml(input.business_name)}</p>
      <p><strong>هدف سایت:</strong> ${escapeHtml(labelForGoal(input.primary_conversion_goal))}</p>
      <p><strong>مشکل اصلی:</strong> ${escapeHtml(labelForProblem(input.primary_business_problem))}</p>
      <p><strong>خدمت مکمل پیشنهادی:</strong> ${escapeHtml(recommendedServiceLabels[recommendedService])}</p>
      <p><a href="${adminUrl}">مشاهده در پنل</a></p>
    </div>
  `;

  const text = [
    "فرم جدید شروع پروژه طراحی سایت",
    `نام: ${input.contact_name}`,
    `موبایل: ${input.contact_phone}`,
    `کسب‌وکار: ${input.business_name}`,
    `هدف: ${labelForGoal(input.primary_conversion_goal)}`,
    `پیشنهاد: ${recommendedServiceLabels[recommendedService]}`,
    adminUrl,
  ].join("\n");

  await sendEmail({
    to: NOTIFY_TO,
    subject: `بریف طراحی سایت — ${input.business_name}`,
    html,
    text,
    idempotencyKey: `website-brief-${submissionId}`,
    tags: [{ name: "type", value: "website_brief" }],
  }).catch((e) => {
    console.error("[websiteBrief/notify]", e);
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
