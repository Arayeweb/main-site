"use client";

import { useState } from "react";
import { medisaNav } from "@/lib/showcaseSites/medisa/config";
import styles from "./medisa.module.css";

export default function MedisaNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <a href="#top" className={styles.logo}>
          Medisa
          <span>استودیو معماری</span>
        </a>

        <nav className={styles.nav} aria-label="ناوبری اصلی">
          {medisaNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={item.href === "#inquiry" ? styles.navCta : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="medisa-mobile-nav"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open ? (
        <nav
          id="medisa-mobile-nav"
          className={`${styles.wrap} ${styles.mobileNav}`}
          aria-label="منوی موبایل"
        >
          {medisaNav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
