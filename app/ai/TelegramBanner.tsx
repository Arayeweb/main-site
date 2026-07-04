"use client";

import { useEffect, useState } from "react";
import { IconX } from "./icons";

const TELEGRAM_BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/araaye_ai";

/** بنر کانال/بات تلگرام — distribution مثل Hoosha */
export default function TelegramBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem("ar-tg-dismiss") === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed) return null;

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem("ar-tg-dismiss", "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="ar-telegram-banner" role="region" aria-label="تلگرام">
      <p>
        اعلان وضعیت ویدیو و لینک سریع —{" "}
        <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer">
          ربات تلگرام آرایه AI
        </a>
      </p>
      <button type="button" className="ar-pwa-banner-close" aria-label="بستن" onClick={dismiss}>
        <IconX size={14} />
      </button>
    </div>
  );
}
