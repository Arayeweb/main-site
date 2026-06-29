/* =========================================================
   آرایه — main.js
   Orchestration: analytics shim, scroll behaviors, reveals,
   hero demo loop, scroll-intent nudge, CTA routing.
   No external dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Analytics shim (GA4/PostHog/GTM-ready, no external script) ----------
     Events fired: page_view, cta_click, form_step, form_submit, chat_open,
     chat_reply, chat_recommend, lead_captured, hero_form_error, etc.
     To send events to your own backend, set window.ARAYEH_ANALYTICS_ENDPOINT.
     To use GA4, load gtag and push dataLayer events; this shim already prepares them. */
  window.dataLayer = window.dataLayer || [];
  const ANALYTICS_ENDPOINT = window.ARAYEH_ANALYTICS_ENDPOINT || null;
  const track = (window.track = function (event, props) {
    const payload = Object.assign({ event: event, ts: Date.now(), page: location.pathname }, props || {});
    window.dataLayer.push(payload);
    if (ANALYTICS_ENDPOINT) {
      fetch(ANALYTICS_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(function () {});
    }
    if (window.console) console.debug("[track]", event, props || {});
  });
  track("page_view", { title: document.title, referrer: document.referrer });

  /* ---------- page-view tracker ----------
     هر بازدید صفحه را ثبت می‌کند (نه فقط ترافیک UTM‌دار).
     UTM (در صورت وجود) هم ثبت و برای فرم‌ها ذخیره می‌شود.
     یک گارد کوتاه جلوی ثبت دوبارهٔ همان صفحه (reload/bfcache) را می‌گیرد. */
  (function () {
    var p = new URLSearchParams(location.search);
    var utmSource = p.get("utm_source");
    var payload = {
      page: location.pathname,
      utm_source: utmSource || undefined,
      utm_medium: p.get("utm_medium") || undefined,
      utm_campaign: p.get("utm_campaign") || undefined,
      utm_content: p.get("utm_content") || undefined,
      utm_term: p.get("utm_term") || undefined,
      referrer: document.referrer || undefined,
    };
    // ذخیرهٔ UTM برای پیش‌پرکردن فرم‌ها (فقط وقتی موجود باشد)
    if (utmSource) { try { sessionStorage.setItem("__utms", JSON.stringify(payload)); } catch (_) {} }
    // گارد ضدِ ثبت تکراری در بازهٔ کوتاه (مثلاً بازگشت bfcache یا دابل‌فایر)
    var dedupKey = "__pv_seen_" + location.pathname;
    try {
      var last = Number(sessionStorage.getItem(dedupKey) || 0);
      if (Date.now() - last < 1500) return;
      sessionStorage.setItem(dedupKey, String(Date.now()));
    } catch (_) {}
    fetch("/api/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(function () {});
  })();

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Delegated CTA / action routing ---------- */
  document.addEventListener("click", function (e) {
    const el = e.target.closest("[data-track]");
    if (el && el.dataset.track) track(el.dataset.track, { cta: el.dataset.cta || null });

    const actor = e.target.closest("[data-action]");
    if (!actor) return;
    const action = actor.dataset.action;

    if (action === "open-chat") {
      e.preventDefault();
      window.Arayeh && window.Arayeh.openChat && window.Arayeh.openChat(actor.dataset.from || "cta");
    } else if (action === "close-chat") {
      window.Arayeh && window.Arayeh.closeChat && window.Arayeh.closeChat();
    } else if (action === "goto-form") {
      e.preventDefault();
      if (actor.dataset.plan && window.Arayeh && window.Arayeh.presetPlan) {
        window.Arayeh.presetPlan(actor.dataset.plan);
      }
      closeExit();
      smoothTo("#leadform");
    } else if (action === "close-exit") {
      closeExit();
    }
  });

  /* ---------- Smooth scroll for in-page anchors ---------- */
  function smoothTo(hash) {
    const target = document.querySelector(hash);
    if (!target) return;
    target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    const input = target.querySelector("input, textarea, select");
    if (input) {
      setTimeout(function () { input.focus(); }, reduceMotion ? 0 : 400);
    }
  }
  document.addEventListener("click", function (e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      smoothTo(id);
    }
  });

  /* ---------- Sticky header shadow ---------- */
  const header = $(".site-header");
  const stickyCta = $("#stickyCta");
  const leadform = $("#leadform");
  const hero = $(".hero");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    if (!stickyCta) return;
    // show sticky CTA once user has scrolled past hero and form is not yet visible
    const heroBottom = hero ? hero.getBoundingClientRect().bottom : 300;
    const formVisible = leadform ? leadform.getBoundingClientRect().top < window.innerHeight : false;
    const show = heroBottom < 120 && !formVisible && !document.body.classList.contains("chat-open");
    stickyCta.classList.toggle("is-hidden", !show);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- IntersectionObserver reveals ---------- */
  const reveals = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach((r) => r.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.revealDelay || "0", 10);
            setTimeout(() => entry.target.classList.add("is-in"), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((r) => io.observe(r));
  }

  /* ---------- Hero mockup live demo loop ---------- */
  const heroThread = $("#heroThread");
  if (heroThread && !reduceMotion) {
    // a page may tailor the mockup conversation via window.ARAYEH_HERO_DEMO
    const script = (window.ARAYEH_HERO_DEMO && window.ARAYEH_HERO_DEMO.length) ? window.ARAYEH_HERO_DEMO : [
      { who: "bot", text: "سلام! چطور می‌تونم کمکتون کنم؟" },
      { who: "user", text: "ساعت کاری‌تون چنده؟" },
      { who: "bot", text: "هر روز ۹ تا ۲۱ 🙌 می‌خواید همین حالا نوبت بگیرم؟" },
      { who: "user", text: "بله، لطفاً" },
      { who: "bot", text: "ایمیلتون رو بفرستید تا تأیید رو بفرستم ✅" },
    ];
    let i = 0;
    function step() {
      if (i >= script.length) {
        setTimeout(() => {
          heroThread.innerHTML = "";
          i = 0;
          step();
        }, 2600);
        return;
      }
      const item = script[i++];
      if (item.who === "bot") {
        const t = document.createElement("div");
        t.className = "demo-msg bot typing";
        t.innerHTML = "<span></span><span></span><span></span>";
        heroThread.appendChild(t);
        scrollThread(heroThread);
        setTimeout(() => {
          t.remove();
          addDemo(item);
          setTimeout(step, 900);
        }, 850);
      } else {
        addDemo(item);
        setTimeout(step, 800);
      }
    }
    function addDemo(item) {
      const m = document.createElement("div");
      m.className = "demo-msg " + item.who;
      m.textContent = item.text;
      heroThread.appendChild(m);
      // keep only last few to avoid overflow
      while (heroThread.children.length > 4) heroThread.removeChild(heroThread.firstChild);
      scrollThread(heroThread);
    }
    setTimeout(step, 700);
  }
  function scrollThread(el) {
    el.scrollTop = el.scrollHeight;
  }

  /* ---------- Exit-intent: disabled by request (never shown) ---------- */
  // The exit-intent popup was removed. closeExit() is kept as a safe no-op
  // so the shared [data-action] click routing continues to work.
  function closeExit() {}
  window.Arayeh = window.Arayeh || {};

  /* ---------- Scroll-intent chat nudge near pricing ---------- */
  const pricing = $("#pricing");
  if (pricing && "IntersectionObserver" in window) {
    const nio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            window.Arayeh && window.Arayeh.nudge && window.Arayeh.nudge();
            nio.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    nio.observe(pricing);
  }
})();
