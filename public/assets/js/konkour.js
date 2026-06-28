(function () {
  "use strict";

  const LEAD_BACKUP_KEY = "__araaye_konkour_pending_leads";

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

  function toPersian(n) {
    return String(n).replace(/\d/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[parseInt(d, 10)]; });
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
      if (!r.ok) throw new Error("http " + r.status);
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
    var planNames = { basic: "پکیج پرامپت کنکور", pro: "پکیج کامل کنکور با AI" };
    return {
      source: source,
      contact: data.contact,
      name: data.name || null,
      goal: "خرید دوره کنکور با AI",
      plan: planNames[data.plan] || data.plan || null,
      budget: data.price || null,
      intent: "purchase",
      detail: data.detail || null,
      consent: true,
    };
  }

  function getDeadline() {
    var stored = localStorage.getItem("__konkour_deadline");
    if (stored) {
      var t = parseInt(stored, 10);
      if (t > Date.now()) return t;
    }
    var deadline = Date.now() + 48 * 60 * 60 * 1000;
    try { localStorage.setItem("__konkour_deadline", String(deadline)); } catch (_) {}
    return deadline;
  }

  function updateCountdown() {
    var diff = Math.max(0, getDeadline() - Date.now());
    var hours   = Math.floor(diff / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((diff % (1000 * 60)) / 1000);

    function set(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = toPersian(String(val).padStart(2, "0"));
    }
    set("kHours", hours);
    set("kMinutes", minutes);
    set("kFinalHours", hours);
    set("kFinalMinutes", minutes);
    set("kFinalSeconds", seconds);
  }

  function initCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  function initSeats() {
    var stored = localStorage.getItem("__konkour_seats");
    if (stored) {
      try {
        var seats = JSON.parse(stored);
        document.querySelectorAll("[data-seats]").forEach(function (el) {
          var key = el.dataset.seats;
          if (seats[key] !== undefined) {
            el.dataset.seats = String(seats[key]);
            el.textContent = toPersian(seats[key]);
          }
        });
        return;
      } catch (_) {}
    }
    var newSeats = {};
    document.querySelectorAll("[data-seats]").forEach(function (el) {
      var val = parseInt(el.dataset.seats, 10);
      var key = el.dataset.seats;
      if (!isNaN(val)) {
        var jitter = Math.floor(Math.random() * 3);
        newSeats[key] = Math.max(1, val - jitter);
      }
    });
    try { localStorage.setItem("__konkour_seats", JSON.stringify(newSeats)); } catch (_) {}
    document.querySelectorAll("[data-seats]").forEach(function (el) {
      var key = el.dataset.seats;
      if (newSeats[key] !== undefined) {
        el.dataset.seats = String(newSeats[key]);
        el.textContent = toPersian(newSeats[key]);
      }
    });
  }

  function initBuyButtons() {
    document.querySelectorAll("[data-buy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var plan = btn.dataset.buy;
        var select = document.querySelector("select[name='plan']");
        if (select) select.value = plan;
        var registerSection = document.getElementById("register");
        if (registerSection) registerSection.scrollIntoView({ behavior: "smooth" });
        setTimeout(function () {
          var contactInput = document.querySelector("input[name='contact']");
          if (contactInput) contactInput.focus();
        }, 450);
      });
    });
  }

  function initForm() {
    var form = document.getElementById("konkourForm");
    if (!form) return;
    var status = document.getElementById("formStatus");
    var submit = form.querySelector("button[type='submit']");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = Object.fromEntries(new FormData(form).entries());
      if (data.company) return;

      var contactInput = form.querySelector("input[name='contact']");
      if (!isPhone(data.contact)) {
        setStatus(status, "شماره موبایل معتبر وارد کنید.", "error");
        contactInput.classList.add("is-invalid");
        return;
      }
      contactInput.classList.remove("is-invalid");
      data.contact = normalizePhone(data.contact);

      var planPrices = { basic: "۴۹۰,۰۰۰ تومان", pro: "۷۹۰,۰۰۰ تومان" };
      data.price = planPrices[data.plan] || null;

      submit.disabled = true;
      setStatus(status, "در حال ثبت درخواست...", "loading");

      sendLead(leadPayload("konkour_form", data)).then(function () {
        window.location.replace("/tashakor");
      }).catch(function () {
        setStatus(status, "مشکل در ارسال — می‌تونید از واتساپ هم اقدام کنید.", "error");
      }).finally(function () {
        submit.disabled = false;
      });
    });
  }

  function initFaq() {
    document.querySelectorAll(".faq-list details").forEach(function (detail) {
      detail.addEventListener("toggle", function () {
        if (detail.open) {
          document.querySelectorAll(".faq-list details").forEach(function (d) {
            if (d !== detail) d.open = false;
          });
        }
      });
    });
  }

  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var nav = document.getElementById("mainNav");
    if (!toggle || !nav) return;

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "بستن منو" : "باز کردن منو");
    }

    toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    document.addEventListener("click", function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
  }

  function initStickyBar() {
    var hero = document.querySelector(".hero");
    var bar = document.getElementById("stickyCta");
    if (!hero || !bar || !window.IntersectionObserver) return;

    var obs = new IntersectionObserver(function (entries) {
      bar.classList.toggle("is-visible", !entries[0].isIntersecting);
    }, { threshold: 0 });
    obs.observe(hero);
  }

  document.addEventListener("DOMContentLoaded", function () {
    flushPendingLeads();
    initCountdown();
    initSeats();
    initBuyButtons();
    initForm();
    initFaq();
    initMobileNav();
    initStickyBar();
  });
})();
