"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { captureCampaignParams } from "@/lib/aiTracking";
import { safeElementText, shouldTrackPath } from "@/lib/analytics/core";
import { pushGtmEvent } from "@/lib/gtm";
import { recordPageview } from "@/lib/pageviewTracking";

function elementLocation(element: Element): string {
  return (
    element.closest("[data-analytics-location]")?.getAttribute("data-analytics-location") ||
    element.closest("header,nav,main,aside,footer")?.tagName.toLowerCase() ||
    "body"
  );
}

/** First-party page, engagement, navigation and form tracking for all Araaye surfaces. */
export default function SitePageviewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldTrackPath(pathname)) return;
    captureCampaignParams();
    recordPageview(pathname);
    const dedupKey = `__ary_canonical_page_view_${pathname}`;
    try {
      const last = Number(sessionStorage.getItem(dedupKey) || 0);
      if (Date.now() - last >= 1500) {
        sessionStorage.setItem(dedupKey, String(Date.now()));
        pushGtmEvent("page_view", { page_title: document.title });
      }
    } catch {
      pushGtmEvent("page_view", { page_title: document.title });
    }
  }, [pathname]);

  useEffect(() => {
    if (!shouldTrackPath(pathname)) return;

    const sessionKey = "__ary_session_started";
    try {
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");
        pushGtmEvent("session_started");
      }
    } catch {
      pushGtmEvent("session_started");
    }

    const firedDepths = new Set<number>();
    const startedForms = new WeakSet<HTMLFormElement>();
    const startedAt = Date.now();

    const onScroll = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      if (available <= 0) return;
      const percent = Math.round((window.scrollY / available) * 100);
      for (const depth of [25, 50, 75, 100]) {
        if (percent >= depth && !firedDepths.has(depth)) {
          firedDepths.add(depth);
          pushGtmEvent("scroll_depth", { depth });
        }
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>("a,button,[data-analytics-event]")
        : null;
      if (!target || target.dataset.analyticsIgnore === "true") return;

      const explicitEvent = target.dataset.analyticsEvent;
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") || "" : "";
      const text = safeElementText(target.getAttribute("aria-label") || target.textContent);
      const base = {
        element_type: target.tagName.toLowerCase(),
        element_text: text,
        location: elementLocation(target),
      };

      if (explicitEvent) {
        pushGtmEvent(explicitEvent, {
          ...base,
          target: target.dataset.analyticsTarget,
        });
      } else if (href.startsWith("tel:")) {
        pushGtmEvent("phone_clicked", base);
      } else if (/wa\.me|whatsapp/i.test(href)) {
        pushGtmEvent("whatsapp_clicked", base);
      } else if (href) {
        try {
          const url = new URL(href, window.location.href);
          pushGtmEvent(
            url.origin === window.location.origin ? "internal_link_clicked" : "outbound_link_clicked",
            {
              ...base,
              link_path: url.origin === window.location.origin ? url.pathname : undefined,
              link_domain: url.origin === window.location.origin ? undefined : url.hostname,
            }
          );
        } catch {
          // Invalid or application-specific href; explicit tracking can be added by data attribute.
        }
      }
    };

    const onFocusIn = (event: FocusEvent) => {
      const form = event.target instanceof Element ? event.target.closest("form") : null;
      if (!form || startedForms.has(form)) return;
      startedForms.add(form);
      pushGtmEvent("form_started", {
        form_name: form.getAttribute("name") || form.id || form.dataset.analyticsForm || "unnamed",
        location: elementLocation(form),
      });
    };

    const onSubmit = (event: SubmitEvent) => {
      const form = event.target instanceof HTMLFormElement ? event.target : null;
      if (!form) return;
      pushGtmEvent("form_submit_attempted", {
        form_name: form.getAttribute("name") || form.id || form.dataset.analyticsForm || "unnamed",
        location: elementLocation(form),
      });
    };

    const onError = () => {
      pushGtmEvent("client_error", { error_type: "window_error" });
    };
    const onUnhandledRejection = () => {
      pushGtmEvent("client_error", { error_type: "unhandled_rejection" });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("submit", onSubmit);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      const seconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      pushGtmEvent("page_left", { page: pathname, engagement_time_seconds: seconds });
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("submit", onSubmit);
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, [pathname]);

  return null;
}
