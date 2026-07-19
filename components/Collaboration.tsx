const collaborationItems = [
  {
    name: "عالیه پوردست",
    category: "حوزه سلامت و پزشکی",
    service: "طراحی حضور دیجیتال و مسیر ارتباط با بیمار",
    description:
      "تمرکز پروژه روی معرفی حرفه‌ای، دسترسی راحت‌تر بیمار، ساختار اعتمادساز و مسیر ارتباطی منظم‌تر بود.",
    badge: "همکاری واقعی",
    initial: "ع",
  },
  {
    name: "شیوا اشرفی",
    category: "هنر، گالری و فروش آثار",
    service: "طراحی و توسعه وب‌سایت هنری",
    description:
      "تمرکز پروژه روی نمایش بهتر آثار، ساختار معرفی آنلاین، تجربه کاربری تمیز و مسیر ساده‌تر برای مشاهده و سفارش بود.",
    badge: "همکاری واقعی",
    initial: "ش",
  },
  {
    name: "DeepinHQ",
    category: "محصول دیجیتال و پلتفرم مالی",
    service: "طراحی و توسعه محصول نرم‌افزاری",
    description:
      "پلتفرمی برای تحلیل مالی، داشبورد، مدیریت پورتفولیو و ساختار محصول دیجیتال با قابلیت توسعه آینده.",
    badge: "همکاری واقعی",
    initial: "D",
  },
];

export default function Collaboration() {
  return (
    <section id="collaboration" className="section-py">
      <div className="container-mx container-px">
        <div className="mx-auto max-w-2xl text-center mb-14">
          <span className="badge bg-cyan-500/10 text-cyan-600 mb-4">تجربه همکاری</span>
          <h2 className="section-title">تجربه همکاری با آرایه</h2>
          <p className="section-subtitle">
            از حوزه سلامت تا هنر و محصول دیجیتال، آرایه تلاش می‌کند فقط ظاهر سایت را نسازد؛
            بلکه مسیر معرفی، فروش، ارتباط با مشتری و مدیریت بهتر را هم در محصول ببیند.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collaborationItems.map((item) => (
            <div
              key={item.name}
              className="flex flex-col rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-100 text-sm font-bold text-navy-700">
                    {item.initial}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy-900 leading-snug">{item.name}</p>
                    <p className="text-xs text-navy-400 mt-0.5">{item.category}</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-600 border border-green-100">
                  {item.badge}
                </span>
              </div>

              <p className="text-xs font-semibold text-brand-600 mb-2">{item.service}</p>

              <p className="text-sm leading-relaxed text-navy-500 flex-1">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/portfolios"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy-500 transition-colors duration-200 hover:text-brand-600"
          >
            مشاهده نمونه‌کارها
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="rotate-180"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
