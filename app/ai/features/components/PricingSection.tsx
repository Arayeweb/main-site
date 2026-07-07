import Link from "next/link";
import { PUBLIC_PLAN_LIST, formatPriceToman } from "@/lib/aiPricingConfig";
import { FREE_PLAN_EQUIVALENTS } from "@/lib/aiFreeMessaging";
import { IconCheck } from "../../icons";
import Reveal from "./Reveal";

const FREE = PUBLIC_PLAN_LIST.find((p) => p.id === "free")!;
const PRO = PUBLIC_PLAN_LIST.find((p) => p.id === "pro")!;
const MAX = PUBLIC_PLAN_LIST.find((p) => p.id === "max")!;

export default function PricingSection() {
  return (
    <section className="feat-section feat-section--alt" id="pricing">
      <div className="feat-container">
        <div className="feat-section-head">
          <span className="feat-eyebrow">قیمت‌ها</span>
          <h2>شروع رایگان — ارتقا وقتی نیاز داشتی</h2>
        </div>
        <div className="feat-pricing-grid">
          <Reveal>
            <article className="feat-plan-glass">
              <h3>{FREE.nameFa ?? FREE.name}</h3>
              <div className="feat-plan-price">
                ۰<span className="per"> تومان</span>
              </div>
              <p className="feat-plan-desc">{FREE.desc}</p>
              <ul className="feat-plan-features">
                <li>
                  <IconCheck size={14} />
                  ثبت‌نام + {FREE_PLAN_EQUIVALENTS.signupBonus} هدیه
                </li>
                <li>
                  <IconCheck size={14} />
                  چت با مدل‌های اقتصادی
                </li>
                <li>
                  <IconCheck size={14} />
                  بدون VPN
                </li>
              </ul>
              <Link href="/ai" className="ar-btn ar-btn-ghost ar-btn-block">
                شروع رایگان
              </Link>
            </article>
          </Reveal>

          <Reveal delay={80}>
            <article className="feat-plan-glass featured">
              <span className="feat-plan-badge">{PRO.badge ?? "محبوب"}</span>
              <h3>{PRO.nameFa ?? PRO.name}</h3>
              <div className="feat-plan-price">
                {formatPriceToman(PRO.priceToman)}
                <span className="per"> تومان</span>
              </div>
              <p className="feat-plan-desc">{PRO.desc}</p>
              <ul className="feat-plan-features">
                {PRO.features.slice(0, 4).map((f) => (
                  <li key={f}>
                    <IconCheck size={14} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/ai/pricing?package=pro" className="ar-btn ar-btn-primary ar-btn-block">
                خرید پلن
              </Link>
            </article>
          </Reveal>

          <Reveal delay={160}>
            <article className="feat-plan-glass">
              <h3>{MAX.nameFa ?? MAX.name}</h3>
              <div className="feat-plan-price">
                {formatPriceToman(MAX.priceToman)}
                <span className="per"> تومان</span>
              </div>
              <p className="feat-plan-desc">{MAX.desc}</p>
              <ul className="feat-plan-features">
                {MAX.features.slice(0, 4).map((f) => (
                  <li key={f}>
                    <IconCheck size={14} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/ai/pricing?package=max" className="ar-btn ar-btn-ghost ar-btn-block">
                خرید پلن
              </Link>
            </article>
          </Reveal>
        </div>
        <p className="feat-pricing-note">
          جزئیات در <Link href="/ai/pricing">صفحه اشتراک‌ها</Link> — پرداخت امن زیبال.
        </p>
      </div>
    </section>
  );
}
