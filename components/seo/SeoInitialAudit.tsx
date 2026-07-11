const EXECUTION_ROWS = [
  {
    found: "اطلاعات ناقص است",
    actionShort: "اطلاعات کسب‌وکار تکمیل می‌شود",
    actionDetail:
      "نام، آدرس، شماره تماس، ساعات کاری، تصاویر و اطلاعات نقشه را تکمیل می‌کنیم.",
    preview: "map",
  },
  {
    found: "برای خدمات مهم صفحه ندارید",
    actionShort: "صفحه معرفی خدمت ساخته می‌شود",
    actionDetail: "برای خدمات و جست‌وجوهای مهم کسب‌وکارتان صفحه مناسب می‌سازیم.",
    preview: "page",
  },
  {
    found: "اعتماد کافی شکل نمی‌گیرد",
    actionShort: "اعتبار آنلاین مرتب می‌شود",
    actionDetail:
      "اطلاعات، تصاویر و مسیر دریافت نظر واقعی مشتریان را مرتب می‌کنیم.",
    preview: "photos",
  },
  {
    found: "تماس‌گرفتن دشوار است",
    actionShort: "مسیر تماس واضح می‌شود",
    actionDetail:
      "دکمه تماس، فرم درخواست و راه‌های ارتباطی را واضح و در دسترس قرار می‌دهیم.",
    preview: "contact",
  },
] as const;

function MapPreview() {
  return (
    <div className="seo-exec-preview seo-exec-preview--map" aria-hidden="true">
      <div className="seo-exec-map-tiles">
        <span />
        <span />
        <span className="seo-exec-map-pin" />
      </div>
      <div className="seo-exec-map-fields">
        <span className="is-filled">کلینیک پوست آبتین</span>
        <span className="is-filled">سعادت‌آباد، تهران</span>
        <span className="is-empty">ساعات کاری</span>
        <span className="is-empty">شماره تماس</span>
      </div>
    </div>
  );
}

function PagePreview() {
  return (
    <div className="seo-exec-preview seo-exec-preview--page" aria-hidden="true">
      <div className="seo-exec-page-bar">
        <span />
        <span />
        <span />
      </div>
      <p className="seo-exec-page-title">خدمات لیزر پوست</p>
      <p className="seo-exec-page-line" />
      <p className="seo-exec-page-line seo-exec-page-line--short" />
      <span className="seo-exec-page-cta">درخواست مشاوره</span>
    </div>
  );
}

function PhotosPreview() {
  return (
    <div className="seo-exec-preview seo-exec-preview--photos" aria-hidden="true">
      <div className="seo-exec-photo-grid">
        <span />
        <span />
        <span />
      </div>
      <div className="seo-exec-review">
        <span className="seo-exec-review-stars">★★★★★</span>
        <span className="seo-exec-review-text">نظر مشتری ثبت شد</span>
      </div>
    </div>
  );
}

function ContactPreview() {
  return (
    <div className="seo-exec-preview seo-exec-preview--contact" aria-hidden="true">
      <span className="seo-exec-contact-btn">تماس</span>
      <div className="seo-exec-contact-field">نام</div>
      <div className="seo-exec-contact-field">موبایل</div>
      <span className="seo-exec-contact-submit">ثبت درخواست</span>
    </div>
  );
}

function RowPreview({ type }: { type: (typeof EXECUTION_ROWS)[number]["preview"] }) {
  switch (type) {
    case "map":
      return <MapPreview />;
    case "page":
      return <PagePreview />;
    case "photos":
      return <PhotosPreview />;
    case "contact":
      return <ContactPreview />;
  }
}

export default function SeoInitialAudit() {
  return (
    <section className="seo-execution section-py" aria-label="از بررسی تا اجرا">
      <div className="container-mx container-px">
        <div className="seo-execution-layout">
          <div className="seo-execution-copy">
            <span className="seo-section-tag">بعد از بررسی</span>
            <h2>گزارش را به کارهای مشخص تبدیل می‌کنیم</h2>
            <p>
              هر مشکلی که در حضور گوگل پیدا شود، به یک اقدام روشن برای بهتر
              دیده‌شدن و ساده‌تر شدن تماس مشتری تبدیل می‌شود.
            </p>
          </div>

          <div className="seo-execution-rows">
            {EXECUTION_ROWS.map((row) => (
              <article key={row.found} className="seo-execution-row">
                <div className="seo-execution-row-main">
                  <div className="seo-execution-flow">
                    <span className="seo-execution-found">{row.found}</span>
                    <span className="seo-execution-arrow" aria-hidden="true">
                      ←
                    </span>
                    <span className="seo-execution-action">{row.actionShort}</span>
                  </div>
                  <p className="seo-execution-detail">{row.actionDetail}</p>
                </div>
                <RowPreview type={row.preview} />
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
