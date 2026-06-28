/* =========================================================
   آرایه — sales.js
   پنل فروش (CRM کوچک): داشبورد، مدیریت لیدها، افزودن دستی.
   ورود فقط از طریق نشست پنل ادمین (نقش sales یا admin).
   ========================================================= */
(function () {
  "use strict";

  /* ---------- labels ---------- */
  var STATUS_LABELS = {
    new: "جدید",
    contacted: "تماس گرفته شد",
    qualified: "واجد شرایط",
    proposal: "پیشنهاد ارسال شد",
    won: "موفق",
    lost: "ناموفق",
  };
  var STATUS_ORDER = ["new", "contacted", "qualified", "proposal", "won", "lost"];
  var SOURCE_LABELS = {
    manual_entry: "ورود دستی",
    multistep_form: "فرم چندمرحله‌ای",
    hero_form: "فرم هرو",
    chatbot: "چت‌بات",
    telegram_bot: "ربات تلگرام",
    partner_signup_form: "همکار فروش",
    spaces_hero: "فرم هرو فضاها",
    spaces_form: "فرم کامل فضاها",
    spaces_chatbot: "چت‌بات فضاها",
  };
  var PAGE_LABELS = {
    index: "صفحه اصلی",
    clinic: "کلینیک",
    doctors: "پزشکان",
    restaurant: "رستوران",
    spaces: "فضاها",
    googlesabt: "ثبت در گوگل",
    academy: "آکادمی",
    konkour: "کنکور",
  };
  var PLAN_LABELS = {
    basic: "پکیج دیده شو",
    popular: "پکیج محبوب",
    vip: "پکیج کامل",
  };

  /* ---------- helpers ---------- */
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
    try { return toFa(d.toLocaleDateString("fa-IR", { month: "long", day: "numeric" })); }
    catch (e) { return "—"; }
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  function fmtDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    try {
      var date = toFa(d.toLocaleDateString("fa-IR", { month: "long", day: "numeric" }));
      var time = toFa(d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit", hour12: false }));
      return date + "، " + time;
    } catch (e) { return "—"; }
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
    }).catch(function () { return { status: 0, data: null }; });
  }

  /* ---------- state ---------- */
  var me = null;
  var role = null;
  var team = [];          // اعضای تیم فروش
  var teamById = {};
  var leadsPage = 0;
  var leadsFilter = { status: "", owner: "", q: "" };
  var leadsById = {};     // کش دادهٔ لیدها برای پیش‌پرکردن فرم مدیریت

  function ownerName(id) {
    if (!id) return "بدون مالک";
    var u = teamById[id];
    if (!u) return "—";
    return u.name || u.email || "—";
  }

  /* ---------- gate / auth ---------- */
  function boot() {
    api("GET", "/api/sales/team").then(function (res) {
      if (res.data && res.data.ok) {
        me = res.data.me;
        role = res.data.role;
        team = res.data.team || [];
        teamById = {};
        team.forEach(function (u) { teamById[u.id] = u; });
        showApp();
      } else {
        showGate();
      }
    }).catch(showGate);
  }

  function showGate() {
    el("gateView").hidden = false;
    el("appView").hidden = true;
    el("gateMsg").textContent = "برای ورود به پنل فروش، ابتدا از پنل مدیریت با حساب فروش وارد شوید.";
    el("gateLogin").hidden = false;
  }

  function showApp() {
    el("gateView").hidden = true;
    el("appView").hidden = false;
    el("userInfo").textContent = role === "admin" ? "مدیر" : "کارشناس فروش";
    fillOwnerSelects();
    loadDashboard();
  }

  function fillOwnerSelects() {
    var teamOpts = team.map(function (u) {
      return '<option value="' + u.id + '">' + esc(u.name || u.email) + "</option>";
    }).join("");
    var addOwner = el("addOwner");
    if (addOwner) addOwner.innerHTML = '<option value="">— انتساب به خودم —</option>' + teamOpts;
    var fOwner = el("fOwner");
    if (fOwner) {
      fOwner.innerHTML =
        '<option value="">همه مالک‌ها</option>' +
        '<option value="me">لیدهای من</option>' +
        '<option value="unassigned">بدون مالک</option>' +
        teamOpts;
    }
  }

  /* ---------- tabs ---------- */
  var leadsLoaded = false;
  var followupsLoaded = false;
  var teamLoaded = false;
  function initTabs() {
    var tabs = document.querySelectorAll(".admin-tab");
    var panels = {
      dashboard: el("panelDashboard"),
      leads: el("panelLeads"),
      followups: el("panelFollowups"),
      add: el("panelAdd"),
      team: el("panelTeam"),
    };
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        Object.keys(panels).forEach(function (k) { panels[k].classList.remove("is-active"); });
        var name = tab.dataset.tab;
        panels[name].classList.add("is-active");
        if (name === "dashboard") loadDashboard();
        if (name === "leads" && !leadsLoaded) { leadsLoaded = true; loadLeads(true); }
        if (name === "followups" && !followupsLoaded) { followupsLoaded = true; loadFollowups(); }
        if (name === "team" && !teamLoaded) { teamLoaded = true; loadTeam(); }
      });
    });
  }

  /* ---------- dashboard ---------- */
  function loadDashboard() {
    var box = el("dashContent");
    api("GET", "/api/sales/stats").then(function (res) {
      if (!res.data || !res.data.ok) {
        box.innerHTML = '<div class="admin-empty">خطا در بارگذاری آمار.</div>';
        return;
      }
      var s = res.data;
      var maxPipe = Math.max.apply(null, STATUS_ORDER.map(function (k) { return s.pipeline[k] || 0; }).concat([1]));
      var pipeRows = STATUS_ORDER.map(function (k) {
        var n = s.pipeline[k] || 0;
        var pct = Math.round((n / maxPipe) * 100);
        return '<div class="pipe-row"><span class="pipe-label">' + esc(STATUS_LABELS[k]) + '</span>' +
          '<span class="pipe-bar-wrap"><span class="pipe-bar st-' + k + '" style="width:' + pct + '%"></span></span>' +
          '<b>' + toFa(n) + '</b></div>';
      }).join("");

      var maxDay = Math.max.apply(null, s.last_7_days.map(function (d) { return d.leads; }).concat([1]));
      var spark = s.last_7_days.map(function (d) {
        var h = Math.round((d.leads / maxDay) * 80);
        var day = toFa(new Date(d.date).getDate());
        return '<div class="spark-col"><div class="spark-bar" style="height:' + (h + 3) + 'px" title="' + toFa(d.leads) + '"></div><span class="spark-day">' + day + '</span></div>';
      }).join("");

      box.innerHTML =
        '<div class="stats-summary">' +
          card(s.active, "لید فعال") +
          card(s.my_leads, "لیدهای من") +
          card(s.followups_due, "پیگیری سررسیدشده", s.followups_due > 0) +
          card(s.unassigned, "بدون مالک") +
          card(s.new_this_week, "جدید این هفته") +
          card(s.won_this_month, "موفق این ماه") +
          card(toFa(s.win_rate) + "٪", "نرخ تبدیل") +
          card(s.manual_total, "ثبت دستی") +
        '</div>' +
        '<div class="stats-grid">' +
          '<div class="stats-block"><h3>پایپ‌لاین فروش</h3>' + pipeRows + '</div>' +
          '<div class="stats-block"><h3>لیدهای ۷ روز اخیر</h3><div class="spark">' + spark + '</div></div>' +
        '</div>';
      updateFollowBadge(s.followups_due);
    });
  }
  function updateFollowBadge(n) {
    var badge = el("followBadge");
    if (!badge) return;
    if (n > 0) { badge.textContent = toFa(n); badge.hidden = false; }
    else { badge.hidden = true; }
  }
  function card(num, label, warn) {
    return '<div class="stat-card"><div class="stat-num' + (warn ? " warn" : "") + '">' +
      (typeof num === "number" ? toFa(num) : num) + '</div><div class="stat-label">' + esc(label) + '</div></div>';
  }

  /* ---------- leads ---------- */
  function loadLeads(reset) {
    if (reset) { leadsPage = 0; el("leadsList").innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>'; }
    var qs = "?page_num=" + leadsPage +
      "&status=" + encodeURIComponent(leadsFilter.status) +
      "&owner=" + encodeURIComponent(leadsFilter.owner) +
      "&q=" + encodeURIComponent(leadsFilter.q);
    api("GET", "/api/sales/leads" + qs).then(function (res) {
      var list = el("leadsList");
      if (reset) list.innerHTML = "";
      if (!res.data || !res.data.ok) { list.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      var leads = res.data.leads || [];
      if (reset) leadsById = {};
      if (reset && !leads.length) { list.innerHTML = '<div class="admin-empty">لیدی یافت نشد.</div>'; }
      leads.forEach(function (l) { leadsById[l.id] = l; list.insertAdjacentHTML("beforeend", renderLead(l)); });
      el("leadsLoadMore").hidden = !res.data.has_more;
    });
  }

  function renderLead(l) {
    var due = l.next_followup_at && l.next_followup_at.slice(0, 10) <= todayStr() &&
      l.crm_status !== "won" && l.crm_status !== "lost";
    var title = esc(l.company || l.name || "بدون نام");
    var sub = [];
    if (l.company && l.name) sub.push(esc(l.name));
    sub.push(esc(l.contact));
    return '<div class="admin-card" data-lead="' + l.id + '">' +
      '<div class="admin-card-head">' +
        '<div><span class="admin-card-code">' + title + '</span>' +
          '<div class="admin-card-sub">' + sub.join(" · ") + '</div></div>' +
        '<span class="pill st-' + esc(l.crm_status) + '">' + esc(STATUS_LABELS[l.crm_status] || l.crm_status) + '</span>' +
      '</div>' +
      '<div class="admin-meta">' +
        '<span class="src-tag src-' + esc(l.source) + '">' + esc(SOURCE_LABELS[l.source] || l.source) + '</span>' +
        (l.page ? '<span>صفحه: <b>' + esc(PAGE_LABELS[l.page] || l.page) + '</b></span>' : '') +
        '<span>مالک: <b>' + esc(ownerName(l.owner_id)) + '</b></span>' +
        (l.plan ? '<span>پکیج: <b>' + esc(PLAN_LABELS[l.plan] || l.plan) + '</b></span>' : '') +
        '<span>ثبت: <b>' + fmtDateTime(l.created_at) + '</b></span>' +
        (l.next_followup_at ? '<span class="' + (due ? "followup-due" : "") + '">پیگیری: <b>' + fmtDate(l.next_followup_at) + '</b></span>' : "") +
      '</div>' +
      (l.crm_note ? '<div class="admin-meta"><span>📝 ' + esc(l.crm_note) + '</span></div>' : "") +
      '<div class="admin-edit-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="toggle">مدیریت ▾</button>' +
        '<a class="btn btn-ghost btn-sm" href="' + contactHref(l.contact) + '">تماس تلفنی</a>' +
      '</div>' +
      '<div class="lead-detail" data-detail="' + l.id + '"></div>' +
    '</div>';
  }

  function contactHref(c) {
    if (!c) return "#";
    if (c.indexOf("@") > -1) return "mailto:" + c;
    return "tel:" + c;
  }

  function detailHtml(l) {
    var ownerOpts = '<option value="">بدون مالک</option>' +
      '<option value="me"' + (l.owner_id === me ? " selected" : "") + '>من</option>' +
      team.map(function (u) {
        return '<option value="' + u.id + '"' + (u.id === l.owner_id ? " selected" : "") + ">" + esc(u.name || u.email) + "</option>";
      }).join("");
    return '<div class="admin-grid" style="margin-top:4px">' +
        '<div class="field"><label>وضعیت</label><select data-f="crm_status">' + options(STATUS_LABELS, l.crm_status) + '</select></div>' +
        '<div class="field"><label>مالک</label><select data-f="owner_id">' + ownerOpts + '</select></div>' +
        '<div class="field"><label>پیگیری بعدی</label><input type="date" data-f="next_followup_at" value="' + (l.next_followup_at ? l.next_followup_at.slice(0, 10) : "") + '" /></div>' +
        '<div class="field"><label>نام کسب‌وکار</label><input type="text" data-f="company" value="' + esc(l.company || "") + '" /></div>' +
      '</div>' +
      '<div class="admin-edit-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-act="save">ذخیره</button>' +
        '<span class="form-ok" data-saveok></span>' +
      '</div>' +
      '<div style="margin-top:10px"><label style="font-weight:700;font-size:.85rem;display:block;margin-bottom:6px">افزودن یادداشت/تماس</label>' +
        '<textarea data-note style="width:100%;min-height:60px;padding:11px 13px;border-radius:var(--r-sm);border:1.5px solid var(--line);font-family:inherit;font-size:.92rem" placeholder="نتیجهٔ تماس یا یادداشت…"></textarea>' +
        '<div class="admin-edit-actions"><button type="button" class="btn btn-ghost btn-sm" data-act="note">ثبت یادداشت</button></div>' +
      '</div>' +
      '<div class="activity-list" data-activities><div class="admin-empty" style="padding:14px">در حال بارگذاری تاریخچه…</div></div>';
  }

  function loadActivities(box, leadId) {
    api("GET", "/api/sales/activities?lead_id=" + encodeURIComponent(leadId)).then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = ""; return; }
      var acts = res.data.activities || [];
      if (!acts.length) { box.innerHTML = '<div class="admin-empty" style="padding:14px">یادداشتی ثبت نشده.</div>'; return; }
      box.innerHTML = acts.map(function (a) {
        return '<div class="activity-item">' + esc(a.body) +
          '<div class="activity-meta">' + esc(a.author_name || "—") + ' · ' + fmtDate(a.created_at) + '</div></div>';
      }).join("");
    });
  }

  // delegation روی یک لیست لیدها
  function initLeadsDelegation() {
    initLeadListDelegation(el("leadsList"), function () { loadLeads(true); });
  }
  function initFollowupsDelegation() {
    initLeadListDelegation(el("followList"), function () { loadFollowups(); });
  }

  function initLeadListDelegation(listEl, onRefresh) {
    if (!listEl) return;
    listEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var card = e.target.closest("[data-lead]");
      if (!card) return;
      var leadId = card.dataset.lead;
      var detail = card.querySelector(".lead-detail");
      var act = btn.dataset.act;

      if (act === "toggle") {
        if (detail.classList.contains("is-open")) {
          detail.classList.remove("is-open");
          detail.innerHTML = "";
        } else {
          // داده‌های فعلی کارت را از DOM بازنمی‌سازیم؛ از حالت ساده استفاده می‌کنیم.
          detail.dataset.lead = leadId;
          detail.innerHTML = detailHtml(leadsById[leadId] || { id: leadId, crm_status: "new" });
          detail.classList.add("is-open");
          loadActivities(detail.querySelector("[data-activities]"), leadId);
        }
        return;
      }

      if (act === "save") {
        var patch = { id: leadId };
        detail.querySelectorAll("[data-f]").forEach(function (f) { patch[f.dataset.f] = f.value; });
        console.log("[sales] save patch", patch);
        btn.disabled = true;
        api("PATCH", "/api/sales/leads", patch).then(function (res) {
          btn.disabled = false;
          var ok = detail.querySelector("[data-saveok]");
          console.log("[sales] save response", res.status, res.data);
          if (res.data && res.data.ok) {
            ok.textContent = "ذخیره شد ✓";
            setTimeout(function () { onRefresh(); }, 600);
          } else {
            var err = (res.data && res.data.error) || (res.status ? "خطای " + res.status : "خطا");
            ok.textContent = err;
            ok.style.color = "#d9534f";
          }
        }).catch(function (e) {
          btn.disabled = false;
          console.error("[sales] save error", e);
          var ok = detail.querySelector("[data-saveok]");
          if (ok) { ok.textContent = "خطا"; ok.style.color = "#d9534f"; }
        });
        return;
      }

      if (act === "note") {
        var ta = detail.querySelector("[data-note]");
        var text = (ta.value || "").trim();
        if (!text) return;
        btn.disabled = true;
        api("POST", "/api/sales/activities", { lead_id: leadId, body: text, kind: "note" }).then(function (res) {
          btn.disabled = false;
          if (res.data && res.data.ok) {
            ta.value = "";
            loadActivities(detail.querySelector("[data-activities]"), leadId);
          }
        });
        return;
      }
    });
  }

  /* ---------- follow-ups ---------- */
  function loadFollowups() {
    var box = el("followList");
    box.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/sales/leads?followup=due").then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      var leads = res.data.leads || [];
      if (!leads.length) { box.innerHTML = '<div class="admin-empty">پیگیری سررسیدشده‌ای وجود ندارد.</div>'; return; }
      box.innerHTML = "";
      leads.forEach(function (l) { leadsById[l.id] = l; box.insertAdjacentHTML("beforeend", renderFollowup(l)); });
    });
  }

  function renderFollowup(l) {
    return '<div class="admin-card" data-lead="' + l.id + '">' +
      '<div class="admin-card-head">' +
        '<div><span class="admin-card-code">' + esc(l.company || l.name || "بدون نام") + '</span>' +
          '<div class="admin-card-sub">' + esc(l.name || "") + (l.name && l.contact ? " · " : "") + esc(l.contact) + '</div></div>' +
        '<span class="pill st-' + esc(l.crm_status) + '">' + esc(STATUS_LABELS[l.crm_status] || l.crm_status) + '</span>' +
      '</div>' +
      '<div class="admin-meta">' +
        '<span>مالک: <b>' + esc(ownerName(l.owner_id)) + '</b></span>' +
        (l.plan ? '<span>پکیج: <b>' + esc(PLAN_LABELS[l.plan] || l.plan) + '</b></span>' : '') +
        '<span class="followup-due">پیگیری تا: <b>' + fmtDate(l.next_followup_at) + '</b></span>' +
        '<span>ثبت: <b>' + fmtDateTime(l.created_at) + '</b></span>' +
      '</div>' +
      '<div class="admin-edit-actions">' +
        '<button type="button" class="btn btn-ghost btn-sm" data-act="toggle">مدیریت ▾</button>' +
        '<a class="btn btn-ghost btn-sm" href="' + contactHref(l.contact) + '">تماس تلفنی</a>' +
      '</div>' +
      '<div class="lead-detail" data-detail="' + l.id + '"></div>' +
    '</div>';
  }

  /* ---------- team performance ---------- */
  function loadTeam() {
    var box = el("teamContent");
    box.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/sales/performance").then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      var team = res.data.team || [];
      if (!team.length) { box.innerHTML = '<div class="admin-empty">کارشناسی ثبت نشده.</div>'; return; }
      var rows = team.map(function (u, i) {
        return '<tr>' +
          '<td><span class="rank">' + toFa(i + 1) + '</span> ' + esc(u.name || u.owner_id || "بدون نام") + '</td>' +
          '<td>' + toFa(u.total) + '</td>' +
          '<td>' + toFa(u.active) + '</td>' +
          '<td>' + toFa(u.won) + '</td>' +
          '<td>' + toFa(u.won_this_month) + '</td>' +
          '<td>' + toFa(u.lost) + '</td>' +
          '<td>' + toFa(u.win_rate) + '٪</td>' +
        '</tr>';
      }).join("");
      box.innerHTML =
        '<table class="team-table">' +
          '<thead><tr>' +
            '<th>کارشناس</th>' +
            '<th>کل لید</th>' +
            '<th>فعال</th>' +
            '<th>موفق</th>' +
            '<th>موفق این ماه</th>' +
            '<th>ناموفق</th>' +
            '<th>نرخ تبدیل</th>' +
          '</tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table>';
    });
  }

  /* ---------- manual add ---------- */
  function initAdd() {
    var formFields = document.querySelectorAll("[data-add]");
    function submitAdd() {
      var btn = el("addSubmitBtn");
      var err = el("addErr");
      var ok = el("addOk");
      err.textContent = ""; ok.textContent = "";
      var payload = {};
      formFields.forEach(function (f) {
        var v = (f.value || "").trim();
        if (v) payload[f.dataset.add] = v;
      });
      if (!payload.contact) { err.textContent = "راه ارتباطی را وارد کنید."; return; }
      if (!payload.owner_id) payload.assign_me = true;
      btn.disabled = true;
      btn.textContent = "در حال ثبت…";
      api("POST", "/api/sales/leads", payload).then(function (res) {
        btn.disabled = false;
        btn.textContent = "ثبت لید";
        if (res.data && res.data.ok) {
          ok.textContent = "لید ثبت شد ✓";
          formFields.forEach(function (f) {
            if (f.dataset.add !== "crm_status") f.value = "";
          });
          leadsLoaded = false; // دفعهٔ بعد تب لیدها تازه‌سازی شود
        } else if (res.data && res.data.error === "invalid_contact") {
          err.textContent = "راه ارتباطی نامعتبر است (موبایل یا ایمیل).";
        } else if (res.data && res.data.error === "missing_contact") {
          err.textContent = "راه ارتباطی را وارد کنید.";
        } else if (res.data && res.data.error) {
          err.textContent = "خطا: " + res.data.error;
        } else {
          err.textContent = "خطا در ثبت لید.";
        }
      }).catch(function (e) {
        btn.disabled = false;
        btn.textContent = "ثبت لید";
        err.textContent = "خطا در ارتباط با سرور.";
      });
    }
    el("addSubmitBtn").addEventListener("click", submitAdd);
    formFields.forEach(function (f) {
      if (f.tagName === "INPUT" || f.tagName === "SELECT") {
        f.addEventListener("keydown", function (e) {
          if (e.key === "Enter") { e.preventDefault(); submitAdd(); }
        });
      }
    });
  }

  /* ---------- filters & misc ---------- */
  function initFilters() {
    el("fApplyBtn").addEventListener("click", function () {
      leadsFilter.status = el("fStatus").value;
      leadsFilter.owner = el("fOwner").value;
      leadsFilter.q = el("fQ").value.trim();
      loadLeads(true);
    });
    el("fQ").addEventListener("keydown", function (e) { if (e.key === "Enter") el("fApplyBtn").click(); });
    el("leadsMoreBtn").addEventListener("click", function () { leadsPage++; loadLeads(false); });
    el("dashRefreshBtn").addEventListener("click", loadDashboard);
    el("followRefreshBtn").addEventListener("click", loadFollowups);
    el("teamRefreshBtn").addEventListener("click", loadTeam);
    el("logoutBtn").addEventListener("click", function () {
      api("DELETE", "/api/admin/login").finally(function () { window.location.href = "/admin"; });
    });
  }

  /* ---------- init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initTabs();
    initLeadsDelegation();
    initFollowupsDelegation();
    initFilters();
    initAdd();
    boot();
  });
})();
