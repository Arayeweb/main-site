"use client";

import { useMemo, useRef, useState } from "react";
import GrowthToolLeadCapture from "./GrowthToolLeadCapture";
import GrowthToolServiceCta from "./GrowthToolServiceCta";
import { trackGrowthToolEvent } from "@/lib/analytics/growthToolsEvents";
import { calculateSeoRoi, toLatinNumber } from "@/lib/tools/growthToolCalculations";

function toman(value: number): string {
  return `${Math.round(value).toLocaleString("fa-IR")} تومان`;
}

export default function SeoRoiCalculatorTool({ industry = "doctor" }: { industry?: string }) {
  const [customerValue, setCustomerValue] = useState("3000000");
  const [monthlyLeads, setMonthlyLeads] = useState("20");
  const [closeRate, setCloseRate] = useState("25");
  const [margin, setMargin] = useState("60");
  const [seoCost, setSeoCost] = useState("20000000");
  const [calculated, setCalculated] = useState(false);
  const started = useRef(false);

  const result = useMemo(() => {
    return calculateSeoRoi({
      customerValue: toLatinNumber(customerValue),
      monthlyLeads: toLatinNumber(monthlyLeads),
      closeRatePercent: toLatinNumber(closeRate),
      marginPercent: toLatinNumber(margin),
      seoCost: toLatinNumber(seoCost),
    });
  }, [customerValue, monthlyLeads, closeRate, margin, seoCost]);

  function update(setter: (value: string) => void, value: string) {
    setter(value);
    setCalculated(false);
    if (!started.current) {
      started.current = true;
      trackGrowthToolEvent("start", "seo_roi", industry);
    }
  }

  function calculate() {
    setCalculated(true);
    trackGrowthToolEvent("complete", "seo_roi", industry, {
      roi: Math.round(result.roi),
      break_even_leads: result.breakEvenLeads,
    });
  }

  const scenarios = [
    { label: "محافظه‌کارانه", factor: 0.7 },
    { label: "واقع‌بینانه", factor: 1 },
    { label: "خوش‌بینانه", factor: 1.3 },
  ];

  return (
    <div className="mx-auto max-w-4xl rounded-3xl border border-navy-100 bg-white p-5 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { id: "customer-value", label: "ارزش متوسط هر مشتری (تومان)", value: customerValue, setter: setCustomerValue },
          { id: "monthly-leads", label: "لید ماهانه مورد انتظار از سئو", value: monthlyLeads, setter: setMonthlyLeads },
          { id: "close-rate", label: "نرخ تبدیل لید به مشتری (درصد)", value: closeRate, setter: setCloseRate },
          { id: "margin", label: "حاشیه سود هر فروش (درصد)", value: margin, setter: setMargin },
          { id: "seo-cost", label: "کل هزینه ماهانه سئو (تومان)", value: seoCost, setter: setSeoCost },
        ].map((field) => (
          <label key={field.id} htmlFor={field.id} className="block">
            <span className="mb-1.5 block text-xs font-bold text-navy-700">{field.label}</span>
            <input
              id={field.id}
              value={field.value}
              onChange={(event) => update(field.setter, event.target.value)}
              inputMode="numeric"
              dir="ltr"
              className="w-full rounded-xl border border-navy-200 px-4 py-3 text-left text-sm outline-none focus:border-brand-500"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-navy-500">
        هزینه سئو باید محتوا، اجرا، ابزار و لینک‌سازی را شامل شود. خروجی پیش‌بینی است، نه تضمین نتیجه.
      </p>
      <button
        type="button"
        onClick={calculate}
        className="mt-5 w-full rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-brand-700"
      >
        محاسبه بازگشت سرمایه سئو
      </button>

      {calculated ? (
        <div className="mt-6 space-y-5" aria-live="polite">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-navy-900 p-5 text-white">
              <p className="text-xs font-bold text-white/60">سود خالص ماهانه</p>
              <p className="mt-2 text-xl font-extrabold">{toman(result.netProfit)}</p>
            </div>
            <div className="rounded-2xl border border-navy-100 p-5">
              <p className="text-xs font-bold text-navy-500">ROI تخمینی</p>
              <p className={`mt-2 text-2xl font-extrabold ${result.roi >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                {Math.round(result.roi).toLocaleString("fa-IR")}٪
              </p>
            </div>
            <div className="rounded-2xl border border-navy-100 p-5">
              <p className="text-xs font-bold text-navy-500">لید لازم برای سربه‌سر</p>
              <p className="mt-2 text-2xl font-extrabold text-brand-700">{result.breakEvenLeads.toLocaleString("fa-IR")}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-navy-100">
            <div className="grid grid-cols-3 bg-navy-50 px-4 py-3 text-xs font-bold text-navy-600">
              <span>سناریو</span><span>مشتری جدید</span><span>سود خالص</span>
            </div>
            {scenarios.map((scenario) => {
              const customers = result.expectedCustomers * scenario.factor;
              const net = customers * result.customerValue * result.profitMargin - result.cost;
              return (
                <div key={scenario.label} className="grid grid-cols-3 border-t border-navy-100 px-4 py-3 text-xs text-navy-700">
                  <span className="font-bold">{scenario.label}</span>
                  <span>{customers.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}</span>
                  <span>{toman(net)}</span>
                </div>
              );
            })}
          </div>

          <GrowthToolLeadCapture
            tool="seo_roi"
            industry={industry}
            detail={`roi=${Math.round(result.roi)} | breakEvenLeads=${result.breakEvenLeads} | monthlyLeads=${result.monthlyLeads} | seoCost=${result.cost}`}
          />

          <GrowthToolServiceCta tool="seo_roi" industry={industry} />
        </div>
      ) : null}
    </div>
  );
}
