/* =========================================================
   آرایه — seo.js
   SEO landing page logic:
   - Package selection (basic/growth/pro/bundle)
   - Multi-step form with lead capture → /api/leads
   - Zibal payment gateway redirect for paid packages
   - Rule-based chatbot for SEO questions
   - WhatsApp float + sticky CTA
   - Referral program + returning customer discount
   ========================================================= */
(function () {
  "use strict";

  var track = window.track || function () {};

  /* ---------- helpers ---------- */
  function toLatin(s) {
    return String(s || "")
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
  }
  function toFa(n) {
    return String(n).replace(/[0-9]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹"[d]; });
  }
  function formatToman(n) { return toFa(Number(n).toLocaleString("en-US")); }

  function isPhone(v) { return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, "")); }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isTelegram(v) { return /^@[a-zA-Z0-9_]{5,32}$/.test(v.trim()); }
  function normalizeContact(v) {
    var raw = String(v || "").trim();
    if (isPhone(raw)) {
      var digits = toLatin(raw).replace(/[\s\-()]/g, "");
      return { kind: "phone", value: "0" + digits.replace(/^(\+98|0098|0)?/, "") };
    }
    if (isEmail(raw)) return { kind: "email", value: raw.toLowerCase() };
    if (isTelegram(raw)) return { kind: "telegram", value: raw.toLowerCase() };
    return { kind: "invalid", value: raw };
  }

  function getUtms() {
    var p = new URLSearchParams(window.location.search);
    var utms = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (k) {
      if (p.has(k)) utms[k] = p.get(k);
    });
    var src = (p.get("src") || "").trim();
    if (src && !utms.utm_source) utms.utm_source = src;
    var source = (p.get("source") || "").trim();
    if (source && !utms.utm_source) utms.utm_source = source;
    var promptSlug = (p.get("promptSlug") || "").trim();
    if (promptSlug && !utms.utm_content) utms.utm_content = "prompt:" + promptSlug;
    var stored = {};
    try { stored = JSON.parse(sessionStorage.getItem("__utms") || "{}"); } catch (_) {}
    var merged = Object.assign({}, stored, utms);
    if (Object.keys(merged).length) {
      try { sessionStorage.setItem("__utms", JSON.stringify(merged)); } catch (_) {}
    }
    return merged;
  }

  /* ---------- package data ---------- */
  var pkgs = {
    basic:  { name: "پایه",     price: 890000,  old: 1290000, label: "۸۹۰,۰۰۰ تومان" },
    growth: { name: "رشد",      price: 1690000, old: 2290000, label: "۱,۶۹۰,۰۰۰ تومان" },
    pro:    { name: "حرفه‌ای",  price: 2900000, old: 3900000, label: "۲,۹۰۰,۰۰۰ تومان" }
  };

  /* bundle cross-sell: SEO basic + Google Sabt */
  var bundlePkg = { name: "ترکیبی سئو+گوگل", price: 3100000, old: 3880000, label: "۳,۱۰۰,۰۰۰ تومان" };

  var current = null;
  var step = 1;

  /* ---------- step navigation ---------- */
  function setStep(n) {
    step = n;
    document.querySelectorAll(".form-step").forEach(function (el) { el.classList.remove("active"); });
    var target = document.querySelector(".form-step[data-step='" + n + "']");
    if (target) target.classList.add("active");
    var pct = (n / 3) * 100;
    var fill = document.getElementById("progressFill");
    var txt = document.getElementById("progressText");
    if (fill) fill.style.width = pct + "%";
    if (txt) txt.textContent = n === 3 ? "تکمیل شد ✓" : "مرحله " + toFa(n) + " از ۳";
    if (n === 3) {
      var sticky = document.getElementById("sticky");
      if (sticky) sticky.classList.remove("show");
    }
  }

  function markSelected(card) {
    document.querySelectorAll(".pkg-card").forEach(function (c) {
      c.classList.remove("selected");
      var btn = c.querySelector(".select-btn");
      if (btn) { btn.textContent = "انتخاب"; btn.classList.remove("btn-primary"); btn.classList.add("btn-ghost"); }
    });
    card.classList.add("selected");
    var btn = card.querySelector(".select-btn");
    if (btn) { btn.textContent = "انتخاب شد ✓"; btn.classList.remove("btn-ghost"); btn.classList.add("btn-primary"); }
    current = card.dataset.package;
    var next = document.getElementById("step1Next");
    if (next) next.disabled = false;
  }

  window.selectPkg = function (card) {
    markSelected(card);
    setStep(2);
    track("pkg_selected", { package: current, page: "seo" });
  };

  /* ---------- cross-sell bundle selection ---------- */
  window.selectBundle = function (e) {
    if (e) e.preventDefault();
    // Select the basic package visually but tag it as bundle
    var basicCard = document.querySelector('.pkg-card[data-package="basic"]');
    if (basicCard) markSelected(basicCard);
    // Override current to indicate bundle
    current = "bundle";
    pkgs.bundle = bundlePkg;
    setStep(2);
    track("bundle_selected", { package: "bundle", page: "seo" });
    // Scroll to form
    var form = document.getElementById("leadForm");
    if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  /* ---------- form submit ---------- */
  function submitLead(payload) {
    var enriched = Object.assign({
      page: location.pathname,
      referrer: document.referrer || undefined,
      ts: Date.now()
    }, getUtms(), payload);
    return fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
      keepalive: true
    });
  }

  function startCheckout(pkgKey, leadData) {
    var btn = document.getElementById("payBtn");
    if (btn) { btn.disabled = true; btn.textContent = "در حال انتقال به درگاه پرداخت..."; }
    fetch("/api/seo/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package: pkgKey,
        amount: pkgs[pkgKey].price,
        name: leadData.name,
        contact: leadData.contact,
        website: leadData.website || null
      })
    }).then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.ok && data.redirectUrl) {
          track("checkout_redirect", { package: pkgKey, page: "seo" });
          window.location.href = data.redirectUrl;
        } else {
          throw new Error(data && data.error ? data.error : "checkout_failed");
        }
      })
      .catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = "پرداخت آنلاین امن 🔒"; }
        var err = document.getElementById("formError");
        if (err) err.textContent = "مشکلی در اتصال به درگاه پرداخت. لطفاً دوباره تلاش کنید یا از واتساپ ارتباط بگیرید.";
      });
  }

  document.getElementById("seoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var err = document.getElementById("formError");
    var name = document.getElementById("bizName").value.trim();
    var website = document.getElementById("websiteUrl").value.trim();
    var contactRaw = document.getElementById("contact").value.trim();
    var contact = normalizeContact(contactRaw);

    if (!name) { if (err) err.textContent = "لطفاً نام کسب‌وکار را وارد کنید."; return; }
    if (contact.kind === "invalid") { if (err) err.textContent = "شماره موبایل یا آیدی تلگرام معتبر وارد کنید."; return; }
    if (err) err.textContent = "";

    var submitBtn = document.getElementById("submitBtn");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "در حال ثبت..."; }

    if (!current || !pkgs[current]) {
      if (err) err.textContent = "لطفاً یک پکیج را انتخاب کنید.";
      return;
    }

    var pkg = pkgs[current];

    var payload = {
      source: "seo_multistep",
      contact: contact.value,
      name: name,
      goal: "seo_service",
      plan: current,
      budget: String(pkg.price),
      detail: "package: " + current + " | name: " + pkg.name + " | price: " + pkg.price + (website ? " | website: " + website : "")
    };

    submitLead(payload).then(function (r) {
      if (!r.ok) throw new Error("lead http " + r.status);
      return r.json();
    }).then(function (data) {
      if (!data || data.ok !== true) throw new Error("lead not saved");
      track("lead_captured", { source: "seo_multistep", plan: current, kind: contact.kind, page: "seo" });
      if (typeof window.yektanet === "function") window.yektanet("lead");
      (window.dataLayer = window.dataLayer || []).push({ event: "generate_lead", source: "seo_multistep", plan: current });

      /* ---------- auto WhatsApp follow-up (speed-to-lead) ---------- */
      var waMsg = encodeURIComponent("سلام، من " + name + " هستم. درخواست سئو (پکیج " + pkg.name + ") رو ثبت کردم. لطفاً راهنمایی کنید.");
      var waUrl = "https://wa.me/98991300788?text=" + waMsg;
      // Show a WhatsApp follow-up button in success step
      var successStep = document.querySelector('.success-step');
      if (successStep && !document.getElementById('waFollowUp')) {
        var waBtn = document.createElement('a');
        waBtn.id = 'waFollowUp';
        waBtn.className = 'btn btn-whatsapp';
        waBtn.style.cssText = 'margin-top:12px;display:inline-flex';
        waBtn.href = waUrl;
        waBtn.target = '_blank';
        waBtn.rel = 'noopener';
        waBtn.innerHTML = '💬 سریع‌تر جواب بگیر — واتساپ بزن';
        successStep.appendChild(waBtn);
      }

      /* ---------- store visit cookie for returning customer ---------- */
      try {
        var visitData = { contact: contact.value, plan: current, ts: Date.now() };
        document.cookie = "seo_visit=" + encodeURIComponent(JSON.stringify(visitData)) + ";max-age=2592000;path=/;SameSite=Lax";
      } catch(_) {}

      /* show success step */
      var successPkgName = document.getElementById("successPkgName");
      var summaryPkg = document.getElementById("summaryPkg");
      var summaryPrice = document.getElementById("summaryPrice");
      var summaryTotal = document.getElementById("summaryTotal");
      var summaryPriceRow = document.getElementById("summaryPriceRow");
      var summaryTotalRow = document.getElementById("summaryTotalRow");
      var payBtn = document.getElementById("payBtn");
      var successMsg = document.getElementById("successMsg");

      if (successPkgName) successPkgName.textContent = pkg.name;
      if (summaryPkg) summaryPkg.textContent = pkg.name;

      if (summaryPriceRow) summaryPriceRow.style.display = "";
      if (summaryTotalRow) summaryTotalRow.style.display = "";
      if (summaryPrice) summaryPrice.textContent = formatToman(pkg.price) + " تومان";
      if (summaryTotal) summaryTotal.textContent = formatToman(pkg.price) + " تومان";
      if (payBtn) {
        payBtn.style.display = "";
        payBtn.textContent = "پرداخت آنلاین " + formatToman(pkg.price) + " تومان 🔒";
        payBtn.onclick = function () {
          startCheckout(current, { name: name, contact: contact.value, website: website });
        };
      }
      if (successMsg) successMsg.textContent = "پکیج " + pkg.name + " رو انتخاب کردی. برای شروع کار، پرداخت آنلاین را انجام بده یا منتظر تماس تیم ما باش.";

      setStep(3);
    }).catch(function () {
      if (err) err.textContent = "مشکلی در ارسال پیش آمد. لطفاً دوباره تلاش کنید یا از واتساپ ارتباط بگیرید.";
      track("hero_form_error", { type: "submit_failed", source: "seo_multistep" });
    }).finally(function () {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "ثبت درخواست"; }
    });
  });

  /* ---------- step buttons ---------- */
  var step1Next = document.getElementById("step1Next");
  if (step1Next) step1Next.addEventListener("click", function () { if (current) setStep(2); });
  var step2Back = document.getElementById("step2Back");
  if (step2Back) step2Back.addEventListener("click", function () { setStep(1); });

  /* ---------- sticky bottom ---------- */
  var sticky = document.getElementById("sticky");
  if (sticky) {
    window.addEventListener("scroll", function () {
      sticky.classList.toggle("show", window.scrollY > 420);
    }, { passive: true });
  }

  /* ---------- pre-select popular ---------- */
  var popularCard = document.querySelector(".pkg-card.popular");
  if (popularCard) markSelected(popularCard);

  /* =========================================================
     Chatbot — rule-based SEO advisor
     ========================================================= */
  var chatPanel = document.getElementById("chatPanel");
  var chatThread = document.getElementById("chatThread");
  var chatInput = document.getElementById("chatInput");
  var chatLauncher = document.getElementById("chatLauncher");
  var chatBadge = chatLauncher ? chatLauncher.querySelector(".chat-launcher-badge") : null;
  var chatOpened = false;

  var chatData = { intent: "", budget: "", contact: "", plan: "" };
  var chatExpecting = null;

  var faqAnswers = {
    price: "پکیج‌های سئو ما:\n• پایه: ۸۹۰,۰۰۰ تومان (بررسی تخصصی + بهینه‌سازی + ۳ محتوا)\n• رشد: ۱,۶۹۰,۰۰۰ تومان (۵ صفحه کلیدی + ۶ محتوا + شروع بک‌لینک)\n• حرفه‌ای: ۲,۹۰۰,۰۰۰ تومان (سئوی کامل + ۱۰ محتوا + بک‌لینک + ضمانت ۶ ماهه)\n\nبررسی تخصصی رایگان هم داریم. کدوم مناسبته؟ شماره‌ت رو بفرست تا کارشناس راهنماییت کنه.",
    time: "بهبودهای تکنیکال طی ۱-۲ هفته اعمال می‌شن. نتایج جستجو از ماه دوم شروع و در ۳-۶ ماه به اوج می‌رسه.\n\nسوالی دیگه داری؟",
    trial: "بررسی تخصصی رایگان شامل:\n• بررسی سرعت سایت\n• ساختار URL و متا تگ‌ها\n• سایت‌مپ و روبوتز\n• ریسپانسیو بودن\n• گزارش کامل مشکلات + پیشنهاد رفع\n\nکافیه شماره‌ت رو بفرست تا شروع کنیم.",
    guarantee: "پکیج حرفه‌ای با ضمانت ۶ ماهه است. اگر در این مدت نتیجه‌ای نبود، کار رو رایگان ادامه می‌دیم.\n\nپکیج پایه هم ضمانت رضایت ۷ روزه داره.",
    basic: "پکیج پایه شامل:\n• بررسی تخصصی کامل + بهینه‌سازی تکنیکال\n• بهینه‌سازی ۱ صفحه کلیدی\n• تولید ۳ محتوای سئوشده\n• ثبت در گوگل سرچ کنسول\n• گزارش ماهانه\n\nقیمت: ۸۹۰,۰۰۰ تومان (۳۰٪ تخفیف این هفته)\n\nشماره‌ت رو بفرست تا شروع کنیم.",
    pro: "پکیج حرفه‌ای شامل:\n• همه امکانات پایه + بهینه‌سازی کل سایت\n• تولید ۱۰ محتوای سئوشده\n• استراتژی بک‌لینک\n• مانیتورینگ رتبه روزانه\n• ضمانت ۶ ماهه نتایج\n• پشتیبانی اختصاصی\n\nقیمت: ۲,۹۰۰,۰۰۰ تومان\n\nشماره‌ت رو بفرست تا کارشناس راهنماییت کنه.",
    hello: "سلام! من دستیار سئو آرایه هستم. می‌تونم در مورد پکیج‌ها، قیمت‌ها، زمان نتیجه‌گیری و ضمانت کمک کنم.\n\nسؤالت چیه؟",
    default: "سؤال خوبیه! می‌تونم در مورد قیمت پکیج‌ها، زمان نتیجه‌گیری، بررسی تخصصی رایگان و ضمانت کمک کنم.\n\nیا شماره‌ت رو بفرست تا کارشناس ما مستقیم راهنماییت کنه.",
    contact_saved: "عالی! شماره‌ت رو ثبت کردم. کارشناس ما در کمتر از ۲ ساعت باهات تماس می‌گیره. 🌟"
  };

  function chatAdd(text, who) {
    var div = document.createElement("div");
    div.className = who === "user" ? "chat-msg user" : "chat-msg bot";
    div.textContent = text;
    if (chatThread) {
      chatThread.appendChild(div);
      chatThread.scrollTop = chatThread.scrollHeight;
    }
  }

  function chatRespond(text) {
    var t = text.toLowerCase();
    var key = "default";

    if (/سلام|درود| hi|hello/.test(t)) key = "hello";
    else if (/قیمت|چنده|هزینه|نرخ|cost|price/.test(t)) key = "price";
    else if (/چقدر|زمان|مدت|وقت|long|time/.test(t)) key = "time";
    else if (/رایگان|free|trial|بررسی تخصصی|بررسی/.test(t)) key = "trial";
    else if (/ضمانت|گارانتی|warranty|guarantee/.test(t)) key = "guarantee";
    else if (/پایه|basic/.test(t)) key = "basic";
    else if (/حرفه|pro|کامل/.test(t)) key = "pro";
    else if (/بک‌لینک|backlink|لینک/.test(t)) key = "pro";
    else if (/محتوا|content|مقاله/.test(t)) key = "basic";

    /* check for phone number in text */
    var phoneMatch = toLatin(text).replace(/[\s\-()]/g, "").match(/(?:\+98|0098|0)?9\d{9}/);
    if (phoneMatch) {
      var c = normalizeContact(phoneMatch[0]);
      if (c.kind === "phone") {
        chatData.contact = c.value;
        key = "contact_saved";
        /* save lead from chatbot */
        submitLead({
          source: "seo_chatbot",
          contact: c.value,
          goal: "seo_service",
          plan: chatData.plan || "unknown",
          detail: "chatbot conversation | page: seo",
          consent: true
        }).then(function () {
          track("lead_captured", { source: "seo_chatbot", page: "seo" });
          (window.dataLayer = window.dataLayer || []).push({ event: "generate_lead", source: "seo_chatbot" });
        }).catch(function () {});
      }
    }

    setTimeout(function () { chatAdd(faqAnswers[key] || faqAnswers.default, "bot"); }, 300);
  }

  window.openChat = function () {
    if (chatPanel) chatPanel.classList.add("active");
    if (chatLauncher) chatLauncher.style.display = "none";
    if (chatBadge) chatBadge.style.display = "none";
    if (!chatOpened) {
      chatOpened = true;
      setTimeout(function () { chatAdd(faqAnswers.hello, "bot"); }, 300);
    }
    if (chatInput) chatInput.focus();
  };

  window.closeChat = function () {
    if (chatPanel) chatPanel.classList.remove("active");
    if (chatLauncher) chatLauncher.style.display = "grid";
  };

  window.chatQuick = function (key) {
    var labels = { price: "قیمت پکیج‌ها چنده؟", time: "چقدر طول می‌کشه؟", trial: "بررسی تخصصی رایگان چیه؟", guarantee: "ضمانت دارید؟" };
    var label = labels[key] || key;
    chatAdd(label, "user");
    setTimeout(function () { chatAdd(faqAnswers[key] || faqAnswers.default, "bot"); }, 300);
  };

  window.chatSubmit = function () {
    var val = chatInput ? chatInput.value.trim() : "";
    if (!val) return;
    chatAdd(val, "user");
    chatInput.value = "";
    chatRespond(val);
  };

  if (chatInput) {
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); window.chatSubmit(); }
    });
  }

  /* auto-open chat after scroll */
  setTimeout(function () {
    if (!chatOpened && window.scrollY > 300) window.openChat();
  }, 10000);

  /* =========================================================
     CMO conversion optimizations
     ========================================================= */

  /* ---------- urgency countdown (ends Sunday midnight) ---------- */
  function getNextSundayMidnight() {
    var now = new Date();
    var daysUntilSunday = (7 - now.getDay()) % 7;
    if (daysUntilSunday === 0 && now.getHours() >= 0) {
      // if today is Sunday, push to next Sunday only if past midnight
      if (now.getMinutes() > 0 || now.getHours() > 0) daysUntilSunday = 7;
    }
    var sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    sunday.setHours(23, 59, 59, 0);
    return sunday;
  }

  function updateCountdown() {
    var target = getNextSundayMidnight();
    var now = new Date();
    var diff = target - now;
    if (diff <= 0) {
      // reset to next week
      target = new Date(now);
      target.setDate(now.getDate() + 7);
      target.setHours(23, 59, 59, 0);
      diff = target - now;
    }
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var mins = Math.floor((diff % 3600000) / 60000);
    var dEl = document.getElementById("cdDays");
    var hEl = document.getElementById("cdHours");
    var mEl = document.getElementById("cdMins");
    if (dEl) dEl.textContent = toFa(days);
    if (hEl) hEl.textContent = toFa(hours);
    if (mEl) mEl.textContent = toFa(mins);
  }
  updateCountdown();
  setInterval(updateCountdown, 30000);

  /* ---------- slots counter (visual scarcity) ---------- */
  var TOTAL_SLOTS = 10;
  var TAKEN_SLOTS = 3; // 7 remaining
  function renderSlots() {
    var remaining = TOTAL_SLOTS - TAKEN_SLOTS;
    var slotsNum = document.getElementById("slotsNum");
    var ribbonSlots = document.getElementById("ribbonSlots");
    if (slotsNum) slotsNum.textContent = toFa(remaining);
    if (ribbonSlots) ribbonSlots.textContent = toFa(remaining);

    var dotsEl = document.getElementById("slotsDots");
    if (dotsEl) {
      dotsEl.innerHTML = "";
      for (var i = 0; i < TOTAL_SLOTS; i++) {
        var dot = document.createElement("span");
        dot.className = "dot" + (i < TAKEN_SLOTS ? " taken" : "");
        dotsEl.appendChild(dot);
      }
    }
  }
  renderSlots();

  /* ---------- exit-intent modal ---------- */
  var exitShown = false;
  var exitModal = document.getElementById("exitModal");

  function showExitModal() {
    if (exitShown || !exitModal) return;
    exitShown = true;
    exitModal.classList.add("active");
    track("exit_intent_shown", { page: "seo" });
  }

  window.closeExitModal = function () {
    if (exitModal) exitModal.classList.remove("active");
  };

  // Desktop: mouse leaves through top
  document.addEventListener("mouseleave", function (e) {
    if (e.clientY <= 0 && !exitShown) showExitModal();
  });

  // Mobile: rapid scroll up (back gesture)
  var lastScrollY = window.scrollY;
  var scrollUpCount = 0;
  window.addEventListener("scroll", function () {
    var y = window.scrollY;
    if (y < lastScrollY - 200) {
      scrollUpCount++;
      if (scrollUpCount >= 2 && !exitShown) showExitModal();
    }
    lastScrollY = y;
  }, { passive: true });

  // Fallback: show after 45 seconds if not shown
  setTimeout(function () {
    if (!exitShown) showExitModal();
  }, 45000);

  // Close on backdrop click
  if (exitModal) {
    exitModal.addEventListener("click", function (e) {
      if (e.target === exitModal) window.closeExitModal();
    });
  }

  /* ---------- exit-intent lead capture ---------- */
  window.submitExitLead = function () {
    var phoneInput = document.getElementById("exitPhone");
    var status = document.getElementById("exitStatus");
    if (!phoneInput || !status) return;

    var raw = phoneInput.value.trim();
    if (!raw) {
      status.className = "exit-status error";
      status.textContent = "لطفاً شماره موبایل را وارد کنید.";
      return;
    }

    var contact = normalizeContact(raw);
    if (contact.kind === "invalid") {
      status.className = "exit-status error";
      status.textContent = "شماره موبایل معتبر وارد کنید.";
      return;
    }

    status.className = "";
    status.textContent = "در حال ارسال...";

    fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({
        page: location.pathname,
        referrer: document.referrer || undefined,
        ts: Date.now(),
        source: "seo_exit_intent",
        contact: contact.value,
        goal: "seo_audit_free",
        plan: "free_audit",
        detail: "exit-intent free audit capture",
        consent: true
      }, getUtms())),
      keepalive: true
    }).then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.ok) {
          status.className = "exit-status success";
          status.textContent = "✓ ثبت شد! در ۲۴ ساعت سایتت رو بررسی می‌کنیم.";
          track("lead_captured", { source: "seo_exit_intent", page: "seo" });
          (window.dataLayer = window.dataLayer || []).push({ event: "generate_lead", source: "seo_exit_intent" });
          if (typeof window.yektanet === "function") window.yektanet("lead");
          setTimeout(function () { window.closeExitModal(); }, 2500);
        } else {
          throw new Error("not saved");
        }
      })
      .catch(function () {
        status.className = "exit-status error";
        status.textContent = "مشکلی پیش آمد. لطفاً از واتساپ ارتباط بگیرید.";
      });
  };

  /* ---------- payment status query params ---------- */
  (function () {
    var p = new URLSearchParams(window.location.search);
    var payment = p.get("payment");
    if (payment === "success") {
      track("payment_success", { page: "seo", trackId: p.get("trackId") });
      (window.dataLayer = window.dataLayer || []).push({ event: "purchase", source: "seo" });
      if (typeof window.yektanet === "function") window.yektanet("lead");
    } else if (payment === "failed") {
      track("payment_failed", { page: "seo", trackId: p.get("trackId") });
    } else if (payment === "error") {
      track("payment_error", { page: "seo" });
    }
  })();

  /* =========================================================
     CEO + CRO: Referral program & returning customer logic
     ========================================================= */

  /* ---------- referral code from URL (?ref=ARY-XXXXXX) ---------- */
  (function () {
    var p = new URLSearchParams(window.location.search);
    var refCode = p.get("ref");
    if (refCode) {
      try { sessionStorage.setItem("ref_code", refCode); } catch(_) {}
      track("referral_visit", { code: refCode, page: "seo" });
      // Show a welcome banner for referred visitors
      var hero = document.querySelector(".hero .wrap");
      if (hero) {
        var banner = document.createElement("div");
        banner.style.cssText = "background:linear-gradient(135deg,#f0fdfa,#ccfbf1);border:1px solid var(--seo-teal);border-radius:14px;padding:12px 20px;margin-bottom:16px;text-align:center;font-size:14px;font-weight:700;color:var(--seo-teal)";
        banner.innerHTML = "🎉 دوستت با کد <b>" + refCode + "</b> معرفیت کرده — ۱۰۰ هزار تومان تخفیف اضافه روی هر پکیج!";
        hero.insertBefore(banner, hero.firstChild);
      }
    }
  })();

  /* ---------- returning customer discount ---------- */
  (function () {
    try {
      var cookieMatch = document.cookie.match(/seo_visit=([^;]+)/);
      if (cookieMatch) {
        var visit = JSON.parse(decodeURIComponent(cookieMatch[1]));
        var daysSince = (Date.now() - visit.ts) / 86400000;
        if (daysSince > 1 && daysSince < 30) {
          // Returning visitor — show discount banner
          var hero = document.querySelector(".hero .wrap");
          if (hero) {
            var banner = document.createElement("div");
            banner.style.cssText = "background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-radius:14px;padding:12px 20px;margin-bottom:16px;text-align:center;font-size:14px;font-weight:700;color:#92400e";
            banner.innerHTML = "👋 دوباره اومدی! به‌خاطر بازگشتت، ۱۰٪ تخفیف اضافه روی پکیج پایه — فقط امروز.";
            hero.insertBefore(banner, hero.firstChild);
          }
          // Apply 10% discount to basic package
          if (pkgs.basic) {
            pkgs.basic.price = Math.round(pkgs.basic.price * 0.9);
            var basicCard = document.querySelector('.pkg-card[data-package="basic"]');
            if (basicCard) {
              var newEl = basicCard.querySelector(".new");
              if (newEl) newEl.innerHTML = formatToman(pkgs.basic.price) + " <small>تومان</small>";
              var saveEl = basicCard.querySelector(".save");
              if (saveEl) saveEl.textContent = "بازگشت مشتری — ۱۰٪ تخفیف اضافه!";
            }
          }
          track("returning_visitor", { page: "seo", daysSince: Math.round(daysSince) });
        }
      }
    } catch(_) {}
  })();

  /* ---------- referral program: get code ---------- */
  window.getReferralCode = function () {
    var phoneInput = document.getElementById("referralPhone");
    var result = document.getElementById("referralResult");
    if (!phoneInput || !result) return;

    var raw = phoneInput.value.trim();
    if (!raw) {
      result.innerHTML = "<span style='color:#fca5a5'>لطفاً شماره موبایل را وارد کنید.</span>";
      return;
    }

    var contact = normalizeContact(raw);
    if (contact.kind !== "phone") {
      result.innerHTML = "<span style='color:#fca5a5'>شماره موبایل معتبر وارد کنید.</span>";
      return;
    }

    result.innerHTML = "در حال دریافت کد...";
    track("referral_requested", { page: "seo" });

    fetch("/api/referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: contact.value })
    }).then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.ok && data.referral) {
          var code = data.referral.code;
          var count = data.referral.referral_count || 0;
          var reward = data.referral.reward_earned || 0;
          var countEl = document.getElementById("referralCount");
          if (countEl) countEl.textContent = toFa(count);

          var shareUrl = "https://araaye.com/seo?ref=" + code;
          var shareText = encodeURIComponent("سئو سایت از ۸۹۰ هزار تومان — با کد معرفی من " + code + " ثبت کن، ۱۰۰ هزار تومان تخفیف بگیر! " + shareUrl);

          result.innerHTML = "<div>کد معرفی شما:</div>" +
            "<div class='code'>" + code + "</div>" +
            (count > 0 ? "<div style='margin-top:8px;opacity:.8'>تا حالا " + toFa(count) + " نفر معرفی کردی — " + formatToman(reward) + " تومان تخفیف کسب کردی.</div>" : "") +
            "<div class='share-links'>" +
            "<a href='https://wa.me/?text=" + shareText + "' target='_blank' rel='noopener'>💬 واتساپ</a>" +
            "<a href='https://t.me/share/url?url=" + encodeURIComponent(shareUrl) + "&text=" + shareText + "' target='_blank' rel='noopener'>👈 تلگرام</a>" +
            "<a href='javascript:void(0)' onclick='copyReferral(\"" + shareUrl + "\")'>📋 کپی لینک</a>" +
            "</div>";

          track("referral_code_generated", { code: code, page: "seo" });
        } else {
          throw new Error("referral failed");
        }
      })
      .catch(function () {
        result.innerHTML = "<span style='color:#fca5a5'>مشکلی پیش آمد. لطفاً دوباره تلاش کنید.</span>";
      });
  };

  /* ---------- copy referral link ---------- */
  window.copyReferral = function (url) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        var result = document.getElementById("referralResult");
        if (result) {
          var existing = result.innerHTML;
          result.innerHTML = "<div style='color:var(--seo-mint);font-weight:700'>✓ لینک کپی شد!</div>" + existing;
          setTimeout(function () { result.innerHTML = existing; }, 2000);
        }
      });
    }
  };

  /* ---------- pass referral code in lead submission ---------- */
  var origSubmitLead = submitLead;
  submitLead = function (payload) {
    try {
      var refCode = sessionStorage.getItem("ref_code");
      if (refCode) {
        payload.ref_code = refCode;
        payload.detail = (payload.detail || "") + " | ref_code: " + refCode;
      }
    } catch(_) {}
    return origSubmitLead(payload);
  };
})();
