"use client";

import { useState } from "react";
import { seoPackageCompareRows } from "@/lib/seoData";

const PLANS = [
  { key: "local", label: "Local SEO" },
  { key: "growth", label: "SEO Growth" },
  { key: "pro", label: "SEO Pro" },
  { key: "enterprise", label: "Enterprise" },
] as const;

export default function SeoPackageCompare() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="seo-plan-compare" aria-label="مقایسه پکیج‌ها">
      <div className="container-mx container-px">
        <h3 className="seo-plan-compare-title">مقایسه پکیج‌ها</h3>

        <div className="seo-plan-compare-table-wrap">
          <table className="seo-plan-compare-table">
            <thead>
              <tr>
                <th scope="col">ویژگی</th>
                {PLANS.map((plan) => (
                  <th key={plan.key} scope="col">
                    {plan.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {seoPackageCompareRows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.local}</td>
                  <td>{row.growth}</td>
                  <td>{row.pro}</td>
                  <td>{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="seo-plan-compare-mobile">
          {seoPackageCompareRows.map((row, index) => (
            <details
              key={row.label}
              className="seo-plan-compare-accordion"
              open={openIndex === index || undefined}
              onToggle={(e) => {
                if ((e.target as HTMLDetailsElement).open) setOpenIndex(index);
              }}
            >
              <summary>{row.label}</summary>
              <dl className="seo-plan-compare-dl">
                {PLANS.map((plan) => (
                  <div key={plan.key}>
                    <dt>{plan.label}</dt>
                    <dd>{row[plan.key]}</dd>
                  </div>
                ))}
              </dl>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
