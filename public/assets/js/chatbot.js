/* =========================================================
   آرایه — chatbot.js
   Scripted, rule-based conversational assistant ("دستیار آرایه").
   Persona-driven lead qualification, in-chat email capture,
   human handoff, multi-channel (Bale/Telegram) mention.
   Fully self-contained — no API, no backend.
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
  if (!launcher || !panel) return;

  const track = window.track || function () {};
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lead = { intent: "", detail: "", contact: "" };
  let started = false;
  let nudged = false;

  /* ---------- conversation script ----------
     A page may define its own tailored flow via window.ARAYEH_CHAT
     (same node shape as DEFAULT_SCRIPT below). Falls back to the
     default agency script when none is provided. */
  const DEFAULT_SCRIPT = {
    start: {
      msgs: ["سلام 👋 من دستیار آرایه‌ام.", "در کمتر از ۳۰ ثانیه کمک می‌کنم بهترین راهکار را پیدا کنید. به چه چیزی فکر می‌کنید؟"],
      quick: [
        { t: "یک وب‌سایت می‌خواهم", go: "website", set: { intent: "website" } },
        { t: "چت‌بات برای کسب‌وکارم", go: "chatbot", set: { intent: "chatbot" } },
        { t: "مطمئن نیستم، مشاوره می‌خواهم", go: "advise", set: { intent: "advise" } },
        { t: "قیمت‌ها چقدر است؟", go: "pricing", set: { intent: "pricing" } },
      ],
    },
    website: {
      msgs: [
        "عالیه! وب‌سایت‌های آرایه سریع، سئوشده و واکنش‌گرا هستند و مهم‌تر از همه، برای تبدیلِ بازدیدکننده به مشتری طراحی می‌شوند.",
        "بیشتر دنبال چه نوع سایتی هستید؟",
      ],
      quick: [
        { t: "سایت شرکتی", go: "qualify", set: { detail: "سایت شرکتی" } },
        { t: "فروشگاه آنلاین", go: "qualify", set: { detail: "فروشگاه آنلاین" } },
        { t: "لندینگ برای کمپین", go: "qualify", set: { detail: "لندینگ کمپین" } },
      ],
    },
    chatbot: {
      msgs: [
        "انتخاب فوق‌العاده‌ای! چت‌بات‌های ما روی دانشِ خودِ کسب‌وکار شما (سایت، PDF، کاتالوگ) آموزش می‌بینند؛ پس پاسخ‌های دقیق و بدون توهم می‌دهند.",
        "و حتی اگر اینترنت بین‌الملل قطع شود یا پیام‌رسان فیلتر شود، روی «بله» و «تلگرام» سرپا می‌ماند. کدام کانال برایتان مهم‌تر است؟",
      ],
      quick: [
        { t: "روی وب‌سایت", go: "qualify", set: { detail: "چت‌بات سایت" } },
        { t: "اینستاگرام", go: "qualify", set: { detail: "چت‌بات اینستاگرام" } },
        { t: "تلگرام / بله", go: "qualify", set: { detail: "چت‌بات تلگرام/بله" } },
      ],
    },
    advise: {
      msgs: ["بدون نگرانی! یک سؤال کوتاه می‌پرسم تا بهترین مسیر را پیشنهاد دهم.", "هدف اصلی شما چیست؟"],
      quick: [
        { t: "فروش بیشتر", go: "qualify", set: { detail: "هدف: فروش" } },
        { t: "پشتیبانی خودکار مشتری", go: "qualify", set: { detail: "هدف: پشتیبانی" } },
        { t: "برندسازی", go: "qualify", set: { detail: "هدف: برندسازی" } },
      ],
    },
    pricing: {
      msgs: [
        "پکیج‌ها سه‌سطحی هستند: «برنزی» (لندینگ تک‌صفحه‌ای)، «نقره‌ای» (وب‌سایت کامل + چت‌بات — محبوب‌ترین)، و «طلایی» (راهکار سازمانی هوش مصنوعی).",
        "بسته به بودجه و هدف‌تان می‌توانم دقیق‌ترین گزینه را پیشنهاد دهم. ادامه دهیم؟",
      ],
      quick: [
        { t: "بله، پیشنهاد بده", go: "qualify", set: { detail: "مشاورهٔ پکیج" } },
        { t: "فرم مشاوره را ببینم", action: "goto-form" },
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
      quick: [{ t: "از اول شروع کنیم", go: "start" }],
    },
    channels: {
      msgs: [
        "حتماً! می‌توانید همین گفتگو را در پیام‌رسان «بله» یا «تلگرام» ادامه دهید — این کانال‌ها مصون از اختلال و فیلترینگ هستند و همهٔ پیام‌ها در یک داشبورد مرکزی برای تیم ما تجمیع می‌شود.",
      ],
      quick: [
        { t: "مشاهدهٔ فرم مشاوره", action: "goto-form" },
        { t: "از اول شروع کنیم", go: "start" },
      ],
    },
  };

  // active script: page-supplied override, else the default agency flow
  const SCRIPT = (window.ARAYEH_CHAT && window.ARAYEH_CHAT.start) ? window.ARAYEH_CHAT : DEFAULT_SCRIPT;

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
    const msgs = node.msgs.slice();

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
      inputForm.hidden = false;
      input.placeholder = "ایمیل یا شمارهٔ موبایل…";
      input.focus();
      return;
    }
    if (node.quick) {
      node.quick.forEach((q) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quick-btn";
        b.textContent = q.t;
        b.addEventListener("click", () => handleQuick(q));
        quickWrap.appendChild(b);
      });
      scrollDown();
    }
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

  /* ---------- free-text input (contact capture) ---------- */
  function toLatin(s) {
    return String(s).replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 0x06f0).replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x0660);
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, "")); }

  inputForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    addMsg(val, "user");
    input.value = "";
    if (isEmail(val) || isPhone(val)) {
      lead.contact = val;
      inputForm.hidden = true;
      track("lead_captured", { source: "chatbot", intent: lead.intent, detail: lead.detail });
      // submission hook → /api/leads (fire-and-forget)
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({}, lead, { source: "chatbot", page: location.pathname })),
        keepalive: true,
      }).catch(function () {});
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
    track("chat_open", { source: source || "launcher" });
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closeChat();
  });

  /* ---------- scroll-intent nudge ---------- */
  function showNudge() {
    if (nudged || !panel.hidden || !nudge) return;
    nudged = true;
    nudge.hidden = false;
    track("chat_nudge_shown", {});
    setTimeout(hideNudge, 8000);
  }
  function hideNudge() { if (nudge) nudge.hidden = true; }

  /* ---------- public API ---------- */
  window.Arayeh = window.Arayeh || {};
  window.Arayeh.openChat = openChat;
  window.Arayeh.closeChat = closeChat;
  window.Arayeh.nudge = showNudge;
})();
