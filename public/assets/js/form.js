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
  const btnSkip = document.getElementById("formSkip");
  const step2Q = document.getElementById("step2Q");

  const TOTAL = 4;
  const PROGRESS = { 1: 25, 2: 50, 3: 75, 4: 100, done: 100 }; // honest progress

  const data = { need: "", infra: "", challenge: "", name: "", contact: "", consent: true, plan: "" };
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
    return step2Variants().find((b) => (b.dataset.when || "").split(/\s+/).includes(data.need)) || null;
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

  /* ---------- recommendation engine ----------
     Builds the step-4 suggestion from the collected answers
     (need + challenge + infra). need & challenge are always set
     by the time step 4 opens; infra refines the wording. */
  const RECS = {
    website: {
      title: "طراحی وب‌سایت تبدیل‌محور",
      main: "طراحی سایت اختصاصی همراه با فرم لید و رزرو یا سفارش آنلاین",
      comp: "زیرساخت سئو، سرعت بالا و تحلیل رفتار کاربران",
      outcome: "سایتی که فقط دیده نمی‌شود؛ بازدید را به مشتری تبدیل می‌کند",
    },
    visibility: {
      title: "دیده‌شدن و دسترسی آسان مشتری",
      main: "ثبت در نقشه‌ها و مسیریاب‌ها به‌همراه لینک همه‌کاره",
      comp: "بهینه‌سازی سئوی محلی برای جست‌وجوهای منطقه‌ای",
      outcome: "مشتری‌ها راحت‌تر شما را پیدا و انتخاب می‌کنند",
    },
    support: {
      title: "چت‌بات هوشمند و پاسخ‌گویی خودکار",
      main: "چت‌بات اختصاصی آموزش‌دیده روی اطلاعات کسب‌وکار شما",
      comp: "اتصال به CRM برای پیگیری منظم مشتریان و فرصت‌های فروش",
      outcome: "پاسخ سریع و شبانه‌روزی، بدون از دست رفتن هیچ مشتری",
    },
    automation: {
      title: "اتوماسیون فروش و فرایندهای کسب‌وکار",
      main: "اتوماسیون اختصاصی فرایندهای فروش، پشتیبانی و کارهای داخلی",
      comp: "چت‌بات هوشمند و CRM یکپارچه برای مدیریت مشتریان",
      outcome: "حذف کارهای تکراری و آزاد شدن وقت تیم برای رشد",
    },
  };
  const CHALLENGE_WHY = {
    discover: "چون مشتریان به‌سختی شما را پیدا می‌کنند",
    website: "چون وب‌سایت فعلی پاسخ‌گوی نیاز شما نیست",
    response: "چون پاسخ‌گویی به مشتریان زمان زیادی می‌برد",
    scattered: "چون اطلاعات و پیگیری مشتریان پراکنده است",
    repetitive: "چون کارهای تکراری وقت تیم را می‌گیرد",
    support: "چون برای سایت به پشتیبانی فنی مطمئن نیاز دارید",
  };

  function buildRecommendation() {
    const base = RECS[data.need] || RECS.website;
    const rec = Object.assign({}, base);
    // refine title when the user already owns the core infrastructure
    if (data.need === "website" && data.infra === "website") {
      rec.title = "بازطراحی و ارتقای وب‌سایت";
      rec.main = "بازطراحی سایت فعلی با فرم لید و رزرو یا سفارش آنلاین";
    }
    if (data.need === "support" && data.infra === "chatbot") {
      rec.title = "ارتقای چت‌بات و پاسخ‌گویی هوشمند";
    }
    const reason = CHALLENGE_WHY[data.challenge];
    rec.why =
      "این راهکار را به شما پیشنهاد می‌کنیم" +
      (reason ? " " + reason : "") +
      "؛ بنابراین تمرکز ما روی همین نقطه است.";
    return rec;
  }

  function renderRecommendation() {
    const box = $("[data-recommendation]", form);
    if (!box) return;
    const rec = buildRecommendation();
    const set = (key, val) => {
      const el = box.querySelector('[data-rec="' + key + '"]');
      if (el && val) el.textContent = val;
    };
    set("title", rec.title);
    set("why", rec.why);
    set("main", rec.main);
    set("comp", rec.comp);
    set("outcome", rec.outcome);
    track("recommendation_view", {
      need: data.need,
      challenge: data.challenge,
      infra: data.infra,
      recommendation: rec.title,
    });
  }

  function showStep(n) {
    current = n;
    steps.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.step) === n));
    if (successPanel) successPanel.hidden = true;
    btnNext.hidden = false;
    btnBack.hidden = n === 1 || n === 4;
    if (btnSkip) btnSkip.hidden = n !== 4;
    if (n === 2) syncStep2();
    btnNext.innerHTML =
      n === TOTAL
        ? 'دریافت مشاوره و برآورد اولیه <svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        : 'ادامه <svg viewBox="0 0 24 24" class="ic" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    setProgress(n);
    refreshSelected();
    if (n === 4) { renderRecommendation(); validateStep4(); }
    track("form_step", { step: n, need: data.need });
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
    if (n === 1) return !!data.need;
    if (n === 2) {
      const field = variantField(activeVariant());
      return field ? !!data[field] : true;
    }
    if (n === 3) return !!data.challenge;
    if (n === 4) return validateStep4();
    return true;
  }

  const nameInput = document.getElementById("leadName");
  const contactInput = document.getElementById("leadContact");
  const consentInput = document.getElementById("leadConsent");

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
    const contactOk = isPhone(contact);
    if (showErrors || name.length) setFieldState(nameInput, nameOk, "لطفاً نام‌تان را وارد کنید.");
    if (showErrors || contact.length) setFieldState(contactInput, contactOk, "شماره موبایل معتبر وارد کنید.");
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
    if (field === "need") {
      // reset downstream conditional answers when primary need changes
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
  if (btnSkip) btnSkip.addEventListener("click", skipContact);

  /* ---------- skip contact on last step ---------- */
  function skipContact() {
    finish(true);
  }

  /* ---------- finish ---------- */
  function finish(skipped) {
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
    if (skipped) {
      track("form_skip", { need: data.need, infra: data.infra, challenge: data.challenge });
    } else {
      track("form_submit", { need: data.need, infra: data.infra, challenge: data.challenge, plan: data.plan || null });
    }
    track("lead_captured", { source: source, need: data.need, infra: data.infra, challenge: data.challenge });
  }

  /* ---------- UTM capture ---------- */
  function getUtmParams() {
    var p = new URLSearchParams(window.location.search);
    var utms = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      if (p.has(k)) utms[k] = p.get(k);
    });
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("__utms") || "{}"); } catch (_) {}
    var merged = Object.assign({}, stored, utms);
    if (Object.keys(merged).length) {
      try { sessionStorage.setItem("__utms", JSON.stringify(merged)); } catch (_) {}
    }
    return merged;
  }

  /* ---------- submission hook → /api/leads ---------- */
  function submitLead(payload) {
    // ارسال fire-and-forget تا تجربهٔ موفقیت فرم بدون تأخیر بماند.
    var utms = getUtmParams();
    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.assign({}, payload, {
          source: source,
          page: location.pathname,
          referrer: document.referrer || undefined,
        }, utms)
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
