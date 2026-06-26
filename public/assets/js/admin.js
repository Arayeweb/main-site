/* =========================================================
   آرایه — admin.js
   پنل مدیریت: ورود، مدیریت پروژه‌ها و تیکت‌ها.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- labels ---------- */
  var SOURCE_LABELS = { multistep_form: "فرم چندمرحله‌ای", hero_form: "فرم هرو", chatbot: "چت‌بات", telegram_bot: "ربات تلگرام", partner_signup_form: "همکار فروش" };
  var BUDGET_LABELS = { lt15: "زیر ۱۵م.ت", "15-40": "۱۵–۴۰م.ت", "40-100": "۴۰–۱۰۰م.ت", gt100: "بالای ۱۰۰م.ت", unsure: "نامشخص" };
  var PLAN_LABELS = { bronze: "برنزی", silver: "نقره‌ای", gold: "طلایی" };
  var PAGE_LABELS = { index: "صفحه اصلی", clinic: "کلینیک", restaurant: "رستوران", doctors: "پزشکان", spaces: "فضاها (Spaces)" };
  var PROJECT_STATUS = {
    intake: "دریافت اطلاعات",
    design: "طراحی",
    development: "توسعه",
    review: "بازبینی",
    delivered: "تحویل‌شده",
    paused: "متوقف",
  };
  var SERVICE = { website: "وب‌سایت", landing: "لندینگ‌پیج", chatbot: "چت‌بات", other: "سایر" };
  var TICKET_STATUS = { open: "باز", in_progress: "در حال بررسی", answered: "پاسخ‌داده‌شده", closed: "بسته" };
  var PRIORITY = { low: "کم", normal: "عادی", high: "زیاد", urgent: "فوری" };
  var CATEGORY = { technical: "فنی", content: "محتوا", billing: "مالی", other: "سایر" };
  var ROLE_LABELS = { admin: "مدیر", sales: "فروش", support: "پشتیبانی" };

  /* ---------- helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function toFa(s) { return String(s).replace(/[0-9]/g, function (d) { return String.fromCharCode(0x06f0 + Number(d)); }); }
  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    try { return toFa(d.toLocaleDateString("fa-IR", { year: "numeric", month: "long", day: "numeric" })); }
    catch (e) { return "—"; }
  }
  function options(map, selected) {
    return Object.keys(map).map(function (k) {
      return '<option value="' + k + '"' + (k === selected ? " selected" : "") + ">" + esc(map[k]) + "</option>";
    }).join("");
  }

  /* ---------- API ---------- */
  function api(method, url, body) {
    var opts = { method: method, credentials: "same-origin", headers: {} };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts).then(function (r) {
      return r.json().then(function (data) { return { status: r.status, data: data }; })
        .catch(function () { return { status: r.status, data: null }; });
    });
  }

  /* ---------- views ---------- */
  var loginView = el("loginView");
  var appView = el("appView");
  var currentRole = null;
  var currentUserId = null;

  function applyRoleVisibility() {
    var tabs = document.querySelectorAll(".admin-tab");
    tabs.forEach(function (t) {
      var required = t.dataset.role;
      if (required && currentRole !== required) {
        t.hidden = true;
      } else {
        t.hidden = false;
      }
    });
  }

  function showApp(role, userId) {
    currentRole = role || currentRole || "admin";
    currentUserId = userId || currentUserId;
    loginView.hidden = true;
    appView.hidden = false;
    el("userInfo").textContent = (ROLE_LABELS[currentRole] || currentRole);
    applyRoleVisibility();
    loadProjects();
    loadTickets("");
    loadPartners(0, "");
  }
  function showLogin() {
    appView.hidden = true;
    loginView.hidden = false;
    currentRole = null;
    currentUserId = null;
    el("userInfo").textContent = "";
  }

  /* ---------- auth ---------- */
  function initLogin() {
    var form = el("loginForm");
    var email = el("loginEmail");
    var pw = el("loginPassword");
    var err = el("loginErr");
    var submit = el("loginSubmit");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      err.textContent = "";
      var emailVal = email.value || "";
      var password = pw.value || "";
      if (!emailVal) { err.textContent = "ایمیل را وارد کنید."; return; }
      if (!password) { err.textContent = "رمز را وارد کنید."; return; }
      submit.disabled = true;
      submit.textContent = "در حال ورود…";
      api("POST", "/api/admin/login", { email: emailVal, password: password }).then(function (res) {
        if (res.data && res.data.ok) {
          email.value = "";
          pw.value = "";
          showApp(res.data.role);
        } else if (res.status === 429) {
          err.textContent = "تلاش زیاد. کمی بعد دوباره امتحان کنید.";
        } else {
          err.textContent = "ایمیل یا رمز نادرست است.";
        }
      }).catch(function () {
        err.textContent = "ارتباط برقرار نشد.";
      }).finally(function () {
        submit.disabled = false;
        submit.textContent = "ورود";
      });
    });

    el("logoutBtn").addEventListener("click", function () {
      api("DELETE", "/api/admin/login").finally(showLogin);
    });
  }

  /* ---------- tabs ---------- */
  var leadsLoaded = false;
  var statsLoaded = false;
  var usersLoaded = false;

  function initTabs() {
    var tabs = document.querySelectorAll(".admin-tab");
    var panels = document.querySelectorAll(".admin-panel");
    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        if (t.hidden) return;
        tabs.forEach(function (x) { x.classList.toggle("is-active", x === t); });
        var name = t.dataset.tab;
        var panelId = "panel" + name.charAt(0).toUpperCase() + name.slice(1);
        panels.forEach(function (p) { p.classList.toggle("is-active", p.id === panelId); });
        // بارگذاری تنبل
        if (name === "leads" && !leadsLoaded) { leadsLoaded = true; loadLeads(0); }
        if (name === "users" && !usersLoaded) { usersLoaded = true; loadUsers(); }
        // این تب‌ها هر بار که باز می‌شوند تازه‌سازی می‌شوند تا با دیتابیس هماهنگ بمانند
        if (name === "stats") { statsLoaded = true; loadStats(); }
        if (name === "partners") { loadPartners(0, partnersSearch); }
      });
    });
  }

  /* ---------- projects ---------- */
  function loadProjects() {
    var list = el("projectsList");
    var newBtn = el("newProjectBtn");
    if (newBtn) newBtn.hidden = currentRole !== "admin";
    list.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/admin/projects").then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) { list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      renderProjects(res.data.projects || []);
    }).catch(function () {
      list.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function renderProjects(projects) {
    var list = el("projectsList");
    if (!projects.length) {
      list.innerHTML = '<div class="admin-empty">هنوز پروژه‌ای ثبت نشده است.</div>';
      return;
    }
    list.innerHTML = projects.map(projectCard).join("");
  }

  function projectCard(p) {
    var pwBadge = p.has_password
      ? '<span class="has-pw">رمز فعال</span>'
      : '<span class="no-pw">بدون رمز</span>';
    var editBtn = currentRole === "admin"
      ? '<div class="admin-edit-actions" style="margin-top:14px"><button type="button" class="btn btn-ghost btn-sm" data-edit>ویرایش</button></div>'
      : '';
    return (
      '<div class="admin-card" data-id="' + esc(p.id) + '">' +
        '<div class="admin-card-head">' +
          '<div>' +
            '<span class="admin-card-code">' + esc(p.title || "بدون عنوان") + '</span>' +
            '<div class="admin-card-sub">' + esc(p.project_code) + ' · ' + esc(p.customer_name || "—") + '</div>' +
          '</div>' +
          '<span class="status-badge st-' + esc(p.status) + '">' + esc(PROJECT_STATUS[p.status] || p.status) + '</span>' +
        '</div>' +
        '<div class="admin-meta">' +
          '<span>پیشرفت: <b>' + toFa(p.progress_percent || 0) + '٪</b></span>' +
          '<span>خدمت: <b>' + esc(SERVICE[p.service_type] || "—") + '</b></span>' +
          '<span>تحویل: <b>' + fmtDate(p.estimated_delivery_at) + '</b></span>' +
          '<span>رمز: <b>' + pwBadge + '</b></span>' +
          '<span>به‌روزرسانی: <b>' + fmtDate(p.updated_at) + '</b></span>' +
        '</div>' +
        (p.last_note ? '<div class="admin-msg">' + esc(p.last_note) + '</div>' : '') +
        editBtn +
        '<div class="admin-edit" data-editbox>' +
          '<div class="admin-grid">' +
            '<div class="field"><label>عنوان</label><input type="text" data-f="title" value="' + esc(p.title || "") + '" /></div>' +
            '<div class="field"><label>نام مشتری</label><input type="text" data-f="customer_name" value="' + esc(p.customer_name || "") + '" /></div>' +
            '<div class="field"><label>راه ارتباطی</label><input type="text" data-f="customer_contact" value="' + esc(p.customer_contact || "") + '" /></div>' +
            '<div class="field"><label>نوع خدمت</label><select data-f="service_type"><option value="">—</option>' + options(SERVICE, p.service_type) + '</select></div>' +
            '<div class="field"><label>وضعیت</label><select data-f="status">' + options(PROJECT_STATUS, p.status) + '</select></div>' +
            '<div class="field"><label>درصد پیشرفت</label><input type="number" data-f="progress_percent" min="0" max="100" value="' + esc(p.progress_percent || 0) + '" /></div>' +
            '<div class="field"><label>تاریخ تخمینی تحویل</label><input type="date" data-f="estimated_delivery_at" value="' + esc((p.estimated_delivery_at || "").slice(0, 10)) + '" /></div>' +
            '<div class="field"><label>رمز جدید (خالی = بدون تغییر)</label><input type="text" data-f="password" placeholder="برای تغییر رمز وارد کنید" /><span class="admin-note">برای حذف رمز، یک فاصله وارد و ذخیره کنید.</span></div>' +
            '<div class="field col-full"><label>یادداشت برای مشتری</label><textarea data-f="last_note">' + esc(p.last_note || "") + '</textarea></div>' +
          '</div>' +
          '<span class="form-err" data-err></span>' +
          '<div class="admin-edit-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" data-save>ذخیره تغییرات</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-cancel>بستن</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function initProjectsPanel() {
    var list = el("projectsList");

    // باز/بسته کردن ویرایش و ذخیره (event delegation)
    list.addEventListener("click", function (e) {
      var card = e.target.closest(".admin-card");
      if (!card) return;
      var box = $("[data-editbox]", card);

      if (e.target.matches("[data-edit]")) { box.classList.add("is-open"); }
      else if (e.target.matches("[data-cancel]")) { box.classList.remove("is-open"); }
      else if (e.target.matches("[data-save]")) { saveProject(card, box, e.target); }
    });

    // فرم ساخت
    var newCard = el("newProjectCard");
    el("newProjectBtn").addEventListener("click", function () { newCard.hidden = false; });
    el("cancelProjectBtn").addEventListener("click", function () {
      newCard.hidden = true;
      el("newProjectErr").textContent = "";
      newCard.querySelectorAll("[data-np]").forEach(function (i) {
        if (i.type === "number") i.value = "0"; else if (i.tagName === "SELECT") i.selectedIndex = 0; else i.value = "";
      });
    });
    el("createProjectBtn").addEventListener("click", createProject);
  }

  function readFields(root, attr) {
    var out = {};
    root.querySelectorAll("[" + attr + "]").forEach(function (i) {
      out[i.getAttribute(attr)] = i.value;
    });
    return out;
  }

  function createProject() {
    var card = el("newProjectCard");
    var err = el("newProjectErr");
    var btn = el("createProjectBtn");
    err.textContent = "";
    var body = readFields(card, "data-np");
    if (!body.title || !body.title.trim()) { err.textContent = "عنوان پروژه را وارد کنید."; return; }
    btn.disabled = true; btn.textContent = "در حال ساخت…";
    api("POST", "/api/admin/projects", body).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) {
        el("cancelProjectBtn").click();
        loadProjects();
      } else if (res.data && res.data.error === "duplicate_code") {
        err.textContent = "این کد پروژه قبلاً استفاده شده است.";
      } else {
        err.textContent = "ثبت پروژه ناموفق بود.";
      }
    }).catch(function () { err.textContent = "ارتباط برقرار نشد."; })
      .finally(function () { btn.disabled = false; btn.textContent = "ساخت پروژه"; });
  }

  function saveProject(card, box, btn) {
    var err = $("[data-err]", box);
    err.textContent = "";
    var body = readFields(box, "data-f");
    body.id = card.dataset.id;
    // اگر فیلد رمز خالی است، اصلاً نفرست تا رمز فعلی پاک نشود.
    if (body.password === "") delete body.password;
    btn.disabled = true; btn.textContent = "در حال ذخیره…";
    api("PATCH", "/api/admin/projects", body).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) { loadProjects(); }
      else { err.textContent = "ذخیره ناموفق بود."; }
    }).catch(function () { err.textContent = "ارتباط برقرار نشد."; })
      .finally(function () { btn.disabled = false; btn.textContent = "ذخیره تغییرات"; });
  }

  /* ---------- tickets ---------- */
  function loadTickets(status) {
    var list = el("ticketsList");
    list.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    var url = "/api/admin/tickets" + (status ? "?status=" + encodeURIComponent(status) : "");
    api("GET", url).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) { list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      renderTickets(res.data.tickets || []);
    }).catch(function () {
      list.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function renderTickets(tickets) {
    var list = el("ticketsList");
    if (!tickets.length) {
      list.innerHTML = '<div class="admin-empty">تیکتی یافت نشد.</div>';
      return;
    }
    list.innerHTML = tickets.map(ticketCard).join("");
  }

  function ticketCard(t) {
    var canManage = currentRole === "admin" || currentRole === "support";
    var actions = canManage
      ? '<div class="admin-row-actions" style="margin-top:14px">' +
          '<label style="font-size:.82rem;color:var(--muted)">تغییر وضعیت:</label>' +
          '<select data-tstatus>' + options(TICKET_STATUS, t.status) + '</select>' +
          '<label style="font-size:.82rem;color:var(--muted)">اولویت:</label>' +
          '<select data-tpriority>' + options(PRIORITY, t.priority) + '</select>' +
          '<span class="form-err" data-err style="min-height:0"></span>' +
        '</div>'
      : '';
    return (
      '<div class="admin-card" data-id="' + esc(t.id) + '">' +
        '<div class="admin-card-head">' +
          '<div>' +
            '<span class="admin-card-code">' + esc(t.subject) + '</span>' +
            '<div class="admin-card-sub">' + esc(t.ticket_code) + ' · ' + esc(t.customer_name || "—") + ' · ' + esc(t.customer_contact) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
            '<span class="pill st-' + esc(t.status) + '">' + esc(TICKET_STATUS[t.status] || t.status) + '</span>' +
            '<span class="pill pr-' + esc(t.priority) + '">' + esc(PRIORITY[t.priority] || t.priority) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="admin-meta">' +
          '<span>دسته: <b>' + esc(CATEGORY[t.category] || t.category || "—") + '</b></span>' +
          '<span>ثبت: <b>' + fmtDate(t.created_at) + '</b></span>' +
        '</div>' +
        '<div class="admin-msg">' + esc(t.message) + '</div>' +
        actions +
      '</div>'
    );
  }

  function initTicketsPanel() {
    var list = el("ticketsList");
    el("ticketFilter").addEventListener("change", function () { loadTickets(this.value); });

    list.addEventListener("change", function (e) {
      var card = e.target.closest(".admin-card");
      if (!card) return;
      var patch = { id: card.dataset.id };
      if (e.target.matches("[data-tstatus]")) patch.status = e.target.value;
      else if (e.target.matches("[data-tpriority]")) patch.priority = e.target.value;
      else return;
      var err = $("[data-err]", card);
      err.textContent = "";
      api("PATCH", "/api/admin/tickets", patch).then(function (res) {
        if (res.status === 401) { showLogin(); return; }
        if (res.data && res.data.ok) {
          var pill = card.querySelector(patch.status ? '.pill[class*="st-"]' : '.pill[class*="pr-"]');
          if (patch.status && pill) { pill.className = "pill st-" + patch.status; pill.textContent = TICKET_STATUS[patch.status]; }
          if (patch.priority && pill) { pill.className = "pill pr-" + patch.priority; pill.textContent = PRIORITY[patch.priority]; }
        } else { err.textContent = "ناموفق"; }
      }).catch(function () { err.textContent = "خطا"; });
    });
  }

  /* ---------- leads ---------- */
  var leadsPage = 0;
  var leadsFilters = {};

  function buildLeadsUrl(page) {
    var params = new URLSearchParams();
    if (leadsFilters.source) params.set("source", leadsFilters.source);
    if (leadsFilters.utm_source) params.set("utm_source", leadsFilters.utm_source);
    if (leadsFilters.page) params.set("page", leadsFilters.page);
    params.set("page_num", String(page));
    return "/api/admin/leads?" + params.toString();
  }

  function loadLeads(page) {
    var list = el("leadsList");
    var moreWrap = el("leadsLoadMore");
    if (page === 0) {
      list.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
      moreWrap.hidden = true;
    }
    api("GET", buildLeadsUrl(page)).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) {
        list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>';
        return;
      }
      var leads = res.data.leads || [];
      if (page === 0) {
        if (!leads.length) { list.innerHTML = '<div class="admin-empty">هیچ لیدی یافت نشد.</div>'; return; }
        list.innerHTML = leads.map(leadCard).join("");
      } else {
        var tmp = document.createElement("div");
        tmp.innerHTML = leads.map(leadCard).join("");
        while (tmp.firstChild) list.appendChild(tmp.firstChild);
      }
      leadsPage = page;
      moreWrap.hidden = !res.data.has_more;
    }).catch(function () {
      list.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function leadCard(l) {
    var srcLabel = esc(SOURCE_LABELS[l.source] || l.source || "—");
    var utmParts = [l.utm_source, l.utm_medium, l.utm_campaign].filter(Boolean);
    var utmHtml = utmParts.length
      ? '<div class="utm-row">UTM: <b>' + utmParts.map(esc).join("</b> / <b>") + "</b></div>"
      : "";
    return (
      '<div class="admin-card">' +
        '<div class="admin-card-head">' +
          '<div>' +
            '<span class="admin-card-code">' + esc(l.name || l.contact) + "</span>" +
            '<div class="admin-card-sub">' + esc(l.contact) + " · " + esc(PAGE_LABELS[l.page] || l.page || "—") + "</div>" +
          "</div>" +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<span class="pill src-' + esc(l.source) + '">' + srcLabel + "</span>" +
            '<span style="color:var(--muted);font-size:.82rem">' + fmtDate(l.created_at) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="admin-meta">' +
          (l.goal ? '<span>هدف: <b>' + esc(l.goal) + "</b></span>" : "") +
          (l.budget ? '<span>بودجه: <b>' + esc(BUDGET_LABELS[l.budget] || l.budget) + "</b></span>" : "") +
          (l.plan ? '<span>پلن: <b>' + esc(PLAN_LABELS[l.plan] || l.plan) + "</b></span>" : "") +
          (l.intent ? '<span>قصد: <b>' + esc(l.intent) + "</b></span>" : "") +
        "</div>" +
        utmHtml +
      "</div>"
    );
  }

  function initLeadsPanel() {
    el("leadFilterBtn").addEventListener("click", function () {
      leadsFilters = {
        source: el("leadSourceFilter").value,
        page: el("leadPageFilter").value,
        utm_source: el("leadUtmFilter").value.trim(),
      };
      leadsLoaded = true;
      loadLeads(0);
    });
    el("leadsMoreBtn").addEventListener("click", function () {
      loadLeads(leadsPage + 1);
    });
    el("leadUtmFilter").addEventListener("keydown", function (e) {
      if (e.key === "Enter") el("leadFilterBtn").click();
    });
  }

  /* ---------- partners ---------- */
  var partnersPage = 0;
  var partnersSearch = "";

  function buildPartnersUrl(page, q) {
    var params = new URLSearchParams();
    params.set("source", "partner_signup_form");
    params.set("page_num", String(page));
    if (q) params.set("q", q);
    return "/api/admin/leads?" + params.toString();
  }

  function loadPartners(page, q) {
    var list = el("partnersList");
    var moreWrap = el("partnersLoadMore");
    if (page === 0) {
      list.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
      moreWrap.hidden = true;
    }
    api("GET", buildPartnersUrl(page, q)).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) {
        list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>';
        return;
      }
      var partners = (res.data.leads || []);
      if (page === 0) {
        if (!partners.length) { list.innerHTML = '<div class="admin-empty">هیچ همکاری ثبت نشده است.</div>'; return; }
        list.innerHTML = partners.map(partnerCard).join("");
      } else {
        var tmp = document.createElement("div");
        tmp.innerHTML = partners.map(partnerCard).join("");
        while (tmp.firstChild) list.appendChild(tmp.firstChild);
      }
      partnersPage = page;
      moreWrap.hidden = !res.data.has_more;
    }).catch(function () {
      list.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function partnerCard(p) {
    var utmParts = [p.utm_source, p.utm_medium, p.utm_campaign].filter(Boolean);
    var utmHtml = utmParts.length
      ? '<div class="utm-row">منبع: <b>' + utmParts.map(esc).join("</b> / <b>") + "</b></div>"
      : "";
    return (
      '<div class="admin-card">' +
        '<div class="admin-card-head">' +
          '<div>' +
            '<div class="partner-name">' + esc(p.name || "بدون نام") + '</div>' +
            '<div class="partner-contact">' + esc(p.contact) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">' +
            '<span class="partner-badge">همکار فروش</span>' +
            '<span style="color:var(--muted);font-size:.82rem">' + fmtDate(p.created_at) + '</span>' +
          '</div>' +
        '</div>' +
        (utmHtml ? utmHtml : '') +
      '</div>'
    );
  }

  function csvDownloadPartners(rows) {
    var headers = ["نام", "شماره تماس", "تاریخ ثبت", "utm_source", "utm_medium", "utm_campaign"];
    var lines = [headers.join(",")];
    rows.forEach(function (p) {
      lines.push([
        '"' + (p.name || "").replace(/"/g, '""') + '"',
        '"' + (p.contact || "") + '"',
        '"' + (p.created_at ? p.created_at.slice(0, 10) : "") + '"',
        '"' + (p.utm_source || "") + '"',
        '"' + (p.utm_medium || "") + '"',
        '"' + (p.utm_campaign || "") + '"',
      ].join(","));
    });
    var blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "partners-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
  }

  function initPartnersPanel() {
    el("partnerFilterBtn").addEventListener("click", function () {
      partnersSearch = el("partnerSearch").value.trim();
      loadPartners(0, partnersSearch);
    });
    el("partnerSearch").addEventListener("keydown", function (e) {
      if (e.key === "Enter") el("partnerFilterBtn").click();
    });
    el("partnersMoreBtn").addEventListener("click", function () {
      loadPartners(partnersPage + 1, partnersSearch);
    });
    el("partnerExportBtn").addEventListener("click", function () {
      // دانلود تمام همکاران (تا صفحه ۱۰)
      var btn = el("partnerExportBtn");
      btn.textContent = "در حال دریافت…";
      btn.disabled = true;
      var allRows = [];
      function fetchPage(p) {
        api("GET", buildPartnersUrl(p, "")).then(function (res) {
          if (!res.data || !res.data.ok) { btn.textContent = "دانلود CSV"; btn.disabled = false; return; }
          allRows = allRows.concat(res.data.leads || []);
          if (res.data.has_more && p < 9) { fetchPage(p + 1); }
          else { csvDownloadPartners(allRows); btn.textContent = "دانلود CSV"; btn.disabled = false; }
        }).catch(function () { btn.textContent = "دانلود CSV"; btn.disabled = false; });
      }
      fetchPage(0);
    });
  }

  /* ---------- users ---------- */
  function loadUsers() {
    var list = el("usersList");
    list.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/admin/users").then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) { list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      renderUsers(res.data.users || []);
    }).catch(function () {
      list.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function renderUsers(users) {
    var list = el("usersList");
    if (!users.length) {
      list.innerHTML = '<div class="admin-empty">هیچ کاربری ثبت نشده است.</div>';
      return;
    }
    list.innerHTML = users.map(userCard).join("");
  }

  function userCard(u) {
    var activeBadge = u.is_active
      ? '<span class="pill st-answered">فعال</span>'
      : '<span class="pill st-closed">غیرفعال</span>';
    return (
      '<div class="admin-card" data-id="' + esc(u.id) + '">' +
        '<div class="admin-card-head">' +
          '<div>' +
            '<span class="admin-card-code">' + esc(u.email) + '</span>' +
            '<div class="admin-card-sub">' + esc(u.name || "—") + ' · ' + esc(ROLE_LABELS[u.role] || u.role) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap">' + activeBadge + '</div>' +
        '</div>' +
        '<div class="admin-meta">' +
          '<span>آخرین ورود: <b>' + fmtDate(u.last_login_at) + '</b></span>' +
          '<span>ثبت: <b>' + fmtDate(u.created_at) + '</b></span>' +
        '</div>' +
        '<div class="admin-edit-actions" style="margin-top:14px">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit>ویرایش</button>' +
        '</div>' +
        '<div class="admin-edit" data-editbox>' +
          '<div class="admin-grid">' +
            '<div class="field"><label>نام</label><input type="text" data-f="name" value="' + esc(u.name || "") + '" /></div>' +
            '<div class="field"><label>نقش</label><select data-f="role">' + options(ROLE_LABELS, u.role) + '</select></div>' +
            '<div class="field"><label>وضعیت</label><select data-f="is_active"><option value="true"' + (u.is_active ? " selected" : "") + '>فعال</option><option value="false"' + (u.is_active ? "" : " selected") + '>غیرفعال</option></select></div>' +
            '<div class="field"><label>رمز جدید (خالی = بدون تغییر)</label><input type="text" data-f="password" placeholder="برای تغییر رمز وارد کنید" /></div>' +
          '</div>' +
          '<span class="form-err" data-err></span>' +
          '<div class="admin-edit-actions">' +
            '<button type="button" class="btn btn-primary btn-sm" data-save>ذخیره</button>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-cancel>بستن</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function initUsersPanel() {
    var list = el("usersList");

    list.addEventListener("click", function (e) {
      var card = e.target.closest(".admin-card");
      if (!card) return;
      var box = $("[data-editbox]", card);

      if (e.target.matches("[data-edit]")) { box.classList.add("is-open"); }
      else if (e.target.matches("[data-cancel]")) { box.classList.remove("is-open"); }
      else if (e.target.matches("[data-save]")) { saveUser(card, box, e.target); }
    });

    var newCard = el("newUserCard");
    el("newUserBtn").addEventListener("click", function () { newCard.hidden = false; });
    el("cancelUserBtn").addEventListener("click", function () {
      newCard.hidden = true;
      el("newUserErr").textContent = "";
      newCard.querySelectorAll("[data-nu]").forEach(function (i) {
        if (i.tagName === "SELECT") i.selectedIndex = 0; else i.value = "";
      });
    });
    el("createUserBtn").addEventListener("click", createUser);
  }

  function createUser() {
    var card = el("newUserCard");
    var err = el("newUserErr");
    var btn = el("createUserBtn");
    err.textContent = "";
    var body = readFields(card, "data-nu");
    if (!body.email || !body.email.trim()) { err.textContent = "ایمیل را وارد کنید."; return; }
    if (!body.password || !body.password.trim()) { err.textContent = "رمز را وارد کنید."; return; }
    if (!ROLE_LABELS[body.role]) { err.textContent = "نقش نامعتبر است."; return; }
    btn.disabled = true; btn.textContent = "در حال ساخت…";
    api("POST", "/api/admin/users", body).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) {
        el("cancelUserBtn").click();
        loadUsers();
      } else if (res.data && res.data.error === "duplicate_email") {
        err.textContent = "این ایمیل قبلاً ثبت شده است.";
      } else {
        err.textContent = "ثبت کاربر ناموفق بود.";
      }
    }).catch(function () { err.textContent = "ارتباط برقرار نشد."; })
      .finally(function () { btn.disabled = false; btn.textContent = "ساخت کاربر"; });
  }

  function saveUser(card, box, btn) {
    var err = $("[data-err]", box);
    err.textContent = "";
    var body = readFields(box, "data-f");
    body.id = card.dataset.id;
    if (body.is_active) body.is_active = body.is_active === "true";
    if (body.password === "") delete body.password;
    btn.disabled = true; btn.textContent = "در حال ذخیره…";
    api("PATCH", "/api/admin/users", body).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) { loadUsers(); }
      else { err.textContent = "ذخیره ناموفق بود."; }
    }).catch(function () { err.textContent = "ارتباط برقرار نشد."; })
      .finally(function () { btn.disabled = false; btn.textContent = "ذخیره"; });
  }

  /* ---------- stats ---------- */
  function loadStats() {
    var content = el("statsContent");
    content.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/admin/stats").then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) {
        content.innerHTML = '<div class="admin-empty">خطا در بارگذاری آمار.</div>';
        return;
      }
      renderStats(res.data);
    }).catch(function () {
      content.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function statsTable(rows, emptyMsg) {
    if (!rows || !rows.length) return '<p style="color:var(--muted);font-size:.88rem">' + esc(emptyMsg) + "</p>";
    var maxCount = rows[0] ? rows[0].count : 1;
    return (
      '<table class="stats-table">' +
      rows.map(function (r) {
        var barW = Math.round((r.count / maxCount) * 80);
        return (
          "<tr><td>" +
          '<span class="stats-bar" style="width:' + barW + 'px"></span>' +
          esc(r.key) + "</td><td>" + toFa(r.count) + "</td></tr>"
        );
      }).join("") +
      "</table>"
    );
  }

  function renderStats(s) {
    var content = el("statsContent");
    var last7Html = s.last_7_days && s.last_7_days.length
      ? '<table class="stats-table">' +
          '<thead><tr><th style="text-align:right;font-size:.8rem;color:var(--muted);padding:4px 8px">تاریخ</th><th style="font-size:.8rem;color:var(--muted);padding:4px 8px">بازدید UTM</th><th style="font-size:.8rem;color:var(--muted);padding:4px 8px">لید</th></tr></thead>' +
          s.last_7_days.map(function (d) {
            return "<tr><td>" + esc(d.date) + "</td><td>" + toFa(d.views || 0) + "</td><td>" + toFa(d.leads || 0) + "</td></tr>";
          }).join("") +
        "</table>"
      : "<p style=\"color:var(--muted);font-size:.88rem\">داده‌ای موجود نیست.</p>";

    content.innerHTML =
      '<div class="stats-summary">' +
        '<div class="stat-card"><div class="stat-num">' + toFa(s.total_views || 0) + '</div><div class="stat-label">بازدید UTM‌دار</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + toFa(s.views_this_week || 0) + '</div><div class="stat-label">بازدید این هفته</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + toFa(s.total_leads || 0) + '</div><div class="stat-label">کل لیدها</div></div>' +
        '<div class="stat-card"><div class="stat-num">' + toFa(s.this_week || 0) + '</div><div class="stat-label">لید این هفته</div></div>' +
      "</div>" +
      '<div class="stats-grid">' +
        '<div class="stats-block"><h3>منبع UTM (بازدید)</h3>' + statsTable(s.by_utm_source, "هنوز بازدیدی با UTM ثبت نشده.") + "</div>" +
        '<div class="stats-block"><h3>کمپین UTM (بازدید)</h3>' + statsTable(s.by_utm_campaign, "هیچ کمپینی یافت نشد.") + "</div>" +
        '<div class="stats-block"><h3>منبع لید</h3>' + statsTable((s.by_source || []).map(function (r) { return { key: SOURCE_LABELS[r.key] || r.key, count: r.count }; }), "داده‌ای موجود نیست.") + "</div>" +
        '<div class="stats-block"><h3>صفحه (بازدید)</h3>' + statsTable(s.by_page, "داده‌ای موجود نیست.") + "</div>" +
        '<div class="stats-block" style="grid-column:1/-1"><h3>۷ روز اخیر</h3>' + last7Html + "</div>" +
      "</div>";
  }

  function initStatsPanel() {
    el("statsRefreshBtn").addEventListener("click", function () {
      statsLoaded = true;
      loadStats();
    });
  }

  /* ---------- boot ---------- */
  initLogin();
  initTabs();
  initProjectsPanel();
  initTicketsPanel();
  initLeadsPanel();
  initPartnersPanel();
  initUsersPanel();
  initStatsPanel();

  // اگر نشست معتبر بود مستقیم وارد پنل شو.
  api("GET", "/api/admin/login").then(function (res) {
    if (res.data && res.data.authed && res.data.role) {
      showApp(res.data.role, res.data.userId);
    } else {
      showLogin();
    }
  }).catch(showLogin);
})();
