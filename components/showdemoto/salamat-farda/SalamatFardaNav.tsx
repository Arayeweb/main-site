"use client";

import { useState } from "react";
import { sfNav } from "@/lib/showdemoto/salamat-farda/config";
import styles from "./salamat-farda.module.css";

export default function SalamatFardaNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <a href="#top" className={styles.logo}>
          مرکز تخصصی چشم
          <span>بیمارستان سلامت فردا</span>
        </a>

        <nav className={styles.nav} aria-label="ناوبری اصلی">
          {sfNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === "#contact" ? styles.navCta : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="sf-mobile-nav"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open ? (
        <nav
          id="sf-mobile-nav"
          className={`${styles.wrap} ${styles.mobileNav}`}
          aria-label="منوی موبایل"
        >
          {sfNav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
