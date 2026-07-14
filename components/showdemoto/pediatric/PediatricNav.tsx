"use client";

import { useState } from "react";
import { pedBrand, pedNav } from "@/lib/showdemoto/pediatric/config";
import styles from "./pediatric.module.css";

export default function PediatricNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <a href="#top" className={styles.logo}>
          {pedBrand.name}
          <span>{pedBrand.doctor}</span>
        </a>

        <nav className={styles.nav} aria-label="ناوبری اصلی">
          {pedNav.map((item) => (
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
          aria-controls="ped-mobile-nav"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open ? (
        <nav
          id="ped-mobile-nav"
          className={`${styles.wrap} ${styles.mobileNav}`}
          aria-label="منوی موبایل"
        >
          {pedNav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
