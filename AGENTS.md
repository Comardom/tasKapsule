<!-- noinspection ALL -->

# AGENTS.md

## Architecture

Three-tier desktop app — Electron is a shell, not an integrated runtime:

```
Electron main (electron/)  →  spawns Spring Boot JAR as child process (port 9999)
                           →  serves Vue SPA via loadFile()
Vue renderer (frontend/)   →  talks to backend via REST (axios → localhost:9999)
                           →  talks to main via IPC (file dialogs, JVM status)
Backend (backend/)         →  Spring Boot 4 / Kotlin / SQLite
```

- Electron **does not serve** the frontend via HTTP. It loads `frontend/dist/index.html` directly.
- The backend is **not a standalone service** — it lives only as long as Electron runs.

## Dev commands (run from repo root)

| Command | What it does |
|---|---|
| `pnpm dev` | Start all 3 in parallel (frontend :9998, backend :9999, Electron) |
| `pnpm dev:frontend` | Vite dev server only |
| `pnpm dev:backend` | `./gradlew bootRun` (or `gradlew.bat` on Windows) |
| `pnpm dev:electron` | `electron .` in development mode |
| `pnpm dist` | Production build: frontend → backend → electron TS → electron-builder |
| `pnpm dist:win` | Same, but uses `gradlew.bat` for backend |

Ports are hard-wired: frontend dev on **9998**, backend on **9999**. Do not change without updating `vite.config.ts`, `apiService.ts`, `backendHealthCheck.ts`, and `electron/main.ts`. These are intentionally fixed for a self-contained desktop app.

## Critical gotchas

### CSS viewport units use logical-axis suffixes

The codebase uses `dvb`/`dvi`/`svb`/`svi` (CSS Viewport Units Level 3). These are valid:
- `dvb` = dynamic viewport **b**lock size, `dvi` = dynamic viewport **i**nline size
- `svb` = small viewport block size, `svi` = small viewport inline size

They work in Chromium 108+, which the bundled Electron provides. Do NOT replace them with `dvh`/`dvw` — the `b`/`i` forms are deliberately chosen to match the codebase's use of CSS logical properties.

### Vue Router uses hash history

`router/index.ts` uses `createWebHashHistory`. Electron loads via `file://` without a web server — hash-based routing is required. Do not change to `createWebHistory`.

### Backend status relay via stdout regex

The backend logs lines like `[STAGE] KEY: message` to stdout. Electron's `main.ts` parses this with a regex and sends the message to the renderer via IPC (`jvm-status-update`). The path is:

```
Backend stdout → main.ts regex → preload.ts (contextBridge) → loadingPageController.ts → LoadingScreen.vue
```

If you change the `[STAGE]` log format in the Kotlin controllers, the loading screen breaks.

### Backend port cleanup on startup

`electron/main.ts` calls `killPort(9999)` before spawning the JVM. If you change the backend port, you must update the kill port logic.

### TimeManager: all date arithmetic uses UTC

`TimeManager.ts` uses `Date.UTC()` + `getUTC*()` for all calendar math (day-of-week, days-in-month, etc.). This avoids timezone offset errors when `this.timeZone` differs from the system local timezone. When adding new date calculation methods, follow the same pattern — never use bare `new Date(year, month, day)` without `Date.UTC`.

### Theme: index.html and store use the same localStorage key

Both `index.html` (inline anti-FOUC script) and `stores/theme.ts` read/write key `'app-theme'`. Keep them in sync.

### Native widget dark mode via `color-scheme`

`themeVariables.css` sets `color-scheme: dark` on `[data-theme='dark']`. This tells Chromium to render native widgets (scrollbars, `<select>` dropdowns, `<input type="date">` panels) in dark mode automatically. It only affects unstyled browser chrome — any CSS you've explicitly set (`background-color`, `color`, `border`) takes priority and is not overridden. Do not remove `color-scheme: dark`.

### `--this-month-height-in-dvi` CSS variable false positive

This variable is set at runtime via JS (`style.setProperty()` in `Calendar.vue:68`), not declared in any `.css` file. VS Code / CSS linters will flag it as unresolved — this is a **false positive**. To silence it, use the `var()` fallback syntax:

