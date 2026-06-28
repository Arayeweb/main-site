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
  var PAGE_LABELS = { index: "صفحه اصلی", clinic: "کلینیک", restaurant: "رستوران", doctors: "پزشکان", spaces: "فضاها (Spaces)", googlesabt: "ثبت در گوگل" };
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
    var salesLink = el("salesLink");
    if (salesLink) salesLink.hidden = !(currentRole === "sales" || currentRole === "admin");
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
  var linksLoaded = false;
  var statsLoaded = false;
  var usersLoaded = false;
  var invLoaded = false;

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
        if (name === "links" && !linksLoaded) { linksLoaded = true; loadLinks(); }
        if (name === "users" && !usersLoaded) { usersLoaded = true; loadUsers(); }
        // این تب‌ها هر بار که باز می‌شوند تازه‌سازی می‌شوند تا با دیتابیس هماهنگ بمانند
        if (name === "stats") { statsLoaded = true; loadStats(); }
        if (name === "partners") { loadPartners(0, partnersSearch); }
        if (name === "links") { loadLinks(); }
        if (name === "invoices" && !invLoaded) { invLoaded = true; loadInvoices(true); }
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

  /* ---------- short links ---------- */
  function loadLinks() {
    var list = el("linksList");
    list.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/admin/links").then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (!res.data || !res.data.ok) { list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      renderLinks(res.data.links || []);
    }).catch(function () {
      list.innerHTML = '<div class="admin-empty">ارتباط برقرار نشد.</div>';
    });
  }

  function renderLinks(links) {
    var list = el("linksList");
    if (!links.length) {
      list.innerHTML = '<div class="admin-empty">هنوز لینک کوتاهی ثبت نشده است.</div>';
      return;
    }
    list.innerHTML = links.map(linkCard).join("");
  }

  function linkCard(l) {
    var shortUrl = location.origin + "/s/" + esc(l.slug);
    var active = l.is_active;
    var activeBadge = active
      ? '<span class="pill st-answered">فعال</span>'
      : '<span class="pill st-closed">غیرفعال</span>';
    return (
      '<div class="admin-card" data-id="' + esc(l.id) + '">' +
        '<div class="admin-card-head">' +
          '<div>' +
            '<span class="admin-card-code">' + esc(l.title || "بدون عنوان") + '</span>' +
            '<div class="admin-card-sub">' + esc(l.slug) + ' · ' + fmtDate(l.created_at) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-wrap:wrap">' + activeBadge + '</div>' +
        '</div>' +
        '<div class="link-short">' +
          '<a href="/s/' + esc(l.slug) + '" target="_blank" rel="noopener" dir="ltr">' + shortUrl + '</a>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-copy="' + shortUrl + '">کپی</button>' +
        '</div>' +
        '<div class="link-target" dir="ltr" title="' + esc(l.target_url) + '">' + esc(l.target_url) + '</div>' +
        '<div class="admin-meta" style="margin-top:10px">' +
          '<span>کلیک: <b>' + toFa(l.clicks || 0) + '</b></span>' +
          '<span>مقصد: <b>' + esc(l.target_url.replace(/^https?:\/\//, "").split("/")[0]) + '</b></span>' +
        '</div>' +
        '<div class="admin-edit-actions" style="margin-top:14px">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit>ویرایش</button>' +
          '<button type="button" class="btn btn-danger btn-sm" data-delete>حذف</button>' +
        '</div>' +
        '<div class="admin-edit" data-editbox>' +
          '<div class="admin-grid">' +
            '<div class="field col-full"><label>لینک مقصد (کامل)</label><input type="text" data-f="target_url" value="' + esc(l.target_url) + '" dir="ltr" /></div>' +
            '<div class="field"><label>عنوان / یادداشت</label><input type="text" data-f="title" value="' + esc(l.title || "") + '" /></div>' +
            '<div class="field"><label>وضعیت</label><select data-f="is_active"><option value="true"' + (active ? " selected" : "") + '>فعال</option><option value="false"' + (active ? "" : " selected") + '>غیرفعال</option></select></div>' +
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

  function initLinksPanel() {
    var list = el("linksList");

    list.addEventListener("click", function (e) {
      var card = e.target.closest(".admin-card");
      if (!card) return;
      var box = $("[data-editbox]", card);
      if (e.target.matches("[data-edit]")) { box.classList.add("is-open"); }
      else if (e.target.matches("[data-cancel]")) { box.classList.remove("is-open"); }
      else if (e.target.matches("[data-save]")) { saveLink(card, box, e.target); }
      else if (e.target.matches("[data-delete]")) { deleteLink(card); }
      else if (e.target.matches("[data-copy]")) {
        var text = e.target.getAttribute("data-copy");
        navigator.clipboard.writeText(text).then(function () {
          var old = e.target.textContent;
          e.target.textContent = "کپی شد";
          setTimeout(function () { e.target.textContent = old; }, 1200);
        }).catch(function () {});
      }
    });

    var newCard = el("newLinkCard");
    el("newLinkBtn").addEventListener("click", function () { newCard.hidden = false; });
    el("cancelLinkBtn").addEventListener("click", function () {
      newCard.hidden = true;
      el("newLinkErr").textContent = "";
      newCard.querySelectorAll("[data-nl]").forEach(function (i) { i.value = ""; });
    });
    el("createLinkBtn").addEventListener("click", createLink);
  }

  function createLink() {
    var card = el("newLinkCard");
    var err = el("newLinkErr");
    var btn = el("createLinkBtn");
    err.textContent = "";
    var body = readFields(card, "data-nl");
    if (!body.target_url || !body.target_url.trim()) { err.textContent = "لینک مقصد را وارد کنید."; return; }
    btn.disabled = true; btn.textContent = "در حال ساخت…";
    api("POST", "/api/admin/links", body).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) {
        el("cancelLinkBtn").click();
        loadLinks();
      } else if (res.data && res.data.error === "duplicate_slug") {
        err.textContent = "این کد کوتاه قبلاً استفاده شده است.";
      } else if (res.data && res.data.error === "invalid_target") {
        err.textContent = "لینک مقصد باید با http:// یا https:// شروع شود.";
      } else {
        err.textContent = "ساخت لینک ناموفق بود.";
      }
    }).catch(function () { err.textContent = "ارتباط برقرار نشد."; })
      .finally(function () { btn.disabled = false; btn.textContent = "ساخت لینک"; });
  }

  function saveLink(card, box, btn) {
    var err = $("[data-err]", box);
    err.textContent = "";
    var body = readFields(box, "data-f");
    body.id = card.dataset.id;
    if ("is_active" in body) body.is_active = body.is_active === "true";
    btn.disabled = true; btn.textContent = "در حال ذخیره…";
    api("PATCH", "/api/admin/links", body).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) { loadLinks(); }
      else if (res.data && res.data.error === "invalid_target") { err.textContent = "لینک مقصد نامعتبر است."; }
      else { err.textContent = "ذخیره ناموفق بود."; }
    }).catch(function () { err.textContent = "ارتباط برقرار نشد."; })
      .finally(function () { btn.disabled = false; btn.textContent = "ذخیره"; });
  }

  function deleteLink(card) {
    if (!confirm("این لینک کوتاه حذف شود؟")) return;
    api("DELETE", "/api/admin/links?id=" + encodeURIComponent(card.dataset.id)).then(function (res) {
      if (res.status === 401) { showLogin(); return; }
      if (res.data && res.data.ok) { loadLinks(); }
      else { alert("حذف ناموفق بود."); }
    }).catch(function () { alert("ارتباط برقرار نشد."); });
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

  /* =========================================================
     فاکتور و پیش‌فاکتور
     ========================================================= */
  var INV_KIND_LABELS = { invoice: "فاکتور", proforma: "پیش‌فاکتور" };
  var INV_STATUS_LABELS = { draft: "پیش‌نویس", sent: "ارسال‌شده", paid: "پرداخت‌شده", cancelled: "لغو‌شده" };
  var invPage = 0;
  var invItems = []; // آرایه‌ی ردیف‌های فعلی builder

  /* --- helpers --- */
  function fmtMoney(n, currency) {
    var num = Number(n) || 0;
    var formatted;
    try {
      formatted = num.toLocaleString("fa-IR");
    } catch (e) {
      formatted = toFa(String(num));
    }
    return formatted + (currency === "USD" ? " $" : " تومان");
  }

  function invCalcTotals() {
    var subtotal = 0, discTotal = 0, taxTotal = 0;
    invItems.forEach(function (it) {
      var base = (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
      var disc = Math.round(base * ((Number(it.discount) || 0) / 100));
      var afterDisc = base - disc;
      var tax = Math.round(afterDisc * ((Number(it.tax) || 0) / 100));
      subtotal += base;
      discTotal += disc;
      taxTotal += tax;
    });
    var grand = subtotal - discTotal + taxTotal;
    var cur = (el("invCurrency") || {}).value || "IRR";
    el("totSubtotal").textContent = fmtMoney(subtotal, cur);
    el("totDiscount").textContent = fmtMoney(discTotal, cur);
    el("totTax").textContent = fmtMoney(taxTotal, cur);
    el("totGrand").textContent = fmtMoney(grand, cur);
    return { subtotal: subtotal, discount_total: discTotal, tax_total: taxTotal, grand_total: grand };
  }

  function invAddRow(data) {
    var idx = invItems.length;
    var it = data || { title: "", qty: 1, unit_price: 0, discount: 0, tax: 9 };
    invItems.push(it);
    var tr = document.createElement("tr");
    tr.dataset.idx = idx;
    tr.innerHTML =
      '<td class="col-title"><input type="text" placeholder="شرح خدمت…" value="' + esc(it.title) + '" data-f="title" /></td>' +
      '<td class="col-num"><input type="number" min="1" value="' + esc(it.qty) + '" data-f="qty" /></td>' +
      '<td class="col-num"><input type="number" min="0" value="' + esc(it.unit_price) + '" data-f="unit_price" /></td>' +
      '<td class="col-num"><input type="number" min="0" max="100" value="' + esc(it.discount) + '" data-f="discount" /></td>' +
      '<td class="col-num"><input type="number" min="0" max="100" value="' + esc(it.tax) + '" data-f="tax" /></td>' +
      '<td class="col-del"><button type="button" class="inv-del-row" title="حذف ردیف">✕</button></td>';
    tr.querySelectorAll("input").forEach(function (inp) {
      inp.addEventListener("input", function () {
        invItems[idx][inp.dataset.f] = inp.type === "number" ? (Number(inp.value) || 0) : inp.value;
        invCalcTotals();
      });
    });
    tr.querySelector(".inv-del-row").addEventListener("click", function () {
      invItems.splice(idx, 1);
      tr.remove();
      // re-index
      var rows = el("invItemsBody").querySelectorAll("tr");
      rows.forEach(function (r, i) { r.dataset.idx = i; });
      invCalcTotals();
    });
    el("invItemsBody").appendChild(tr);
    invCalcTotals();
  }

  function invResetBuilder() {
    el("invEditId").value = "";
    el("invBuilderTitle").textContent = "فاکتور جدید";
    el("invKind").value = "invoice";
    el("invStatus").value = "draft";
    el("invNumber").value = "";
    el("invCurrency").value = "IRR";
    el("invIssueDate").value = new Date().toISOString().split("T")[0];
    el("invDueDate").value = "";
    el("invCustName").value = "";
    el("invCustContact").value = "";
    el("invCustAddr").value = "";
    el("invNote").value = "";
    el("invTerms").value = "";
    el("invErr").textContent = "";
    invItems = [];
    el("invItemsBody").innerHTML = "";
    invAddRow();
    invCalcTotals();
  }

  function invFillBuilder(inv) {
    el("invEditId").value = inv.id;
    el("invBuilderTitle").textContent = (INV_KIND_LABELS[inv.kind] || "سند") + " — " + esc(inv.invoice_number);
    el("invKind").value = inv.kind || "invoice";
    el("invStatus").value = inv.status || "draft";
    el("invNumber").value = inv.invoice_number || "";
    el("invCurrency").value = inv.currency || "IRR";
    el("invIssueDate").value = inv.issue_date ? inv.issue_date.split("T")[0] : "";
    el("invDueDate").value = inv.due_date ? inv.due_date.split("T")[0] : "";
    el("invCustName").value = inv.customer_name || "";
    el("invCustContact").value = inv.customer_contact || "";
    el("invCustAddr").value = inv.customer_address || "";
    el("invNote").value = inv.note || "";
    el("invTerms").value = inv.terms || "";
    el("invErr").textContent = "";
    invItems = [];
    el("invItemsBody").innerHTML = "";
    var rows = Array.isArray(inv.items) ? inv.items : [];
    if (rows.length === 0) { invAddRow(); } else {
      rows.forEach(function (r) { invAddRow(r); });
    }
    invCalcTotals();
  }

  function invCollectPayload() {
    return {
      kind: el("invKind").value,
      status: el("invStatus").value,
      invoice_number: el("invNumber").value.trim() || null,
      currency: el("invCurrency").value,
      issue_date: el("invIssueDate").value || null,
      due_date: el("invDueDate").value || null,
      customer_name: el("invCustName").value.trim(),
      customer_contact: el("invCustContact").value.trim() || null,
      customer_address: el("invCustAddr").value.trim() || null,
      items: invItems,
      note: el("invNote").value.trim() || null,
      terms: el("invTerms").value.trim() || null,
    };
  }

  /* --- PDF print --- */
  function invPrint(inv) {
    var cur = inv.currency || "IRR";
    var items = Array.isArray(inv.items) ? inv.items : [];
    var itemsHtml = items.map(function (it, i) {
      var base = (Number(it.qty) || 0) * (Number(it.unit_price) || 0);
      var disc = Math.round(base * ((Number(it.discount) || 0) / 100));
      var afterDisc = base - disc;
      var tax = Math.round(afterDisc * ((Number(it.tax) || 0) / 100));
      var total = afterDisc + tax;
      return "<tr>" +
        "<td>" + toFa(String(i + 1)) + "</td>" +
        "<td>" + esc(it.title) + "</td>" +
        "<td>" + toFa(String(Number(it.qty) || 1)) + "</td>" +
        "<td>" + fmtMoney(it.unit_price, cur) + "</td>" +
        "<td>" + (Number(it.discount) ? toFa(String(it.discount)) + "٪" : "—") + "</td>" +
        "<td>" + (Number(it.tax) ? toFa(String(it.tax)) + "٪" : "—") + "</td>" +
        "<td>" + fmtMoney(total, cur) + "</td>" +
        "</tr>";
    }).join("");

    var kindLabel = INV_KIND_LABELS[inv.kind] || "سند";
    var statusLabel = INV_STATUS_LABELS[inv.status] || inv.status;

    var html = "<!DOCTYPE html><html lang='fa' dir='rtl'><head><meta charset='UTF-8'/>" +
      "<title>" + esc(kindLabel) + " " + esc(inv.invoice_number) + "</title>" +
      "<style>" +
      "@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-Regular.woff2') format('woff2');font-weight:400}" +
      "@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-Bold.woff2') format('woff2');font-weight:700}" +
      "@font-face{font-family:'Vazirmatn';src:url('/assets/fonts/Vazirmatn-ExtraBold.woff2') format('woff2');font-weight:800}" +
      "*{box-sizing:border-box;margin:0;padding:0}" +
      "body{font-family:'Vazirmatn',Tahoma,sans-serif;font-size:13px;color:#1a1a1a;background:#fff;padding:32px 36px;direction:rtl}" +
      ".inv-header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2.5px solid #2E7D6B;padding-bottom:18px;margin-bottom:24px}" +
      ".inv-brand{font-size:22px;font-weight:800;color:#2E7D6B;letter-spacing:.02em}" +
      ".inv-brand small{display:block;font-size:12px;font-weight:400;color:#666;margin-top:4px}" +
      ".inv-meta{text-align:left}" +
      ".inv-meta h1{font-size:18px;font-weight:800;color:#0E1A2B;margin-bottom:8px}" +
      ".inv-meta-row{font-size:12px;color:#555;margin-bottom:4px}" +
      ".inv-meta-row b{color:#1a1a1a}" +
      ".inv-parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;padding:16px 18px;background:#f6f8fa;border-radius:8px}" +
      ".inv-party-label{font-size:10px;font-weight:800;color:#2E7D6B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}" +
      ".inv-party-name{font-size:15px;font-weight:700;margin-bottom:4px}" +
      ".inv-party-sub{font-size:12px;color:#666}" +
      "table{width:100%;border-collapse:collapse;margin-bottom:20px;font-size:12.5px}" +
      "thead tr{background:#0E1A2B;color:#fff}" +
      "thead th{padding:9px 10px;text-align:right;font-weight:700;white-space:nowrap}" +
      "tbody tr:nth-child(even){background:#f6f8fa}" +
      "tbody td{padding:8px 10px;border-bottom:1px solid #e2e8ee}" +
      ".totals-section{display:flex;flex-direction:column;align-items:flex-end;gap:5px;margin-bottom:24px}" +
      ".totals-row{display:flex;gap:32px;font-size:13px}" +
      ".totals-row span:first-child{color:#666;min-width:110px;text-align:right}" +
      ".totals-row span:last-child{font-weight:700;min-width:120px;text-align:left;font-variant-numeric:tabular-nums}" +
      ".totals-grand{font-size:15px;font-weight:800;color:#2E7D6B;border-top:2px solid #2E7D6B;padding-top:8px;margin-top:4px}" +
      ".inv-footer{border-top:1px solid #e2e8ee;padding-top:16px;display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:8px}" +
      ".inv-footer-label{font-size:10px;font-weight:800;color:#2E7D6B;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}" +
      ".inv-footer-val{font-size:12px;color:#444;line-height:1.7;white-space:pre-wrap}" +
      ".inv-sig{border:1px dashed #ccc;border-radius:6px;height:60px;margin-top:10px;display:flex;align-items:center;justify-content:center;color:#bbb;font-size:11px}" +
      ".status-badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:11px;font-weight:700;background:#e8f5f2;color:#2E7D6B;margin-right:8px}" +
      "@media print{body{padding:20px 24px}}" +
      "</style></head><body>" +
      "<div class='inv-header'>" +
        "<div class='inv-brand'>آرایه وب<small>Araaye.com</small></div>" +
        "<div class='inv-meta'>" +
          "<h1>" + esc(kindLabel) + " <span class='status-badge'>" + esc(statusLabel) + "</span></h1>" +
          "<div class='inv-meta-row'><b>شماره سند:</b> " + esc(inv.invoice_number) + "</div>" +
          "<div class='inv-meta-row'><b>تاریخ صدور:</b> " + fmtDate(inv.issue_date) + "</div>" +
          (inv.due_date ? "<div class='inv-meta-row'><b>تاریخ سررسید:</b> " + fmtDate(inv.due_date) + "</div>" : "") +
        "</div>" +
      "</div>" +
      "<div class='inv-parties'>" +
        "<div><div class='inv-party-label'>صادرکننده</div><div class='inv-party-name'>آرایه وب</div><div class='inv-party-sub'>araaye.com</div></div>" +
        "<div><div class='inv-party-label'>مشتری</div><div class='inv-party-name'>" + esc(inv.customer_name) + "</div>" +
          (inv.customer_contact ? "<div class='inv-party-sub'>" + esc(inv.customer_contact) + "</div>" : "") +
          (inv.customer_address ? "<div class='inv-party-sub'>" + esc(inv.customer_address) + "</div>" : "") +
        "</div>" +
      "</div>" +
      "<table><thead><tr>" +
        "<th>#</th><th>شرح خدمت / کالا</th><th>تعداد</th><th>قیمت واحد</th><th>تخفیف</th><th>مالیات</th><th>جمع ردیف</th>" +
      "</tr></thead><tbody>" + itemsHtml + "</tbody></table>" +
      "<div class='totals-section'>" +
        "<div class='totals-row'><span>جمع کل:</span><span>" + fmtMoney(inv.subtotal, cur) + "</span></div>" +
        "<div class='totals-row'><span>تخفیف:</span><span>" + fmtMoney(inv.discount_total, cur) + "</span></div>" +
        "<div class='totals-row'><span>مالیات:</span><span>" + fmtMoney(inv.tax_total, cur) + "</span></div>" +
        "<div class='totals-row totals-grand'><span>مبلغ قابل پرداخت:</span><span>" + fmtMoney(inv.grand_total, cur) + "</span></div>" +
      "</div>" +
      "<div class='inv-footer'>" +
        "<div><div class='inv-footer-label'>توضیحات</div><div class='inv-footer-val'>" + esc(inv.note || "—") + "</div></div>" +
        "<div><div class='inv-footer-label'>شرایط و مقررات</div><div class='inv-footer-val'>" + esc(inv.terms || "—") + "</div>" +
          "<div class='inv-sig'>امضا و مهر</div></div>" +
      "</div>" +
      "</body></html>";

    var frame = el("invPrintFrame");
    frame.innerHTML = html;
    window.print();
    setTimeout(function () { frame.innerHTML = ""; }, 2000);
  }

  /* --- render list --- */
  function invRenderCard(inv) {
    var cur = inv.currency || "IRR";
    return '<div class="admin-card" id="inv-' + esc(inv.id) + '">' +
      '<div class="admin-card-head">' +
        '<div>' +
          '<div class="admin-card-code">' +
            '<span class="pill inv-kind-' + esc(inv.kind) + '" style="margin-left:6px">' + esc(INV_KIND_LABELS[inv.kind] || inv.kind) + '</span>' +
            esc(inv.invoice_number) +
          '</div>' +
          '<div class="admin-card-sub">' + esc(inv.customer_name) + (inv.customer_contact ? ' — ' + esc(inv.customer_contact) : '') + '</div>' +
        '</div>' +
        '<div class="admin-row-actions">' +
          '<span class="pill inv-st-' + esc(inv.status) + '">' + esc(INV_STATUS_LABELS[inv.status] || inv.status) + '</span>' +
          '<button type="button" class="btn btn-ghost btn-sm inv-print-btn" data-id="' + esc(inv.id) + '">🖨 چاپ / PDF</button>' +
          '<button type="button" class="btn btn-ghost btn-sm inv-edit-btn" data-id="' + esc(inv.id) + '">ویرایش</button>' +
          '<button type="button" class="btn btn-danger btn-sm inv-del-btn" data-id="' + esc(inv.id) + '">حذف</button>' +
        '</div>' +
      '</div>' +
      '<div class="admin-meta">' +
        '<span><b>تاریخ صدور:</b> ' + fmtDate(inv.issue_date) + '</span>' +
        (inv.due_date ? '<span><b>سررسید:</b> ' + fmtDate(inv.due_date) + '</span>' : '') +
        '<span><b>مبلغ:</b> ' + fmtMoney(inv.grand_total, cur) + '</span>' +
        (inv.paid_at ? '<span><b>پرداخت:</b> ' + fmtDate(inv.paid_at) + '</span>' : '') +
      '</div>' +
    '</div>';
  }

  var invCache = {};

  function invLoadFull(id, cb) {
    if (invCache[id]) { cb(invCache[id]); return; }
    api("GET", "/api/admin/invoices?id=" + encodeURIComponent(id) + "&full=1").then(function (res) {
      if (res.ok && res.data && res.data.invoice) {
        invCache[id] = res.data.invoice;
        cb(res.data.invoice);
      }
    });
  }

  function invBindCard(card) {
    var printBtn = card.querySelector(".inv-print-btn");
    var editBtn = card.querySelector(".inv-edit-btn");
    var delBtn = card.querySelector(".inv-del-btn");
    if (printBtn) printBtn.addEventListener("click", function () {
      var id = printBtn.dataset.id;
      invLoadFull(id, function (inv) { invPrint(inv); });
    });
    if (editBtn) editBtn.addEventListener("click", function () {
      var id = editBtn.dataset.id;
      invLoadFull(id, function (inv) {
        invFillBuilder(inv);
        el("invBuilderWrap").hidden = false;
        el("invBuilderWrap").scrollIntoView({ behavior: "smooth" });
      });
    });
    if (delBtn) delBtn.addEventListener("click", function () {
      if (!confirm("فاکتور " + (card.querySelector(".admin-card-code") || {}).textContent + " حذف شود؟")) return;
      var id = delBtn.dataset.id;
      api("DELETE", "/api/admin/invoices?id=" + encodeURIComponent(id)).then(function (res) {
        if (res.ok) {
          var c = el("inv-" + id);
          if (c) c.remove();
          delete invCache[id];
        } else { alert("خطا در حذف فاکتور"); }
      });
    });
  }

  function loadInvoices(reset) {
    if (reset) { invPage = 0; el("invList").innerHTML = ""; }
    var kind = el("invKindFilter").value;
    var status = el("invStatusFilter").value;
    var url = "/api/admin/invoices?page=" + invPage + (kind ? "&kind=" + encodeURIComponent(kind) : "") + (status ? "&status=" + encodeURIComponent(status) : "");
    api("GET", url).then(function (res) {
      if (!res.ok || !res.data) return;
      var list = res.data.invoices || [];
      if (list.length === 0 && invPage === 0) {
        el("invList").innerHTML = '<div class="admin-empty">هیچ فاکتوری یافت نشد.</div>';
      } else {
        list.forEach(function (inv) {
          invCache[inv.id] = inv;
          var div = document.createElement("div");
          div.innerHTML = invRenderCard(inv);
          var card = div.firstElementChild;
          invBindCard(card);
          el("invList").appendChild(card);
        });
      }
      el("invLoadMore").hidden = list.length < 30;
    });
  }

  function initInvoicesPanel() {
    el("newInvBtn").addEventListener("click", function () {
      invResetBuilder();
      el("invBuilderWrap").hidden = false;
      el("invBuilderWrap").scrollIntoView({ behavior: "smooth" });
    });
    el("invCancelBtn").addEventListener("click", function () {
      el("invBuilderWrap").hidden = true;
      invItems = [];
    });
    el("invAddRowBtn").addEventListener("click", function () { invAddRow(); });
    el("invCurrency").addEventListener("change", function () { invCalcTotals(); });

    el("invSaveBtn").addEventListener("click", function () {
      var payload = invCollectPayload();
      if (!payload.customer_name) { el("invErr").textContent = "نام مشتری الزامی است."; return; }
      el("invErr").textContent = "";
      el("invSaveBtn").disabled = true;
      var editId = el("invEditId").value;
      if (editId) {
        payload.id = editId;
        api("PATCH", "/api/admin/invoices", payload).then(function (res) {
          el("invSaveBtn").disabled = false;
          if (res.ok && res.data && res.data.invoice) {
            var inv = res.data.invoice;
            invCache[inv.id] = inv;
            var old = el("inv-" + inv.id);
            if (old) {
              var div = document.createElement("div");
              div.innerHTML = invRenderCard(inv);
              var card = div.firstElementChild;
              invBindCard(card);
              old.replaceWith(card);
            }
            el("invBuilderWrap").hidden = true;
          } else { el("invErr").textContent = "خطا در ذخیره‌سازی."; }
        }).catch(function () { el("invSaveBtn").disabled = false; el("invErr").textContent = "خطا در ارتباط با سرور."; });
      } else {
        api("POST", "/api/admin/invoices", payload).then(function (res) {
          el("invSaveBtn").disabled = false;
          if (res.ok && res.data && res.data.invoice) {
            var inv = res.data.invoice;
            invCache[inv.id] = inv;
            el("invBuilderWrap").hidden = true;
            var div = document.createElement("div");
            div.innerHTML = invRenderCard(inv);
            var card = div.firstElementChild;
            invBindCard(card);
            var list = el("invList");
            if (list.firstElementChild && list.firstElementChild.classList.contains("admin-empty")) {
              list.innerHTML = "";
            }
            list.insertBefore(card, list.firstElementChild);
          } else {
            var errMsg = (res.data && res.data.error) === "duplicate_number" ? "این شماره فاکتور قبلاً ثبت شده." : "خطا در ذخیره‌سازی.";
            el("invErr").textContent = errMsg;
          }
        }).catch(function () { el("invSaveBtn").disabled = false; el("invErr").textContent = "خطا در ارتباط با سرور."; });
      }
    });

    el("invFilterBtn").addEventListener("click", function () { loadInvoices(true); });
    el("invMoreBtn").addEventListener("click", function () { invPage++; loadInvoices(false); });
  }

  /* ---------- boot ---------- */
  initLogin();
  initTabs();
  initProjectsPanel();
  initTicketsPanel();
  initLeadsPanel();
  initPartnersPanel();
  initUsersPanel();
  initLinksPanel();
  initStatsPanel();
  initInvoicesPanel();

  // اگر نشست معتبر بود مستقیم وارد پنل شو.
  api("GET", "/api/admin/login").then(function (res) {
    if (res.data && res.data.authed && res.data.role) {
      showApp(res.data.role, res.data.userId);
    } else {
      showLogin();
    }
  }).catch(showLogin);
})();
