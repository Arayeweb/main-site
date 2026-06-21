/* =========================================================
   آرایه — heroLead.js
   Single-field lead capture in the hero section.
   Captures mobile/email as early as possible, then hands off
   to the multi-step form or submits directly if the user only
   leaves contact info.
   ========================================================= */
(function () {
  "use strict";

  const track = window.track || function () {};

  function toLatin(s) {
    return String(s)
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  }

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, "")); }
  function normalizeContact(v) {
    const raw = String(v || "").trim();
    if (isPhone(raw)) {
      const digits = toLatin(raw).replace(/[\s\-()]/g, "");
      return { kind: "phone", value: "0" + digits.replace(/^(\+98|0098|0)?/, "") };
    }
    if (isEmail(raw)) return { kind: "email", value: raw.toLowerCase() };
    return { kind: "invalid", value: raw };
  }

  function submitLead(payload) {
    return fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ ts: Date.now(), page: location.pathname }, payload)),
      keepalive: true,
    });
  }

  function initHeroForm(form) {
    const input = form.querySelector("input[name='contact']");
    const err = form.querySelector(".hero-lead-err");
    const success = form.querySelector(".hero-lead-success");
    const wrap = form.querySelector(".hero-lead-wrap");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const raw = input.value.trim();
      const contact = normalizeContact(raw);
      if (contact.kind === "invalid") {
        if (err) err.textContent = "ایمیل یا شمارهٔ موبایل معتبر وارد کنید.";
        input.classList.add("is-invalid");
        track("hero_form_error", { type: "invalid_contact" });
        return;
      }
      input.classList.remove("is-invalid");
      if (err) err.textContent = "";

      submitLead({
        source: "hero_form",
        contact: contact.value,
        goal: form.dataset.goal || "unknown",
        page: location.pathname,
      }).then(function (r) {
        if (!r.ok) throw new Error("lead http " + r.status);
        track("lead_captured", { source: "hero_form", kind: contact.kind });
        if (wrap) wrap.hidden = true;
        if (success) {
          success.hidden = false;
          success.classList.add("is-shown");
        }
      }).catch(function () {
        if (err) err.textContent = "مشکلی در ارسال پیش آمد. لطفاً دوباره تلاش کنید.";
        track("hero_form_error", { type: "submit_failed" });
      });
    });

    input.addEventListener("input", function () {
      input.classList.remove("is-invalid");
      if (err) err.textContent = "";
    });
  }

  const forms = document.querySelectorAll("[data-hero-lead]");
  forms.forEach(initHeroForm);
})();
