const STAGES = [
  "پیدا شدن در گوگل",
  "گرفتن تماس و درخواست",
  "پیگیری مشتریان",
] as const;

function StageHeading({ title }: { title: string }) {
  return (
    <div className="mb-4 text-center lg:mb-0 lg:pb-4 lg:text-center">
      <p className="text-sm font-bold text-navy-900">{title}</p>
    </div>
  );
}

function FlowConnector({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`} aria-hidden="true">
      <div className="h-0.5 w-8 bg-brand-400 sm:w-12" />
      <div className="h-2 w-2 rounded-full bg-brand-500" />
      <div className="h-0.5 w-8 bg-brand-400 sm:w-12" />
    </div>
  );
}

function GoogleResultCard() {
  return (
    <div className="rounded-2xl border border-navy-100/80 bg-white p-4 shadow-[0_8px_30px_rgba(16,42,67,0.06)] sm:p-5">
      <div className="mb-3 flex items-center gap-2 rounded-full border border-navy-100 bg-navy-50/60 px-3 py-2 text-[11px] text-navy-400">
        <span className="font-serif text-navy-300">G</span>
        <span>کلینیک زیبایی تهران</span>
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-[#1a0dab]">خدمات کلینیک آریا</p>
          <p className="mt-0.5 text-[11px] text-emerald-700">araaye.com/campaign/arya-clinic</p>
          <p className="mt-1.5 text-xs leading-relaxed text-navy-500">
            مشاهده خدمات و درخواست وقت مشاوره
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-navy-50/70 px-3 py-2 text-[11px] text-navy-600">
          <span className="font-bold text-amber-500">۴٫۸</span>
          <span>ولنجک، تهران</span>
          <span className="text-navy-300">·</span>
          <span className="text-brand-600">تماس</span>
        </div>
      </div>
    </div>
  );
}

function AdReadyPageCard() {
  return (
    <div className="relative rounded-2xl border border-brand-200/60 bg-white p-4 shadow-[0_16px_48px_rgba(59,108,255,0.12)] sm:p-5 lg:-mt-2 lg:scale-[1.04]">
      <div className="mb-3 flex items-center gap-1.5 text-[10px] text-navy-400">
        <span className="h-2 w-2 rounded-full bg-red-300" />
        <span className="h-2 w-2 rounded-full bg-amber-300" />
        <span className="h-2 w-2 rounded-full bg-emerald-300" />
        <span className="mr-auto truncate">araaye.com/campaign/arya-clinic</span>
      </div>
      <div className="rounded-xl bg-gradient-to-b from-brand-50/80 to-white px-4 py-5 text-center">
        <p className="text-[10px] font-semibold text-brand-600">AdReady</p>
        <p className="mt-2 text-base font-extrabold text-navy-900">خدمات کلینیک آریا</p>
        <p className="mt-1 text-xs text-navy-500">مشاهده خدمات و درخواست وقت مشاوره</p>
        <div className="mx-auto mt-4 max-w-[200px] space-y-2">
          <div className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-right text-[11px] text-navy-400">
            نام و نام خانوادگی
          </div>
          <div className="rounded-lg border border-navy-100 bg-white px-3 py-2 text-right text-[11px] text-navy-400">
            شماره موبایل
          </div>
          <div className="rounded-lg bg-navy-900 py-2 text-[11px] font-bold text-white">
            درخواست وقت مشاوره
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsListCard() {
  const leads = [
    { name: "مریم احمدی", source: "گوگل", status: "جدید", tone: "bg-brand-50 text-brand-700" },
    { name: "علی رضایی", source: "یکتانت", status: "تماس گرفته شد", tone: "bg-emerald-50 text-emerald-700" },
    { name: "سارا محمدی", source: "اینستاگرام", status: "در پیگیری", tone: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="rounded-2xl border border-navy-100/80 bg-white p-4 shadow-[0_8px_30px_rgba(16,42,67,0.06)] sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-bold text-navy-800">درخواست‌های مشتریان</p>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-600">
          ۳ جدید
        </span>
      </div>
      <ul className="space-y-2">
        {leads.map((lead) => (
          <li
            key={lead.name}
            className="flex items-center justify-between gap-2 rounded-xl border border-navy-50 bg-navy-50/40 px-3 py-2.5"
          >
            <div className="min-w-0 text-right">
              <p className="truncate text-xs font-semibold text-navy-800">{lead.name}</p>
              <p className="text-[10px] text-navy-400">{lead.source}</p>
            </div>
            <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${lead.tone}`}>
              {lead.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HeroProductFlow() {
  return (
    <div
      className="relative mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-10"
      aria-label="مسیر پیدا شدن در گوگل تا پیگیری مشتریان"
    >
      <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-end lg:gap-0">
        <StageHeading title={STAGES[0]} />
        <div />
        <StageHeading title={STAGES[1]} />
        <div />
        <StageHeading title={STAGES[2]} />
      </div>

      <div className="hidden lg:mt-2 lg:grid lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center lg:gap-0">
        <GoogleResultCard />
        <FlowConnector />
        <AdReadyPageCard />
        <FlowConnector />
        <LeadsListCard />
      </div>

      <div className="space-y-2 lg:hidden">
        <StageHeading title={STAGES[0]} />
        <GoogleResultCard />
        <FlowConnector className="py-1" />
        <StageHeading title={STAGES[1]} />
        <AdReadyPageCard />
        <FlowConnector className="py-1" />
        <StageHeading title={STAGES[2]} />
        <LeadsListCard />
      </div>
    </div>
  );
}
