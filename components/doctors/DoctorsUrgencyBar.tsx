import {
  DOCTORS_PRODUCT_PRICE_TOMAN,
  doctorsUrgencyConfig,
  formatToman,
} from "@/lib/doctorsData";

function formatFaDate(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return null;
  }
}

export default function DoctorsUrgencyBar() {
  const { priceValidUntil, remainingSlotsThisMonth } = doctorsUrgencyConfig;
  const dateLabel = priceValidUntil ? formatFaDate(priceValidUntil) : null;
  const hasPriceDeadline = Boolean(dateLabel);
  const hasSlots =
    typeof remainingSlotsThisMonth === "number" &&
    Number.isFinite(remainingSlotsThisMonth) &&
    remainingSlotsThisMonth > 0;

  if (!hasPriceDeadline && !hasSlots) return null;

  return (
    <section className="border-b border-amber-200 bg-amber-50" aria-label="فوریت قیمت و ظرفیت">
      <div className="container-mx container-px flex flex-col items-center justify-center gap-1 py-3 text-center text-[13px] font-bold text-amber-950 sm:flex-row sm:gap-4">
        {hasPriceDeadline ? (
          <p>
            قیمت فعلی پکیج: {formatToman(DOCTORS_PRODUCT_PRICE_TOMAN)} تومان تا {dateLabel}
          </p>
        ) : null}
        {hasSlots ? (
          <p>فقط {formatToman(remainingSlotsThisMonth!)} ظرفیت اجرای جدید در این ماه باقی مانده</p>
        ) : null}
      </div>
    </section>
  );
}
