/*
 * ARISE UI Studio — app shell: state, rendering and prototype-only interactions.
 * Nothing here talks to the Android app, a database or any server.
 * State lives in one in-memory object and resets on reload.
 */
(function () {
  "use strict";
  const D = window.ARISE_DATA, U = window.UI;
  const { SCREENS, OVERLAYS, LIBRARY, libraryList, T } = window.ARISE_SCREENS;

  const S = {
    screen: "dashboard", opts: {}, overlays: [], toasts: [], studio: false,
    selected: D.ymd(D.today), tasksFilter: "all", awardsFilter: "all", notifFilter: "all", notifRead: {},
    calOffset: 0, done: {}, libQuery: ""
  };
  const $ = (id) => document.getElementById(id);
  const els = { app: $("app"), overlays: $("overlays"), toasts: $("toasts"), pill: $("pill") };

  /* ---------- rendering ---------- */
  function renderApp(animate) {
    const def = SCREENS[S.screen] || SCREENS.dashboard;
    const r = def(S, S.opts || {});
    const prev = els.app.querySelector(".view"), keep = !animate && prev ? prev.scrollTop : 0;
    els.app.innerHTML = U.appHeader(r.title) +
      `<div class="view-host"><main class="view${r.blank ? " view--blank" : ""}" ${animate ? "" : 'style="animation:none"'}>${r.html}</main></div>` +
      U.bottomNav(r.nav) + (r.fab ? U.fab() : "");
    if (keep) els.app.querySelector(".view").scrollTop = keep;
    renderPill();
  }
  function renderOverlays() {
    els.overlays.innerHTML = S.overlays.map((o) => (OVERLAYS[o.type] ? OVERLAYS[o.type](S, o.props || {}) : "")).join("");
    const top = S.overlays[S.overlays.length - 1];
    if (top && top.type === "shareCard") { const c = $("share-canvas"); if (c) U.drawShareCard(c, top.props.report); }
    renderPill();
    startSplash();
  }
  function renderToasts() {
    els.toasts.innerHTML = S.toasts.map(U.toast).join("");
  }
  function renderPill() {
    const base = S.screen !== "profile" && S.screen !== "library";
    const show = S.studio && S.screen !== "library" && (base || S.overlays.length > 0);
    els.pill.innerHTML = show ? `<div class="studio-pill" role="toolbar" aria-label="UI Studio">
        <button data-act="nav:library">${U.icon("apps")}Screen Library</button><button data-act="nav:profile">Profile</button></div>` : "";
  }
  const renderAll = (animate) => { renderApp(animate); renderOverlays(); renderToasts(); };

  /* ---------- state helpers ---------- */
  function go(screen, opts) {
    S.screen = screen; S.opts = opts || {}; S.overlays = [];
    if (screen === "library" || screen === "profile") S.selected = D.ymd(D.today);
    renderApp(true); renderOverlays();
    const v = els.app.querySelector(".view"); if (v) v.scrollTop = 0;
  }
  const push = (type, props) => { S.overlays.push({ type, props: props || {} }); renderOverlays(); };
  const pop = () => { const top = S.overlays[S.overlays.length - 1]; if (!top) return; if (top.type === "levelNotify") return; S.overlays.pop(); renderOverlays(); };
  function toast(t, hold) {
    const item = Object.assign({}, t); S.toasts.push(item); renderToasts();
    if (!hold) setTimeout(() => { const i = S.toasts.indexOf(item); if (i > -1) { S.toasts.splice(i, 1); renderToasts(); } }, 3000);   // original: auto-dismiss after 3 s
  }

  function openLibraryItem(id) {
    let item = null; LIBRARY.forEach((c) => c.items.forEach((i) => { if (i.id === id) item = i; }));
    if (!item) return;
    const sp = item.spec;
    S.screen = sp.screen; S.opts = sp.opts || {};
    S.selected = D.ymd(D.addDays(D.today, sp.selected || 0));
    S.overlays = (sp.overlays || []).map((o) => ({ type: o.type, props: o.props || {} }));
    S.toasts = (sp.toasts || []).map((t) => Object.assign({}, t));
    S.studio = true;
    renderAll(true);
    const v = els.app.querySelector(".view"); if (v) v.scrollTop = 0;
  }

  function reportFor(kind, id) {
    const item = D.REPORT_LISTS[kind].find((i) => i.id === id) || D.REPORT_LISTS[kind][0];
    return kind === "daily" ? D.dailyReport(item.grade, { id: item.id, title: D.nice(D.parse(item.id)) }) : D.weeklyReport(item.grade, { id: item.id, title: item.sub });
  }

  /* ---------- actions (data-act="name:arg:arg") ---------- */
  const ACTIONS = {
    noop() {}, stop() {},
    nav: (a) => go(a[0]),
    close: pop, "close-bg": pop,
    "dismiss-toast": (a, el) => { const i = [...els.toasts.children].indexOf(el.closest(".toast")); if (i > -1) { S.toasts.splice(i, 1); renderToasts(); } },
    sheet(a) {
      switch (a[0]) {
        case "rank": return push("rankRoadmap", { level: D.PROFILE.level });
        case "newTask": return push("taskSheet", {});
        case "editTask": return push("taskSheet", { editing: +a[1] });
        case "editProfile": return push("profileEdit");
        case "about": return push("about");
        case "system": return push("systemData");
        case "reports": return push("reportsList", { kind: a[1] });
        case "share": { const top = S.overlays[S.overlays.length - 1]; return push("shareCard", { report: top.props.report }); }
      }
    },
    dialog(a) { if (a[0] === "reset") push("resetConfirm"); },
    toast(a) {
      if (a[0] === "export") toast(T.bak);
      if (a[0] === "import") toast(T.rst);
      if (a[0] === "reset") { S.overlays = []; renderOverlays(); toast(T.rs2); }
    },
    report: (a) => push("reportDetail", { report: reportFor(a[0], a.slice(1).join(":")) }),
    toggle(a) { const id = +a[0], t = [...D.TASKS, ...D.PAST_TASKS, ...D.FUTURE_TASKS].find((x) => x.id === id); S.done[id] = !(S.done[id] !== undefined ? S.done[id] : t.done); renderApp(false); },
    tasksF(a) { S.tasksFilter = a.join(":"); renderApp(false); },
    awardsF(a) { S.awardsFilter = a[0]; renderApp(false); },
    notifF(a) { S.notifFilter = a[0]; renderApp(false); },
    notif(a) { S.notifRead[+a[0]] = true; renderApp(false); },
    cal(a) { S.calOffset += +a[0]; renderApp(false); },
    date(a) { S.selected = a[0]; go("dashboard"); },
    lib: (a) => openLibraryItem(a[0])
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const parts = el.dataset.act.split(":"), fn = ACTIONS[parts[0]];
    if (fn) fn(parts.slice(1), el);
  });
  document.addEventListener("input", (e) => {
    if (e.target.id === "lib-q") { S.libQuery = e.target.value; $("lib-list").innerHTML = libraryList(S.libQuery); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") pop(); });

  /* ---------- splash (official; markup in screens.js, animation timeline in style.css) ---------- */
  const SPLASH_BAR = [   // simulated loading: irregular steps, visual only (from splash.html)
    { transform: "scaleX(0)", offset: 0, easing: "ease-out" }, { transform: "scaleX(.16)", offset: .14, easing: "ease-in-out" },
    { transform: "scaleX(.34)", offset: .30, easing: "ease-in-out" }, { transform: "scaleX(.52)", offset: .46, easing: "ease-in-out" },
    { transform: "scaleX(.60)", offset: .62, easing: "ease-in-out" }, { transform: "scaleX(.87)", offset: .80, easing: "ease-in-out" },
    { transform: "scaleX(.94)", offset: .90, easing: "ease-out" }, { transform: "scaleX(1)", offset: 1 }
  ];
  function startSplash() {
    const st = els.overlays.querySelector(".splash-stage"); if (!st) return;
    const fill = st.querySelector(".sp-fill"), sp = st.querySelector(".splash");
    void st.offsetWidth;                                                   // reflow: clean start of every CSS animation
    st.classList.add("run");
    fill.animate(SPLASH_BAR, { duration: 4000, delay: 800, fill: "both" });
    sp.addEventListener("animationend", (e) => {                           // end of the fade-out = hand-off to the app
      if (e.target !== sp || e.animationName !== "sp-out") return;
      S.overlays = S.overlays.filter((o) => o.type !== "splash"); renderOverlays();
    });
  }

  /* ---------- boot ---------- */
  S.overlays = [{ type: "splash", props: {} }];
  renderAll(false);

  window.ARISE_STUDIO = { state: S, go, openLibraryItem };                    // handy from the browser console
})();
