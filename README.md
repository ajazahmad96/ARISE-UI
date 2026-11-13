# ARISE UI Studio

An independent, browser-based visual prototype of the ARISE Android app (HTML + CSS + vanilla JS).
It exists to **inspect and redesign** every screen before approved designs are rebuilt in Jetpack Compose.

* **No build step, no server, no framework.** Open `index.html`.
* **Isolated.** Everything lives in `ui-studio/`. No Kotlin, Gradle, Room, manifest, package name, CI or build file was touched.
* **UI only.** Sample data, in-memory state, resets on reload. Nothing is saved or sent anywhere.

## Folder structure

```
ui-studio/
├── index.html                 entry point (phone preview + desktop side panel)
├── css/style.css              design tokens (:root variables) + one block per component
├── js/
│   ├── data.js                sample data, rank table, achievement table, report samples
│   ├── components.js          reusable components (DashCard, TabPill, TaskRow, ProgressRing, sheets, dialogs…)
│   ├── screens.js             screens, overlays and the Screen Library registry
│   └── app.js                 state, rendering, prototype-only interactions
└── assets/
    ├── logo/                  arise-logo.svg, arise-app-icon.svg  (official masters, byte-identical copies)
    ├── ranks/                 rank-01-seed.svg … rank-11-pulse-master.svg
    ├── achievements/          first_step.svg … perfect_day.svg
    ├── icons/icons.js         UI icon paths (nav, edit, delete, share…)
    ├── illustrations/         empty – for your artwork
    ├── backgrounds/           empty – for your artwork
    └── fonts/                 empty – for your fonts
```

## Open it on Android

1. Copy the `ui-studio` folder to the phone (keep the folder intact: `index.html` needs `css/`, `js/`, `assets/` beside it).
2. Open a file manager that can launch HTML in a browser (Files by Google → *ui-studio* → `index.html` → *Open with Chrome*).
   If the file manager only previews text, open Chrome and go to `file:///storage/emulated/0/Download/ui-studio/index.html` (adjust the path).
3. If your phone blocks `file://`, run a tiny server from the folder instead, e.g. Termux: `pkg install python && cd ui-studio && python -m http.server 8080`, then open `http://localhost:8080`.

On a phone-sized screen the prototype fills the display; on a desktop it shows a phone frame.

## Screen Library

**Profile → Screen Library** (purple *STUDIO* tag). It lists every screen and state by category, with search:
Main Screens · Branding & Launch · Sheets & Secondary Screens · Reports · Report Grades · Dialogs & Popups · Notifications · Empty States · Loading States · Date & Filter Variants.
While previewing, a purple **Screen Library | Profile** pill at the top of the phone returns you.

### Add a screen later
1. Add a renderer to `SCREENS` (full view) or `OVERLAYS` (sheet/dialog) in `js/screens.js`.
2. Add its CSS in `css/style.css`.
3. Add one entry to `LIBRARY` in `js/screens.js`:
   ```js
   it("my-screen", "My Screen", "What it shows", "screen", S1("myScreen"))
   ```

## Replace assets

| What | How |
|---|---|
| Rank icon | Replace `assets/ranks/rank-NN-name.svg` (same name), or edit `RANK_ICON` in `js/data.js`. |
| Achievement icon | Replace `assets/achievements/<id>.svg`, or edit `icon` in `ACHIEVEMENTS` in `js/data.js`. |
| Navigation / UI icon | Edit its path in `assets/icons/icons.js`. |
| Avatar | Set `ASSET.avatar` at the top of `js/components.js`. |
| Illustration / background | Drop a file in `assets/illustrations/` or `assets/backgrounds/`; for a background set `--app-bg-image` in `css/style.css`. |
| Font | Drop a file in `assets/fonts/` and enable the `@font-face` block at the top of `css/style.css`. |
| Colours, radii, spacing | Edit the `:root` variables at the top of `css/style.css`. |

Rank glyphs appear coloured on the Dashboard and white on the Roadmap/Level dialog (CSS class `.rank-glyph--white`).
**Official logo and app icon are final** — do not edit `assets/logo/*`.

## Where the UI came from (original files inspected)

`ui/theme/{Color,Theme,Type}.kt` · `ui/AscendRoot.kt` · `ui/navigation/{Destinations,AscendNavHost}.kt` ·
`ui/components/{AppHeader,AscendIcons,AscendWidgets,BottomNavBar,LevelNotifyDialog,ProgressRing,RankRoadmapSheet,TaskRow,TaskSheet,ToastHost}.kt` ·
`ui/{dashboard,tasks,audit,stats,achievements,calendar,profile}/*Screen.kt` ·
`ui/reports/{ReportsSheets,ReportModels}.kt` · `ui/settings/SettingsSheets.kt` ·
`ui/viewmodel/{ScreenStates,MoreScreenStates,AppViewModel}.kt` · `domain/model/{Rank,Achievement}.kt` ·
`domain/engine/{ReportEngine,XpEngine}.kt` · `utils/{ShareCardRenderer,DateUtils,FormatUtils}.kt` ·
`res/drawable/arise_logo.xml` · `res/values/{colors,strings}.xml` · `branding/*.svg` · `README.md`.

## Known limitations

* Fonts: the Android app uses the system sans-serif (Roboto); the studio does the same, so glyph metrics differ slightly on non-Android devices.
* Icons: the Android app uses Material icons; the studio uses the same Material paths. The Profile menu uses SVG icons instead of the original emoji (⭐ ✨ 📄 📊 ◎) so they can be replaced and tinted. The greeting 👋 and About-sheet emoji are original text and kept.
* Sheets use the Material 3 look (28 dp top corners, drag handle) but are not draggable.
* Calendar “has data” dots, task/audit lists, stats, ranks and reports are fixed sample data; only toggling a task, adding an audit row, filters, month paging and date selection respond.
* Share Card Preview is a canvas port of `ShareCardRenderer.kt`; the real Android share sheet is not simulated.
* No onboarding screen is included because the Android app has none. The Settings screen of the brief maps to *System Data*.
* Keyboard / IME behaviour of text fields is not simulated.
