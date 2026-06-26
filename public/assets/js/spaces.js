(function () {
  "use strict";

  const track = window.track || function () {};
  const LEAD_BACKUP_KEY = "__araaye_spaces_pending_leads";

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

  function fileSummary(input) {
    const files = Array.prototype.slice.call(input && input.files ? input.files : []);
    if (!files.length) return "بدون عکس";
    return files.map(function (f) { return f.name + " (" + Math.round(f.size / 1024) + "KB)"; }).join("، ");
  }

  function setStatus(el, text, type) {
    if (!el) return;
    el.textContent = text || "";
    el.dataset.type = type || "";
    el.hidden = !text;
  }

  function leadPayload(source, data) {
    return {
      source: source,
      contact: data.contact,
      name: data.name || null,
      goal: "آرایه Spaces - طراحی و آماده‌سازی فضای فیزیکی کسب‌وکار",
      sitetype: data.spaceType || null,
      budget: data.budget || null,
      intent: data.intent || "consultation",
      detail: [
        data.city ? "شهر: " + data.city : null,
        data.area ? "متراژ: " + data.area : null,
        data.stage ? "مرحله پروژه: " + data.stage : null,
        data.services ? "خدمات: " + data.services : null,
        data.material ? "سبک/متریال: " + data.material : null,
        data.photos ? "عکس‌ها: " + data.photos : null,
        data.note ? "توضیح: " + data.note : null,
      ].filter(Boolean).join(" | "),
      raw: data,
      consent: true,
    };
  }

  function initReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    items.forEach(function (el) { io.observe(el); });
  }

  function initParallax() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduce || coarse) return;
    const layers = document.querySelectorAll("[data-depth]");
    if (!layers.length) return;
    let raf = 0;
    function update() {
      raf = 0;
      const y = window.scrollY || 0;
      layers.forEach(function (el) {
        const depth = Number(el.dataset.depth || 0);
        const speed = (depth - 2) * 0.035;
        el.style.transform = "translate3d(0," + (y * speed).toFixed(2) + "px,0)";
      });
    }
    window.addEventListener("scroll", function () {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  function initHeroLead() {
    const form = document.getElementById("spacesHeroLead");
    if (!form) return;
    const input = form.querySelector("input[name='contact']");
    const status = form.querySelector(".mini-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const raw = input.value.trim();
      if (!isPhone(raw)) {
        setStatus(status, "شماره موبایل معتبر وارد کنید.", "error");
        input.classList.add("is-invalid");
        return;
      }
      input.classList.remove("is-invalid");
      setStatus(status, "در حال ثبت درخواست...", "loading");
      sendLead(leadPayload("hero_form", {
        contact: normalizePhone(raw),
        intent: "initial_consultation",
        services: "مشاوره اولیه طراحی فضا",
      })).then(function () {
        setStatus(status, "ثبت شد. برای بررسی اولیه با شما تماس می‌گیریم.", "success");
        form.reset();
        track("lead_captured", { source: "hero_form", page: "spaces" });
      }).catch(function () {
        setStatus(status, "فعلاً ارسال آنلاین کامل نشد؛ شماره شما برای ارسال مجدد نگه داشته شد.", "error");
      });
    });
  }

  function initFullForm() {
    const form = document.getElementById("spaceForm");
    if (!form) return;
    const status = document.getElementById("spaceFormStatus");
    const submit = form.querySelector("button[type='submit']");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (data.company) return;
      if (!isPhone(data.contact)) {
        setStatus(status, "شماره تماس معتبر وارد کنید.", "error");
        return;
      }
      data.contact = normalizePhone(data.contact);
      data.photos = fileSummary(form.querySelector("input[name='photos']"));
      data.services = Array.prototype.slice.call(form.querySelectorAll("input[name='services']:checked")).map(function (i) { return i.value; }).join("، ");
      submit.disabled = true;
      setStatus(status, "در حال ثبت لید...", "loading");
      sendLead(leadPayload("multistep_form", data)).then(function () {
        setStatus(status, "درخواست ثبت شد. تیم آرایه Spaces کمتر از یک روز کاری تماس می‌گیرد. اگر عکس دارید، از دکمه واتساپ هم ارسال کنید.", "success");
        form.reset();
        track("lead_captured", { source: "multistep_form", page: "spaces", sitetype: data.spaceType });
      }).catch(function () {
        setStatus(status, "ارسال کامل نشد؛ اطلاعات به صف ذخیره شد و در اولین اتصال دوباره ارسال می‌شود.", "error");
      }).finally(function () {
        submit.disabled = false;
      });
    });
  }

  function initChatbot() {
    const toggle = document.getElementById("chatbotToggle");
    const panel = document.getElementById("chatbotContainer");
    const close = document.getElementById("chatbotClose");
    const input = document.getElementById("chatbotInput");
    const send = document.getElementById("chatbotSend");
    const messages = document.getElementById("chatbotMessages");
    if (!toggle || !panel || !input || !send || !messages) return;

    const questions = [
      { key: "spaceType", text: "چه فضایی دارید؟ کلینیک، دفتر، سالن، کافه یا فروشگاه؟" },
      { key: "area", text: "متراژ حدودی فضا چقدر است؟" },
      { key: "city", text: "شهر پروژه کجاست؟" },
      { key: "budget", text: "بودجه حدودی را بفرستید؛ اقتصادی، متوسط یا لوکس؟" },
      { key: "contact", text: "شماره تماس را بفرستید تا مشاوره اولیه را هماهنگ کنیم." },
    ];
    let step = 0;
    const data = { intent: "chat_consultation", services: "طراحی داخلی اولیه، moodboard، 3D، متریال، چیدمان، نورپردازی" };

    function add(text, who) {
      const div = document.createElement("div");
      div.className = who === "user" ? "user-msg" : "bot-msg";
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
    }

    function open() {
      panel.classList.add("active");
      toggle.hidden = true;
      input.focus();
    }

    function hide() {
      panel.classList.remove("active");
      setTimeout(function () { toggle.hidden = false; }, 250);
    }

    function nextAnswer(text) {
      const q = questions[step];
      data[q.key] = text;
      if (q.key === "contact") {
        if (!isPhone(text)) {
          setTimeout(function () { add("شماره موبایل را کامل وارد کنید؛ مثل 09123456789", "bot"); }, 250);
          return;
        }
        data.contact = normalizePhone(text);
        input.disabled = true;
        send.disabled = true;
        setTimeout(function () { add("در حال ثبت درخواست طراحی فضای شما...", "bot"); }, 150);
        sendLead(leadPayload("chatbot", data)).then(function () {
          setTimeout(function () { add("ثبت شد. برای بررسی اولیه فضا و مسیر طراحی با شما تماس می‌گیریم.", "bot"); }, 600);
          track("lead_captured", { source: "chatbot", page: "spaces" });
        }).catch(function () {
          setTimeout(function () { add("اتصال کامل نشد، ولی اطلاعات شما ذخیره شد و دوباره ارسال می‌شود.", "bot"); }, 600);
        });
        return;
      }
      step += 1;
      setTimeout(function () { add(questions[step].text, "bot"); }, 350);
    }

    function submit() {
      const val = input.value.trim();
      if (!val) return;
      add(val, "user");
      input.value = "";
      nextAnswer(val);
    }

    toggle.addEventListener("click", open);
    close.addEventListener("click", hide);
    send.addEventListener("click", submit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit();
    });

    setTimeout(function () {
      if (!panel.classList.contains("active") && window.scrollY > 200) open();
    }, 8500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    flushPendingLeads();
    initReveal();
    initParallax();
    initHeroLead();
    initFullForm();
    initChatbot();
  });
})();
