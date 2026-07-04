import { NextRequest, NextResponse } from "next/server";
import { getSession, type AdminRole, AI_OPS_ROLES } from "@/lib/auth";

// =========================================================
// دسترسی نقش/ماژول پنل عملیات Araaye AI (app/admin/ai-ops)
// نگاشت استاتیک — همگام با seed جدول ai_admin_permissions
// (آن جدول برای نمایش/مرجع در UI تنظیمات است، اجرا اینجا انجام می‌شود).
// =========================================================

export type AiOpsModule =
  | "overview"
  | "users"
  | "plans"
  | "credits"
  | "models"
  | "providers"
  | "prompts"
  | "conversations"
  | "costs"
  | "payments"
  | "coupons"
  | "tickets"
  | "notifications"
  | "content"
  | "logs"
  | "settings"
  | "team"
  | "security";

export const AI_OPS_ROLE_MODULES: Record<string, AiOpsModule[]> = {
  ai_superadmin: [
    "overview", "users", "plans", "credits", "models", "providers", "prompts",
    "conversations", "costs", "payments", "coupons", "tickets", "notifications",
    "content", "logs", "settings", "team", "security",
  ],
  ai_finance: ["overview", "plans", "credits", "costs", "payments", "coupons"],
  ai_support: ["overview", "users", "tickets", "notifications", "conversations"],
  ai_ops: ["overview", "models", "providers", "prompts", "content", "logs", "settings", "users"],
  // نقش کلی آژانس هم دسترسی کامل به عنوان superadmin دارد
  admin: [
    "overview", "users", "plans", "credits", "models", "providers", "prompts",
    "conversations", "costs", "payments", "coupons", "tickets", "notifications",
    "content", "logs", "settings", "team", "security",
  ],
};

export function modulesForRole(role: string): AiOpsModule[] {
  return AI_OPS_ROLE_MODULES[role] ?? [];
}

export function roleCanAccess(role: string, mod: AiOpsModule): boolean {
  return modulesForRole(role).includes(mod);
}

export interface AiOpsSession {
  userId: string;
  role: AdminRole;
}

/** نشست را می‌خواند و دسترسی به یک ماژول را تایید می‌کند؛ در غیر این صورت پاسخ خطا برمی‌گرداند. */
export function requireAiOpsModule(
  req: NextRequest,
  mod: AiOpsModule
): AiOpsSession | NextResponse {
  const session = getSession(req);
  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const isAiOpsRole = AI_OPS_ROLES.includes(session.role) || session.role === "admin";
  if (!isAiOpsRole || !roleCanAccess(session.role, mod)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  return { userId: session.userId, role: session.role };
}

export function isAiOpsSession(s: AiOpsSession | NextResponse): s is AiOpsSession {
  return !(s instanceof NextResponse);
}

export const AI_OPS_ROLE_LABELS: Record<string, string> = {
  ai_superadmin: "سوپرادمین AI",
  ai_finance: "مالی AI",
  ai_support: "پشتیبانی AI",
  ai_ops: "عملیات AI",
  admin: "مدیر کل",
};
