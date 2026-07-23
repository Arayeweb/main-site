"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { IconMenu, IconClose, IconArrowLeft } from "./icons";
import Logo from "./Logo";
import { openSiteChat } from "@/lib/openSiteChat";

const solutionLinks = [
  {
    label: "طراحی سایت",
    description: "سایت واضح با مسیر تماس، رزرو یا ثبت درخواست",
    href: "/website-design",
  },
  {
    label: "سایت فوری",
    description: "نسخه اول قابل انتشار در ۲۴ ساعت کاری",
    href: "/fastweb",
  },
  {
    label: "آرایه SEO",
    description: "حضور در گوگل و جذب مشتری از جست‌وجو",
    href: "/seo",
  },
  {
    label: "لندینگ فروش",
    description: "صفحه فروش سریع برای کمپین تبلیغاتی",
    href: "/adready",
  },
  {
    label: "ثبت گوگل مپ",
    description: "ثبت کسب‌وکار در گوگل، نشان، بلد و اسنپ",
    href: "/googlesabt",
  },
] as const;

const toolLinks = [
  {
    label: "کارت ویزیت دیجیتال",
    description: "لینک اختصاصی، QR کد و تماس در یک صفحه",
    href: "/bizcard",
  },
  {
    label: "کوتاه‌کننده لینک",
    description: "لینک کوتاه رایگان با آدرس دلخواه",
    href: "/shortener",
  },
  {
    label: "ساخت QR کد",
    description: "QR رایگان از لینک، متن و بیشتر",
    href: "/qr",
  },
  {
    label: "لینک نظر گوگل + QR",
    description: "لینک مستقیم ثبت نظر و QR قابل چاپ",
    href: "/review-link",
  },
  {
    label: "تست سئو محلی",
    description: "امتیاز آمادگی گوگل مپ و اقدامات فوری",
    href: "/local-seo-check",
  },
  {
    label: "محاسبه ROI سئو",
    description: "سود و نقطه سربه‌سر سرمایه‌گذاری سئو",
    href: "/seo-roi-calculator",
  },
] as const;

const navLinks = [
  { label: "نمونه خروجی‌ها", shortLabel: "نمونه‌ها", href: "/#real-portfolio" },
  { label: "هوش مصنوعی آرایه", shortLabel: "آرایه AI", href: "/ai", external: true },
  { label: "درباره آرایه", href: "/about" },
] as const;

const CHAT_CTA_HREF = "#chat";

type NavbarTone = "default" | "dark-hero";

interface NavbarProps {
  tone?: NavbarTone;
  solid?: boolean;
  ctaHref?: string;
  ctaLabel?: string;
  onCtaClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
}

function linkClass(onDarkHero: boolean, active = false) {
  const activeClass = active
    ? onDarkHero
      ? "bg-white/15 text-white"
      : "bg-brand-50 text-brand-700"
    : "";
  return onDarkHero
    ? `rounded-lg px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-white/75 transition-colors hover:bg-white/10 hover:text-white xl:px-3 ${activeClass}`
    : `rounded-lg px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-navy-500 transition-colors hover:bg-navy-50 hover:text-navy-900 xl:px-3 ${activeClass}`;
}

function isNavLinkActive(pathname: string, href: string) {
  if (href === "/about") return pathname === "/about";
  if (href === "/ai") return pathname.startsWith("/ai");
  return false;
}

function isSolutionsActive(pathname: string) {
  return (
    pathname.startsWith("/website-design") ||
    pathname.startsWith("/fastweb") ||
    pathname.startsWith("/seo") ||
    pathname.startsWith("/adready") ||
    pathname.startsWith("/googlesabt")
  );
}

function isToolsActive(pathname: string) {
  return (
    pathname.startsWith("/bizcard") ||
    pathname.startsWith("/shortener") ||
    pathname.startsWith("/qr") ||
    pathname.startsWith("/review-link") ||
    pathname.startsWith("/local-seo-check") ||
    pathname.startsWith("/seo-roi-calculator")
  );
}

function NavLinkLabel({ link }: { link: (typeof navLinks)[number] }) {
  if ("shortLabel" in link && link.shortLabel) {
    return (
      <>
        <span className="xl:hidden">{link.shortLabel}</span>
        <span className="hidden xl:inline">{link.label}</span>
      </>
    );
  }
  return <>{link.label}</>;
}

type DropdownItem = { label: string; description: string; href: string };

function DropdownMenu({
  items,
  onClose,
}: {
  items: readonly DropdownItem[];
  onClose: () => void;
}) {
  return (
    <div
      role="menu"
      className="absolute right-0 top-[calc(100%+0.35rem)] z-50 w-72 rounded-2xl border border-navy-100 bg-white p-2 shadow-xl"
    >
      {items.map((item) => (
        <a
          key={item.href}
          role="menuitem"
          href={item.href}
          onClick={onClose}
          className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-navy-50"
        >
          <span className="block text-[13px] font-bold text-navy-900">{item.label}</span>
          <span className="mt-0.5 block text-[12px] leading-relaxed text-navy-500">
            {item.description}
          </span>
        </a>
      ))}
    </div>
  );
}

