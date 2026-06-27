import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, type AdminRole } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SALES_ROLES: AdminRole[] = ["sales", "admin"];

// عملکرد کارشناس‌های فروش: تعداد لید، فعال، موفق/ناموفق و نرخ تبدیل هر نفر.
export async function GET(req: NextRequest) {
  const session = getSession(req);
  if (!session || !SALES_ROLES.includes(session.role)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const [leadsRes, usersRes] = await Promise.all([
      supabase.from("leads").select("owner_id, crm_status, created_at"),
      supabase
        .from("admin_users")
        .select("id, name, email, role")
        .in("role", ["sales", "admin"]),
    ]);

    if (leadsRes.error) {
      console.error("[api/sales/performance] error:", leadsRes.error.message);
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const leads = (leadsRes.data || []) as Record<string, unknown>[];
    const users = (usersRes.data || []) as Record<string, unknown>[];
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    type Row = {
      owner_id: string | null;
      name: string;
      total: number;
      active: number;
      won: number;
      lost: number;
      won_this_month: number;
    };
    const rows = new Map<string, Row>();

    const ensure = (id: string | null, name: string): Row => {
      const key = id || "__unassigned__";
      let r = rows.get(key);
      if (!r) {
        r = { owner_id: id, name, total: 0, active: 0, won: 0, lost: 0, won_this_month: 0 };
        rows.set(key, r);
      }
      return r;
    };

    // ابتدا همهٔ کاربران را با مقدار صفر ثبت کن تا در گزارش دیده شوند.
    for (const u of users) {
      ensure(u.id as string, (u.name as string) || (u.email as string) || "—");
    }
    ensure(null, "بدون مالک");

    for (const l of leads) {
      const id = (l.owner_id as string) || null;
      const known = id ? rows.get(id) : rows.get("__unassigned__");
      const r = known || ensure(id, "حذف‌شده");
      r.total++;
      const status = (l.crm_status as string) || "new";
      if (status === "won") {
        r.won++;
        if (now - new Date(l.created_at as string).getTime() < monthMs) r.won_this_month++;
      } else if (status === "lost") {
        r.lost++;
      } else {
        r.active++;
      }
    }

    const team = Array.from(rows.values())
      .map((r) => {
        const closed = r.won + r.lost;
        return { ...r, win_rate: closed > 0 ? Math.round((r.won / closed) * 100) : 0 };
      })
      .filter((r) => r.total > 0 || r.owner_id !== null) // ردیف «بدون مالک» فقط اگر لید دارد
      .filter((r) => !(r.owner_id === null && r.total === 0))
      .sort((a, b) => b.won - a.won || b.total - a.total);

    return NextResponse.json({ ok: true, team });
  } catch (e) {
    console.error("[api/sales/performance] error:", e);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