```css
block-size: var(--this-month-height-in-dvi, auto);
```

The `auto` fallback also prevents height collapse before `onMounted` fires.

### Loading screen has timeout ✅ fixed

`loadingPageController.ts` now caps retries at `MAX_RETRIES = 120` (2 minutes). On timeout, sets `loadingText` to an error message and stops polling. No changes needed to consumer components.

### Dev mode backend management ✅ fixed

`electron/main.ts` lines 58–62: when `!isProd` (development), Electron creates the window immediately and returns — skipping `killPort(9999)` and `spawn()`. The backend is managed independently by `./gradlew bootRun` via `dev:backend`. No double-backend conflict.

### Backend: Capsule status enum ✅ fixed

`Capsule.kt` now uses `enum class CapsuleStatus { PENDING, COMPLETED }` with `@Enumerated(EnumType.STRING)` on the `status` field. The database stores the same `"PENDING"`/`"COMPLETED"` strings — no data migration needed. Compile-time enforcement prevents typos.

### Timezone data lives in `frontend/src/data/timezones.ts`

Calendar.vue imports `timeZoneOptions` from the shared data file. The `v-for` uses `:key="\`tz-${index}\`"` to avoid Vue's duplicate-key warnings from overlapping city-name and UTC-offset entries.

### Backend: Jackson module coordinate

Line 38 of `backend/build.gradle.kts`: the Jackson Kotlin module is declared as `tools.jackson.module:jackson-module-kotlin`. While it currently resolves (version 3.1.0), the canonical namespace is `com.fasterxml.jackson.module`. If the build ever fails to resolve it, change to `com.fasterxml.jackson.module:jackson-module-kotlin`.

### Backend: Production startup guards on electron/main.ts ✅ fixed

Lines 87–126 of `electron/main.ts`: in production mode, `javaPath`/`jarPath` checks now `return` after `dialog.showErrorBox`, preventing the `ENOENT` crash that previously occurred when spawn() ran with invalid paths.

### Backend: CapsuleController exception logging ✅ fixed

`CapsuleController.kt` now logs caught exceptions via `logger.error(...)` before returning the empty list. The log output appears in Electron's stderr capture, making date-parse failures and DB errors visible during debugging.

### TimeManager: `??` not `||` for fallback values ✅ fixed

`TimeManager.ts` line 42–47 uses `??` (nullish coalescing) instead of `||`. The `||` operator treats `0` as falsy, which could cause month/day/hour/minute/second values of `0` to incorrectly trigger fallbacks. `??` only triggers on `null`/`undefined`.

### apiService uses Capsule types ✅ fixed

`apiService.ts` imports `Capsule` interface from `stores/capsule.ts`. `getByDate` returns `Capsule[]`, `create` accepts `Omit<Capsule, 'id' | 'createdAt'>`. No `any` types remain.

### Router has 404 catch-all ✅ fixed

`router/index.ts` includes `{ path: '/:pathMatch(.*)*', redirect: '/' }` as the last route. Any unrecognized hash path redirects to the home page.

### Backend: CapsuleRepository null-safe sorting ✅ fixed

`findByTargetDateOrderByStartTimeAsc` uses a `@Query` with `CASE WHEN c.startTime IS NULL THEN 1 ELSE 0 END` to push null `startTime` values to the end of the list. SQLite defaults to `NULLS FIRST`, which would put untimed capsules above timed ones.

### Backend: Capsule CRUD now includes PUT endpoint ✅ fixed

`CapsuleController.kt` has a `@PutMapping("/{id}")` that uses `findById` + field-by-field assignment on the managed entity, avoiding `.copy()` (Capsule is not a data class). Hibernate generates an `UPDATE` from the dirty-checked fields.

### Backend: `targetDate` indexed ✅ fixed

`Capsule.kt` `@Table` annotation includes `indexes = [Index(name = "idx_capsules_target_date", columnList = "targetDate")]`.

### Backend: basic integration test ✅ fixed

`BackendApplicationTests.kt` injects `CapsuleRepository` via `@Autowired` and asserts it's not null after context loads.

### Backend: DatabaseConfig slimmed down ✅ fixed

