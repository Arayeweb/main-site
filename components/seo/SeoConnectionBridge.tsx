import { seoBridgeSteps } from "@/lib/seoData";

export default function SeoConnectionBridge() {
  return (
    <section className="seo-bridge" aria-label="مسیر اتصال سئو به فروش">
      <div className="container-mx container-px">
        <p className="seo-bridge-headline">
          آرایه سئو را به لندینگ‌پیج، لید، CRM و فروش وصل می‌کند.
        </p>
        <div className="seo-bridge-track">
          {seoBridgeSteps.map((step, i) => (
            <div key={step.label} className="seo-bridge-step">
              <div className="seo-bridge-node">
                <span className="seo-bridge-num">{i + 1}</span>
                <span className="seo-bridge-label">{step.label}</span>
              </div>
              <p className="seo-bridge-desc">{step.desc}</p>
              {i < seoBridgeSteps.length - 1 && (
                <span className="seo-bridge-arrow" aria-hidden>
                  ←
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
