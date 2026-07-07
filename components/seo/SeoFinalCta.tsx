import Link from "next/link";

export default function SeoFinalCta() {
  return (
    <section className="seo-final section-py">
      <div className="container-mx container-px">
        <div className="seo-final-cta">
          <h2>گوگل باید برای کسب‌وکارت مشتری بیاورد.</h2>
          <p>
            آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند. مشاوره رایگان بگیرید
            و ببینید مسیر لید از گوگل برای کسب‌وکار شما چطور ساخته می‌شود.
          </p>
          <div className="seo-final-cta-actions">
            <a href="#lead-form" className="seo-btn-primary seo-btn-lg">
              مشاوره رایگان سرچ تا لید
            </a>
            <Link href="/" className="seo-btn-secondary seo-btn-lg">
              سایر خدمات آرایه
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
