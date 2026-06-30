import { cookies } from "next/headers";
import Link from "next/link";
import { verifyAIToken } from "@/lib/aiAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { IconBolt, IconSpark, IconSeal, IconPlus, IconArrowRight } from "../icons";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

export default async function DashboardPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("ary_ai_session")?.value;
  const session = verifyAIToken(token);
  if (!session) return null;

  const supabase = getSupabaseAdmin();

  const [userRes, convRes] = await Promise.all([
    supabase
      .from("ai_users")
      .select("plan, credits, brainstorm_demos")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("ai_conversations")
      .select("id, title, mode, updated_at")
      .eq("user_id", session.userId)
      .order("updated_at", { ascending: false })
      .limit(6),
  ]);

  const user = userRes.data;
  const conversations = convRes.data ?? [];

  const planLabel =
    user?.plan === "pro"
      ? "Pro"
      : user?.plan === "business"
      ? "Business"
      : "رایگان";

  return (
    <div className="ai-app-shell">
      {/* Header */}
      <header className="ai-app-header">
        <div className="ai-container ai-app-header-inner">
          <Link href="/ai/app" className="ai-app-logo">
            آرایه <span>AI</span>
          </Link>
          <div className="ai-header-actions">
            <div className="ai-credits-chip">
              <span>کردیت:</span>
              <span className="num">{user?.credits ?? 0}</span>
            </div>
            <Link
              href="/ai/app/settings"
              className="ai-btn ai-btn-ghost ai-btn-sm"
            >
              تنظیمات
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ai-app-main">
        <div className="ai-container">
          {/* Welcome */}
          <div className="ai-dashboard-welcome">
            <h1>خوش آمدی</h1>
            <p>
              پلن <strong>{planLabel}</strong> — {user?.credits ?? 0} کردیت
              باقی‌مانده
              {user?.plan === "free" && user?.brainstorm_demos > 0 && (
                <> — {user.brainstorm_demos} دمو هم‌فکری رایگان</>
              )}
            </p>
          </div>

          {/* New Chat */}
          <Link href="/ai/app/chat" className="ai-new-chat-btn">
            <IconPlus size={20} /> گفتگوی جدید
          </Link>

          {/* Mode Cards */}
          <div className="ai-mode-cards">
            <Link href="/ai/app/chat?mode=quick" className="ai-mode-card">
              <div className="ai-mode-card-icon" style={{ color: "var(--clr-quick)" }}>
                <IconBolt size={22} />
              </div>
              <div className="ai-mode-card-name">پاسخ سریع</div>
              <div className="ai-mode-card-sub">۱ کردیت</div>
            </Link>
            <Link href="/ai/app/chat?mode=brainstorm" className="ai-mode-card">
              <div className="ai-mode-card-icon" style={{ color: "var(--clr-exec)" }}>
                <IconSpark size={22} />
              </div>
              <div className="ai-mode-card-name">شورای هم‌فکری</div>
              <div className="ai-mode-card-sub">۲ کردیت</div>
            </Link>
            <Link href="/ai/app/chat?mode=critique" className="ai-mode-card">
              <div className="ai-mode-card-icon" style={{ color: "var(--clr-final)" }}>
                <IconSeal size={22} />
              </div>
              <div className="ai-mode-card-name">نقد و اصلاح</div>
              <div className="ai-mode-card-sub">Business</div>
            </Link>
          </div>

          {/* Recent Conversations */}
          <div className="ai-recent-section">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <h2>گفتگوهای اخیر</h2>
              {conversations.length > 0 && (
                <Link
                  href="/ai/app/history"
                  style={{
                    fontSize: 12,
                    color: "var(--ai-primary-b)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  همه <IconArrowRight size={13} />
                </Link>
              )}
            </div>

            {conversations.length === 0 ? (
              <div className="ai-empty-state">
                هنوز گفتگویی نداری — اولین سؤالت را بپرس.
              </div>
            ) : (
              <div className="ai-conv-list">
                {conversations.map((c) => (
                  <Link
                    key={c.id as string}
                    href={`/ai/app/c/${c.id}`}
                    className="ai-conv-item"
                  >
                    <span
                      className={`ai-conv-mode-dot ${c.mode as string}`}
                    />
                    <span className="ai-conv-title">
                      {(c.title as string) || "گفتگوی بدون عنوان"}
                    </span>
                    <span className="ai-conv-date">
                      {formatDate(c.updated_at as string)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
