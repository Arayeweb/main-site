// =====================================================
// lib/notifyAdmin.ts
// ارسال نوتیفیکیشن ساده به ادمین در تلگرام (بدون وابستگی به جریان چت‌بات).
// برای فالوآپ/لید داغ کارت ویزیت استفاده می‌شود. اگر توکن یا چت‌آی‌دی
// تنظیم نشده باشد بی‌صدا رد می‌شود (هرگز خطا پرتاب نمی‌کند).
// =====================================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** پیام متنی برای ادمین می‌فرستد. در صورت نبود تنظیمات، false برمی‌گرداند. */
export async function notifyAdmin(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: Number(ADMIN_CHAT_ID),
        text: escapeHtml(text),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
    return res.ok;
  } catch (e) {
    console.error("[notifyAdmin] error:", e);
    return false;
  }
}
