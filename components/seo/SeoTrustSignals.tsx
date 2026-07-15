import { seoTrustSignals } from "@/lib/seoData";

export default function SeoTrustSignals() {
  return (
    <section className="seo-trust" aria-label="اعتماد و شفافیت">
      <div className="container-mx container-px">
        <ul className="seo-trust-row">
          {seoTrustSignals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
