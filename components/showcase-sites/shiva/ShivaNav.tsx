"use client";

import { useState } from "react";
import { shivaNav } from "@/lib/showcaseSites/shiva/config";
import styles from "./shiva.module.css";

export default function ShivaNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.headerInner}`}>
        <a href="#top" className={styles.logo}>
          کلینیک شنوایی شیوا
          <span>ارزیابی شنوایی و سمعک</span>
        </a>

        <nav className={styles.nav} aria-label="ناوبری اصلی">
          {shivaNav.map((item) => (
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
          aria-controls="shiva-mobile-nav"
          aria-label={open ? "بستن منو" : "باز کردن منو"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : "☰"}
        </button>
      </div>

      {open ? (
        <nav id="shiva-mobile-nav" className={`${styles.wrap} ${styles.mobileNav}`} aria-label="منوی موبایل">
          {shivaNav.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
