const STAGES = [
  { label: "دیده‌شدن", icon: "◎" },
  { label: "معرفی و تبدیل", icon: "◇" },
  { label: "دریافت درخواست", icon: "□" },
  { label: "پیگیری مشتری", icon: "◆" },
] as const;

function FlowArrow({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <div className="flex flex-col items-center py-1 sm:hidden" aria-hidden="true">
        <div className="h-4 w-px bg-navy-200" />
        <span className="text-[10px] text-brand-500">↓</span>
        <div className="h-4 w-px bg-navy-200" />
      </div>
    );
  }

  return (
    <div className="hidden shrink-0 items-center justify-center px-1 sm:flex sm:px-2" aria-hidden="true">
      <div className="h-px w-4 bg-navy-200 sm:w-8" />
      <span className="text-[10px] text-brand-500 sm:text-xs">←</span>
      <div className="h-px w-4 bg-navy-200 sm:w-8" />
    </div>
  );
}

function StageCard({ label, icon }: { label: string; icon: string }) {
  return (
    <div className="flex w-full max-w-[14rem] flex-col items-center rounded-2xl border border-navy-100 bg-white px-4 py-3.5 sm:min-w-[8.5rem] sm:max-w-none sm:px-4">
      <span
        className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-sm text-brand-600"
        aria-hidden="true"
      >
        {icon}
      </span>
      <p className="mt-2 text-center text-xs font-bold text-navy-800 sm:text-[13px]">{label}</p>
    </div>
  );
}

export default function AboutHeroFlow() {
  return (
    <div
      className="mx-auto mt-12 max-w-3xl sm:mt-14"
      aria-label="مسیر دیده‌شدن تا پیگیری مشتری"
    >
      {/* Mobile: vertical stack */}
      <div className="flex flex-col items-center sm:hidden">
        {STAGES.map((stage, index) => (
          <div key={stage.label} className="flex w-full flex-col items-center">
            <StageCard label={stage.label} icon={stage.icon} />
            {index < STAGES.length - 1 ? <FlowArrow vertical /> : null}
          </div>
        ))}
      </div>

      {/* Tablet+: horizontal flow */}
      <div className="hidden flex-wrap items-center justify-center gap-y-3 sm:flex">
        {STAGES.map((stage, index) => (
          <div key={stage.label} className="flex items-center">
            <StageCard label={stage.label} icon={stage.icon} />
            {index < STAGES.length - 1 ? <FlowArrow /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
