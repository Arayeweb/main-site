"use client";

import { useState, useEffect, useRef } from "react";
import { IconMenu, IconClose, IconArrowLeft } from "./icons";
import Logo from "./Logo";

const solutionLinks = [
  {
    label: "طراحی سایت",
    description: "سایت واضح با مسیر تماس، رزرو یا ثبت درخواست",
    href: "/#cta",
  },
  {
    label: "آرایه SEO",
    description: "حضور در گوگل و جذب مشتری از جست‌وجو",
    href: "/seo",
  },
  {
    label: "AdReady",
    description: "صفحه فروش سریع برای کمپین تبلیغاتی",
    href: "/adready",
  },
] as const;

const navLinks = [
  { label: "نمونه خروجی‌ها", href: "/#real-portfolio" },
  { label: "هوش مصنوعی آرایه", href: "/ai", external: true },
  { label: "درباره آرایه", href: "/#faq" },
] as const;

const CHAT_CTA_HREF = "#chat";

type NavbarTone = "default" | "dark-hero";

interface NavbarProps {
  tone?: NavbarTone;
  ctaHref?: string;
  ctaLabel?: string;
}

function linkClass(onDarkHero: boolean) {
  return onDarkHero
    ? "rounded-lg px-3 py-1.5 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
    : "rounded-lg px-3 py-1.5 text-[13px] font-medium text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900";
}

import { openSiteChat } from "@/lib/openSiteChat";

export default function Navbar({
  tone = "default",
  ctaHref = CHAT_CTA_HREF,
  ctaLabel = "شروع گفت‌وگو",
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const solutionsRef = useRef<HTMLLIElement>(null);
  const onDarkHero = tone === "dark-hero" && !scrolled;
  const opensChat = ctaHref === CHAT_CTA_HREF;

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

  useEffect(() => {
    if (!solutionsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSolutionsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [solutionsOpen]);

  function handleCtaClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!opensChat) return;
    event.preventDefault();
    openSiteChat(open ? "navbar_mobile" : "navbar");
    setOpen(false);
  }

  const ctaClass = onDarkHero
    ? "hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-navy-900 transition-all duration-200 hover:bg-teal-50 active:scale-[0.98]"
    : "hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-[13px] font-bold text-white transition-all duration-200 hover:bg-navy-800 active:scale-[0.98]";

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
            <li ref={solutionsRef} className="relative">
              <button
                type="button"
                className={`inline-flex items-center gap-1 ${linkClass(onDarkHero)}`}
                aria-expanded={solutionsOpen}
                aria-haspopup="menu"
                onClick={() => setSolutionsOpen((value) => !value)}
              >
                راهکارها
                <span aria-hidden="true" className="text-[11px] opacity-70">
                  ▾
                </span>
              </button>

              {solutionsOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.35rem)] z-50 w-72 rounded-2xl border border-navy-100 bg-white p-2 shadow-xl"
                >
                  {solutionLinks.map((item) => (
                    <a
                      key={item.href}
                      role="menuitem"
                      href={item.href}
                      onClick={() => setSolutionsOpen(false)}
                      className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-navy-50"
                    >
                      <span className="block text-[13px] font-bold text-navy-900">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[12px] leading-relaxed text-navy-500">
                        {item.description}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </li>

            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className={linkClass(onDarkHero)}>
                  {link.label}
                  {"external" in link && link.external ? (
                    <span aria-hidden="true" className="ms-0.5 text-[11px] opacity-70">
                      ↗
                    </span>
                  ) : null}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <a href={ctaHref} onClick={handleCtaClick} className={ctaClass}>
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

            <ul className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
              <li>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-navy-700 hover:bg-navy-50"
                  aria-expanded={mobileSolutionsOpen}
                  onClick={() => setMobileSolutionsOpen((value) => !value)}
                >
                  <span>
                    راهکارها{" "}
                    <span aria-hidden="true" className="text-sm text-navy-400">
                      ▾
                    </span>
                  </span>
                  <IconArrowLeft
                    size={16}
                    className={`text-navy-300 transition-transform ${mobileSolutionsOpen ? "-rotate-90" : ""}`}
                  />
                </button>

                {mobileSolutionsOpen && (
                  <ul className="mt-1 space-y-1 border-r-2 border-navy-100 pr-3 mr-3">
                    {solutionLinks.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className="block rounded-xl px-4 py-3 hover:bg-navy-50"
                        >
                          <span className="block text-sm font-semibold text-navy-800">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-navy-500">
                            {item.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>

              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-navy-700 hover:bg-navy-50"
                  >
                    <span>
                      {link.label}
                      {"external" in link && link.external ? (
                        <span aria-hidden="true" className="ms-1 text-sm text-navy-400">
                          ↗
                        </span>
                      ) : null}
                    </span>
                    <IconArrowLeft size={16} className="text-navy-300" />
                  </a>
                </li>
              ))}
            </ul>

            <div className="border-t border-navy-100 p-4">
              <a
                href={ctaHref}
                onClick={(event) => {
                  handleCtaClick(event);
                  if (!opensChat) setOpen(false);
                }}
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
