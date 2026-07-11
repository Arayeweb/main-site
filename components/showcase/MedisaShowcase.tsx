type MedisaProps = { full?: boolean };

const PROJECTS = [
  {
    title: "ویلا ساحلی نوشهر",
    tag: "مسکونی",
    location: "مازندران",
    gradient:
      "bg-[linear-gradient(160deg,#e8d5b5_0%,#c9a66b_28%,#8b6f47_55%,#4a3728_100%)]",
    span: "col-span-2 row-span-2",
    minH: "min-h-[220px]",
  },
  {
    title: "بازسازی کلینیک",
    tag: "درمانی",
    location: "تهران",
    gradient:
      "bg-[linear-gradient(145deg,#dce8f0_0%,#9bb4c8_45%,#5a7a94_100%)]",
    span: "",
    minH: "min-h-[120px]",
  },
  {
    title: "آپارتمان مدرن",
    tag: "مسکونی",
    location: "اصفهان",
    gradient:
      "bg-[linear-gradient(145deg,#f0ebe3_0%,#c4b8a8_50%,#7a6f62_100%)]",
    span: "",
    minH: "min-h-[120px]",
  },
] as const;

function ArchitecturePhoto({
  gradient,
  title,
  tag,
  location,
  className = "",
}: {
  gradient: string;
  title: string;
  tag: string;
  location: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className={`absolute inset-0 ${gradient}`} />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,42,67,0.72)_0%,rgba(16,42,67,0.05)_55%,transparent_100%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 40px)",
        }}
      />
      <div className="absolute bottom-0 right-0 left-0 p-3 sm:p-4">
        <p className="text-[8px] font-bold tracking-widest text-white/70 sm:text-[9px]">{tag}</p>
        <p className="mt-0.5 text-[11px] font-extrabold text-white sm:text-sm">{title}</p>
        <p className="mt-0.5 text-[9px] text-white/60">{location}</p>
      </div>
    </div>
  );
}

export function MedisaShowcase({ full = false }: MedisaProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-[#f7f4ef] shadow-[0_16px_48px_rgba(16,42,67,0.10)]">
      <div className="flex items-center justify-between border-b border-stone-200/80 bg-white px-4 py-3 sm:px-5">
        <span className="text-[10px] font-bold tracking-[0.2em] text-stone-400">MEDISA</span>
        <span className="text-xs font-extrabold text-navy-900 sm:text-sm">استودیو معماری مدیسا</span>
        <span className="rounded-md border border-stone-200 px-2 py-1 text-[9px] font-semibold text-navy-600">
          پروژه‌ها
        </span>
      </div>

      <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[2/1]">
        <div className="absolute inset-0 bg-[linear-gradient(125deg,#c8bfb0_0%,#8a7d6e_40%,#4a4238_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.35),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(16,42,67,0.75)_0%,transparent_60%)]" />
        <div className="absolute bottom-0 right-0 left-0 px-5 pb-5 pt-20 sm:px-7 sm:pb-7">
          <p className="text-[9px] font-bold tracking-[0.25em] text-stone-200 sm:text-[10px]">
            PORTFOLIO 2025
          </p>
          <h2 className="mt-1 max-w-md text-lg font-extrabold leading-snug text-white sm:text-2xl">
            معماری معاصر با تمرکز بر نور، فضا و جزئیات
          </h2>
        </div>
      </div>

      <div
        className={`grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4 ${full ? "sm:grid-cols-3" : ""}`}
      >
        {PROJECTS.map((project, index) => (
          <article
            key={project.title}
            className={`overflow-hidden rounded-xl bg-white shadow-sm ${
              full && index === 0 ? "sm:col-span-2 sm:row-span-2" : ""
            } ${!full && index === 0 ? "col-span-2" : ""}`}
          >
            <ArchitecturePhoto
              gradient={project.gradient}
              title={project.title}
              tag={project.tag}
              location={project.location}
              className={`${full && index === 0 ? project.minH : "aspect-[5/3] sm:aspect-[4/3]"}`}
            />
          </article>
        ))}
      </div>

      {full ? (
        <div className="border-t border-stone-200 bg-white px-5 py-6 sm:px-6">
          <h3 className="text-base font-extrabold text-navy-900">ثبت درخواست پروژه</h3>
          <p className="mt-1 text-sm text-navy-500">
            توضیح کوتاه پروژه، متراژ تقریبی و شماره تماس
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {["نوع پروژه", "متراژ تقریبی", "شماره تماس"].map((field) => (
              <div
                key={field}
                className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-navy-400"
              >
                {field}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MedisaShowcasePreview({ compact }: { compact?: boolean }) {
  void compact;
  return <MedisaShowcase />;
}
