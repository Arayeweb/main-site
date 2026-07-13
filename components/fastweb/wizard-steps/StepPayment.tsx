"use client";

import Link from "next/link";
import { FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { formatPriceToman } from "@/lib/aiPricingConfig";
import {
  FASTWEB_GOALS,
  FASTWEB_PACKAGES,
  FASTWEB_STYLES,
  type FastWebBrief,
  type FastWebPackageKey,
} from "@/lib/fastweb";
import Field from "./Field";

interface CouponState {
  code: string;
  applied: boolean;
  label: string | null;
  listAmountToman: number;
  discountToman: number;
  finalAmountToman: number;
  error: string | null;
  applying: boolean;
}

interface StepPaymentProps {
  brief: FastWebBrief;
  packageKey: FastWebPackageKey;
  phone: string;
  busy: boolean;
  coupon: CouponState;
  slugHint: string;
  onPackageChange: (key: FastWebPackageKey) => void;
  onPhoneChange: (v: string) => void;
  onCouponCodeChange: (v: string) => void;
  onApplyCoupon: () => void;
  onSubmit: (e: FormEvent) => void;
}

export default function StepPayment({
  brief,
  packageKey,
  phone,
  busy,
  coupon,
  slugHint,
  onPackageChange,
  onPhoneChange,
  onCouponCodeChange,
  onApplyCoupon,
  onSubmit,
}: StepPaymentProps) {
  const pkg = FASTWEB_PACKAGES[packageKey];
  const goalLabel =
    FASTWEB_GOALS.find((g) => g.id === brief.goal)?.label || "—";
  const styleLabel =
    FASTWEB_STYLES.find((s) => s.id === brief.style)?.label || "—";

  const listPrice = coupon.applied ? coupon.listAmountToman : pkg.priceToman;
  const finalPrice = coupon.applied ? coupon.finalAmountToman : pkg.priceToman;

  return (
    <section>
      <h1 className="text-2xl font-bold">انتخاب بسته و پرداخت</h1>
      <p className="mt-2 text-sm text-slate-600">
        نسخه اول قابل انتشار تا ۲۴ ساعت کاری، پس از تکمیل اطلاعات و پرداخت.
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm space-y-2">
        <p>
          <span className="text-slate-500">هدف:</span> {goalLabel}
        </p>
        <p>
          <span className="text-slate-500">سبک:</span> {styleLabel}
        </p>
        <p>
          <span className="text-slate-500">آدرس:</span>{" "}
          <span dir="ltr" className="font-mono text-xs">
            {slugHint}
          </span>
        </p>
        {brief.shortDescription ? (
          <p className="text-slate-600 line-clamp-3">{brief.shortDescription}</p>
        ) : null}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(Object.values(FASTWEB_PACKAGES) as Array<(typeof FASTWEB_PACKAGES)["fast"]>).map(
          (p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPackageChange(p.key)}
              className={`rounded-xl border p-4 text-right ${
                packageKey === p.key
                  ? "border-[#0F4C5C] bg-teal-50"
                  : "border-slate-200"
              }`}
            >
              <p className="font-bold">{p.name}</p>
              <p className="mt-1 text-lg font-bold text-[#0F4C5C]">
                {formatPriceToman(p.priceToman)} تومان
              </p>
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                {p.features.slice(0, 4).map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            </button>
          )
        )}
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 p-4">
        <p className="text-sm font-medium">کد تخفیف دارید؟</p>
        <div className="mt-2 flex gap-2">
          <input
            value={coupon.code}
            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
            placeholder="کد تخفیف"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#0F4C5C]"
          />
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={coupon.applying || !coupon.code.trim()}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
          >
            {coupon.applying ? "..." : "اعمال"}
          </button>
        </div>
        {coupon.error ? (
          <p className="mt-2 text-xs text-red-600">{coupon.error}</p>
        ) : null}
        {coupon.applied && coupon.label ? (
          <p className="mt-2 text-xs text-emerald-700">{coupon.label} اعمال شد.</p>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">مبلغ</span>
          <span>{formatPriceToman(listPrice)} تومان</span>
        </div>
        {coupon.applied && coupon.discountToman > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>تخفیف</span>
            <span>− {formatPriceToman(coupon.discountToman)} تومان</span>
          </div>
        ) : null}
        <div className="flex justify-between font-bold text-[#0F4C5C] pt-2 border-t border-slate-200">
          <span>مبلغ قابل پرداخت</span>
          <span>{formatPriceToman(finalPrice)} تومان</span>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field
          label="موبایل برای پیگیری سفارش"
          value={phone}
          onChange={onPhoneChange}
          placeholder="0912..."
        />
        <button
          type="submit"
          disabled={busy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F4C5C] px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          پرداخت و ثبت سفارش
        </button>
        <p className="text-center text-xs text-slate-500">
          یا{" "}
          <Link href="/website-design" className="underline">
            طراحی سایت اختصاصی
          </Link>{" "}
          اگر به فروشگاه، پنل یا امکانات سفارشی نیاز دارید.
        </p>
      </form>
    </section>
  );
}
