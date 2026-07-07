"use client";

import { useState, useEffect } from "react";
import { IconMenu, IconClose, IconArrowLeft } from "./icons";
import Logo from "./Logo";

const navLinks = [
  { label: "خدمات", href: "/#services" },
  { label: "نمونه‌کارها", href: "/#real-portfolio" },
  { label: "صنایع", href: "/#industries" },
  { label: "سئو محلی", href: "/seo" },
  { label: "درباره ما", href: "/#about" },
];

type NavbarTone = "default" | "dark-hero";

interface NavbarProps {
  tone?: NavbarTone;
  ctaHref?: string;
  ctaLabel?: string;
}

export default function Navbar({
  tone = "default",
  ctaHref = "#cta",
  ctaLabel = "مشاوره رایگان",
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const onDarkHero = tone === "dark-hero" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b border-navy-100 shadow-soft"
            : onDarkHero
              ? "bg-transparent"
              : "bg-transparent"
        }`}
      >
        <nav className="container-mx container-px flex h-14 items-center justify-between gap-4">
          <a href="/" className="shrink-0">
            <Logo size="sm" tone={onDarkHero ? "light" : "default"} />
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={
                    onDarkHero
                      ? "rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
                      : "rounded-lg px-3 py-1.5 text-[13px] font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900"
                  }
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={ctaHref}
              className={
                onDarkHero
                  ? "hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-navy-900 transition-all duration-200 hover:bg-teal-50 active:scale-[0.98]"
                  : "hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-[13px] font-bold text-white transition-all duration-200 hover:bg-navy-800 active:scale-[0.98]"
              }
            >
              {ctaLabel}
            </a>
            <button
              className={
                onDarkHero
                  ? "lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-white hover:bg-white/10"
                  : "lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-navy-700 hover:bg-navy-50"
              }
              onClick={() => setOpen(true)}
              aria-label="منو"
            >
              <IconMenu size={20} />
            </button>
          </div>
        </nav>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-slide-down flex flex-col">
            <div className="flex items-center justify-between border-b border-navy-100 px-5 h-14">
              <Logo size="sm" />
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-navy-600 hover:bg-navy-50"
                onClick={() => setOpen(false)}
                aria-label="بستن"
              >
                <IconClose size={20} />
              </button>
            </div>
            <ul className="flex flex-col gap-1 p-4 flex-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-navy-700 hover:bg-navy-50"
                  >
                    {link.label}
                    <IconArrowLeft size={16} className="text-navy-300" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="border-t border-navy-100 p-4">
              <a
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="btn-primary w-full"
              >
                {ctaLabel}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
