// =====================================================
// lib/resend.ts
// ارسال ایمیل با Resend — آدرس پیش‌فرض: support@araaye.com
// اگر RESEND_API_KEY تنظیم نشده باشد بی‌صدا false برمی‌گرداند.
// =====================================================

import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY;
const DEFAULT_FROM = process.env.RESEND_FROM ?? "آرایه <support@araaye.com>";

let client: Resend | null = null;

function getResend(): Resend | null {
  if (!API_KEY) return null;
  if (!client) client = new Resend(API_KEY);
  return client;
}

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
};

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** ایمیل می‌فرستد. در صورت نبود RESEND_API_KEY، { ok: false } برمی‌گرداند. */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "resend_not_configured" };
  }

  const { data, error } = await resend.emails.send(
    {
      from: options.from ?? DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
      tags: options.tags,
    },
    options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : undefined,
  );

  if (error) {
    console.error("[sendEmail]", error);
    return { ok: false, error: error.message };
  }

  return { ok: true, id: data!.id };
}

/** آدرس فرستنده پیش‌فرض (support@araaye.com) */
export const defaultFromAddress = DEFAULT_FROM;