`DatabaseConfig.kt` no longer attempts `mkdirs()` — the directory is pre-created by `BackendApplication.main()` before Spring starts. Only `[STAGE]` progress logging remains.

## Issue tracker

`design/issues.md` contains the full known-issues list organized by P0–P3 priority. Rounds 1–3 complete. Round 4 (2026-05-13) complete — 3 fixed, 5 intentionally skipped.

## Project layout

```
tasKapsule/
├── electron/           # Electron main + preload (TS → CommonJS → dist/)
│   ├── main.ts         # Window creation, JVM spawn, IPC handlers
│   ├── preload.ts      # contextBridge: exposes window.api + window.electronAPI
│   └── killPort.ts     # Port cleanup utility
├── frontend/           # Vue 3 + Vite (port 9998 in dev)
│   └── src/
│       ├── components/ # Vue SFCs; Calendar/, LoadingScreen, ClockVibe, etc.
│       ├── stores/     # Pinia: theme.ts, capsule.ts, locale.ts
│       ├── router/     # vue-router (hash history)
│       ├── utils/      # apiService, healthCheck, loadingPageController, TimeManager
│       └── globalCSS/  # baseReset, themeVariables, baseNiceStyle
├── backend/            # Spring Boot Kotlin (Gradle, port 9999)
│   └── src/main/kotlin/xyz/taskapsule/backend/
│       ├── controller/ # HomeController (/health), CapsuleController (REST CRUD)
│       ├── entity/     # Capsule (JPA), CapsuleRepository
│       └── config/     # DatabaseConfig ([STAGE] logging)
├── jre/                # Bundled JRE per platform (win_x64, mac_arm, linux_x64)
└── design/             # Design specs
    ├── color.md        # Calendar color reference (fabric-texture palette)
    ├── issues.md       # Known issues tracker (P0–P3 priority)
    └── mvp-plan.md     # MVP Phase 1: skeleton (Centro layout, calendar click, CapsuleShelf)
```

## Key conventions

