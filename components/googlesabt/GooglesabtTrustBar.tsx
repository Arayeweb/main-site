const TRUST_ITEMS = [
  "✅ ده‌ها کسب‌وکار از این سرویس استفاده کرده‌اند.",
  "⭐ میانگین رضایت مشتریان",
  "⏱️ راه‌اندازی سریع",
] as const;

export default function GooglesabtTrustBar() {
  return (
    <aside
      className="border-y border-navy-100/80 bg-navy-50/40"
      aria-label="اعتماد مشتریان"
    >
      <div className="container-mx container-px">
        <ul className="flex flex-col items-center justify-center gap-3 py-5 text-center sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-2 sm:py-6">
          {TRUST_ITEMS.map((item) => (
            <li
              key={item}
              className="text-[13px] font-bold leading-snug text-navy-600 sm:text-[14px]"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
