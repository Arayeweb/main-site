const QUOTES = [
  {
    name: "دکتر عالیه پوردست",
    role: "متخصص بیماری‌های عفونی",
    text: "بیماران بیشتر از گوگل ما را پیدا می‌کنند. اطلاعات مطب و راه تماس مرتب شد.",
    initial: "ع",
    href: "https://aliehpourdast.com",
  },
  {
    name: "دکتر طاهره پوردست",
    role: "متخصص زنان و زایمان",
    text: "برای جست‌وجوهای مربوط به مطب زنان، حضورمان در گوگل شفاف‌تر شد و نوبت‌گیری راحت‌تر شده.",
    initial: "ط",
  },
  {
    name: "کلینیک سلامت",
    role: "مراقبت و درمان",
    text: "حضورمان در نقشه درست شد؛ مشتری قبل از آمدن آدرس و ساعت کاری را می‌بیند.",
    initial: "س",
    href: "https://araaye.com/b/salamt-clinic",
  },
  {
    name: "شاپه رستوان تگزاسی",
    role: "کرمان",
    text: "جست‌وجوی رستوران در کرمان دیگر بی‌نتیجه نیست؛ تماس و مسیر روی نقشه واضح شده.",
    initial: "ر",
  },
  {
    name: "امداد آهن",
    role: "تولیدی آهن",
    text: "پیمانکارها از گوگل و نقشه ما را پیدا می‌کنند؛ شماره تماس و آدرس انبار دقیق ثبت شده.",
    initial: "ا",
  },
  {
    name: "شیوا اشرفی‌وند",
    role: "شنوایی‌سنجی",
    text: "کسانی که برای سمعک یا مشاوره شنوایی جست‌وجو می‌کنند، راحت‌تر به کلینیک ما می‌رسند.",
    initial: "ش",
  },
  {
    name: "فروشگاه لباس پارس",
    role: "پوشاک",
    text: "اطلاعات فروشگاه در گوگل کامل شد؛ مشتری قبل از مراجعه آدرس و ساعات کاری را می‌بیند.",
    initial: "پ",
  },
  {
    name: "پلتفرم امروز",
    role: "محصول دیجیتال",
    text: "مسیر پیدا شدن محصول در جست‌وجو شفاف‌تر شد؛ کاربر جدید راحت‌تر به سایت ما می‌رسد.",
    initial: "ا",
    href: "https://emroz.top",
  },
] as const;

export default function SeoCustomerQuotes() {
  return (
    <section className="seo-quotes" aria-label="نظر مشتریان">
      <div className="container-mx container-px">
        <p className="seo-quotes-title">مشتریان ما چه می‌گویند</p>
        <ul className="seo-quotes-list">
          {QUOTES.map((item) => (
            <li key={item.name} className="seo-quotes-item">
              <span className="seo-quotes-avatar" aria-hidden="true">
                {item.initial}
              </span>
              <div className="seo-quotes-body">
                <p className="seo-quotes-name">
                  {"href" in item && item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="seo-quotes-link"
                    >
                      {item.name}
                    </a>
                  ) : (
                    item.name
                  )}
                </p>
                <p className="seo-quotes-role">{item.role}</p>
                <p className="seo-quotes-text">&ldquo;{item.text}&rdquo;</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
