import { NextRequest, NextResponse } from "next/server";
import { settlePaymentByTrackId } from "@/lib/telegram/payment";
import { getTelegramConfig } from "@/lib/telegram/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const trackId = sp.get("trackId");
  const status = sp.get("status");
  const success = sp.get("success");
  const { botUsername } = getTelegramConfig();

  if (!trackId) {
    return new NextResponse(html("خطا در پرداخت", "شناسه پرداخت یافت نشد."), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const result = await settlePaymentByTrackId(trackId, status, success);

  const title = result.ok ? "پرداخت موفق" : "پرداخت ناموفق";
  const body = result.ok
    ? "اعتبار به حساب شما اضافه شد. به تلگرام برگرد و دوباره سوالت را بفرست."
    : "پرداخت تأیید نشد. اگر مبلغ کم شده با پشتیبانی تماس بگیر.";

  const botLink = `https://t.me/${botUsername.replace("@", "")}`;

  return new NextResponse(
    html(title, `${body}<br><br><a href="${botLink}">بازگشت به تلگرام</a>`),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function html(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;padding:20px;line-height:1.7}a{color:#2563eb}</style>
</head><body><h1>${title}</h1><p>${body}</p></body></html>`;
}
