"use client";

import Link from "next/link";

export default function PlanUpsellBanner({
  variant = "plan",
  onDismiss,
}: {
  variant?: "plan" | "mode";
  onDismiss?: () => void;
}) {
  const title = "این قابلیت در پلن فعلی فعال نیست";
  const desc =
    variant === "plan"
      ? "برای استفاده از همفکری AIها و مدل‌های پیشرفته، پلن خود را ارتقا دهید."
      : "برای چت مستقیم و مقایسه دو مدل، پلن خود را ارتقا دهید.";

  return (
    <div className="ar-upsell ar-upsell--compact" role="status">
      <div className="ar-upsell-text">
        <p className="ar-upsell-title">{title}</p>
        <p className="ar-upsell-desc">{desc}</p>
      </div>
      <div className="ar-upsell-actions">
        <Link
          href="/ai/pricing"
          className="ar-upsell-btn ar-upsell-btn--outline"
          onClick={onDismiss}
        >
          مشاهده پلن‌ها
        </Link>
        {onDismiss && (
          <button type="button" className="ar-upsell-btn ar-upsell-btn--ghost" onClick={onDismiss}>
            بعداً
          </button>
        )}
      </div>
    </div>
  );
}