- **Package manager**: pnpm (not npm/yarn). Root orchestration uses `npm-run-all`.
- **Node version**: lts/krypton (v24.14.0), managed via nvm.
- **Java**: JDK 21 from Adoptium. Managed via sdkman (macOS/Linux) or JAVA_HOME (Windows).
- **Database**: SQLite at `~/.taskapsule/data/app.db`. The `BackendApplication.kt` pre-creates the directory. Logs at `~/.taskapsule/logs/backend.log`.
- **Gradle wrapper**: `./gradlew` (Linux/macOS) or `gradlew.bat` (Windows) — always use the wrapper.
- **Electron TS**: Compiles to CommonJS, output in `electron/dist/`. Entry point: `electron/dist/main.js` (set in root `package.json` main field).
- **Path alias**: `@/` maps to `frontend/src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- **No linter or formatter config exists yet.** No test scripts.
- **Production JAR name**: Gradle `bootJar` names the output `backend-server.jar`. Electron-builder renames it to `backend.jar` in extraResources.

## i18n & timezone

### locale store (`stores/locale.ts`)

Composition API style. Persists to localStorage. Fields:

| Field | Values | Key |
|---|---|---|
| `locale` | `'zh'` / `'ja'` / `'en'` | `'locale'` |
| `timeZone` | IANA timezone string | `'timezone'` |

### How Calendar.vue uses it

```
localeStore.timeZone ──→ TimeManager constructor ──→ getFormatted() uses target timezone
localeStore.locale   ──→ 曜日缩写 computed ──→ selects Zh曜日/Jp曜日/En曜日
watch(timeZone)      ──→ timeManager.setTimeZone() + refreshCalendar()
```

- **Always access `localeStore.locale` directly** (via Pinia reactive proxy). Do NOT destructure with `const { locale } = useLocaleStore()` — loses reactivity.
- Calendar refreshes every 60s (`setInterval` in `onMounted`, cleared in `onUnmounted`). This handles midnight rollover.
- TimeManager's `getFormatted()` uses `Intl.DateTimeFormat('zh-CN', ...)` with numeric-only options — the `'zh-CN'` locale has zero effect on output, no need to i18n it.

### Day name arrays

`nameOfDaysOfWeek.ts` exports `Zh曜日`, `Jp曜日`, `En曜日`. `'Thur'` in `En曜日` is intentional (author preference), not a typo.

### Language / timezone UI

Calendar.vue's `.calendar-header` contains two `<select>` dropdowns:

```html
<select v-model="localeStore.timeZone"> ... </select>  <!-- IANA timezone list -->
<select v-model="localeStore.locale"> ... </select>    <!-- zh/ja/en -->
```

Both are bound directly to the Pinia store via `v-model`. Changes persist to localStorage automatically via `watchEffect`.

## Calendar color scheme

Color spec lives at `design/color.md`. The palette uses a "fabric texture" (布料感) aesthetic — subtle alternating color pairs for a barely-perceptible linen-like grain.

### Today cell highlighting

Today's cell adds a dynamic CSS class in the `v-for` loop:

```html
<!-- Calendar.vue template: "thisMonth" cells only -->
<Cell :class="{ today: day此月 === 今天几号 }" ...>
```

Styles use the `--calendar-today-*` variables (see below). `今天几号` is kept up-to-date by the 60s refresh loop.

### Theme variable inventory

Existing globals (unchanged): `--theme-bg-stripe-1`, `--theme-bg-stripe-2`, `--stripe-width`, `--theme-color`, `--theme-link`, `--theme-bg-button`, `--theme-bg-button-hover`, `--theme-border-button`, `--theme-color-button`, `--selection-bg`, `--selection-text`.

Calendar-specific variables (from `design/color.md`, to be added to `themeVariables.css`):

| Variable | Light | Dark | Used by |
|---|---|---|---|
| `--calendar-frame-bg` | `#F0F0F0` | `#1C1C20` | `.calendar` panel background |
| `--calendar-frame-bg-alt` | `#EDEDED` | `#1A1A1E` | Optional fabric grain |
| `--calendar-cell-bg` | `#F3F3F3` | `#2C2C32` | `Cell.thisMonth` background |
| `--calendar-cell-bg-alt` | `#F2F2F2` | `#2A2A30` | Fabric grain alternate |
| `--calendar-cell-text` | `#666666` | `#B0B0B8` | This-month text color |
| `--calendar-cell-text-small` | `#C8CBD2` | `#6A6A72` | This-month small text |
| `--calendar-cell-other-bg` | `#E1E1E1` | `#1E1E22` | Non-month cell background |
| `--calendar-cell-other-bg-alt` | `#E3E3E3` | `#202024` | Fabric grain alternate |
| `--calendar-cell-other-text` | `#FFFFFF` | `#3E3E46` | Non-month text (deliberately low contrast) |
| `--calendar-cell-other-text-small` | `#FEFEFE` | `#34343C` | Non-month small text |
| `--calendar-today-bg-start` | `#7198F0` | `#5B7CE0` | Today gradient start |
| `--calendar-today-bg-mid` | `#628CED` | `#4A6AD5` | Today gradient mid |
| `--calendar-today-bg-end` | `#4E78E8` | `#3D5AC8` | Today gradient end |
| `--calendar-today-text` | `#FFFFFF` | `#FFFFFF` | Today text color |
| `--calendar-grid-line` | `#DADBDF` | `#3A3A40` | Cell border color |

Variables `--camera-border` and `--camera-corner` in `themeVariables.css` are unused — safe to delete.

## Pinia stores

| Store | Style | Persisted keys | Purpose |
|---|---|---|---|
| `theme` | Composition | `'app-theme'` | Dark/light mode |
| `capsule` | Options | — | Capsule CRUD state |
| `locale` | Composition | `'locale'`, `'timezone'` | Language + timezone |

## Known stub / deprecated components

- `CapsuleShelf/Capsule.vue` — single capsule card component (new).
- `CapsuleShelf/CapsuleShelf.vue` — capsule list view (in progress).
- `EgoMe.vue` — empty stub, meant for personal profile page.
- `ClockVibe.vue` — deprecated, will be removed.
- `TestPage.vue` / `TestPage1.vue` — near-duplicate test pages.
- `TestPinia.vue` — capsule store integration test page.
