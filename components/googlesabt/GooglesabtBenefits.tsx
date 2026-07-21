import {
  IconSearchCheck,
  IconPhone,
  IconNetwork,
  IconShield,
} from "@/components/icons";

const BENEFITS = [
  {
    title: "مشتریان راحت‌تر شما را پیدا می‌کنند",
    description: "اطلاعات کسب‌وکارتان در دسترس افرادی قرار می‌گیرد که به دنبال شما هستند.",
    Icon: IconSearchCheck,
  },
  {
    title: "راه‌های ارتباطی همیشه در دسترس است",
    description: "شماره تماس، آدرس، لینک‌ها و اطلاعات مهم در یک مکان قرار می‌گیرد.",
    Icon: IconPhone,
  },
  {
    title: "اشتراک‌گذاری آسان",
    description: "تمام اطلاعات کسب‌وکار را تنها با یک لینک برای مشتری ارسال کنید.",
    Icon: IconNetwork,
  },
  {
    title: "حضور حرفه‌ای‌تر",
    description: "کسب‌وکار شما منظم‌تر و قابل اعتمادتر دیده می‌شود.",
    Icon: IconShield,
  },
] as const;

export default function GooglesabtBenefits() {
  return (
    <section
      className="bg-gradient-to-b from-blue-50/30 to-white py-20 sm:py-28"
      aria-labelledby="googlesabt-benefits-heading"
    >
      <div className="container-mx container-px">
        <header className="mx-auto max-w-2xl text-center">
          <h2
            id="googlesabt-benefits-heading"
            className="text-2xl font-extrabold leading-snug text-navy-900 sm:text-3xl lg:text-[2.1rem]"
          >
            چرا این سرویس برای کسب‌وکار شما مهم است؟
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-500 sm:text-base">
            حضور آنلاین حرفه‌ای، ارتباط آسان‌تر با مشتری و دسترسی سریع‌تر به اطلاعات کسب‌وکار.
          </p>
        </header>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 sm:gap-6 lg:gap-7">
          {BENEFITS.map(({ title, description, Icon }) => (
            <article
              key={title}
              className="rounded-3xl border border-navy-100/80 bg-white p-7 shadow-[0_8px_30px_rgba(16,42,67,0.04)] transition-shadow duration-300 hover:shadow-[0_14px_40px_rgba(16,42,67,0.08)] sm:p-8"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#4285F4]">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              <h3 className="mt-5 text-[15px] font-extrabold leading-snug text-navy-900 sm:text-base">
                {title}
              </h3>
              <p className="mt-2.5 text-[13px] leading-relaxed text-navy-500 sm:text-[14px]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
