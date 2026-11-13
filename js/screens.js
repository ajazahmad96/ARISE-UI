/*
 * ARISE UI Studio — screens, overlays and the Screen Library registry.
 *
 *  SCREENS  : full views that live inside the app shell (header + bottom nav).
 *  OVERLAYS : sheets, dialogs and splash drawn on top of a screen.
 *  LIBRARY  : the catalogue shown in Profile > Screen Library.
 *
 * ADD A NEW SCREEN LATER (3 steps):
 *   1. Add a renderer to SCREENS (or OVERLAYS):  myScreen: (S, opts) => ({ title, nav, html })
 *   2. Add CSS for it in css/style.css (section 4 or 5).
 *   3. Add an entry to LIBRARY below, e.g.
 *        { id: "my-screen", title: "My Screen", desc: "What it shows", kind: "screen",
 *          spec: { screen: "myScreen", opts: {}, overlays: [], toasts: [] } }
 *   It is then listed in the Screen Library and can be opened with one tap.
 */
(function () {
  "use strict";
  const D = window.ARISE_DATA, U = window.UI;
  const { esc, icon, act } = U;

  const statusOf = (S) => { const s = D.ymd(D.today), sel = S.selected; return sel === s ? "today" : sel < s ? "past" : "future"; };
  const tasksFor = (status) => status === "today" ? D.TASKS : status === "past" ? D.PAST_TASKS : D.FUTURE_TASKS;
  const isDone = (S, t) => (S.done[t.id] !== undefined ? S.done[t.id] : t.done);
  const greeting = () => { const h = new Date().getHours(); return h >= 5 && h <= 11 ? "Good morning" : h >= 12 && h <= 16 ? "Good afternoon" : h >= 17 && h <= 20 ? "Good evening" : "Good night"; };
  const rankVars = (r) => `--rc:${r.color};--rg:${r.glow}`;
  const P = D.PROFILE;

  /* ====================================================================== SCREENS */
  const SCREENS = {};

  SCREENS.loading = () => ({ title: "Dashboard", nav: "dashboard", blank: true, html: "" });

  SCREENS.dashboard = (S, o) => {
    const status = o.status || statusOf(S);
    const tasks = o.empty ? [] : tasksFor(status);
    const done = tasks.filter((t) => isDone(S, t)).length, total = tasks.length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const rank = D.rankFor(P.level);
    const sub = status === "today" ? "Let's make today amazing." : "Viewing " + D.nice(D.parse(S.selected));
    const focus = o.empty ? "0h 0m" : status === "today" ? "3h 30m" : "2h 0m";
    const html = `
      <div class="greeting" style="padding-top:0"><h1>${greeting()}, <em>${esc(P.name)}</em> 👋</h1><p>${sub}</p></div>
      ${U.dashCard(`<div style="font-size:16px;font-weight:600">Today's Progress</div>
        <div class="progress-card__row">${U.progressRing(pct / 100, 100, "#1E8BFF", "rgba(30,139,255,.30)", `<div class="ring__pct">${pct}%</div>`)}
          <div class="progress-card__stats">
            <div class="stat-row"><span class="stat-row__label">Tasks</span><span class="stat-row__value">${done}/${total}</span></div>
            <div class="stat-row"><span class="stat-row__label">Focus Time</span><span class="stat-row__value">${focus}</span></div>
            <div class="stat-row"><span class="stat-row__label">Net XP</span><span class="stat-row__value" style="color:var(--emerald)">${o.empty ? 0 : 120}</span></div>
          </div></div>`)}
      ${U.dashCard(`<div class="level-card" style="${rankVars(rank)}">
          <div class="level-card__main"><div class="level-card__lvl">Level ${P.level}</div>
            <div class="level-card__rank" style="--rc:${rank.color}">${rank.name.toUpperCase()}</div>
            <div class="level-card__bar">${U.bar(P.xpInto / P.xpForNext, rank.color, 6)}<div class="level-card__xp">${P.xpInto} / ${P.xpForNext} XP</div></div></div>
          <div class="rank-badge">${U.rankGlyph(rank, 20)}</div></div>`, act("sheet:rank"))}
      <div class="row row--gap16">${U.miniCard("flame", "Streak", P.streak, "Keep it up!")}${U.miniCard("star", "Best Streak", P.longestStreak, "All time high")}</div>
      ${U.sectionHead("Today's Tasks", "View all", "nav:tasks")}
      ${tasks.length ? tasks.map((t) => U.taskRow(t, status, false, isDone(S, t))).join("") : U.emptyNote("No tasks scheduled.")}`;
    return { title: "Dashboard", nav: "dashboard", fab: status !== "past", html };
  };

  SCREENS.tasks = (S, o) => {
    const status = o.status || statusOf(S);
    const all = o.empty ? [] : tasksFor(status);
    const cats = ["all"].concat([...new Set(all.map((t) => t.category))]);
    const filter = o.filter || (cats.includes(S.tasksFilter) ? S.tasksFilter : "all");
    const list = filter === "all" ? all : all.filter((t) => t.category === filter);
    const done = all.filter((t) => isDone(S, t)).length;
    const html = `
      ${U.pillRow(cats.map((c) => [c, c === "all" ? "All" : c]), filter, "tasksF")}
      <div class="tasks-summary">Timeline · ${done}/${all.length} completed</div>
      ${list.length ? list.map((t) => U.taskRow(t, status, true, isDone(S, t))).join("") : U.emptyNote("No matching tasks.")}`;
    return { title: "Tasks Timeline", nav: "tasks", fab: status !== "past", html };
  };

  SCREENS.audit = (S, o) => {
    const status = o.status || statusOf(S);
    const logs = o.empty ? [] : status === "today" ? D.AUDIT.concat(S.auditExtra) : D.AUDIT.slice(0, 3);
    const total = logs.reduce((a, l) => a + l.hours, 0), prod = logs.filter((l) => l.type === "productive").reduce((a, l) => a + l.hours, 0);
    const eff = total > 0 ? Math.round(prod / total * 100) : 0;
    const verdict = eff > 75 ? "Excellent focus. You prioritized productive deep work today." : eff > 40 ? "Balanced day, but try to minimize distractions to boost output." : "Low efficiency detected. Restructure your environment for better focus tomorrow.";
    const dot = { productive: "var(--primary)", distraction: "var(--rose)", routine: "var(--text-1)" };
    const typeLabel = D.AUDIT_TYPES.find((t) => t[0] === S.auditType)[1];
    const menuOpen = o.menuOpen || S.auditMenu;
    const form = status === "today" ? `<div class="form-card audit-form">
        <h3>Log Time</h3>
        <div class="audit-form__row"><input class="input" id="audit-hours" inputmode="decimal" placeholder="Hours (e.g. 1.5)">
          <div class="select"><button class="select__btn" ${act("audit-menu")}><span>${typeLabel}</span>${icon("chevDown")}</button>
            ${menuOpen ? `<div class="select__menu">${D.AUDIT_TYPES.map((t) => `<button class="select__opt" ${act("audit-type:" + t[0])}>${t[1]}</button>`).join("")}</div>` : ""}</div></div>
        <div class="field-hint">0.5 to 24 hours, in steps of 0.5</div>
        <input class="input" id="audit-desc" placeholder="What did you do?" style="margin-bottom:16px">
        ${U.btn("Add Log", "primary", "audit-add")}</div>` : `<div style="height:32px"></div>`;
    const html = `
      <div class="seg"><div class="seg__item is-active">Timeline</div><div class="seg__item">Categories</div></div>
      <div class="audit-ring">${U.progressRing(Math.min(100, Math.round(total / 24 * 100)) / 100, 160, "#2A8DFF", "rgba(42,141,255,.30)", `<div class="audit-ring__total">${D.hm(total)}</div><div class="audit-ring__label">Total Time</div>`)}</div>
      ${logs.length ? `<div class="log-list">${logs.map((l) => `<div class="log-row"><span class="log-row__dot" style="background:${dot[l.type]}"></span><span class="log-row__desc">${esc(l.desc)}</span><span class="log-row__time">${D.hm(l.hours)}</span>${status === "today" ? `<button class="icon-tap icon-tap--delete" ${act("noop")} aria-label="Delete log">${icon("delete")}</button>` : ""}</div>`).join("")}</div>` : U.emptyNote("No time logged.")}
      ${form}
      <div class="form-card verdict"><h3>Daily Verdict</h3><div class="verdict__eff">${eff}% Efficiency</div><p>${verdict}</p></div>`;
    return { title: "Time Audit", nav: "audit", html };
  };

  SCREENS.stats = (S) => {
    const s = D.STATS, up = s.deltaPct >= 0;
    const html = `
      ${U.pillRow([["overview", "Overview"], ["focus", "Focus"], ["tasks", "Tasks"]], S.statsFilter, "statsF")}
      <div class="dash-card" style="margin-top:8px">
        <div class="hero-card__top"><span class="hero-card__range">Last 7 Days ▼</span><span class="hero-card__date">${esc(s.dateRange)}</span></div>
        <div class="hero-card__label">Productivity Momentum</div>
        <div class="hero-card__value">${s.productivityPct}%</div>
        <div class="hero-card__delta ${up ? "up" : "down"}">${up ? "▲" : "▼"} ${Math.abs(s.deltaPct)}% vs previous</div>
        ${U.sparkline(s.scores)}</div>
      <div class="row row--gap12">${U.statCard("schedule", "var(--primary)", "Focus Time", s.focusHours, "var(--primary)")}${U.statCard("tasks", "var(--secondary)", "Tasks Done", s.tasksDone, "#fff")}</div>
      <div class="row row--gap12">${U.statCard("star", "var(--amber)", "XP Earned", s.xp, "var(--emerald)")}${U.statCard("trophy", "var(--blue)", "Top Level", "Lv " + s.level, "#fff")}</div>`;
    return { title: "Analytics", nav: "stats", html };
  };

  SCREENS.awards = (S, o) => {
    const f = o.filter || S.awardsFilter, all = D.ACHIEVEMENTS;
    const list = f === "completed" ? all.filter((a) => a.unlocked) : f === "locked" ? all.filter((a) => !a.unlocked) : all;
    const dn = all.filter((a) => a.unlocked).length;
    const html = `
      ${U.pillRow([["all", "All"], ["completed", "Completed"], ["locked", "Locked"]], f, "awardsF")}
      <div class="summary" style="margin-top:8px">
        <div class="summary__col"><div class="summary__label">TOTAL</div><div class="summary__value" style="color:var(--amber)">${all.length}</div></div>
        <div class="summary__col"><div class="summary__label">COMPLETED</div><div class="summary__value">${dn}</div></div>
        <div class="summary__col"><div class="summary__label">LOCKED</div><div class="summary__value">${all.length - dn}</div></div></div>
      <div class="award-grid">${list.map(U.awardCard).join("")}</div>`;
    return { title: "Awards", nav: "awards", html };
  };

  SCREENS.calendar = (S) => {
    const base = new Date(D.today.getFullYear(), D.today.getMonth() + S.calOffset, 1);
    const y = base.getFullYear(), m = base.getMonth(), fd = base.getDay(), dim = new Date(y, m + 1, 0).getDate(), dip = new Date(y, m, 0).getDate();
    const cells = [];
    for (let i = fd - 1; i >= 0; i--) cells.push({ label: dip - i, outside: true });
    for (let d = 1; d <= dim; d++) { const k = `${y}-${D.pad(m + 1)}-${D.pad(d)}`; cells.push({ label: d, key: k, today: k === D.ymd(D.today), sel: k === S.selected, data: D.CAL_DATA_DAYS.includes(d) }); }
    while (cells.length % 7) { const n = cells.length; cells.push({ label: n <= 31 ? n : "", outside: true }); }   // original quirk kept
    const weeks = []; for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
    const cell = (c) => c.outside ? `<div class="cal__cell is-outside">${c.label}</div>`
      : `<button class="cal__cell${c.today ? " is-today" : ""}${c.sel ? " is-selected" : ""}${c.data ? " has-data" : ""}" ${act("date:" + c.key)}>${c.label}</button>`;
    const html = `<div class="dash-card" style="margin-bottom:0">
      <div class="cal__head"><button class="cal__nav" ${act("cal:-1")} aria-label="Previous month">${icon("chevLeft")}</button><div class="cal__month">${D.MONTHS_LONG[m]} ${y}</div><button class="cal__nav" ${act("cal:1")} aria-label="Next month">${icon("chevRight")}</button></div>
      <div class="cal__dow">${"SMTWTFS".split("").map((c) => `<span>${c}</span>`).join("")}</div>
      ${weeks.map((w) => `<div class="cal__week">${w.map(cell).join("")}</div>`).join("")}</div>`;
    return { title: "Calendar", nav: "calendar", html };
  };
  D.MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  SCREENS.profile = () => {
    const rank = D.rankFor(P.level), unlocked = D.ACHIEVEMENTS.filter((a) => a.unlocked).length;
    const html = `
      <div class="profile-head" style="${rankVars(rank)}">
        <div class="avatar">${U.ASSET.avatar ? `<img src="${U.ASSET.avatar}" alt="">` : esc(P.name[0].toUpperCase())}</div>
        <div class="profile-head__main"><div class="profile-head__name">${esc(P.name)}</div>
          <button class="profile-head__rank" ${act("sheet:rank")}>${rank.name.toUpperCase()}</button>
          <div class="profile-head__bar">${U.bar(P.xpInto / P.xpForNext, rank.color, 4)}</div>
          <div class="profile-head__xp">${P.xpInto} / ${P.xpForNext} XP</div></div>
        <button class="icon-tap" ${act("sheet:editProfile")} aria-label="Edit profile">${icon("settings")}</button></div>
      <div class="h-section">Lifetime Statistics</div>
      <div class="row row--gap12">${U.lifeStat("Total XP", P.totalXp)}${U.lifeStat("Days Active", P.daysActive)}</div>
      <div class="row row--gap16">${U.lifeStat("Tasks Done", P.tasksDone)}${U.lifeStat("Total Focus Time", P.lifeFocus)}</div>
      <div class="menu">
        ${U.menuItem("star", "var(--secondary)", "Achievements", unlocked + "/" + D.ACHIEVEMENTS.length, "nav:awards")}
        ${U.menuItem("sparkle", "var(--emerald)", "About ARISE", "v" + P.version, "sheet:about")}
        ${U.menuItem("doc", "var(--amber)", "Daily Reports", "Archives", "sheet:reports:daily")}
        ${U.menuItem("chart", "var(--blue)", "Weekly Reports", "Archives", "sheet:reports:weekly")}
        ${U.menuItem("target", "var(--primary)", "System Data", "Backup & Reset", "sheet:system")}
        ${U.menuItem("apps", "#9d87ff", "Screen Library", "All screens", "nav:library", "menu-item--studio", "STUDIO")}
      </div>`;
    return { title: "Profile", nav: "profile", html };
  };

  /* ---------- Screen Library (studio only — not part of the Android app) ---------- */
  const KIND = { screen: "Screen", sheet: "Sheet", dialog: "Dialog", state: "State", toast: "Toast", brand: "Brand" };
  function libraryList(query) {
    const q = (query || "").trim().toLowerCase();
    let shown = 0, html = "";
    LIBRARY.forEach((cat) => {
      const items = cat.items.filter((i) => !q || (i.title + " " + i.desc + " " + cat.name + " " + KIND[i.kind]).toLowerCase().includes(q));
      if (!items.length) return;
      shown += items.length;
      html += `<section class="lib-cat"><div class="lib-cat__h"><b>${esc(cat.name)}</b><span>${items.length}</span></div>
        ${items.map((i) => `<button class="lib-item" ${act("lib:" + i.id)}><div class="lib-item__main"><div class="lib-item__t">${esc(i.title)}</div><div class="lib-item__d">${esc(i.desc)}</div></div><span class="lib-item__k">${KIND[i.kind]}</span><span class="chev">›</span></button>`).join("")}</section>`;
    });
    return shown ? html : `<div class="lib-empty">No screens match “${esc(query)}”.</div>`;
  }
  SCREENS.library = (S) => {
    const count = LIBRARY.reduce((a, c) => a + c.items.length, 0);
    const html = `
      <div class="lib-top"><button class="lib-back" ${act("nav:profile")}>${icon("back")}Profile</button></div>
      <div class="lib-title">Screen Library</div>
      <div class="lib-sub">${count} screens and visual states from ARISE, including the ones normal navigation never shows. Tap one to preview it; use the purple <b>Screen Library</b> pill to come back.</div>
      <div class="lib-search">${icon("search")}<input class="input" id="lib-q" type="search" placeholder="Search screens" value="${esc(S.libQuery)}" autocomplete="off"></div>
      <div id="lib-list">${libraryList(S.libQuery)}</div>
      <div class="lib-note">Studio-only feature. Not in the Android app. Onboarding screens are intentionally absent because the original app has none.</div>`;
    return { title: "Screen Library", nav: "profile", html };
  };

  /* ====================================================================== OVERLAYS */
  const OVERLAYS = {};

  OVERLAYS.rankRoadmap = (S, p) => {
    const level = p.level || P.level, c = D.rankFor(level), idx = D.RANKS.indexOf(c), n = D.RANKS[idx + 1];
    let left, nextName, prog;
    if (n) { nextName = n.name; left = `${n.min - level} Levels Left`; prog = Math.min(100, Math.round((level - c.min) / (n.min - c.min) * 100)) / 100; }
    else { nextName = "Max Rank Reached"; left = "Unlimited"; prog = 1; }
    return U.sheet(`
      <div class="roadmap__status"><div class="k">CURRENT STATUS</div><div class="n" style="color:${c.color}">${c.name}</div><div class="l">Level ${level}</div>
        <div class="roadmap__next"><div class="top"><span class="a">Next: <span style="color:${n ? n.color : "#fff"}">${nextName}</span></span><span class="b">${left}</span></div>${U.bar(prog, c.color, 8)}</div></div>
      <div class="roadmap__h">Rank Roadmap</div>
      ${D.RANKS.map((r) => { const un = level >= r.min, cur = level >= r.min && level <= r.max;
        return `<div class="rank-row${un ? "" : " is-locked"}${cur ? " is-current" : ""}"><div class="rank-tile" style="${cur ? `background:${r.color}` : ""}">${U.rankGlyph(r, 20, true)}</div>
          <div class="rank-row__main"><div class="rank-row__name" style="color:${un ? r.color : "var(--text-1)"}">${r.name}</div><div class="rank-row__lv">Levels ${r.min}${r.max === 9999 ? "+" : " - " + r.max}</div></div>
          ${cur ? `<span class="rank-row__active" style="color:${r.color};background:${r.glow}">ACTIVE</span>` : ""}</div>`; }).join("")}
      <div style="margin-top:12px">${U.btn("Close Roadmap", "secondary", "close")}</div>`, { cls: "sheet--tall", body: "sheet__body--16" });
  };

  OVERLAYS.taskSheet = (S, p) => {
    const t = p.editing ? [...D.TASKS, ...D.FUTURE_TASKS].find((x) => x.id === p.editing) || D.TASKS[2] : null;
    return U.sheet(`<h2 class="sheet__title">${t ? "Edit Task" : "New Task"}</h2>
      <input class="input" placeholder="Task Name (e.g. Code Review)" value="${t ? esc(t.name) : ""}" style="margin-bottom:12px">
      <input class="input" placeholder="Category (e.g. Work)" value="${t ? esc(t.category) : ""}">
      <div class="btn-row">${U.btn("Cancel", "secondary", "close")}${U.btn(t ? "Update Task" : "Save Task", "primary", "close")}</div>`);
  };

  OVERLAYS.profileEdit = () => U.sheet(`<h2 class="sheet__title">Edit Profile</h2>
      <input class="input" placeholder="Enter your name" value="${esc(P.name)}">
      <div class="btn-row">${U.btn("Cancel", "secondary", "close")}${U.btn("Update Info", "primary", "close")}</div>`);

  OVERLAYS.about = () => U.sheet(`<h2 style="margin-bottom:12px">About ARISE</h2>
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center">
        ${U.logo(96)}
        <div style="font-size:20px;font-weight:800;letter-spacing:1px;color:var(--primary);margin-bottom:4px">ARISE</div>
        <div style="font-size:13px;color:var(--silver);margin-bottom:8px">Become Better Every Day.</div>
        <div style="font-size:14px;font-weight:600;margin-bottom:4px">Your Personal Growth Operating System</div>
        <div style="font-size:14px;color:var(--text-1);margin-bottom:24px">Build better habits. Stay focused. Grow every day.</div></div>
      <div style="font-size:14px;font-weight:600;margin-bottom:4px">👨‍💻 Created by</div>
      <div style="font-size:14px;color:var(--text-1);margin-bottom:16px">Ajaz Ahmad</div>
      <div style="display:flex;margin:20px 0"><div style="width:3px;background:var(--secondary);flex:none"></div><div style="padding-left:14px;font-size:14px;line-height:21px;font-style:italic;color:var(--text-2)">“Every great journey starts with small daily actions. ARISE is here to help you stay focused, disciplined, and keep moving forward.”</div></div>
      <div style="font-size:14px;font-weight:600;margin:8px 0">⭐ Version</div>
      <div style="font-size:13px;color:var(--text-1);margin-bottom:4px">Current Version: ARISE v${P.version}</div>
      <div style="font-size:13px;color:var(--text-1);margin-bottom:24px">Native Android edition</div>
      ${U.btn("Close", "secondary", "close")}`);

  OVERLAYS.systemData = () => U.sheet(`<h2 style="margin-bottom:12px">System Data Manager</h2>
      <p class="sheet__sub" style="margin-bottom:20px">Backup your data securely or restore from a previous save. Data stays entirely on your device.</p>
      ${U.btn("Export JSON Backup", "blue", "toast:export")}
      <div style="height:12px"></div>${U.btn("Import Data", "outline", "toast:import")}
      <div style="height:24px"></div>${U.btn("Hard Reset System", "danger", "dialog:reset")}
      <div style="height:8px"></div>${U.btn("Close", "text", "close")}`);

  OVERLAYS.resetConfirm = () => U.dialog(`<div class="dialog__title">Hard Reset</div>
      <div class="dialog__text">Are you sure you want to completely erase all local data? This is permanent.</div>
      <div class="dialog__actions">${U.textBtn("Cancel", "var(--text-1)", "close")}${U.textBtn("Erase Everything", "var(--rose)", "toast:reset")}</div>`);

  OVERLAYS.importNotes = (S, p) => { const n = p.notes || D.IMPORT_NOTES;
    return U.dialog(`<div class="dialog__title">Import Notes</div>
      <div class="dialog__scroll"><div class="l">Your data was restored. A few items needed attention:</div>${n.map((x) => `<div class="s">• ${esc(x)}</div>`).join("")}
        <div class="xs">Items that could not be used were kept inside the data and will be included in your next export.</div></div>
      <div class="dialog__actions">${U.textBtn("OK", "var(--primary)", "close")}</div>`); };

  OVERLAYS.reportsList = (S, p) => {
    const kind = p.kind, items = p.empty ? [] : D.REPORT_LISTS[kind];
    return U.sheet(`<h2 style="margin-bottom:8px">${kind === "daily" ? "Daily Reports" : "Weekly Reports"}</h2>
      <p class="sheet__sub" style="margin-bottom:20px">Select a report to view details.</p>
      ${items.length ? items.map((i) => `<button class="report-item" ${act("report:" + kind + ":" + i.id)}><div class="report-item__main"><div class="report-item__t">${esc(i.title)}</div><div class="report-item__s">${esc(i.sub)}</div></div><span class="report-item__chev">›</span></button>`).join("")
        : `<div style="text-align:center;color:var(--text-2);padding:40px 0">No locked reports yet.</div>`}
      <div style="margin-top:12px">${U.btn("Close", "secondary", "close")}</div>`, { cls: "sheet--report", body: "sheet__body--16" });
  };

  OVERLAYS.reportDetail = (S, p) => {
    const r = p.report, daily = r.kind === "daily", sd = r.delta, busy = p.busy;
    const cats = r.categories;
    return U.sheet(`
      <div class="report-head"><div class="report-head__main"><div class="report-head__k">${daily ? "DAILY REPORT" : "WEEKLY REPORT"}</div><div class="report-head__t">${esc(r.title)}</div><div class="report-head__lock">Locked at: ${esc(r.locked)}</div></div>
        <button class="round-btn" ${act("close")} aria-label="Close">${icon("close")}</button></div>
      <div style="display:flex;justify-content:center;margin-bottom:16px">${U.gradeBox(r.grade)}</div>
      <div class="report-score"><div class="k">Productivity Score</div><div class="v">${r.score}%</div><div class="m">${esc(r.msg)}</div>
        <div class="d ${sd >= 0 ? "up" : "down"}">${sd >= 0 ? "▲" : "▼"} ${Math.abs(sd)}% ${daily ? "vs yesterday" : "vs last week"}</div></div>
      <div class="insight"><p><b>Insight:</b> ${esc(r.insight)}</p></div>
      <div class="row row--gap12">${U.detailStat("Tasks", `${r.tasksDone}/${r.tasksTotal}`, "#fff")}${U.detailStat("Focus", D.hm(r.focusHours), "var(--primary)")}</div>
      <div class="row" style="gap:12px;margin-bottom:24px">${U.detailStat("XP Yield", `+${r.xpEarned} / -${r.xpPenalty}`, "var(--emerald)")}${U.detailStat("Streak", r.streak, "var(--amber)")}</div>
      <div class="section-title">Category Analysis</div><div class="section-rule"></div>
      ${cats.length ? `<div style="margin-bottom:24px">${cats.map((c) => { const pc = c.total ? Math.round(c.done / c.total * 100) : 0;
          return `<div class="cat-row"><div class="cat-row__top"><b style="color:${c.color}">${esc(c.name)}</b><span>${c.done}/${c.total} (${pc}%)</span></div>${U.bar(pc / 100, c.color, 6)}</div>`; }).join("")}</div>`
        : `<div style="color:var(--text-2);font-size:13px;margin-bottom:24px">No category data.</div>`}
      ${!daily && r.breakdown ? `<div class="section-title">Daily Breakdown</div><div class="section-rule"></div><div class="breakdown">${r.breakdown.map((d) =>
          `<div class="breakdown__col"><div class="breakdown__track"><i style="height:${Math.max(10, d.score)}%"></i></div><div class="breakdown__day">${d.day}</div><div class="breakdown__score">${d.score}</div></div>`).join("")}</div>` : ""}
      <button class="btn btn--gradient" ${act(busy ? "noop" : "sheet:share")}>${icon("share")}<span style="margin-left:8px">${busy ? "Generating…" : "Share Report Card"}</span></button>
      <div style="height:32px"></div>`, { cls: "sheet--bg0 sheet--taller" });
  };

  OVERLAYS.shareCard = (S, p) => U.sheet(`<div class="report-head"><div class="report-head__main"><div class="report-head__k">SHARE REPORT CARD</div><div class="report-head__t">Preview</div></div><button class="round-btn" ${act("close")} aria-label="Close">${icon("close")}</button></div>
      <canvas class="share-card" id="share-canvas" width="1080" height="990" style="aspect-ratio:1080/990"></canvas>
      <div class="share-note">Studio preview of the 1080 × 990 PNG that ARISE hands to the Android share sheet. It is drawn from the same layout as ShareCardRenderer.kt.</div>
      ${U.btn("Close", "secondary", "close")}`, { cls: "sheet--bg0 sheet--taller" });

  OVERLAYS.levelNotify = (S, p) => {
    const lvl = p.level, r = D.rankFor(lvl), up = p.up;
    const col = up ? r.color : "var(--rose)", glow = up ? r.glow : "var(--rose)";
    return U.dialog(`<div class="level-dialog__title" style="color:${col}">${up ? "LEVEL UP!" : "LEVEL DOWN"}</div>
      <div class="level-dialog__badge" style="--bg-a:${up ? r.color : "#FF2A5F"};--bg-glow:${glow}">${U.rankGlyph(r, 48, true)}</div>
      <div class="level-dialog__lvl">${lvl}</div><div class="level-dialog__rank" style="color:${r.color}">${r.name}</div>
      <div class="level-dialog__msg">${up ? D.LEVEL_NOTICE.upMsg : D.LEVEL_NOTICE.downMsg}</div>
      ${U.btn("Continue", "primary", "close")}`, { cls: "level-dialog", locked: true });
  };

  OVERLAYS.splash = () => `<div class="splash" ${act("close")}>${U.logo(140)}<div class="splash__name">ARISE</div><div class="splash__tag">Become Better Every Day.</div></div>`;

  /* ====================================================================== LIBRARY */
  const T = {
    ok: { type: "success", title: "System Online", message: "ARISE v" + P.version + " initialized." },
    ach: { type: "success", title: "Achievement Unlocked!", message: "Task Builder" },
    bak: { type: "success", title: "Backup Saved", message: "Your data was exported." },
    rst: { type: "success", title: "Restore Complete", message: "System records recovered." },
    rs2: { type: "success", title: "System Reset", message: "All databases cleared." },
    e1: { type: "danger", title: "Invalid Hours", message: "Enter hours as a number, e.g. 1.5." },
    e2: { type: "danger", title: "Export Failed", message: "Could not write the backup file." },
    e3: { type: "danger", title: "Import Failed", message: "File format is corrupt or invalid." },
    e4: { type: "danger", title: "Startup Error", message: "Could not load data." },
    e5: { type: "danger", title: "Reset Failed", message: "Could not clear data." },
    e6: { type: "danger", title: "Failed", message: "Could not generate report card." },
    e7: { type: "danger", title: "Update Error", message: "Daily evaluation failed." }
  };
  const S1 = (screen, opts, extra) => ({ spec: Object.assign({ screen, opts: opts || {} }, extra || {}) });
  const O1 = (screen, type, props, extra) => ({ spec: Object.assign({ screen, overlays: [{ type, props: props || {} }] }, extra || {}) });
  const it = (id, title, desc, kind, s) => Object.assign({ id, title, desc, kind }, s);
  const grade = (g) => it("report-grade-" + g, "Report grade " + g, `Daily report detail with the ${g} grade box (${D.SCORE_FOR[g]}%)`, "sheet", O1("profile", "reportDetail", { report: D.dailyReport(g) }));

  const LIBRARY = [
    { name: "Main Screens", items: [
      it("dashboard", "Dashboard", "Greeting, today's progress ring, level card, streaks and today's tasks", "screen", S1("dashboard")),
      it("tasks", "Tasks Timeline", "Category filter pills and the full task list with edit / delete / check", "screen", S1("tasks")),
      it("audit", "Time Audit", "Total-time ring, logged entries, Log Time form and Daily Verdict", "screen", S1("audit")),
      it("stats", "Analytics (Stats)", "Productivity momentum chart and four stat cards", "screen", S1("stats")),
      it("awards", "Awards (Achievements)", "Summary strip and the hexagon achievement grid", "screen", S1("awards")),
      it("calendar", "Calendar", "Month grid with today, selection and data dots", "screen", S1("calendar")),
      it("profile", "Profile", "Rank header, lifetime statistics and menu", "screen", S1("profile"))
    ] },
    { name: "Branding & Launch", items: [
      it("splash", "Splash Screen", "Official logo, name and tagline on deep black (tap to dismiss)", "brand", O1("dashboard", "splash")),
      it("logo", "Official Logo", "arise-logo.svg as used in the header, About and splash", "brand", O1("dashboard", "about")),
      it("app-icon", "App Icon", "arise-app-icon.svg launcher artwork (read-only master)", "brand", { spec: { screen: "appIcon" } })
    ] },
    { name: "Sheets & Secondary Screens", items: [
      it("rank-roadmap", "Rank Roadmap", "Current status, next-rank progress and the 11-tier roadmap", "sheet", O1("dashboard", "rankRoadmap")),
      it("rank-roadmap-max", "Rank Roadmap — max rank", "Level 120: “Max Rank Reached” state", "state", O1("dashboard", "rankRoadmap", { level: 120 })),
      it("new-task", "New Task", "Task name and category fields", "sheet", O1("tasks", "taskSheet")),
      it("edit-task", "Edit Task", "Same sheet pre-filled, “Update Task”", "sheet", O1("tasks", "taskSheet", { editing: 3 })),
      it("edit-profile", "Edit Profile", "Name field, Cancel / Update Info", "sheet", O1("profile", "profileEdit")),
      it("about", "About ARISE", "Logo, tagline, creator, quote and version", "sheet", O1("profile", "about")),
      it("system-data", "System Data (Settings)", "Export, import and hard reset", "sheet", O1("profile", "systemData"))
    ] },
    { name: "Reports", items: [
      it("daily-list", "Daily Reports", "Archive list, newest first", "sheet", O1("profile", "reportsList", { kind: "daily" })),
      it("weekly-list", "Weekly Reports", "Archive list with “Last Week” label", "sheet", O1("profile", "reportsList", { kind: "weekly" })),
      it("daily-detail", "Daily Report Detail", "Grade, score, insight, stats and category analysis", "sheet", O1("profile", "reportDetail", { report: D.dailyReport("B") })),
      it("weekly-detail", "Weekly Report Detail", "Same layout plus the Daily Breakdown bars", "sheet", O1("profile", "reportDetail", { report: D.weeklyReport("A") })),
      it("share-card", "Share Card Preview", "The 1080 × 990 report card image", "sheet", O1("profile", "shareCard", { report: D.dailyReport("B") }))
    ] },
    { name: "Report Grades", items: ["S", "A", "B", "C", "D", "F"].map(grade) },
    { name: "Dialogs & Popups", items: [
      it("level-up", "Level Up", "Rank-coloured celebration dialog (only “Continue” closes it)", "dialog", O1("dashboard", "levelNotify", { level: 10, up: true })),
      it("level-down", "Level Down", "Rose-coloured version after a bad day", "dialog", O1("dashboard", "levelNotify", { level: 8, up: false })),
      it("reset-confirm", "Reset Confirmation", "“Hard Reset” confirm dialog", "dialog", { spec: { screen: "profile", overlays: [{ type: "systemData" }, { type: "resetConfirm" }] } }),
      it("import-notes", "Import Notes", "Items repaired or set aside while restoring a backup", "dialog", O1("profile", "importNotes")),
      it("audit-dropdown", "Audit type dropdown", "The open Productive / Routine / Distraction popup menu", "state", S1("audit", { menuOpen: true }))
    ] },
    { name: "Notifications (Toasts)", items: [
      it("toast-success", "Success notifications", "System Online, Achievement Unlocked, Backup Saved, Restore Complete, System Reset", "toast", S1("dashboard", {}, { toasts: [T.ok, T.ach, T.bak, T.rst, T.rs2] })),
      it("toast-error", "Error notifications", "Invalid Hours, Export / Import / Reset Failed, Startup Error and more", "toast", S1("audit", {}, { toasts: [T.e1, T.e2, T.e3, T.e4, T.e5, T.e6, T.e7] }))
    ] },
    { name: "Empty States", items: [
      it("empty-dashboard", "Dashboard — no tasks", "“No tasks scheduled.” with a 0% ring", "state", S1("dashboard", { empty: true })),
      it("empty-tasks", "Tasks — no matching tasks", "“No matching tasks.”", "state", S1("tasks", { empty: true })),
      it("empty-audit", "Audit — no time logged", "“No time logged.” with 0% efficiency", "state", S1("audit", { empty: true })),
      it("empty-daily", "Daily Reports — none yet", "“No locked reports yet.”", "state", O1("profile", "reportsList", { kind: "daily", empty: true })),
      it("empty-weekly", "Weekly Reports — none yet", "“No locked reports yet.”", "state", O1("profile", "reportsList", { kind: "weekly", empty: true })),
      it("empty-categories", "Report — no category data", "“No category data.” in Category Analysis", "state", O1("profile", "reportDetail", { report: D.dailyReport("B", { categories: [] }) }))
    ] },
    { name: "Loading States", items: [
      it("loading", "Boot — loading data", "Header and navigation with a blank body while data loads", "state", S1("loading")),
      it("share-busy", "Share button — generating", "“Generating…” while the report card renders", "state", O1("profile", "reportDetail", { report: D.dailyReport("A"), busy: true }))
    ] },
    { name: "Date & Filter Variants", items: [
      it("past-dashboard", "Dashboard — past date", "Read-only tasks, no FAB, “Viewing …” subtitle", "state", S1("dashboard", { status: "past" }, { selected: -1 })),
      it("past-tasks", "Tasks — past date", "No toggle or edit actions", "state", S1("tasks", { status: "past" }, { selected: -1 })),
      it("past-audit", "Audit — past date", "Entries without delete; Log Time form hidden", "state", S1("audit", { status: "past" }, { selected: -1 })),
      it("future-tasks", "Tasks — future date", "Edit / delete only, no completion check", "state", S1("tasks", { status: "future" }, { selected: 1 })),
      it("tasks-filtered", "Tasks — category filter", "“Work” pill active", "state", S1("tasks", { filter: "Work" })),
      it("awards-completed", "Awards — Completed", "Completed filter active", "state", S1("awards", { filter: "completed" })),
      it("awards-locked", "Awards — Locked", "Locked filter active", "state", S1("awards", { filter: "locked" }))
    ] }
  ];

  /* ---------- app icon preview (brand master, shown big) ---------- */
  SCREENS.appIcon = () => ({ title: "App Icon", nav: "profile", html: `
    <div class="lib-top"><button class="lib-back" ${act("nav:library")}>${icon("back")}Screen Library</button></div>
    <div class="lib-title">App Icon</div><div class="lib-sub">Official launcher artwork — assets/logo/arise-app-icon.svg. Master file, never redesigned.</div>
    <img src="${U.ASSET.appIcon}" style="width:100%;border-radius:24px;background:#000" alt="ARISE app icon">` });

  window.ARISE_SCREENS = { SCREENS, OVERLAYS, LIBRARY, libraryList, statusOf, T };
})();
