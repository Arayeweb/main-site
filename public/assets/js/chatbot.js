/* =========================================================
   آرایه — chatbot.js
   Scripted, rule-based ADVISORY assistant ("دستیار آرایه").
   Acts as a consultant: understands the goal, asks budget,
   recommends the right package WITH reasoning (value before
   the ask), then captures contact. Understands free-text
   questions (FAQ routing) anywhere in the conversation.
   Human handoff + multi-channel (Bale/Telegram).
   Fully self-contained — POSTs leads to /api/leads with a
   localStorage backup so a lead is never silently lost.
   ========================================================= */
(function () {
  "use strict";

  const launcher = document.getElementById("chatLauncher");
  const panel = document.getElementById("chatPanel");
  const thread = document.getElementById("chatThread");
  const quickWrap = document.getElementById("chatQuick");
  const inputForm = document.getElementById("chatInputForm");
  const input = document.getElementById("chatInput");
  const nudge = document.getElementById("chatNudge");
  // hard guard: bail out if any structural node is missing instead of throwing later
  if (!launcher || !panel || !thread || !quickWrap || !inputForm || !input) return;

  // add notification badge to launcher (visible until first open)
  const badge = document.createElement("span");
  badge.className = "chat-launcher-badge";
  badge.setAttribute("aria-hidden", "true");
  launcher.appendChild(badge);

  const closeBtn = panel.querySelector('[data-action="close-chat"]');
  const track = window.track || function () {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lead = { intent: "", detail: "", budget: "", plan: "", contact: "" };
  let started = false;
  let nudged = false;
  let expecting = null; // "contact" while we wait for an email/phone, else null

  // a11y baseline: announce open state on the launcher, mark the panel modal
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "chatPanel");
  panel.setAttribute("aria-modal", "true");

  /* ---------- advisory engine: budget → package recommendation ---------- */
  const PLAN_NAME = { bronze: "برنزی", silver: "نقره‌ای", gold: "طلایی" };

  function recommendPlan(state) {
    const b = state.budget;
    const d = state.detail || "";
    const wantsAI = state.intent === "chatbot" || state.intent === "support" || /چت‌بات|پشتیبانی/.test(d);

    if (b === "lt15") {
      return { plan: "bronze", why: "با این بودجه، یک لندینگ‌پیجِ تک‌صفحه‌ایِ سریع و سئوشده بهترین نقطهٔ شروع است؛ کم‌هزینه، مناسب کمپین تبلیغاتی و بعداً قابل ارتقا به سایت کامل." };
    }
    if (b === "gt100") {
      return { plan: "gold", why: "برای این سطح بودجه، راهکار سازمانیِ «طلایی» با اتوماسیون هوش مصنوعی، زیرساخت بومی مقاوم و مدیر پروژهٔ اختصاصی بیشترین بازده را می‌دهد." };
    }
    if (b === "40-100") {
      return wantsAI
        ? { plan: "gold", why: "چون تمرکزتان روی چت‌بات و پشتیبانی هوشمند است، پکیج «طلایی» با اتوماسیون و دستیار اختصاصی AI ارزش این بودجه را کامل آزاد می‌کند." }
        : { plan: "silver", why: "وب‌سایت کامل + چت‌بات متصل به CRM در این بازه، تعادلِ عالیِ هزینه و نتیجه است و مستقیم روی نرخ تبدیل کار می‌کند." };
    }
    if (b === "15-40") {
      return { plan: "silver", why: "پکیج «نقره‌ای» (وب‌سایت کامل + چت‌بات هوشمند) محبوب‌ترین انتخاب در این بودجه است؛ هم برند را روایت می‌کند و هم لید می‌سازد." };
    }
    // unsure / unknown
    return { plan: "silver", why: "اگر هنوز در بودجه مطمئن نیستید، از پکیج «نقره‌ای» شروع کنید؛ پرتقاضاترین گزینه که هم سایت و هم چت‌بات را پوشش می‌دهد و با بودجهٔ شما قابل تنظیم است." };
  }

  /* ---------- conversation script ----------
     A page may define its own tailored flow via window.ARAYEH_CHAT
     (same node shape as DEFAULT_SCRIPT below). Falls back to the
     default agency script when none is provided.
     node.msgs / node.quick may be a function(lead) for dynamic nodes. */
  const DEFAULT_SCRIPT = {
    start: {
      msgs: ["سلام 👋 من دستیار آرایه‌ام؛ مثل یک مشاور کمک می‌کنم بهترین راهکار را پیدا کنید.", "می‌توانید سؤالتان را همین‌جا بنویسید یا یکی را انتخاب کنید:"],
      quick: [
        { t: "یک وب‌سایت می‌خواهم", go: "website", set: { intent: "website" } },
        { t: "چت‌بات برای کسب‌وکارم", go: "chatbot", set: { intent: "chatbot" } },
        { t: "مطمئن نیستم، مشاوره می‌خواهم", go: "advise", set: { intent: "advise" } },
        { t: "قیمت‌ها چقدر است؟", go: "budget", set: { intent: "pricing" } },
      ],
    },
    website: {
      msgs: [
        "عالیه! وب‌سایت‌های آرایه سریع، سئوشده و واکنش‌گرا هستند و مهم‌تر از همه، برای تبدیلِ بازدیدکننده به مشتری طراحی می‌شوند.",
        "بیشتر دنبال چه نوع سایتی هستید؟",
      ],
      quick: [
        { t: "سایت شرکتی", go: "budget", set: { detail: "سایت شرکتی" } },
        { t: "فروشگاه آنلاین", go: "budget", set: { detail: "فروشگاه آنلاین" } },
        { t: "لندینگ برای کمپین", go: "budget", set: { detail: "لندینگ کمپین" } },
      ],
    },
    chatbot: {
      msgs: [
        "انتخاب فوق‌العاده‌ای! چت‌بات‌های ما روی دانشِ خودِ کسب‌وکار شما (سایت، PDF، کاتالوگ) آموزش می‌بینند؛ پس پاسخ‌های دقیق و بدون توهم می‌دهند.",
        "همچنین امکان اتصال به پیام‌رسان‌های مختلف و جمع‌آوری تمام پیام‌ها در یک داشبورد مرکزی وجود دارد. کدام کانال برایتان مهم‌تر است؟",
      ],
      quick: [
        { t: "روی وب‌سایت", go: "budget", set: { detail: "چت‌بات سایت" } },
        { t: "اینستاگرام", go: "budget", set: { detail: "چت‌بات اینستاگرام" } },
        { t: "تلگرام / بله", go: "budget", set: { detail: "چت‌بات تلگرام/بله" } },
      ],
    },
    advise: {
      msgs: ["بدون نگرانی! دو سؤال کوتاه می‌پرسم تا بهترین مسیر را پیشنهاد دهم.", "هدف اصلی شما چیست؟"],
      quick: [
        { t: "فروش بیشتر", go: "budget", set: { detail: "هدف: فروش" } },
        { t: "پشتیبانی خودکار مشتری", go: "budget", set: { detail: "هدف: پشتیبانی", intent: "support" } },
        { t: "برندسازی", go: "budget", set: { detail: "هدف: برندسازی" } },
      ],
    },
    budget: {
      msgs: ["یک سؤال کوتاه تا دقیق‌ترین پیشنهاد را بدهم: بودجهٔ تقریبیِ شما در چه بازه‌ای است؟"],
      quick: [
        { t: "کمتر از ۱۵ م.ت", go: "recommend", set: { budget: "lt15" } },
        { t: "۱۵ تا ۴۰ م.ت", go: "recommend", set: { budget: "15-40" } },
        { t: "۴۰ تا ۱۰۰ م.ت", go: "recommend", set: { budget: "40-100" } },
        { t: "بیش از ۱۰۰ م.ت", go: "recommend", set: { budget: "gt100" } },
        { t: "هنوز مطمئن نیستم", go: "recommend", set: { budget: "unsure" } },
      ],
    },
    recommend: {
      msgs: function (state) {
        const r = recommendPlan(state);
        state.plan = r.plan;
        // prefill the multi-step form so a hand-off to the form keeps context
        if (window.Arayeh && typeof window.Arayeh.presetPlan === "function") window.Arayeh.presetPlan(r.plan);
        track("chat_recommend", { plan: r.plan, intent: state.intent, budget: state.budget });
        return [
          "بر اساس آنچه گفتید، پیشنهادِ من پکیج «" + PLAN_NAME[r.plan] + "» است 👇",
          r.why,
          "می‌خواهید نمونه‌کارِ مرتبط و برآورد دقیق قیمت را همین‌جا برایتان بفرستم؟",
        ];
      },
      quick: [
        { t: "بله، برایم بفرست", go: "qualify" },
        { t: "پکیج‌ها را ببینم", action: "goto-pricing" },
        { t: "با کارشناس حرف بزنم", go: "human" },
      ],
    },
    qualify: {
      msgs: ["عالی! یک ایمیل یا شمارهٔ موبایل بدهید تا نمونه‌کارِ مرتبط و پیشنهاد قیمت را همین حالا برایتان بفرستم 🎁"],
      expects: "contact",
    },
    thanks: {
      msgs: [
        "ممنون! 🙌 اطلاعات شما ثبت شد.",
        "یکی از مشاوران آرایه خیلی زود با شما تماس می‌گیرد. تا آن موقع چه کاری برایتان انجام دهم؟",
      ],
      quick: [
        { t: "اتصال به پشتیبان انسانی", go: "human" },
        { t: "ادامه در بله / تلگرام", go: "channels" },
        { t: "مشاهدهٔ پکیج‌ها", action: "goto-pricing" },
      ],
    },
    human: {
      msgs: [
        "در حال بررسی…",
        "یکی از همکاران ما الان آنلاین است ✅ گفتگو همراه با کل تاریخچه به ایشان منتقل شد؛ لطفاً چند لحظه صبر کنید. (در نسخهٔ واقعی، این‌جا مکالمه به اپراتور انسانی سپرده می‌شود.)",
      ],
      quick: [
        { t: "شماره/ایمیلم را می‌گذارم", go: "qualify" },
        { t: "از اول شروع کنیم", go: "start" },
      ],
    },
    channels: {
      msgs: [
        "حتماً! می‌توانید همین گفتگو را در پیام‌رسان «بله» یا «تلگرام» ادامه دهید — تمامی پیام‌های شما از این کانال‌ها در یک داشبورد مرکزی برای تیم ما تجمیع می‌شود.",
      ],
      quick: [
        { t: "مشاهدهٔ فرم مشاوره", action: "goto-form" },
        { t: "از اول شروع کنیم", go: "start" },
      ],
    },

    /* ---- free-text FAQ answers (advisory knowledge) ---- */
    faq_seo: {
      msgs: [
        "خیالتان راحت باشد 🙂 تمامی پروژه‌های آرایه با رعایت اصول اولیه سئو تکنیکال، سرعت بالای بارگذاری و کدهای تمیز طراحی می‌شوند.",
        "این یعنی سایت شما از همان روز اول آمادگی کامل برای کسب رتبه‌های برتر در موتورهای جستجو را خواهد داشت.",
      ],
      quick: [
        { t: "پیشنهاد پکیج مناسب من", go: "budget" },
        { t: "با کارشناس حرف بزنم", go: "human" },
      ],
    },
    faq_accuracy: {
      msgs: [
        "چت‌بات فقط روی دانشِ اختصاصیِ کسب‌وکار شما (سایت، PDF، کاتالوگ) با فناوری RAG آموزش می‌بیند و صرفاً بر اساس همان منابع پاسخ می‌دهد.",
        "همین مکانیزمِ ضدِ توهم، خطرِ ارائهٔ قیمت یا وعدهٔ نادرست را عملاً به صفر می‌رساند؛ و برای سؤال‌های پیچیده، گفتگو به اپراتور انسانی سپرده می‌شود.",
      ],
      quick: [
        { t: "پیشنهاد پکیج مناسب من", go: "budget" },
        { t: "با کارشناس حرف بزنم", go: "human" },
      ],
    },
    faq_timeline: {
      msgs: [
        "لندینگ‌پیج‌ها معمولاً طی چند روز و وب‌سایت‌های کامل با چت‌بات طی دو تا چهار هفته تحویل می‌شوند.",
        "زمان دقیق بعد از مشاورهٔ رایگان و بر اساس دامنهٔ پروژه مشخص می‌شود. می‌خواهید پکیج مناسب‌تان را پیشنهاد دهم؟",
      ],
      quick: [
        { t: "بله، پیشنهاد بده", go: "budget" },
        { t: "با کارشناس حرف بزنم", go: "human" },
      ],
    },
    fallback: {
      msgs: ["می‌توانم دربارهٔ این موضوع‌ها دقیق راهنمایی‌تان کنم 👇"],
      quick: [
        { t: "پیشنهاد پکیج مناسب من", go: "budget" },
        { t: "قیمت‌ها و پکیج‌ها", action: "goto-pricing" },
        { t: "بهینه‌سازی برای گوگل (سئو)", go: "faq_seo" },
        { t: "اتصال به کارشناس انسانی", go: "human" },
      ],
    },
  };

  // active script: a page may override the entry funnel (start + its topic
  // nodes), but the shared advisory nodes (budget, recommend, faq_*, fallback,
  // human, channels) are always merged in so free-text routing works everywhere.
  const SCRIPT = (window.ARAYEH_CHAT && window.ARAYEH_CHAT.start)
    ? Object.assign({}, DEFAULT_SCRIPT, window.ARAYEH_CHAT)
    : DEFAULT_SCRIPT;

  /* ---------- helpers ---------- */
  function scrollDown() { thread.scrollTop = thread.scrollHeight; }

  function addMsg(text, who) {
    const m = document.createElement("div");
    m.className = "msg " + who;
    m.textContent = text;
    thread.appendChild(m);
    scrollDown();
    return m;
  }

  function clearQuick() { quickWrap.innerHTML = ""; }

  function showTyping() {
    const t = document.createElement("div");
    t.className = "msg typing";
    t.innerHTML = "<span></span><span></span><span></span>";
    thread.appendChild(t);
    scrollDown();
    return t;
  }

  /* render a sequence of bot messages, then quick replies / input */
  function renderNode(id) {
    const node = SCRIPT[id];
    if (!node) return;
    clearQuick();
    inputForm.hidden = true;
    expecting = null;
    const rawMsgs = typeof node.msgs === "function" ? node.msgs(lead) : node.msgs;
    const msgs = (rawMsgs || []).slice();

    function next() {
      if (!msgs.length) {
        afterMsgs(node);
        return;
      }
      const text = msgs.shift();
      if (reduceMotion) {
        addMsg(text, "bot");
        next();
        return;
      }
      const typing = showTyping();
      const delay = Math.min(1100, 450 + text.length * 14);
      setTimeout(() => {
        typing.remove();
        addMsg(text, "bot");
        setTimeout(next, 220);
      }, delay);
    }
    next();
  }

  function afterMsgs(node) {
    if (node.expects === "contact") {
      expecting = "contact";
      inputForm.hidden = false;
      input.placeholder = "ایمیل یا شمارهٔ موبایل…";
      input.focus();
      return;
    }
    const quick = typeof node.quick === "function" ? node.quick(lead) : node.quick;
    if (quick) {
      quick.forEach((q) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quick-btn";
        b.textContent = q.t;
        b.addEventListener("click", () => handleQuick(q));
        quickWrap.appendChild(b);
      });
    }
    // free-text is available throughout the consultation, not just at contact
    inputForm.hidden = false;
    input.placeholder = "سؤالت را بنویس یا یک گزینه را انتخاب کن…";
    scrollDown();
  }

  function handleQuick(q) {
    addMsg(q.t, "user");
    clearQuick();
    if (q.set) Object.assign(lead, q.set);
    track("chat_reply", { choice: q.t, intent: lead.intent });
    if (q.action) {
      runAction(q.action);
      return;
    }
    setTimeout(() => renderNode(q.go), 250);
  }

  function runAction(action) {
    if (action === "goto-form") {
      closeChat();
      const el = document.getElementById("leadform");
      if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    } else if (action === "goto-pricing") {
      closeChat();
      const el = document.getElementById("pricing");
      if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  /* ---------- free-text routing (advisory intent matcher) ---------- */
  function routeFreeText(text) {
    const t = text.toLowerCase();
    const has = (...keys) => keys.some((k) => t.indexOf(k) > -1);
    let go = "fallback";
    if (has("سئو", "seo", "موتور جستجو", "گوگل", "بهینه‌سازی", "رتبه", "سرچ")) go = "faq_seo";
    else if (has("توهم", "اشتباه", "غلط", "دقت", "منبع", "rag", "رگ", "اطلاعات نادرست")) go = "faq_accuracy";
    else if (has("زمان", "چقدر طول", "کی آماده", "تحویل", "مدت", "چند روز", "چند هفته")) go = "faq_timeline";
    else if (has("قیمت", "هزینه", "تومان", "چنده", "چند است", "پکیج", "بودجه", "تعرفه", "پلن")) go = "budget";
    else if (has("انسان", "اپراتور", "پشتیبان", "کارشناس", "تماس بگیر", "مشاور")) go = "human";
    else if (has("سلام", "درود", "وقت بخیر", "خسته نباشید")) go = "start";
    // defensive: if a page override lacks the target node, degrade gracefully
    if (!SCRIPT[go]) go = SCRIPT.fallback ? "fallback" : "start";
    track("chat_freetext", { route: go });
    setTimeout(() => renderNode(go), 250);
  }

  /* ---------- contact validation ---------- */
  function toLatin(s) {
    return String(s).replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 0x06f0).replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x0660);
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, "")); }

  /* ---------- lead submission (reliable, never silently lost) ----------
     This is a lead-gen widget, so a dropped lead is lost revenue. We POST to
     /api/leads, and on any failure stash the payload in localStorage and retry
     later (on the next chat open) instead of swallowing the error. */
  const LEAD_BACKUP_KEY = "arayeh_pending_leads";

  function backupLead(payload) {
    try {
      const q = JSON.parse(localStorage.getItem(LEAD_BACKUP_KEY) || "[]");
      q.push(payload);
      localStorage.setItem(LEAD_BACKUP_KEY, JSON.stringify(q.slice(-20)));
    } catch (_) {}
  }

  function sendLead(payload) {
    return fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then(function (r) {
      if (!r.ok) throw new Error("lead http " + r.status);
      return r;
    });
  }

  function getUtmParams() {
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

  function submitLead(payload) {
    var enriched = Object.assign({}, getUtmParams(), { referrer: document.referrer || undefined }, payload);
    sendLead(enriched)
      .then(function () { track("lead_sent", { source: payload.source, intent: payload.intent }); })
      .catch(function () {
        track("lead_send_failed", { source: payload.source, intent: payload.intent });
        backupLead(enriched);
      });
  }

  function flushPendingLeads() {
    let q;
    try { q = JSON.parse(localStorage.getItem(LEAD_BACKUP_KEY) || "[]"); } catch (_) { return; }
    if (!q || !q.length) return;
    localStorage.removeItem(LEAD_BACKUP_KEY);
    q.forEach(function (p) { submitLead(p); });
  }

  inputForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, "user");
    input.value = "";

    if (expecting !== "contact") {
      // anywhere else in the chat, treat typed text as a question to advise on
      clearQuick();
      routeFreeText(val);
      return;
    }

    if (isEmail(val) || isPhone(val)) {
      lead.contact = val;
      expecting = null;
      inputForm.hidden = true;
      track("lead_captured", { source: "chatbot", intent: lead.intent, detail: lead.detail });
      submitLead(Object.assign({}, lead, { source: "chatbot", page: location.pathname, ts: Date.now() }));
      setTimeout(() => renderNode("thanks"), 300);
    } else {
      setTimeout(() => {
        addMsg("به‌نظر می‌رسد ایمیل یا شماره کامل نیست 🤔 لطفاً دوباره بفرستید (مثلاً name@mail.com یا ۰۹۱۲…).", "bot");
      }, 300);
    }
  });

  /* ---------- open / close ---------- */
  function openChat(source) {
    if (!panel.hidden) return;
    panel.hidden = false;
    document.body.classList.add("chat-open");
    hideNudge();
    if (badge) badge.style.display = "none";
    track("chat_open", { source: source || "launcher" });
    flushPendingLeads();
    if (!started) {
      started = true;
      setTimeout(() => renderNode("start"), 350);
    }
  }
  function closeChat() {
    panel.hidden = true;
    document.body.classList.remove("chat-open");
  }
  function toggleChat() { panel.hidden ? openChat("launcher") : closeChat(); }

  launcher.addEventListener("click", toggleChat);
  if (closeBtn) closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closeChat();
  });

  /* ---------- scroll-intent nudge ---------- */
  function showNudge() {
    if (nudged || !panel.hidden || !nudge) return;
    nudged = true;
    nudge.hidden = false;
    track("chat_nudge_shown", {});
    setTimeout(hideNudge, 10000);
  }
  function hideNudge() { if (nudge) nudge.hidden = true; }

  // proactive nudge after 25s if the visitor hasn't started a chat
  setTimeout(function () {
    if (!started) showNudge();
  }, 25000);

  /* ---------- public API ---------- */
  window.Arayeh = window.Arayeh || {};
  window.Arayeh.openChat = openChat;
  window.Arayeh.closeChat = closeChat;
  window.Arayeh.nudge = showNudge;
})();