export default function Navbar({
  tone = "default",
  solid = false,
  ctaHref = CHAT_CTA_HREF,
  ctaLabel = "شروع گفت‌وگو",
  onCtaClick,
}: NavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileSolutionsOpen, setMobileSolutionsOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const solutionsRef = useRef<HTMLLIElement>(null);
  const toolsRef = useRef<HTMLLIElement>(null);
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
    if (!solutionsOpen && !toolsOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
      if (!toolsRef.current?.contains(event.target as Node)) {
        setToolsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSolutionsOpen(false);
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [solutionsOpen, toolsOpen]);

  function handleCtaClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (onCtaClick) {
      event.preventDefault();
      onCtaClick(event);
      setOpen(false);
      return;
    }
    if (!opensChat) return;
    event.preventDefault();
    openSiteChat(open ? "navbar_mobile" : "navbar");
    setOpen(false);
  }

  const ctaClass = onDarkHero
    ? "hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-[13px] font-bold text-navy-900 transition-all duration-200 hover:bg-teal-50 active:scale-[0.98]"
    : "hidden sm:inline-flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-[13px] font-bold text-white transition-all duration-200 hover:bg-navy-800 active:scale-[0.98]";

  const showBar = scrolled || solid;
  const solutionsActive = isSolutionsActive(pathname);
  const toolsActive = isToolsActive(pathname);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          showBar
            ? "glass border-b border-navy-100 shadow-soft"
            : onDarkHero
              ? "bg-transparent"
              : "bg-transparent"
        }`}
      >
        <nav className="container-mx container-px flex h-14 items-center justify-between gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-2 xl:gap-4">
          <a href="/" className="shrink-0 lg:justify-self-start">
            <Logo size="sm" tone={onDarkHero && !showBar ? "light" : "default"} />
          </a>

          <ul className="hidden items-center gap-0.5 lg:flex lg:justify-self-center">
            <li ref={solutionsRef} className="relative">
              <button
                type="button"
                className={`inline-flex items-center gap-1 ${linkClass(onDarkHero, solutionsActive)}`}
                aria-expanded={solutionsOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setSolutionsOpen((value) => !value);
                  setToolsOpen(false);
                }}
              >
                راهکارها
                <span aria-hidden="true" className="text-[11px] opacity-70">
                  ▾
                </span>
              </button>
              {solutionsOpen && (
                <DropdownMenu items={solutionLinks} onClose={() => setSolutionsOpen(false)} />
              )}
            </li>

            <li ref={toolsRef} className="relative">
              <button
                type="button"
                className={`inline-flex items-center gap-1 ${linkClass(onDarkHero, toolsActive)}`}
                aria-expanded={toolsOpen}
                aria-haspopup="menu"
                onClick={() => {
                  setToolsOpen((value) => !value);
                  setSolutionsOpen(false);
                }}
              >
                ابزارها
                <span aria-hidden="true" className="text-[11px] opacity-70">
                  ▾
                </span>
              </button>
              {toolsOpen && (
                <DropdownMenu items={toolLinks} onClose={() => setToolsOpen(false)} />
              )}
            </li>

            {navLinks.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={linkClass(onDarkHero, active)}
                    aria-current={active ? "page" : undefined}
                  >
                    <NavLinkLabel link={link} />
                    {"external" in link && link.external ? (
                      <span aria-hidden="true" className="ms-0.5 text-[11px] opacity-70">
                        ↗
                      </span>
                    ) : null}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2 lg:justify-self-end">
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

              <li>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-base font-medium text-navy-700 hover:bg-navy-50"
                  aria-expanded={mobileToolsOpen}
                  onClick={() => setMobileToolsOpen((value) => !value)}
                >
                  <span>
                    ابزارها{" "}
                    <span aria-hidden="true" className="text-sm text-navy-400">
                      ▾
                    </span>
                  </span>
                  <IconArrowLeft
                    size={16}
                    className={`text-navy-300 transition-transform ${mobileToolsOpen ? "-rotate-90" : ""}`}
                  />
                </button>

                {mobileToolsOpen && (
                  <ul className="mt-1 space-y-1 border-r-2 border-navy-100 pr-3 mr-3">
                    {toolLinks.map((item) => (
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

              {navLinks.map((link) => {
                const active = isNavLinkActive(pathname, link.href);
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium hover:bg-navy-50 ${
                        active ? "bg-brand-50 text-brand-700" : "text-navy-700"
                      }`}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>
                        <NavLinkLabel link={link} />
                        {"external" in link && link.external ? (
                          <span aria-hidden="true" className="ms-1 text-sm text-navy-400">
                            ↗
                          </span>
                        ) : null}
                      </span>
                      <IconArrowLeft size={16} className="text-navy-300" />
                    </a>
                  </li>
                );
              })}
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
