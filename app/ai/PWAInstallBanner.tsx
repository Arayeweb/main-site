"use client";

import { useEffect, useState } from "react";
import { IconX } from "./icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export default function PWAInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }
    try {
      if (localStorage.getItem("ar-pwa-dismiss") === "1") setDismissed(true);
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (installed || dismissed || !deferred) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem("ar-pwa-dismiss", "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="ar-pwa-banner" role="region" aria-label="نصب اپ">
      <p>آرایه AI را روی گوشی نصب کن — دسترسی سریع‌تر مثل Hoosha.</p>
      <div className="ar-pwa-banner-actions">
        <button type="button" className="ar-btn ar-btn-primary ar-btn-sm" onClick={install}>
          نصب
        </button>
        <button type="button" className="ar-pwa-banner-close" aria-label="بستن" onClick={dismiss}>
          <IconX size={14} />
        </button>
      </div>
    </div>
  );
}
