/* =========================================================
   آرایه — form.js
   Multi-step "breadcrumb" lead form:
   endowed progress (starts 20%), conditional logic, realtime
   validation, success state. Submission is front-end (stub)
   with a clear hook (submitLead) ready to wire to CRM/webhook.
   ========================================================= */
(function () {
  "use strict";

  const form = document.getElementById("leadForm");
  if (!form) return;

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const track = window.track || function () {};

  const steps = $$(".form-step", form); // 1..4
  const successPanel = $(".form-success", form);
  const fill = document.getElementById("progressFill");
  const progressLabel = document.getElementById("progressLabel");
  const btnBack = document.getElementById("formBack");
  const btnNext = document.getElementById("formNext");
  const step2Q = document.getElementById("step2Q");

  const TOTAL = 4;
  const PROGRESS = { 1: 25, 2: 50, 3: 75, 4: 100, done: 100 }; // honest progress

  const data = { goal: "", budget: "", name: "", contact: "", consent: true, plan: "" };
  const source = (form.dataset.source || "multistep_form");
  let current = 1;

  /* ---------- digit normalization ---------- */
  function toLatinDigits(str) {
    return String(str)
      .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
      .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));
  }

  /* ---------- progress ---------- */
  function setProgress(key) {
    const pct = PROGRESS[key] || 20;
    if (fill) fill.style.width = pct + "%";
    if (progressLabel) {
      progressLabel.textContent =
        key === "done" ? "تکمیل شد ✓" : "گام " + toFa(key) + " از " + toFa(TOTAL);
    }
  }
  function toFa(n) {
    return String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]);
  }

  /* ---------- step 2: markup-driven conditional branches ----------
     Each .step2-variant block carries data-when="goalA goalB" and data-q="…".
     This keeps the form reusable across every landing page without
     hard-coding any goal values in JS. */
  function step2Variants() {
    return $$(".step2-variant", form);
  }
  function activeVariant() {
    return step2Variants().find((b) => (b.dataset.when || "").split(/\s+/).includes(data.goal)) || null;
  }
  function variantField(block) {
    const opt = block && block.querySelector(".opt");
    return opt ? opt.dataset.field : null;
  }
  function clearStep2Fields() {
    step2Variants().forEach((b) => {
      const f = variantField(b);
      if (f) data[f] = "";
    });
  }
  function syncStep2() {
    const active = activeVariant();
    step2Variants().forEach((block) => {
      block.hidden = block !== active;
    });
    if (active && step2Q && active.dataset.q) step2Q.textContent = active.dataset.q;
    refreshSelected();
  }
  function refreshSelected() {
    $$(".opt", form).forEach((opt) => {
      const f = opt.dataset.field;
      opt.classList.toggle("is-selected", data[f] === opt.dataset.value && data[f] !== "");
    });
  }

  function showStep(n) {
    current = n;
    steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
    if (successPanel) successPanel.hidden = true;
    btnNext.hidden = false;
    btnBack.hidden = n === 1;
    if (n === 2) syncStep2();
    btnNext.innerHTML =
      n === TOTAL
        ? 'ارسال درخواست <svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : 'ادامه <svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    setProgress(n);
    refreshSelected();
    if (n === 4) validateStep4();
    track("form_step", { step: n, goal: data.goal });
    // focus the first interactive element of the step
    const active = steps[n - 1];
    const focusable = active.querySelector(".opt:not([hidden]), input");
    if (focusable && n !== 1) {
      // avoid stealing focus on initial load
      try { focusable.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  /* ---------- validation ---------- */
  function stepValid(n) {
    if (n === 1) return !!data.goal;
    if (n === 2) {
      const field = variantField(activeVariant());
      return field ? !!data[field] : true;
    }
    if (n === 3) return !!data.budget;
    if (n === 4) return validateStep4();
    return true;
  }

  const nameInput = document.getElementById("leadName");
  const contactInput = document.getElementById("leadContact");
  const consentInput = document.getElementById("leadConsent");

  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) {
    const d = toLatinDigits(v).replace(/[\s\-()]/g, "");
    return /^(\+98|0098|0)?9\d{9}$/.test(d);
  }

  function setFieldState(input, ok, msg) {
    const field = input.closest(".field");
    const errEl = field.querySelector(".field-err");
    field.classList.toggle("is-valid", ok === true);
    field.classList.toggle("is-invalid", ok === false);
    if (errEl) errEl.textContent = ok === false ? msg || "" : "";
  }

  function validateStep4(showErrors) {
    const name = nameInput.value.trim();
    const contact = contactInput.value.trim();
    const nameOk = name.length >= 2;
    const contactOk = isEmail(contact) || isPhone(contact);
    if (showErrors || name.length) setFieldState(nameInput, nameOk, "لطفاً نام‌تان را وارد کنید.");
    if (showErrors || contact.length) setFieldState(contactInput, contactOk, "ایمیل یا شمارهٔ موبایل معتبر وارد کنید.");
    const ok = nameOk && contactOk;
    btnNext.disabled = !ok;
    return ok;
  }

  if (nameInput) nameInput.addEventListener("input", () => validateStep4());
  if (contactInput) contactInput.addEventListener("input", () => validateStep4());

  /* ---------- navigation ---------- */
  function goNext() {
    if (!stepValid(current)) {
      if (current === 4) validateStep4(true);
      return;
    }
    if (current < TOTAL) {
      showStep(current + 1);
    } else {
      finish();
    }
  }
  function goBack() {
    if (current > 1) showStep(current - 1);
  }

  /* ---------- option selection (auto-advance) ---------- */
  form.addEventListener("click", function (e) {
    const opt = e.target.closest(".opt");
    if (!opt) return;
    const field = opt.dataset.field;
    data[field] = opt.dataset.value;
    refreshSelected();
    if (field === "goal") {
      // reset downstream conditional answers when goal changes
      clearStep2Fields();
    }
    btnNext.disabled = false;
    // smooth auto-advance for single-select steps
    if (current < TOTAL) setTimeout(goNext, 280);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    goNext();
  });
  btnBack.addEventListener("click", goBack);

  /* ---------- finish ---------- */
  function finish() {
    data.name = nameInput.value.trim();
    data.contact = contactInput.value.trim();
    data.consent = consentInput ? consentInput.checked : true;

    submitLead(data);

    steps.forEach((s) => s.classList.remove("is-active"));
    btnNext.hidden = true;
    btnBack.hidden = true;
    if (successPanel) successPanel.hidden = false;
    setProgress("done");

    const planName = { bronze: "برنزی", silver: "نقره‌ای", gold: "طلایی" }[data.plan];
    const msg = document.getElementById("successMsg");
    if (msg && planName) {
      msg.textContent =
        "درخواست شما برای پکیج «" + planName + "» ثبت شد. کارشناسان آرایه طی کمتر از یک روز کاری با شما تماس می‌گیرند.";
    }
    track("form_submit", { goal: data.goal, budget: data.budget, plan: data.plan || null });
    track("lead_captured", { source: source, channel: data.channel || data.sitetype || null });
  }

  /* ---------- submission hook → /api/leads ---------- */
  function submitLead(payload) {
    // ارسال fire-and-forget تا تجربهٔ موفقیت فرم بدون تأخیر بماند.
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.assign({}, payload, {
          source: source,
          page: location.pathname,
        })
      ),
      keepalive: true,
    }).catch(function () {});
  }

  /* ---------- public API ---------- */
  window.Arayeh = window.Arayeh || {};
  window.Arayeh.presetPlan = function (plan) {
    data.plan = plan;
    track("plan_preset", { plan: plan });
  };
  window.Arayeh.getLead = () => Object.assign({}, data);

  /* ---------- init ---------- */
  showStep(1);
})();
