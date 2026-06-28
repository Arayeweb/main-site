/* =========================================================
   آرایه — support.js
   پنل پشتیبانی: پیگیری وضعیت پروژه + ثبت تیکت.
   ========================================================= */
(function () {
  "use strict";

  var track = window.track || function () {};

  /* ---------- helpers ---------- */
  function toLatin(s) {
    return String(s)
      .replace(/[۰-۹]/g, function (d) { return String(d.charCodeAt(0) - 0x06f0); })
      .replace(/[٠-٩]/g, function (d) { return String(d.charCodeAt(0) - 0x0660); });
  }
  function toFa(s) {
    return String(s).replace(/[0-9]/g, function (d) {
      return String.fromCharCode(0x06f0 + Number(d));
    });
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isPhone(v) { return /^(\+98|0098|0)?9\d{9}$/.test(toLatin(v).replace(/[\s\-()]/g, "")); }
  function normalizeContact(v) {
    var raw = String(v || "").trim();
    if (isPhone(raw)) {
      var digits = toLatin(raw).replace(/[\s\-()]/g, "");
      return { kind: "phone", value: "0" + digits.replace(/^(\+98|0098|0)?/, "") };
    }
    if (isEmail(raw)) return { kind: "email", value: raw.toLowerCase() };
    return { kind: "invalid", value: raw };
  }

  var STATUS_LABELS = {
    intake: "دریافت اطلاعات",
    design: "طراحی",
    development: "توسعه",
    review: "بازبینی",
    delivered: "تحویل‌شده",
    paused: "متوقف",
  };
  var SERVICE_LABELS = {
    website: "وب‌سایت",
    landing: "لندینگ‌پیج",
    chatbot: "چت‌بات",
    other: "سایر",
  };

  function statusLabel(s) { return STATUS_LABELS[s] || s || "—"; }
  function serviceLabel(s) { return SERVICE_LABELS[s] || s || "—"; }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return "—";
      return toFa(d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" }));
    } catch (e) {
      return "—";
    }
  }

  /* ---------- tabs ---------- */
  function initTabs() {
    var tabs = document.querySelectorAll(".support-tab");
    var panels = {
      status: document.getElementById("panel-status"),
      ticket: document.getElementById("panel-ticket"),
    };
    function activate(name) {
      tabs.forEach(function (t) {
        var on = t.dataset.tab === name;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      Object.keys(panels).forEach(function (k) {
        if (!panels[k]) return;
        var on = k === name;
        panels[k].classList.toggle("is-active", on);
        panels[k].hidden = !on;
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { activate(t.dataset.tab); });
    });
    // link from status result → ticket tab, prefilling project code
    document.querySelectorAll("[data-goto-ticket]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var code = (document.getElementById("statusCode").value || "").trim();
        if (code) document.getElementById("ticketProject").value = code;
        activate("ticket");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    return activate;
  }

  /* ---------- project status form ---------- */
  function initStatusForm() {
    var form = document.getElementById("statusForm");
    if (!form) return;
    var codeInput = document.getElementById("statusCode");
    var passwordInput = document.getElementById("statusPassword");
    var err = document.getElementById("statusErr");
    var submit = document.getElementById("statusSubmit");
    var result = document.getElementById("statusResult");

    function clearErr() { if (err) err.textContent = ""; }
    [codeInput, passwordInput].forEach(function (el) {
      el.addEventListener("input", clearErr);
    });

    document.getElementById("statusReset").addEventListener("click", function () {
      result.hidden = true;
      form.hidden = false;
      codeInput.value = "";
      passwordInput.value = "";
      clearErr();
      codeInput.focus();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErr();
      var code = (codeInput.value || "").trim();
      var password = passwordInput.value || "";
      if (!code) {
        err.textContent = "کد پروژه را وارد کنید.";
        return;
      }
      if (!password) {
        err.textContent = "رمز پروژه را وارد کنید.";
        return;
      }

      submit.disabled = true;
      submit.textContent = "در حال بررسی…";
      track("support_status_lookup", {});

      fetch("/api/support/project-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectCode: code, password: password }),
      })
        .then(function (r) {
          return r.json().then(function (data) { return { status: r.status, data: data }; });
        })
        .then(function (res) {
          if (res.status === 404) {
            err.textContent = "پروژه‌ای با این مشخصات پیدا نشد. کد پروژه و رمز را بررسی کنید.";
            return;
          }
          if (res.status === 429) {
            err.textContent = "تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید.";
            return;
          }
          if (!res.data || !res.data.ok) {
            err.textContent = "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.";
            return;
          }
          renderProject(res.data.project);
          track("support_status_found", {});
        })
        .catch(function () {
          err.textContent = "ارتباط برقرار نشد. اتصال اینترنت را بررسی کنید.";
        })
        .finally(function () {
          submit.disabled = false;
          submit.textContent = "پیگیری پروژه";
        });
    });

    function renderProject(p) {
      document.getElementById("resTitle").textContent = p.title || "پروژه شما";
      var badge = document.getElementById("resBadge");
      badge.textContent = statusLabel(p.status);
      badge.className = "status-badge st-" + (p.status || "intake");

      var pct = Math.max(0, Math.min(100, Number(p.progress_percent) || 0));
      document.getElementById("resProgressBar").style.width = pct + "%";
      document.getElementById("resProgressNum").textContent = toFa(pct) + "٪";

      document.getElementById("resCode").textContent = p.project_code || "—";
      document.getElementById("resService").textContent = serviceLabel(p.service_type);
      document.getElementById("resDelivery").textContent = formatDate(p.estimated_delivery_at);
      document.getElementById("resUpdated").textContent = formatDate(p.updated_at);

      var noteWrap = document.getElementById("resNoteWrap");
      if (p.last_note) {
        document.getElementById("resNote").textContent = p.last_note;
        noteWrap.hidden = false;
      } else {
        noteWrap.hidden = true;
      }

      form.hidden = true;
      result.hidden = false;
    }
  }

  /* ---------- ticket form ---------- */
  function initTicketForm() {
    var form = document.getElementById("ticketForm");
    if (!form) return;
    var err = document.getElementById("ticketErr");
    var submit = document.getElementById("ticketSubmit");
    var success = document.getElementById("ticketSuccess");

    function clearErr() { if (err) err.textContent = ""; }
    form.querySelectorAll("input,textarea,select").forEach(function (el) {
      el.addEventListener("input", clearErr);
    });

    document.getElementById("ticketReset").addEventListener("click", function () {
      success.hidden = true;
      form.hidden = false;
      form.reset();
      clearErr();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErr();

      var contact = normalizeContact(document.getElementById("ticketContact").value);
      var subject = (document.getElementById("ticketSubject").value || "").trim();
      var message = (document.getElementById("ticketMessage").value || "").trim();

      if (contact.kind === "invalid") {
        err.textContent = "ایمیل یا شمارهٔ موبایل معتبر وارد کنید.";
        return;
      }
      if (!subject) { err.textContent = "موضوع تیکت را وارد کنید."; return; }
      if (!message) { err.textContent = "شرح درخواست را وارد کنید."; return; }

      var payload = {
        name: (document.getElementById("ticketName").value || "").trim(),
        contact: contact.value,
        projectCode: (document.getElementById("ticketProject").value || "").trim(),
        category: document.getElementById("ticketCategory").value,
        priority: document.getElementById("ticketPriority").value,
        subject: subject,
        message: message,
        company: form.querySelector("[name='company']").value, // honeypot
        page: location.pathname,
      };

      submit.disabled = true;
      submit.textContent = "در حال ارسال…";
      track("support_ticket_submit", { category: payload.category, priority: payload.priority });

      fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (data) { return { status: r.status, data: data }; });
        })
        .then(function (res) {
          if (res.status === 429) {
            err.textContent = "تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید.";
            return;
          }
          if (!res.data || !res.data.ok) {
            err.textContent = "ثبت تیکت ناموفق بود. لطفاً دوباره تلاش کنید.";
            return;
          }
          track("support_ticket_created", {});
          var code = res.data.ticketCode || "";
          window.location.replace("/tashakor" + (code ? "?ticket=" + encodeURIComponent(code) : ""));
        })
        .catch(function () {
          err.textContent = "ارتباط برقرار نشد. اتصال اینترنت را بررسی کنید.";
        })
        .finally(function () {
          submit.disabled = false;
          submit.textContent = "ارسال تیکت";
        });
    });
  }

  initTabs();
  initStatusForm();
  initTicketForm();
})();
