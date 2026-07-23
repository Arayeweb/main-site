import "server-only";

import { sendEmail } from "@/lib/resend";

// Growth Hub invitation email via the existing Resend infrastructure.
// The raw token appears ONLY inside the invite URL (never logged, never stored).

export async function sendGrowthHubInviteEmail(params: {
  to: string;
  workspaceName: string;
  inviteUrl: string;
}): Promise<{ ok: boolean }> {
  const { to, workspaceName, inviteUrl } = params;

  const subject = `دعوت به فضای کاری «${workspaceName}» در مرکز رشد آرایه`;

  const html = `
<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;line-height:1.9;color:#1c1917">
  <h2 style="margin:0 0 12px">دعوت به مرکز رشد آرایه</h2>
  <p style="margin:0 0 12px">
    شما برای همکاری در فضای کاری <strong>${escapeHtml(workspaceName)}</strong>
    دعوت شده‌اید.
  </p>
  <p style="margin:0 0 20px">برای پذیرش دعوت و ورود، روی دکمه زیر بزنید:</p>
  <p style="margin:0 0 20px">
    <a href="${escapeAttr(inviteUrl)}"
       style="display:inline-block;background:#0f766e;color:#fff;text-decoration:none;
              padding:12px 22px;border-radius:10px;font-weight:700">
      پذیرش دعوت
    </a>
  </p>
  <p style="margin:0 0 4px;font-size:12px;color:#78716c">
    این لینک تا زمان مشخص‌شده معتبر است و فقط یک‌بار قابل استفاده است.
  </p>
  <p style="margin:0;font-size:12px;color:#78716c">
    اگر انتظار این دعوت را نداشتید، این ایمیل را نادیده بگیرید.
  </p>
</div>`.trim();

  const text = [
    `دعوت به فضای کاری «${workspaceName}» در مرکز رشد آرایه`,
    "",
    "برای پذیرش دعوت این لینک را باز کنید:",
    inviteUrl,
    "",
    "این لینک محدود و یک‌بار مصرف است.",
  ].join("\n");

  const result = await sendEmail({ to, subject, html, text });
  return { ok: result.ok };
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(input: string): string {
  return escapeHtml(input).replace(/'/g, "&#39;");
}
