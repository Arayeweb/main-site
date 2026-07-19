"use client";

import { useEffect, useState } from "react";
import { IconX } from "./icons";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia("(display-mode: standalone)").matches;
  const ios =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return mq || ios;
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isWebkit = /WebKit/i.test(ua);
  const isChromeOrFx = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return isIOS && isWebkit && !isChromeOrFx;
}

export default function PWAInstallBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalonePwa()) {
      setInstalled(true);
      return;
    }
    try {
      if (localStorage.getItem("ar-pwa-dismiss") === "1") setDismissed(true);
    } catch {
      /* ignore */
    }

    if (isIosSafari()) {
      setIosHint(true);
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setIosHint(false);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (installed || dismissed) return null;
  if (!deferred && !iosHint) return null;

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
      {deferred ? (
        <>
          <p>آرایه AI را روی گوشی نصب کن — دسترسی سریع‌تر مثل اپ.</p>
          <div className="ar-pwa-banner-actions">
            <button type="button" className="ar-btn ar-btn-primary ar-btn-sm" onClick={install}>
              نصب
            </button>
            <button type="button" className="ar-pwa-banner-close" aria-label="بستن" onClick={dismiss}>
              <IconX size={14} />
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            برای نصب روی آیفون: Share
            <span aria-hidden="true"> ⎋ </span>
            سپس «Add to Home Screen».
          </p>
          <div className="ar-pwa-banner-actions">
            <button type="button" className="ar-pwa-banner-close" aria-label="بستن" onClick={dismiss}>
              <IconX size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
