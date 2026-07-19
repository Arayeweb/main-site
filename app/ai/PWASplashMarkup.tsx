/** Static SSR splash markup for installed PWA cold start (pre-hydrate). */
export default function PWASplashMarkup() {
  return (
    <div
      id="ar-pwa-splash"
      className="ar-pwa-splash"
      role="status"
      aria-live="polite"
      aria-label="در حال بارگذاری آرایه AI"
    >
      <div className="ar-pwa-splash-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="ar-pwa-splash-logo"
          src="/assets/ai-icon-192.png"
          alt=""
          width={72}
          height={72}
          decoding="async"
          fetchPriority="high"
        />
        <p className="ar-pwa-splash-brand">آرایه AI</p>
        <div className="ar-pwa-splash-spinner" aria-hidden="true" />
        <p className="ar-pwa-splash-hint">در حال آماده‌سازی…</p>
      </div>
    </div>
  );
}
