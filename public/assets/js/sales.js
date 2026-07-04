/* =========================================================
   آرایه — sales.js
   پنل فروش CRM: پایپ‌لاین کانبان (درگ‌ودراپ)، کشوی مدیریت لید،
   داشبورد، پیگیری‌ها، افزودن دستی، عملکرد تیم.
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
  var STATUS_COLORS = {
    new: "#3478c8", contacted: "#cc9a3a", qualified: "#8c5fc8",
    proposal: "#2E7D6B", won: "#3FA08A", lost: "#d9534f",
  };
  var SOURCE_LABELS = {
    manual_entry: "ورود دستی",
    multistep_form: "فرم چندمرحله‌ای",
    hero_form: "فرم هرو",
    chatbot: "چت‌بات",
    telegram_bot: "ربات تلگرام",
    partner_signup_form: "همکار فروش",
  };
  var PAGE_LABELS = {
    index: "صفحه اصلی", clinic: "کلینیک", doctors: "پزشکان",
    restaurant: "رستوران", googlesabt: "ثبت در گوگل",
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
  function options(map, selected) {
    return Object.keys(map).map(function (k) {
      return '<option value="' + k + '"' + (k === selected ? " selected" : "") + ">" + esc(map[k]) + "</option>";
    }).join("");
  }
  function initials(name) {
    var n = (name || "").trim();
    if (!n) return "؟";
    var parts = n.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2);
    return parts[0].slice(0, 1) + parts[1].slice(0, 1);
  }
  function isDue(l) {
    return l.next_followup_at && l.next_followup_at.slice(0, 10) <= todayStr() &&
      l.crm_status !== "won" && l.crm_status !== "lost";
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
  var team = [];
  var teamById = {};
  var leadsById = {};
  var boardFilter = { owner: "", q: "" };

  function ownerName(id) {
    if (!id) return "بدون مالک";
    var u = teamById[id];
    if (!u) return "—";
    return u.name || u.email || "—";
  }

  /* ---------- contact helpers ---------- */
  function contactHref(c) {
    if (!c) return "#";
    if (c.indexOf("@") > -1) return "mailto:" + c;
    return "tel:" + c;
  }
  function isPhone(c) { return c && c.indexOf("@") === -1 && /\d/.test(c); }
  function waHref(c) {
    if (!isPhone(c)) return "";
    var d = String(c).replace(/[^\d]/g, "");
    if (d.indexOf("0098") === 0) d = d.slice(2);
    else if (d.indexOf("98") === 0 && d.length === 12) { /* already */ }
    else if (d.indexOf("0") === 0) d = "98" + d.slice(1);
    return "https://wa.me/" + d;
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
    loadStats();
    loadBoard();
  }
  function fillOwnerSelects() {
    var teamOpts = team.map(function (u) {
      return '<option value="' + u.id + '">' + esc(u.name || u.email) + "</option>";
    }).join("");
    var addOwner = el("addOwner");
    if (addOwner) addOwner.innerHTML = '<option value="">— انتساب به خودم —</option>' + teamOpts;
    var pOwner = el("pOwner");
    if (pOwner) {
      pOwner.innerHTML =
        '<option value="">همه مالک‌ها</option>' +
        '<option value="me">لیدهای من</option>' +
        '<option value="unassigned">بدون مالک</option>' + teamOpts;
    }
  }

  /* ---------- tabs ---------- */
  var loaded = { dashboard: false, followups: false, team: false };
  function initTabs() {
    var tabs = document.querySelectorAll(".admin-tab");
    var panels = {
      pipeline: el("panelPipeline"),
      dashboard: el("panelDashboard"),
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
        if (name === "pipeline") loadBoard();
        if (name === "dashboard") { loaded.dashboard = true; loadDashboard(); }
        if (name === "followups") { loaded.followups = true; loadFollowups(); }
        if (name === "team") { loaded.team = true; loadTeam(); }
      });
    });
  }

  /* ---------- KPI strip + stats ---------- */
  function kpi(num, label, warn) {
    return '<div class="kpi' + (warn ? " warn" : "") + '"><div class="kpi-num">' +
      (typeof num === "number" ? toFa(num) : num) + '</div><div class="kpi-label">' + esc(label) + '</div></div>';
  }
  var lastStats = null;
  function loadStats() {
    api("GET", "/api/sales/stats").then(function (res) {
      if (!res.data || !res.data.ok) return;
      lastStats = res.data;
      var s = res.data;
      el("kpiStrip").innerHTML =
        kpi(s.active, "لید فعال") +
        kpi(s.followups_due, "پیگیری سررسیدشده", s.followups_due > 0) +
        kpi(s.new_this_week, "جدید این هفته") +
        kpi(s.won_this_month, "موفق این ماه") +
        kpi(toFa(s.win_rate) + "٪", "نرخ تبدیل") +
        kpi(s.unassigned, "بدون مالک");
      updateFollowBadge(s.followups_due);
    });
  }
  function updateFollowBadge(n) {
    var badge = el("followBadge");
    if (!badge) return;
    if (n > 0) { badge.textContent = toFa(n); badge.hidden = false; }
    else { badge.hidden = true; }
  }

  /* ========================================================
     PIPELINE / KANBAN BOARD
     ======================================================== */
  // ستون‌های فعال پایپ‌لاین (won/lost هم نمایش داده می‌شوند).
  var BOARD_COLS = STATUS_ORDER;

  function loadBoard() {
    var board = el("board");
    if (!board.children.length) {
      // اسکلت ستون‌ها
      board.innerHTML = BOARD_COLS.map(function (k) {
        return '<div class="board-col col-' + k + '" data-col="' + k + '">' +
          '<div class="board-col-head">' +
            '<span class="board-col-title"><span class="board-dot" style="background:' + STATUS_COLORS[k] + '"></span>' + esc(STATUS_LABELS[k]) + '</span>' +
            '<span class="board-count" data-count="' + k + '">…</span>' +
          '</div>' +
          '<div class="board-col-body" data-body="' + k + '"><div class="board-col-empty">…</div></div>' +
        '</div>';
      }).join("");
      bindBoardDnD();
    }
    var qs = "&owner=" + encodeURIComponent(boardFilter.owner) + "&q=" + encodeURIComponent(boardFilter.q);
    // یک درخواست به ازای هر ستون تا تا ۵۰ لید در هر مرحله بیاید.
    BOARD_COLS.forEach(function (k) {
      var body = board.querySelector('[data-body="' + k + '"]');
      api("GET", "/api/sales/leads?page_num=0&status=" + k + qs).then(function (res) {
        var leads = (res.data && res.data.ok && res.data.leads) || [];
        leads.forEach(function (l) { leadsById[l.id] = l; });
        board.querySelector('[data-count="' + k + '"]').textContent = toFa(leads.length) + (res.data && res.data.has_more ? "+" : "");
        if (!leads.length) {
          body.innerHTML = '<div class="board-col-empty">—</div>';
        } else {
          body.innerHTML = leads.map(renderKard).join("");
        }
      });
    });
  }

  function renderKard(l) {
    var title = esc(l.company || l.name || "بدون نام");
    var sub = l.company && l.name ? esc(l.name) : esc(l.contact || "");
    var fu = "";
    if (l.next_followup_at) {
      fu = '<span class="kard-fu' + (isDue(l) ? " due" : "") + '">⏰ ' + fmtDate(l.next_followup_at) + '</span>';
    }
    var av = l.owner_id
      ? '<span class="avatar" title="' + esc(ownerName(l.owner_id)) + '">' + esc(initials(ownerName(l.owner_id))) + '</span>'
      : '<span class="avatar unassigned" title="بدون مالک">؟</span>';
    return '<div class="kard" draggable="true" data-lead="' + l.id + '">' +
      '<div class="kard-title">' + title + '</div>' +
      (sub ? '<div class="kard-sub">' + sub + '</div>' : '') +
      '<div class="kard-foot"><span class="kard-foot-left">' + fu + '</span>' + av + '</div>' +
    '</div>';
  }

  var dragId = null;
  function bindBoardDnD() {
    var board = el("board");

    board.addEventListener("dragstart", function (e) {
      var k = e.target.closest(".kard");
      if (!k) return;
      dragId = k.dataset.lead;
      k.classList.add("dragging");
      try { e.dataTransfer.setData("text/plain", dragId); e.dataTransfer.effectAllowed = "move"; } catch (x) {}
    });
    board.addEventListener("dragend", function (e) {
      var k = e.target.closest(".kard");
      if (k) k.classList.remove("dragging");
      board.querySelectorAll(".board-col.drop-on").forEach(function (c) { c.classList.remove("drop-on"); });
      dragId = null;
    });
    board.addEventListener("dragover", function (e) {
      var col = e.target.closest(".board-col");
      if (!col) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      board.querySelectorAll(".board-col.drop-on").forEach(function (c) { if (c !== col) c.classList.remove("drop-on"); });
      col.classList.add("drop-on");
    });
    board.addEventListener("drop", function (e) {
      e.preventDefault();
      var col = e.target.closest(".board-col");
      if (!col || !dragId) return;
      col.classList.remove("drop-on");
      var newStatus = col.dataset.col;
      moveLead(dragId, newStatus);
    });

    // کلیک روی کارت → باز کردن کشو (نه هنگام درگ)
    board.addEventListener("click", function (e) {
      var k = e.target.closest(".kard");
      if (k) openDrawer(k.dataset.lead);
    });
  }

  // جابه‌جایی مرحلهٔ یک لید (خوش‌بینانه + ذخیره در سرور)
  function moveLead(id, newStatus) {
    var l = leadsById[id];
    if (!l || l.crm_status === newStatus) return;
    var oldStatus = l.crm_status;
    l.crm_status = newStatus;
    // جابه‌جایی DOM
    moveCardDom(id, oldStatus, newStatus);
    api("PATCH", "/api/sales/leads", { id: id, crm_status: newStatus }).then(function (res) {
      if (!(res.data && res.data.ok)) {
        l.crm_status = oldStatus;
        moveCardDom(id, newStatus, oldStatus);
        return;
      }
      loadStats();
    });
  }
  function moveCardDom(id, from, to) {
    var board = el("board");
    var card = board.querySelector('.kard[data-lead="' + id + '"]');
    var toBody = board.querySelector('[data-body="' + to + '"]');
    if (!toBody) return;
    var emptyTo = toBody.querySelector(".board-col-empty");
    if (emptyTo) emptyTo.remove();
    if (card) toBody.insertBefore(card, toBody.firstChild);
    else { toBody.insertAdjacentHTML("afterbegin", renderKard(leadsById[id])); }
    // به‌روزرسانی شمارنده‌ها
    [from, to].forEach(function (k) {
      var b = board.querySelector('[data-body="' + k + '"]');
      var cnt = board.querySelector('[data-count="' + k + '"]');
      var n = b.querySelectorAll(".kard").length;
      cnt.textContent = toFa(n);
      if (!n && !b.querySelector(".board-col-empty")) b.innerHTML = '<div class="board-col-empty">—</div>';
    });
  }

  /* ========================================================
     LEAD DRAWER
     ======================================================== */
  var drawerLeadId = null;

  function openDrawer(id) {
    drawerLeadId = id;
    var l = leadsById[id] || { id: id, crm_status: "new" };
    el("drawerTitle").textContent = l.company || l.name || "لید";
    var subParts = [];
    if (l.company && l.name) subParts.push(l.name);
    if (l.contact) subParts.push(l.contact);
    el("drawerSub").textContent = subParts.join(" · ");
    el("drawerBody").innerHTML = drawerBodyHtml(l);
    el("drawerBackdrop").classList.add("is-open");
    el("leadDrawer").classList.add("is-open");
    el("leadDrawer").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    loadActivities(el("drawerBody").querySelector("[data-activities]"), id);
  }
  function closeDrawer() {
    drawerLeadId = null;
    el("drawerBackdrop").classList.remove("is-open");
    el("leadDrawer").classList.remove("is-open");
    el("leadDrawer").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function drawerBodyHtml(l) {
    var wa = waHref(l.contact);
    var quick = '<div class="quick-actions">';
    if (l.contact) {
      quick += '<a class="qa-btn" href="' + esc(contactHref(l.contact)) + '">' + (isPhone(l.contact) ? "📞 تماس" : "✉ ایمیل") + '</a>';
      if (wa) quick += '<a class="qa-btn wa" href="' + esc(wa) + '" target="_blank" rel="noopener">واتساپ</a>';
      quick += '<button type="button" class="qa-btn" data-copy="' + esc(l.contact) + '">⧉ کپی</button>';
    }
    quick += '</div>';

    var stageChips = '<div class="stage-chips">' + STATUS_ORDER.map(function (k) {
      return '<button type="button" class="stage-chip' + (k === l.crm_status ? " is-active" : "") + '" data-stage="' + k + '" data-s="' + k + '">' + esc(STATUS_LABELS[k]) + '</button>';
    }).join("") + '</div>';

    var ownerOpts = '<option value="">بدون مالک</option>' +
      '<option value="me"' + (l.owner_id === me ? " selected" : "") + '>من</option>' +
      team.map(function (u) {
        return '<option value="' + u.id + '"' + (u.id === l.owner_id ? " selected" : "") + ">" + esc(u.name || u.email) + "</option>";
      }).join("");

    return (
      // اقدام‌های سریع
      '<div class="drawer-section"><h4>اقدام سریع</h4>' + quick + '</div>' +
      // مرحله
      '<div class="drawer-section"><h4>مرحلهٔ پایپ‌لاین</h4>' + stageChips + '</div>' +
      // جزئیات
      '<div class="drawer-section"><h4>اطلاعات و مالکیت</h4>' +
        '<div class="drawer-grid">' +
          '<div><label>مالک</label><select data-f="owner_id">' + ownerOpts + '</select></div>' +
          '<div><label>پیگیری بعدی</label><input type="date" data-f="next_followup_at" value="' + (l.next_followup_at ? l.next_followup_at.slice(0, 10) : "") + '" /></div>' +
          '<div><label>نام مشتری</label><input type="text" data-f="name" value="' + esc(l.name || "") + '" /></div>' +
          '<div><label>نام کسب‌وکار</label><input type="text" data-f="company" value="' + esc(l.company || "") + '" /></div>' +
        '</div>' +
        '<div class="admin-edit-actions"><button type="button" class="btn btn-primary btn-sm" data-act="save">ذخیره تغییرات</button><span class="form-ok" data-saveok></span></div>' +
        metaLine(l) +
      '</div>' +
      // یادداشت
      '<div class="drawer-section note-compose"><h4>ثبت یادداشت / نتیجهٔ تماس</h4>' +
        '<textarea data-note placeholder="مثلاً: تماس گرفتم، فردا دموی نرم‌افزار را می‌فرستم…"></textarea>' +
        '<div class="admin-edit-actions"><button type="button" class="btn btn-ghost btn-sm" data-act="note">افزودن به تاریخچه</button></div>' +
      '</div>' +
      // تاریخچه
      '<div class="drawer-section"><h4>تاریخچهٔ فعالیت</h4>' +
        '<div class="activity-list" data-activities><div class="admin-empty" style="padding:14px">در حال بارگذاری…</div></div>' +
      '</div>'
    );
  }
  function metaLine(l) {
    var bits = [];
    bits.push('منبع: <b>' + esc(SOURCE_LABELS[l.source] || l.source || "—") + '</b>');
    if (l.page) bits.push('صفحه: <b>' + esc(PAGE_LABELS[l.page] || l.page) + '</b>');
    if (l.budget) bits.push('بودجه: <b>' + esc(l.budget) + '</b>');
    bits.push('ثبت: <b>' + fmtDate(l.created_at) + '</b>');
    return '<div class="admin-meta" style="margin-top:12px">' + bits.map(function (b) { return '<span>' + b + '</span>'; }).join("") + '</div>' +
      (l.goal ? '<div class="admin-meta"><span>📝 ' + esc(l.goal) + '</span></div>' : "");
  }

  function loadActivities(box, leadId) {
    if (!box) return;
    api("GET", "/api/sales/activities?lead_id=" + encodeURIComponent(leadId)).then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = ""; return; }
      var acts = res.data.activities || [];
      if (!acts.length) { box.innerHTML = '<div class="admin-empty" style="padding:14px">یادداشتی ثبت نشده.</div>'; return; }
      box.innerHTML = acts.map(function (a) {
        return '<div class="activity-item k-' + esc(a.kind || "note") + '">' + esc(a.body) +
          '<div class="activity-meta">' + esc(a.author_name || "—") + ' · ' + fmtDate(a.created_at) + '</div></div>';
      }).join("");
    });
  }

  function initDrawer() {
    el("drawerClose").addEventListener("click", closeDrawer);
    el("drawerBackdrop").addEventListener("click", closeDrawer);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawerLeadId) closeDrawer(); });

    el("drawerBody").addEventListener("click", function (e) {
      var id = drawerLeadId;
      if (!id) return;
      var detail = el("drawerBody");

      // تغییر مرحله با چیپ
      var chip = e.target.closest("[data-stage]");
      if (chip) {
        var newStatus = chip.dataset.stage;
        detail.querySelectorAll("[data-stage]").forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        api("PATCH", "/api/sales/leads", { id: id, crm_status: newStatus }).then(function (res) {
          if (res.data && res.data.ok) {
            if (leadsById[id]) leadsById[id].crm_status = newStatus;
            syncCardEverywhere(id);
            loadStats();
          }
        });
        return;
      }

      // کپی تماس
      var copyBtn = e.target.closest("[data-copy]");
      if (copyBtn) {
        var txt = copyBtn.dataset.copy;
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        var prev = copyBtn.textContent; copyBtn.textContent = "✓ کپی شد";
        setTimeout(function () { copyBtn.textContent = prev; }, 1400);
        return;
      }

      var btn = e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.dataset.act;

      if (act === "save") {
        var patch = { id: id };
        detail.querySelectorAll("[data-f]").forEach(function (f) { patch[f.dataset.f] = f.value; });
        btn.disabled = true;
        var ok = detail.querySelector("[data-saveok]");
        api("PATCH", "/api/sales/leads", patch).then(function (res) {
          btn.disabled = false;
          if (res.data && res.data.ok) {
            ok.textContent = "ذخیره شد ✓"; ok.style.color = "";
            if (leadsById[id]) {
              ["owner_id", "next_followup_at", "name", "company"].forEach(function (f) {
                if (patch[f] !== undefined) leadsById[id][f] = patch[f] || null;
              });
              if (patch.owner_id === "me") leadsById[id].owner_id = me;
            }
            syncCardEverywhere(id);
            loadStats();
            setTimeout(function () { ok.textContent = ""; }, 1500);
          } else { ok.textContent = "خطا"; ok.style.color = "#d9534f"; }
        }).catch(function () { btn.disabled = false; ok.textContent = "خطا"; ok.style.color = "#d9534f"; });
        return;
      }

      if (act === "note") {
        var ta = detail.querySelector("[data-note]");
        var text = (ta.value || "").trim();
        if (!text) return;
        btn.disabled = true;
        api("POST", "/api/sales/activities", { lead_id: id, body: text, kind: "note" }).then(function (res) {
          btn.disabled = false;
          if (res.data && res.data.ok) {
            ta.value = "";
            loadActivities(detail.querySelector("[data-activities]"), id);
          }
        });
        return;
      }
    });
  }

  // وقتی لیدی از کشو تغییر کرد، کارت آن در برد/پیگیری‌ها را تازه کن.
  function syncCardEverywhere(id) {
    var l = leadsById[id];
    if (!l) return;
    // برد کانبان
    var board = el("board");
    var card = board && board.querySelector('.kard[data-lead="' + id + '"]');
    if (card) {
      var targetBody = board.querySelector('[data-body="' + l.crm_status + '"]');
      if (targetBody && card.parentNode !== targetBody) {
        var oldCol = card.closest(".board-col");
        var emptyTo = targetBody.querySelector(".board-col-empty");
        if (emptyTo) emptyTo.remove();
        targetBody.insertBefore(card, targetBody.firstChild);
        recountCols();
        if (oldCol) { /* counts handled in recount */ }
      }
      card.outerHTML = renderKard(l);
    }
    // لیست پیگیری‌ها
    if (loaded.followups) loadFollowups();
  }
  function recountCols() {
    var board = el("board");
    if (!board) return;
    BOARD_COLS.forEach(function (k) {
      var b = board.querySelector('[data-body="' + k + '"]');
      var cnt = board.querySelector('[data-count="' + k + '"]');
      if (!b || !cnt) return;
      var n = b.querySelectorAll(".kard").length;
      cnt.textContent = toFa(n);
      if (!n && !b.querySelector(".board-col-empty")) b.innerHTML = '<div class="board-col-empty">—</div>';
    });
  }

  /* ---------- dashboard ---------- */
  function loadDashboard() {
    var box = el("dashContent");
    api("GET", "/api/sales/stats").then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = '<div class="admin-empty">خطا در بارگذاری آمار.</div>'; return; }
      var s = res.data;
      lastStats = s;
      var maxPipe = Math.max.apply(null, STATUS_ORDER.map(function (k) { return s.pipeline[k] || 0; }).concat([1]));
      var pipeRows = STATUS_ORDER.map(function (k) {
        var n = s.pipeline[k] || 0;
        var pct = Math.round((n / maxPipe) * 100);
        return '<div class="pipe-row"><span class="pipe-label">' + esc(STATUS_LABELS[k]) + '</span>' +
          '<span class="pipe-bar-wrap"><span class="pipe-bar st-' + k + '" style="width:' + pct + '%;background:' + STATUS_COLORS[k] + '"></span></span>' +
          '<b>' + toFa(n) + '</b></div>';
      }).join("");

      var maxDay = Math.max.apply(null, s.last_7_days.map(function (d) { return d.leads; }).concat([1]));
      var spark = s.last_7_days.map(function (d) {
        var h = Math.round((d.leads / maxDay) * 80);
        var day = toFa(new Date(d.date).getDate());
        return '<div class="spark-col"><div class="spark-bar" style="height:' + (h + 3) + 'px" title="' + toFa(d.leads) + '"></div><span class="spark-day">' + day + '</span></div>';
      }).join("");

      var chans = (s.by_channel || []).slice(0, 6);
      var chanHtml = chans.length
        ? chans.map(function (c) { return '<div class="chan-row"><span>' + esc(c.key) + '</span><b>' + toFa(c.count) + '</b></div>'; }).join("")
        : '<div class="admin-empty" style="padding:14px">کانالی ثبت نشده.</div>';

      box.innerHTML =
        '<div class="stats-grid">' +
          '<div class="stats-block"><h3>پایپ‌لاین فروش</h3>' + pipeRows + '</div>' +
          '<div class="stats-block"><h3>لیدهای ۷ روز اخیر</h3><div class="spark">' + spark + '</div></div>' +
          '<div class="stats-block"><h3>منبع ورود (کانال)</h3>' + chanHtml + '</div>' +
        '</div>';
      updateFollowBadge(s.followups_due);
    });
  }

  /* ---------- follow-ups ---------- */
  function loadFollowups() {
    var box = el("followList");
    box.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/sales/leads?followup=due").then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      var leads = res.data.leads || [];
      if (!leads.length) { box.innerHTML = '<div class="admin-empty">پیگیری سررسیدشده‌ای وجود ندارد. 🎉</div>'; return; }
      box.innerHTML = "";
      leads.forEach(function (l) { leadsById[l.id] = l; box.insertAdjacentHTML("beforeend", renderFollowup(l)); });
    });
  }
  function renderFollowup(l) {
    return '<div class="admin-card" data-lead="' + l.id + '" style="cursor:pointer">' +
      '<div class="admin-card-head">' +
        '<div><span class="admin-card-code">' + esc(l.company || l.name || "بدون نام") + '</span>' +
          '<div class="admin-card-sub">' + esc(l.name || "") + (l.name && l.contact ? " · " : "") + esc(l.contact) + '</div></div>' +
        '<span class="pill st-' + esc(l.crm_status) + '">' + esc(STATUS_LABELS[l.crm_status] || l.crm_status) + '</span>' +
      '</div>' +
      '<div class="admin-meta">' +
        '<span>مالک: <b>' + esc(ownerName(l.owner_id)) + '</b></span>' +
        '<span class="followup-due">پیگیری تا: <b>' + fmtDate(l.next_followup_at) + '</b></span>' +
        '<span>ثبت: <b>' + fmtDate(l.created_at) + '</b></span>' +
      '</div>' +
      '<div class="admin-edit-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-open>مدیریت لید</button>' +
        '<a class="btn btn-ghost btn-sm" href="' + contactHref(l.contact) + '" onclick="event.stopPropagation()">تماس</a>' +
      '</div>' +
    '</div>';
  }
  function initFollowupsDelegation() {
    var listEl = el("followList");
    if (!listEl) return;
    listEl.addEventListener("click", function (e) {
      var card = e.target.closest("[data-lead]");
      if (!card) return;
      if (e.target.closest("a")) return; // لینک تماس
      openDrawer(card.dataset.lead);
    });
  }

  /* ---------- team performance ---------- */
  function loadTeam() {
    var box = el("teamContent");
    box.innerHTML = '<div class="admin-empty">در حال بارگذاری…</div>';
    api("GET", "/api/sales/performance").then(function (res) {
      if (!res.data || !res.data.ok) { box.innerHTML = '<div class="admin-empty">خطا در بارگذاری.</div>'; return; }
      var t = res.data.team || [];
      if (!t.length) { box.innerHTML = '<div class="admin-empty">کارشناسی ثبت نشده.</div>'; return; }
      var rows = t.map(function (u, i) {
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
        '<table class="team-table"><thead><tr>' +
          '<th>کارشناس</th><th>کل لید</th><th>فعال</th><th>موفق</th><th>موفق این ماه</th><th>ناموفق</th><th>نرخ تبدیل</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table>';
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
          formFields.forEach(function (f) { if (f.dataset.add !== "crm_status") f.value = ""; });
          loadStats();
          loadBoard();
        } else if (res.data && res.data.error === "invalid_contact") {
          err.textContent = "راه ارتباطی نامعتبر است (موبایل یا ایمیل).";
        } else if (res.data && res.data.error === "missing_contact") {
          err.textContent = "راه ارتباطی را وارد کنید.";
        } else if (res.data && res.data.error) {
          err.textContent = "خطا: " + res.data.error;
        } else { err.textContent = "خطا در ثبت لید."; }
      }).catch(function () {
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
    el("pApplyBtn").addEventListener("click", function () {
      boardFilter.owner = el("pOwner").value;
      boardFilter.q = el("pQ").value.trim();
      loadBoard();
    });
    el("pQ").addEventListener("keydown", function (e) { if (e.key === "Enter") el("pApplyBtn").click(); });
    el("pRefreshBtn").addEventListener("click", function () { loadStats(); loadBoard(); });
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
    initFollowupsDelegation();
    initFilters();
    initAdd();
    initDrawer();
    boot();
  });
})();
