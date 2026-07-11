"use client";

import { useState } from "react";
import { kavehNav } from "@/lib/showcaseSites/kaveh/config";
import styles from "./kaveh.module.css";

export default function KavehNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <a href="#top" className={styles.logo}>
          آهن کاوه
          <span>فروش و تأمین آهن‌آلات ساختمانی</span>
        </a>

        <nav className={styles.nav} aria-label="ناوبری اصلی">
          {kavehNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === "#quote" ? styles.navCta : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="kaveh-mobile-nav"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open ? (
        <nav
          id="kaveh-mobile-nav"
          className={`${styles.wrap} ${styles.mobileNav}`}
          aria-label="منوی موبایل"
        >
          {kavehNav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
