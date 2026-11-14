/*
 * ARISE UI Studio — sample data.
 * Static, made-up values shaped like the real app's data (see domain/model/*.kt).
 * Nothing here is calculated or saved: edit freely to preview other states.
 * Rank and achievement tables are copied unchanged from the Android app.
 */
(function () {
  "use strict";

  /* ---------- date helpers (UI formatting only) ---------- */
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pad = (n) => String(n).padStart(2, "0");
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; };
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const nice = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;      // "Nov 12, 2026"
  const shortMD = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;                       // "Nov 5"
  const time12 = (h, m) => `${pad(((h + 11) % 12) + 1)}:${pad(m)} ${h < 12 ? "AM" : "PM"}`;
  const hm = (hours) => `${Math.floor(hours)}h ${Math.round((hours % 1) * 60)}m`;        // FormatUtils.formatHM

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  /* ---------- ranks (unchanged from Rank.kt) + icon asset per rank ---------- */
  const RANKS = [
    { min: 1,   max: 2,    name: "Seed",         color: "#4ADE80", glow: "rgba(74,222,128,.30)",  glyph: "star" },
    { min: 3,   max: 6,    name: "Sprout",       color: "#2DD4BF", glow: "rgba(45,212,191,.30)",  glyph: "star" },
    { min: 7,   max: 12,   name: "Builder",      color: "#3B82F6", glow: "rgba(59,130,246,.40)",  glyph: "shield" },
    { min: 13,  max: 20,   name: "Achiever",     color: "#8B5CF6", glow: "rgba(139,92,246,.40)",  glyph: "trophy" },
    { min: 21,  max: 30,   name: "Performer",    color: "#D946EF", glow: "rgba(217,70,239,.40)",  glyph: "target" },
    { min: 31,  max: 42,   name: "Expert",       color: "#F43F5E", glow: "rgba(244,63,94,.40)",   glyph: "flame" },
    { min: 43,  max: 56,   name: "Leader",       color: "#F59E0B", glow: "rgba(245,158,11,.50)",  glyph: "trophy" },
    { min: 57,  max: 72,   name: "Elite",        color: "#FACC15", glow: "rgba(250,204,21,.50)",  glyph: "star" },
    { min: 73,  max: 90,   name: "Master",       color: "#FF5500", glow: "rgba(255,85,0,.60)",    glyph: "flame" },
    { min: 91,  max: 110,  name: "Legend",       color: "#00E5FF", glow: "rgba(0,229,255,.60)",   glyph: "shield" },
    { min: 111, max: 9999, name: "Pulse Master", color: "#FFFFFF", glow: "rgba(255,255,255,.80)", glyph: "trophy" }
  ];
  /* >>> RANK ICON ASSETS: swap a file in assets/ranks/ or change a path here. <<< */
  const RANK_ICON = [
    "assets/ranks/rank-01-seed.svg", "assets/ranks/rank-02-sprout.svg", "assets/ranks/rank-03-builder.svg",
    "assets/ranks/rank-04-achiever.svg", "assets/ranks/rank-05-performer.svg", "assets/ranks/rank-06-expert.svg",
    "assets/ranks/rank-07-leader.svg", "assets/ranks/rank-08-elite.svg", "assets/ranks/rank-09-master.svg",
    "assets/ranks/rank-10-legend.svg", "assets/ranks/rank-11-pulse-master.svg"
  ];
  RANKS.forEach((r, i) => { r.icon = RANK_ICON[i]; });
  const rankFor = (level) => RANKS.find((r) => level >= r.min && level <= r.max) || RANKS[RANKS.length - 1];

  /* ---------- achievements (unchanged ids / names / descriptions) ---------- */
  /* >>> ACHIEVEMENT ICON ASSETS: swap a file in assets/achievements/ or change `icon`. <<< */
  const ACHIEVEMENTS = [
    { id: "first_step",   name: "First Step",      desc: "Complete your first task",       icon: "assets/achievements/first_step.svg",   unlocked: true },
    { id: "ten_done",     name: "Getting Started", desc: "Complete 10 tasks total",        icon: "assets/achievements/ten_done.svg",     unlocked: true },
    { id: "fifty_done",   name: "Task Builder",    desc: "Complete 50 tasks total",        icon: "assets/achievements/fifty_done.svg",   unlocked: true },
    { id: "hundred_done", name: "Task Master",     desc: "Complete 100 tasks total",       icon: "assets/achievements/hundred_done.svg", unlocked: false },
    { id: "streak3",      name: "On a Roll",       desc: "Reach a 3-day streak",           icon: "assets/achievements/streak3.svg",      unlocked: true },
    { id: "streak7",      name: "Week Warrior",    desc: "Reach a 7-day streak",           icon: "assets/achievements/streak7.svg",      unlocked: false },
    { id: "level5",       name: "Rising Star",     desc: "Reach Level 5",                  icon: "assets/achievements/level5.svg",       unlocked: true },
    { id: "perfect_day",  name: "Perfect Day",     desc: "Complete every task in a day",   icon: "assets/achievements/perfect_day.svg",  unlocked: false }
  ];

  /* ---------- profile / progress ---------- */
  const PROFILE = {
    name: "Alex", level: 9, xpInto: 320, xpForNext: 500,
    totalXp: 2520, daysActive: 28, tasksDone: 74, lifeFocus: "96h",
    streak: 3, longestStreak: 5, version: "1.0.0"
  };

  /* ---------- tasks (today) ---------- */
  const TASKS = [
    { id: 1, name: "Morning Workout",         category: "Health",      color: "#00D282", time: "06:30 AM", done: true },
    { id: 2, name: "Deep Work: Project Plan", category: "Work",        color: "#1E8BFF", time: "09:00 AM", done: true },
    { id: 3, name: "Code Review",             category: "Work",        color: "#1E8BFF", time: "11:30 AM", done: false },
    { id: 4, name: "Read 20 pages",           category: "Learning",    color: "#F59E0B", time: "08:00 PM", done: false },
    { id: 5, name: "Meditate 10 min",         category: "Mindfulness", color: "#8B5CF6", time: "09:30 PM", done: false }
  ];
  const FUTURE_TASKS = [
    { id: 11, name: "Weekly Planning",  category: "Work",     color: "#1E8BFF", time: "09:00 AM", done: false },
    { id: 12, name: "Long Run",         category: "Health",   color: "#00D282", time: "07:00 AM", done: false }
  ];
  const PAST_TASKS = [
    { id: 21, name: "Morning Workout",  category: "Health",   color: "#00D282", time: "06:30 AM", done: true },
    { id: 22, name: "Write Report",     category: "Work",     color: "#1E8BFF", time: "10:00 AM", done: true },
    { id: 23, name: "Read 20 pages",    category: "Learning", color: "#F59E0B", time: "08:00 PM", done: false }
  ];

  /* ---------- notifications (demo only: no service, no backend) ---------- */
  const NOTIFICATIONS = [
    { id: 1, kind: "task",     title: "Task Reminder",        text: "Code Review is scheduled for 11:30 AM.",                        minsAgo: 12,   unread: true },
    { id: 2, kind: "upcoming", title: "Upcoming Task",        text: "Read 20 pages starts at 8:00 PM today.",                        minsAgo: 55,   unread: true },
    { id: 3, kind: "progress", title: "Daily Progress",       text: "2 of 5 tasks done and +120 XP so far. Keep going!",             minsAgo: 180,  unread: true },
    { id: 4, kind: "streak",   title: "3-Day Streak",         text: "You are on a 3-day streak. Complete a task today to keep it.",  minsAgo: 300,  unread: false },
    { id: 5, kind: "award",    title: "Achievement Unlocked", text: "On a Roll: reach a 3-day streak.",                              minsAgo: 1500, unread: false },
    { id: 6, kind: "progress", title: "Yesterday's Summary",  text: "You finished yesterday with a B grade (74%).",                  minsAgo: 1700, unread: false }
  ];

  /* ---------- calendar: which day numbers show a "has data" dot ---------- */
  const CAL_DATA_DAYS = [1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 14, 15, 17, 19, 20, 22, 24, 26, 27, 29];

  /* ---------- reports ---------- */
  const GRADES = {
    S: { min: 95, msg: "Masterclass execution. Absolute perfection.",             a: "#FACC15", b: "#F59E0B", share: ["#facc15", "#f59e0b"] },
    A: { min: 85, msg: "Excellent momentum and solid focus.",                    a: "#00D282", b: "#059669", share: ["#00d282", "#059669"] },
    B: { min: 70, msg: "Good consistency. A productive day overall.",            a: "#1E8BFF", b: "#0EA5E9", share: ["#00e5ff", "#0ea5e9"] },
    C: { min: 50, msg: "Average day. Needs slightly better prioritization.",     a: "#0564F4", b: "#4F46E5", share: ["#8c52ff", "#4f46e5"] },
    D: { min: 30, msg: "Distractions took over. Regain control tomorrow.",       a: "#FFAA00", b: "#EA580C", share: ["#ffaa00", "#ea580c"] },
    F: { min: 0,  msg: "System drift detected. Reset and start fresh.",          a: "#FF2A5F", b: "#BE123C", share: ["#ff2a5f", "#be123c"] }
  };
  const SCORE_FOR = { S: 97, A: 88, B: 74, C: 56, D: 38, F: 17 };

  const yesterday = addDays(today, -1);
  const lockedAt = (d) => `${d.getMonth() + 1}/${d.getDate()}/${String(d.getFullYear()).slice(2)} ${time12(0, 0)}`;

  function dailyReport(grade, over) {
    const score = SCORE_FOR[grade];
    const tasksTotal = 5, tasksDone = Math.max(0, Math.min(5, Math.round(score / 20)));
    const base = {
      kind: "daily", id: ymd(yesterday), title: nice(yesterday), locked: lockedAt(today),
      grade, score, msg: GRADES[grade].msg,
      insight: "Based on your logs, " + (tasksDone < tasksTotal ? "incomplete tasks dragged your score down." : "your execution was highly disciplined."),
      delta: grade === "F" || grade === "D" ? -12 : 6,
      tasksDone, tasksTotal, focusHours: grade === "F" ? 0.5 : 3.5, xpEarned: tasksDone * 20, xpPenalty: tasksTotal - tasksDone > 2 ? 30 : 0, streak: grade === "F" ? 0 : 3,
      categories: [
        { name: "Work", done: Math.min(2, tasksDone), total: 2, color: "#1E8BFF" },
        { name: "Health", done: Math.min(1, Math.max(0, tasksDone - 2)), total: 1, color: "#00D282" },
        { name: "Learning", done: Math.min(1, Math.max(0, tasksDone - 3)), total: 1, color: "#F59E0B" },
        { name: "Mindfulness", done: Math.min(1, Math.max(0, tasksDone - 4)), total: 1, color: "#8B5CF6" }
      ]
    };
    return Object.assign(base, over || {});
  }
  function weeklyReport(grade, over) {
    const score = SCORE_FOR[grade];
    const sat = addDays(today, -((today.getDay() + 1) % 7 || 7));         // last Saturday
    const start = addDays(sat, -6);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const wiggle = [-9, 4, -14, 7, 2, -6, 10];
    const base = {
      kind: "weekly", id: "w_" + ymd(start), title: `${shortMD(start)} – ${shortMD(sat)}`, locked: lockedAt(addDays(sat, 1)),
      grade, score, msg: GRADES[grade].msg,
      insight: "Weekly macro-analysis: " + (score > 75 ? "You maintained solid altitude throughout the week." : "Consistency fluctuated. Identify the weak days and adjust your systems."),
      delta: grade === "F" || grade === "D" ? -8 : 5,
      tasksDone: Math.round(score / 100 * 32), tasksTotal: 32, focusHours: 21.5, xpEarned: Math.round(score / 100 * 640), xpPenalty: 40, streak: 5,
      categories: [],
      breakdown: days.map((d, i) => ({ day: d, score: Math.max(0, Math.min(100, score + wiggle[i])) }))
    };
    return Object.assign(base, over || {});
  }

  const REPORT_LISTS = {
    daily: [
      { id: ymd(addDays(today, -1)), title: "Yesterday",                       sub: ymd(addDays(today, -1)), grade: "B" },
      { id: ymd(addDays(today, -2)), title: nice(addDays(today, -2)),          sub: ymd(addDays(today, -2)), grade: "A" },
      { id: ymd(addDays(today, -3)), title: nice(addDays(today, -3)),          sub: ymd(addDays(today, -3)), grade: "C" },
      { id: ymd(addDays(today, -4)), title: nice(addDays(today, -4)),          sub: ymd(addDays(today, -4)), grade: "B" }
    ],
    weekly: (() => {
      const sat = addDays(today, -((today.getDay() + 1) % 7 || 7));
      const mk = (end, last, grade) => { const s = addDays(end, -6); return { id: "w_" + ymd(s), title: last ? "Last Week" : "Week starting " + ymd(s), sub: `${shortMD(s)} – ${shortMD(end)}`, grade }; };
      return [mk(sat, true, "A"), mk(addDays(sat, -7), false, "B"), mk(addDays(sat, -14), false, "C")];
    })()
  };

  const IMPORT_NOTES = [
    "2 tasks had no category and were set to \"General\".",
    "1 audit entry with an invalid type was kept as \"routine\".",
    "Achievement \"legacy_badge\" is not recognised and was set aside."
  ];

  window.ARISE_DATA = {
    today, yesterday, ymd, addDays, parse, nice, shortMD, time12, hm, pad, MONTHS,
    RANKS, rankFor, ACHIEVEMENTS, PROFILE, TASKS, FUTURE_TASKS, PAST_TASKS, NOTIFICATIONS,
    CAL_DATA_DAYS, GRADES, SCORE_FOR, dailyReport, weeklyReport, REPORT_LISTS, IMPORT_NOTES,
    LEVEL_NOTICE: { upMsg: "Keep the momentum going. Great job!", downMsg: "Consistency is key. Don't give up, push harder tomorrow!" }
  };
})();
