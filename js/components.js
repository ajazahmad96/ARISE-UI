/*
 * ARISE UI Studio — components.
 * Each function returns an HTML string for one reusable piece of the original UI
 * (names match the Compose composables: DashCard, TabPill, TaskRow, ProgressRing, ...).
 * Interactions are declared with data-act="name:arg" and handled in app.js.
 */
(function () {
  "use strict";
  const D = window.ARISE_DATA;
  const ICONS = window.ARISE_ICONS;

  /* >>> BRAND ASSETS: official, never redesign. Replace only by swapping the file. <<< */
  const ASSET = {
    logo: "assets/logo/arise-logo.svg",
    appIcon: "assets/logo/arise-app-icon.svg",
    avatar: null                    // e.g. "assets/illustrations/avatar.svg" to show a picture instead of the initial
  };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

  /* ---------- primitives ---------- */
  function icon(name, cls) {
    const p = ICONS[name];
    if (!p) return `<span class="ico" title="missing icon: ${esc(name)}"></span>`;
    return `<svg class="ico ${cls || ""}" viewBox="0 0 24 24" aria-hidden="true"><path d="${p}"/></svg>`;
  }
  const logo = (size, cls) => `<img class="${cls || ""}" src="${ASSET.logo}" width="${size}" height="${size}" alt="ARISE logo">`;
  const rankGlyph = (rank, size, white) => `<img class="rank-glyph${white ? " rank-glyph--white" : ""}" src="${rank.icon}" width="${size}" height="${size}" alt="">`;
  const act = (a) => `data-act="${a}"`;

  /* ---------- layout ---------- */
  function appHeader(title) {
    return `<header class="app-header">
      <div class="app-header__brand">${logo(44, "app-header__logo")}
        <div><div class="app-header__name">ARISE</div><div class="app-header__tag">TRACKER &amp; AUDIT</div></div></div>
      <div class="app-header__title">${esc(title)}</div></header>`;
  }
  const NAV = [
    ["dashboard", "Dashboard", "home"], ["tasks", "Tasks", "tasks"], ["audit", "Audit", "schedule"],
    ["stats", "Stats", "chart"], ["awards", "Awards", "trophy"], ["calendar", "Calendar", "calendar"], ["profile", "Profile", "person"]
  ];
  function bottomNav(current) {
    return `<nav class="bottom-nav">${NAV.map(([id, label, ic]) =>
      `<button class="bottom-nav__item${id === current ? " is-active" : ""}" ${act("nav:" + id)} aria-label="${label}">${icon(ic)}<span>${label}</span></button>`).join("")}</nav>`;
  }
  const fab = () => `<button class="fab" ${act("sheet:newTask")} aria-label="Add task">${icon("add")}</button>`;

  /* ---------- cards & text ---------- */
  const dashCard = (inner, attrs) => attrs ? `<button class="dash-card" ${attrs}>${inner}</button>` : `<div class="dash-card">${inner}</div>`;
  const sectionHead = (title, link, linkAct) =>
    `<div class="section-head"><div class="section-head__title">${esc(title)}</div>${link ? `<button class="section-head__link" ${act(linkAct)}>${esc(link)}</button>` : ""}</div>`;
  const tabPill = (text, active, a) => `<button class="tab-pill${active ? " is-active" : ""}" ${a ? act(a) : ""}>${esc(text)}</button>`;
  const pillRow = (items, active, prefix) => `<div class="pill-row">${items.map(([k, l]) => tabPill(l, active === k, prefix + ":" + k)).join("")}</div>`;
  const btn = (text, variant, a, extra) => `<button class="btn btn--${variant}" ${a ? act(a) : ""} ${extra || ""}>${text}</button>`;
  const emptyNote = (t) => `<div class="empty-note">${esc(t)}</div>`;

  /* ---------- ProgressRing: r=42, stroke=8 in a 100 box, 12 o'clock start, 1s ease-out ---------- */
  function progressRing(fraction, size, color, glow, inner) {
    const r = 42, c = +(2 * Math.PI * r).toFixed(2), f = Math.max(0, Math.min(1, fraction));
    const off = +(c * (1 - f)).toFixed(2);
    const arcs = f > 0 ? `
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${glow}" stroke-width="15.2" class="ring__fill" style="--c:${c};stroke-dashoffset:${off}"/>
      <circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="8" class="ring__fill" style="--c:${c};stroke-dashoffset:${off}"/>` : "";
    return `<div class="ring" style="width:${size}px;height:${size}px"><svg viewBox="0 0 100 100"><circle class="ring__track" cx="50" cy="50" r="${r}" fill="none" stroke-width="8"/>${arcs}</svg><div class="ring__label">${inner || ""}</div></div>`;
  }
  const bar = (frac, color, h) => `<div class="bar" ${h ? `style="height:${h}px"` : ""}><i style="width:${Math.round(Math.max(0, Math.min(1, frac)) * 100)}%;background:${color}"></i></div>`;

  /* ---------- TaskRow: today = toggle (+edit/delete when manage); future = edit/delete; past = read-only ---------- */
  function taskRow(t, status, manage, done) {
    const isDone = done !== undefined ? done : t.done;
    let actions = "";
    if (status !== "past") {
      if (manage) actions += `<button class="icon-tap icon-tap--edit" ${act("sheet:editTask:" + t.id)} aria-label="Edit task">${icon("edit")}</button>
        <button class="icon-tap icon-tap--delete" ${act("noop")} aria-label="Delete task">${icon("delete")}</button>`;
      if (status === "today") actions += `<button class="icon-tap" ${act("toggle:" + t.id)} aria-label="Toggle"><span class="check${isDone ? " is-on" : ""}">${isDone ? icon("check") : ""}</span></button>`;
    }
    return `<div class="task-row${isDone ? " is-done" : ""}" data-task="${t.id}">
      <div class="task-row__bar" style="background:${t.color}"></div>
      <div class="task-row__main"><div class="task-row__name">${esc(t.name)}</div>
        <div class="task-row__meta"><span class="task-row__cat" style="color:${t.color};background:${rgba(t.color, 0.125)}">${esc(t.category)}</span><span class="task-row__time">${esc(t.time)}</span></div></div>
      <div class="task-row__actions">${actions}</div></div>`;
  }

  const statCard = (ic, tint, label, value, vcolor) =>
    `<div class="stat-card"><span style="color:${tint}">${icon(ic)}</span><div class="stat-card__label">${label}</div><div class="stat-card__value" style="color:${vcolor}">${value}</div></div>`;
  const lifeStat = (l, v) => `<div class="life-stat"><div class="life-stat__label">${l}</div><div class="life-stat__value">${v}</div></div>`;
  const detailStat = (l, v, c) => `<div class="detail-stat"><div class="detail-stat__label">${l}</div><div class="detail-stat__value" style="color:${c}">${v}</div></div>`;
  const miniCard = (ic, title, value, sub) => `<div class="mini-card">${icon(ic)}<div class="mini-card__title">${title}</div><div class="mini-card__value">${value} Days</div><div class="mini-card__sub">${sub}</div></div>`;

  function awardCard(a) {
    return `<div class="award-card ${a.unlocked ? "is-unlocked" : "is-locked"}">
      <div class="hex"><div class="hex__ring"></div><div class="hex__bg"></div><div class="hex__icon"><img class="award-icon" src="${a.icon}" alt=""></div></div>
      <div class="award-card__name">${esc(a.name)}</div><div class="award-card__desc">${esc(a.desc)}</div></div>`;
  }

  function menuItem(ic, tint, label, value, a, cls, tag) {
    return `<button class="menu-item ${cls || ""}" ${act(a)}><div class="menu-item__main"><span style="color:${tint}">${icon(ic)}</span><span class="menu-item__label">${esc(label)}</span>${tag ? `<span class="studio-tag">${tag}</span>` : ""}</div><span class="menu-item__value">${esc(value)} &nbsp;›</span></button>`;
  }

  function sparkline(scores) {
    const W = 300, H = 60, pts = scores.map((s, i) => [i / (scores.length - 1) * W, H - s / 100 * H]);
    const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("");
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><defs><linearGradient id="spk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(30,139,255,.30)"/><stop offset="1" stop-color="rgba(30,139,255,0)"/></linearGradient></defs>
      <path d="M0,${H}${pts.map((p) => "L" + p[0].toFixed(1) + "," + p[1].toFixed(1)).join("")}L${W},${H}Z" fill="url(#spk)"/>
      <path d="${line}" fill="none" stroke="#1E8BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }

  /* ---------- overlays: sheet / dialog / toast ---------- */
  function sheet(inner, o) {
    o = o || {};
    return `<div class="scrim" ${act(o.locked ? "noop" : "close")}></div>
      <section class="sheet ${o.cls || ""}" role="dialog" aria-modal="true"><div class="sheet__handle"><i></i></div><div class="sheet__body ${o.body || ""}">${inner}</div></section>`;
  }
  function dialog(inner, o) {
    o = o || {};
    return `<div class="scrim scrim--dialog" ${act(o.locked ? "noop" : "close")}></div>
      <div class="dialog-wrap" ${act(o.locked ? "noop" : "close-bg")}><div class="dialog ${o.cls || ""}" role="alertdialog" aria-modal="true" ${act("stop")}>${inner}</div></div>`;
  }
  const textBtn = (t, color, a) => `<button class="text-btn" style="color:${color}" ${act(a)}>${esc(t)}</button>`;
  function toast(t) {
    return `<div class="toast toast--${t.type}" ${act("dismiss-toast")}><div class="toast__t">${esc(t.title)}</div>${t.message ? `<div class="toast__m">${esc(t.message)}</div>` : ""}</div>`;
  }

  /* ---------- report pieces ---------- */
  function gradeBox(g) { const c = D.GRADES[g]; return `<div class="grade-box" style="background:linear-gradient(135deg,${c.a},${c.b})">${g}</div>`; }

  /* ---------- Share card: canvas port of ShareCardRenderer.kt (1080 x 990) ---------- */
  function drawShareCard(canvas, d) {
    const W = 1080, H = 990, ctx = canvas.getContext("2d");
    canvas.width = W; canvas.height = H;
    const font = (size, weight) => `${weight} ${size}px Roboto, "Helvetica Neue", Arial, sans-serif`;
    const text = (s, x, y, color, size, bold, align) => { ctx.fillStyle = color; ctx.font = font(size, bold ? 700 : 500); ctx.textAlign = align; ctx.fillText(s, x, y); };
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#10131c"); g.addColorStop(1, "#080a0f");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const img = new Image(); img.onload = () => ctx.drawImage(img, 60, 52, 80, 80); img.src = ASSET.logo;
    text("ARISE", 160, 100, "#1e8bff", 44, true, "left");
    text(d.kind === "daily" ? "DAILY REPORT" : "WEEKLY REPORT", 160, 135, "#64748b", 22, true, "left");
    text(d.title, 70, 200, "#ffffff", 40, true, "left");
    const [g0, g1] = D.GRADES[d.grade].share, bx = W / 2, by = 350, br = 105;
    const bg = ctx.createLinearGradient(bx - br, by - br, bx + br, by + br); bg.addColorStop(0, g0); bg.addColorStop(1, g1);
    ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(bx - br, by - br, br * 2, br * 2, 34); ctx.fill();
    text(d.grade, bx, by + 35, "#ffffff", 100, true, "center");
    text(d.score + "%", bx, by + 175, "#00e5ff", 64, true, "center");
    text("Productivity Score", bx, by + 210, "#94a3b8", 24, true, "center");
    const sd = d.delta;
    text(`${sd >= 0 ? "▲" : "▼"} ${Math.abs(sd)}% ${d.kind === "daily" ? "vs yesterday" : "vs last week"}`, bx, by + 250, sd >= 0 ? "#00d282" : "#ff2a5f", 26, true, "center");
    const stats = [["Tasks", `${d.tasksDone}/${d.tasksTotal}`], ["Focus", D.hm(d.focusHours)], ["XP", "+" + d.xpEarned], ["Streak", d.streak + "d"]];
    const sy = by + 320, cw = W / 4;
    stats.forEach(([l, v], i) => { const cx = cw * i + cw / 2; text(v, cx, sy, "#fff", 36, true, "center"); text(l, cx, sy + 32, "#64748b", 20, true, "center"); });
    ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(70, sy + 65); ctx.lineTo(W - 70, sy + 65); ctx.stroke();
    ctx.font = font(25, 500); const lines = []; let line = "";
    d.msg.split(" ").forEach((w) => { const t = line ? line + " " + w : w; if (ctx.measureText(t).width > W - 160 && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line);
    const y0 = sy + 115 - ((lines.length - 1) * 32) / 2; lines.forEach((l, i) => text(l, bx, y0 + i * 32, "#e2e8f0", 25, false, "center"));
    text("Built with ARISE — Become Better Every Day.", bx, H - 45, "#64748b", 21, true, "center");
  }

  window.UI = {
    ASSET, esc, rgba, icon, logo, rankGlyph, act, appHeader, bottomNav, fab, dashCard, sectionHead, tabPill, pillRow, btn, emptyNote,
    progressRing, bar, taskRow, statCard, lifeStat, detailStat, miniCard, awardCard, menuItem, sparkline,
    sheet, dialog, textBtn, toast, gradeBox, drawShareCard
  };
})();
