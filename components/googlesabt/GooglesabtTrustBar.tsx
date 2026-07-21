import { IconCheck, IconStar, IconClock } from "@/components/icons";

const TRUST_ITEMS = [
  { text: "ده‌ها کسب‌وکار از این سرویس استفاده کرده‌اند.", Icon: IconCheck },
  { text: "میانگین رضایت مشتریان", Icon: IconStar },
  { text: "راه‌اندازی سریع", Icon: IconClock },
] as const;

export default function GooglesabtTrustBar() {
  return (
    <aside
      className="border-y border-navy-100/80 bg-navy-50/40"
      aria-label="اعتماد مشتریان"
    >
      <div className="container-mx container-px">
        <ul className="flex flex-col items-center justify-center gap-3 py-5 text-center sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-2 sm:py-6">
          {TRUST_ITEMS.map(({ text, Icon }) => (
            <li
              key={text}
              className="inline-flex items-center gap-2 text-[13px] font-bold leading-snug text-navy-600 sm:text-[14px]"
            >
              <Icon size={15} className="shrink-0 text-[#4285F4]" />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
