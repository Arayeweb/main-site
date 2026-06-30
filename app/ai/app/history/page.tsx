import { cookies } from "next/headers";
import Link from "next/link";
import { verifyAIToken } from "@/lib/aiAuth";
import { getSupabaseAdmin } from "@/lib/supabase";
import { IconArrowRight } from "../../icons";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MODE_LABEL: Record<string, string> = {
  quick:      "پاسخ سریع",
  brainstorm: "شورای هم‌فکری",
  critique:   "نقد و اصلاح",
};

export default async function HistoryPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("ary_ai_session")?.value;
  const session = verifyAIToken(token);
  if (!session) return null;

  const supabase = getSupabaseAdmin();
  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("id, title, mode, created_at, updated_at")
    .eq("user_id", session.userId)
    .order("updated_at", { ascending: false })
    .limit(50);

  const convs = conversations ?? [];

  return (
    <div className="ai-app-shell">
      {/* Header */}
      <header className="ai-app-header">
        <div className="ai-container ai-app-header-inner">
          <Link href="/ai/app" className="ai-back-btn" aria-label="بازگشت">
            <IconArrowRight size={18} />
          </Link>
          <div className="ai-app-logo">
            تاریخچه گفتگوها
          </div>
          <div style={{ width: 36 }} />
        </div>
      </header>

      <main className="ai-app-main">
        <div className="ai-container">
          {convs.length === 0 ? (
            <div className="ai-empty-state" style={{ marginTop: 60 }}>
              <div>هنوز گفتگویی نداری.</div>
              <Link
                href="/ai/app/chat"
                className="ai-btn ai-btn-primary ai-btn-sm"
                style={{ marginTop: 16, display: "inline-flex" }}
              >
                شروع اولین گفتگو
              </Link>
            </div>
          ) : (
            <div className="ai-conv-list">
              {convs.map((c) => {
                const modeLabel =
                  MODE_LABEL[c.mode as string] ?? (c.mode as string);
                return (
                  <Link
                    key={c.id as string}
                    href={`/ai/app/c/${c.id}`}
                    className="ai-conv-item"
                    style={{ gap: 14 }}
                  >
                    <span
                      className={`ai-conv-mode-dot ${c.mode as string}`}
                    />
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div className="ai-conv-title" style={{ fontSize: 14 }}>
                        {(c.title as string) || "گفتگوی بدون عنوان"}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--ai-text3)",
                          marginTop: 2,
                        }}
                      >
                        {modeLabel}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ai-text3)",
                        flexShrink: 0,
                        textAlign: "left",
                      }}
                    >
                      {formatDate(c.updated_at as string)}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
