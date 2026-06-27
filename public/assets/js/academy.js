(function () {
  "use strict";

  const LEAD_BACKUP_KEY = "__araaye_academy_pending_leads";

  function toLatin(s) {
    return String(s || "")
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
  }

  function isPhone(v) {
    return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, ""));
  }

  function normalizePhone(v) {
    const digits = toLatin(v).replace(/[\s\-()]/g, "");
    return "0" + digits.replace(/^(\+98|0098|0)?/, "");
  }

  function toPersianNumber(n) {
    return String(n).replace(/\d/g, function (d) {
      return "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)];
    });
  }

  function getUtmParams() {
    const p = new URLSearchParams(window.location.search);
    const utms = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      if (p.has(k)) utms[k] = p.get(k);
    });
    let stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("__utms") || "{}"); } catch (_) {}
    const merged = Object.assign({}, stored, utms);
    if (Object.keys(merged).length) {
      try { sessionStorage.setItem("__utms", JSON.stringify(merged)); } catch (_) {}
    }
    return merged;
  }

  function backupLead(payload) {
    try {
      const q = JSON.parse(localStorage.getItem(LEAD_BACKUP_KEY) || "[]");
      q.push(payload);
      localStorage.setItem(LEAD_BACKUP_KEY, JSON.stringify(q.slice(-20)));
    } catch (_) {}
  }

  function sendLead(payload) {
    const enriched = Object.assign({
      page: location.pathname,
      referrer: document.referrer || undefined,
      ts: Date.now(),
    }, getUtmParams(), payload);

    return fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
      keepalive: true,
    }).then(function (r) {
      if (!r.ok) throw new Error("lead http " + r.status);
      return r;
    }).catch(function (err) {
      backupLead(enriched);
      throw err;
    });
  }

  function flushPendingLeads() {
    let q;
    try { q = JSON.parse(localStorage.getItem(LEAD_BACKUP_KEY) || "[]"); } catch (_) { return; }
    if (!q || !q.length) return;
    localStorage.removeItem(LEAD_BACKUP_KEY);
    q.forEach(function (p) { sendLead(p).catch(function () { backupLead(p); }); });
  }

  function setStatus(el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.dataset.type = type || "";
    el.hidden = !text;
  }

  function leadPayload(source, data) {
    const planNames = {
      prompt: "دوره پرامپت‌نویسی",
      pro: "بسته AI Pro",
      team: "بسته AI Team",
    };
    return {
      source: source,
      contact: data.contact,
      name: data.name || null,
      goal: "آرایه AI - خرید دوره یا بسته AI",
      plan: planNames[data.plan] || data.plan || null,
      budget: data.price || null,
      intent: "purchase",
      detail: data.detail || null,
      consent: true,
    };
  }

  function getDeadline() {
    const stored = localStorage.getItem("__academy_deadline");
    if (stored) {
      const t = parseInt(stored, 10);
      if (t > Date.now()) return t;
    }
    const deadline = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from first visit
    try { localStorage.setItem("__academy_deadline", String(deadline)); } catch (_) {}
    return deadline;
  }

  function updateCountdown() {
    const deadline = getDeadline();
    const diff = Math.max(0, deadline - Date.now());
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const h1 = document.getElementById("hoursLeft");
    const m1 = document.getElementById("minutesLeft");
    const fh = document.getElementById("finalHours");
    const fm = document.getElementById("finalMinutes");
    const fs = document.getElementById("finalSeconds");

    if (h1) h1.textContent = toPersianNumber(hours.toString().padStart(2, "0"));
    if (m1) m1.textContent = toPersianNumber(minutes.toString().padStart(2, "0"));
    if (fh) fh.textContent = toPersianNumber(hours.toString().padStart(2, "0"));
    if (fm) fm.textContent = toPersianNumber(minutes.toString().padStart(2, "0"));
    if (fs) fs.textContent = toPersianNumber(seconds.toString().padStart(2, "0"));
  }

  function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  function initSeats() {
    const stored = localStorage.getItem("__academy_seats");
    if (stored) {
      try {
        const seats = JSON.parse(stored);
        document.querySelectorAll("[data-seats]").forEach(function (el) {
          const key = el.dataset.seats;
          if (seats[key] !== undefined) {
            el.dataset.seats = String(seats[key]);
            el.textContent = toPersianNumber(seats[key]);
          }
        });
        return;
      } catch (_) {}
    }

    const seats = {};
    document.querySelectorAll("[data-seats]").forEach(function (el) {
      const val = parseInt(el.dataset.seats, 10);
      const key = el.dataset.seats;
      if (!isNaN(val)) {
        const jitter = Math.floor(Math.random() * 3); // 0-2 seats randomly consumed
        seats[key] = Math.max(1, val - jitter);
      }
    });
    try { localStorage.setItem("__academy_seats", JSON.stringify(seats)); } catch (_) {}
    document.querySelectorAll("[data-seats]").forEach(function (el) {
      const key = el.dataset.seats;
      if (seats[key] !== undefined) {
        el.dataset.seats = String(seats[key]);
        el.textContent = toPersianNumber(seats[key]);
      }
    });
  }

  function initBuyButtons() {
    document.querySelectorAll("[data-buy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const plan = btn.dataset.buy;
        const name = btn.dataset.name || "";
        const select = document.querySelector("select[name='plan']");
        if (select) {
          select.value = plan;
        }
        document.getElementById("offer").scrollIntoView({ behavior: "smooth" });
        const contactInput = document.querySelector("input[name='contact']");
        if (contactInput) contactInput.focus();
        setTimeout(function () {
          alert("برای تکمیل خرید " + name + "، فرم زیر را با شماره تماس پر کنید تا همکاران ما با شما تماس بگیرند.");
        }, 400);
      });
    });
  }

  function initForm() {
    const form = document.getElementById("academyForm");
    if (!form) return;
    const status = document.getElementById("formStatus");
    const submit = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.company) return;

      const contactInput = form.querySelector("input[name='contact']");
      if (!isPhone(data.contact)) {
        setStatus(status, "شماره موبایل معتبر وارد کنید.", "error");
        contactInput.classList.add("is-invalid");
        return;
      }
      contactInput.classList.remove("is-invalid");

      data.contact = normalizePhone(data.contact);
      submit.disabled = true;
      setStatus(status, "در حال ثبت درخواست...", "loading");

      const planPrices = {
        prompt: "۱,۳۹۰,۰۰۰ تومان",
        pro: "۲,۷۹۰,۰۰۰ تومان",
        team: "۴,۱۹۰,۰۰۰ تومان",
      };
      data.price = planPrices[data.plan] || null;

      sendLead(leadPayload("academy_form", data)).then(function () {
        setStatus(status, "درخواست ثبت شد. همکاران ما کمتر از یک روز کاری با شما تماس می‌گیرند.", "success");
        form.reset();
        if (window.track) track("lead_captured", { source: "academy_form", page: "academy", plan: data.plan });
      }).catch(function () {
        setStatus(status, "ارسال کامل نشد؛ اطلاعات ذخیره شد و در اولین اتصال دوباره ارسال می‌شود.", "error");
      }).finally(function () {
        submit.disabled = false;
      });
    });
  }

  function initFaq() {
    const details = document.querySelectorAll(".faq-list details");
    details.forEach(function (detail) {
      detail.addEventListener("toggle", function () {
        if (detail.open) {
          details.forEach(function (d) {
            if (d !== detail) d.open = false;
          });
        }
      });
    });
  }

  function initMobileNav() {
    const toggle = document.getElementById("navToggle");
    const nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "بستن منو" : "باز کردن منو");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    flushPendingLeads();
    initCountdown();
    initSeats();
    initBuyButtons();
    initForm();
    initFaq();
    initMobileNav();
  });
})();
