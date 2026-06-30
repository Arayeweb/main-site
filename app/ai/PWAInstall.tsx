"use client";

import { useEffect, useState, useCallback } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

export default function PWAInstall() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(true); // assume installed until we know otherwise
  const [showIOSHelp, setShowIOSHelp] = useState(false);
  const ios = isIOS();

  // Register the service worker (scoped to /ai).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/ai-sw.js", { scope: "/ai" })
      .catch(() => {/* SW optional — ignore failures */});
  }, []);

  useEffect(() => {
    setInstalled(isStandalone());

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setInstalled(false);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
      setShowIOSHelp(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const onClick = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferred(null);
      return;
    }
    if (ios) setShowIOSHelp((v) => !v);
  }, [deferred, ios]);

  // Already installed → nothing to show.
  if (installed) return null;
  // No native prompt available and not iOS → browser can't install; hide.
  if (!deferred && !ios) return null;

  return (
    <div className="ai-pwa-wrap">
      <button
        className="ai-btn ai-btn-ghost ai-btn-sm ai-pwa-btn"
        onClick={onClick}
        aria-label="نصب اپ آرایه"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3v11m0 0 4-4m-4 4-4-4M5 19h14"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        نصب اپ
      </button>

      {ios && showIOSHelp && (
        <>
          <div className="ai-pwa-backdrop" onClick={() => setShowIOSHelp(false)} />
          <div className="ai-pwa-pop" role="dialog" aria-label="راهنمای نصب">
            <strong>نصب روی آیفون</strong>
            <ol>
              <li>
                دکمه‌ی <b>اشتراک‌گذاری</b> (مربع با فلش رو به بالا) را در نوار سافاری بزن.
              </li>
              <li>
                گزینه‌ی <b>«افزودن به صفحهٔ اصلی»</b> را انتخاب کن.
              </li>
              <li>
                روی <b>افزودن</b> بزن — آرایه AI مثل یک اپ روی گوشی نصب می‌شود.
              </li>
            </ol>
            <button className="ai-btn ai-btn-ghost ai-btn-sm" onClick={() => setShowIOSHelp(false)}>
              باشه
            </button>
          </div>
        </>
      )}
    </div>
  );
}
