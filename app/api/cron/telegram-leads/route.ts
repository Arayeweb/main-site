import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const GROUP_CHAT_ID = process.env.TELEGRAM_GROUP_CHAT_ID;
const CRON_SECRET = process.env.TELEGRAM_CRON_SECRET;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fa-IR", { timeZone: "Asia/Tehran" });
  } catch {
    return iso;
  }
}

function buildLeadMessage(lead: Record<string, unknown>): string {
  const lines: string[] = [];
  lines.push("🔔 لید جدید");
  lines.push("");

  if (lead.name) lines.push(`👤 نام: ${escapeHtml(String(lead.name))}`);
  if (lead.contact) lines.push(`📞 تماس: ${escapeHtml(String(lead.contact))}`);
  if (lead.source) lines.push(`📊 منبع: ${escapeHtml(String(lead.source))}`);
  if (lead.page) lines.push(`📄 صفحه: ${escapeHtml(String(lead.page))}`);
  if (lead.goal) lines.push(`🎯 هدف: ${escapeHtml(String(lead.goal))}`);
  if (lead.budget) lines.push(`💰 بودجه: ${escapeHtml(String(lead.budget))}`);
  if (lead.plan) lines.push(`📦 پلن: ${escapeHtml(String(lead.plan))}`);
  if (lead.sitetype) lines.push(`🏪 نوع کسب‌وکار: ${escapeHtml(String(lead.sitetype))}`);
  if (lead.intent) lines.push(`💡 قصد: ${escapeHtml(String(lead.intent))`);
  if (lead.detail) lines.push(`📝 جزئیات: ${escapeHtml(String(lead.detail).slice(0, 500))}`);

  if (lead.utm_source) lines.push(`🔗 UTM: ${escapeHtml(String(lead.utm_source))}`);

  lines.push("");
  lines.push(`🕐 ${escapeHtml(fmtDate(String(lead.created_at)))}`);

  return lines.join("\n");
}

async function sendToTelegram(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !GROUP_CHAT_ID) return false;
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: Number(GROUP_CHAT_ID),
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch (e) {
    console.error("[cron/telegram-leads] sendMessage error:", e);
    return false;
  }
}

// GET /api/cron/telegram-leads?secret=XXX
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!CRON_SECRET || secret !== CRON_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  if (!BOT_TOKEN || !GROUP_CHAT_ID) {
    return NextResponse.json(
      { ok: false, error: "missing_telegram_config" },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // لیدهایی که هنوز به تلگرام ارسال نشده‌اند
    const { data: newLeads, error: fetchErr } = await supabase
      .from("leads")
      .select(
        "id, created_at, source, page, name, contact, goal, budget, plan, sitetype, intent, detail, utm_source"
      )
      .is("telegram_notified_at", null)
      .order("created_at", { ascending: true })
      .limit(20);

    if (fetchErr) {
      console.error("[cron/telegram-leads] fetch error:", fetchErr.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    if (!newLeads || newLeads.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: "no new leads" });
    }

    let sent = 0;
    let failed = 0;

    for (const lead of newLeads) {
      const text = buildLeadMessage(lead);
      const ok = await sendToTelegram(text);

      if (ok) {
        await supabase
          .from("leads")
          .update({ telegram_notified_at: new Date().toISOString() })
          .eq("id", lead.id);
        sent++;
      } else {
        failed++;
      }

      // فاصلهٔ کوتاه بین پیام‌ها برای جلوگیری از rate-limit تلگرام
      await new Promise((r) => setTimeout(r, 300));
    }

    return NextResponse.json({
      ok: true,
      sent,
      failed,
      total: newLeads.length,
    });
  } catch (e) {
    console.error("[cron/telegram-leads] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
