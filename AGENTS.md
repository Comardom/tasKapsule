<!-- noinspection ALL -->

# AGENTS.md

## Architecture

Desktop app — Electron shell + Go backend (replaced Kotlin/Spring Boot):

```
Electron main (electron/)  →  spawns Go binary as child process (port 9999)
                           →  serves Vue SPA via loadFile()
Vue renderer (frontend/)   →  talks to backend via REST (axios → localhost:9999)
                           →  talks to main via IPC (file dialogs, status updates)
Backend (backend/)         →  Go / net/http / SQLite
```

- Electron **does not serve** the frontend via HTTP. It loads `frontend/dist/index.html` directly.
- The backend is a single Go binary — `go build -o taskapsule-server` produces one file, no JRE needed.
- The Kotlin/Spring Boot version is archived at `github.com/Comardom/tasKapsule-kotlin`.

## Dev commands (run from repo root)

| Command | What it does |
|---|---|
| `pnpm dev` | Start all 3 in parallel (frontend :9998, backend :9999, Electron) |
| `pnpm dev:frontend` | Vite dev server only |
| `pnpm dev:backend` | `cd backend && go run .` |
| `pnpm dev:electron` | `electron .` in development mode |
| `pnpm build:backend` | `cd backend && go build -o taskapsule-server` |
| `pnpm dist` | Production build: frontend → backend (go build) → electron TS → electron-builder |

Ports are hard-wired: frontend dev on **9998**, backend on **9999**.

## Critical gotchas

### CSS viewport units use logical-axis suffixes

The codebase uses `dvb`/`dvi`/`svb`/`svi` (CSS Viewport Units Level 3). These are valid:
- `dvb` = dynamic viewport **b**lock size, `dvi` = dynamic viewport **i**nline size
- `svb` = small viewport block size, `svi` = small viewport inline size

They work in Chromium 108+, which the bundled Electron provides. Do NOT replace them with `dvh`/`dvw` — the `b`/`i` forms are deliberately chosen to match the codebase's use of CSS logical properties.

### Vue Router uses hash history

`router/index.ts` uses `createWebHashHistory`. Electron loads via `file://` without a web server — hash-based routing is required. Do not change to `createWebHistory`.

### Backend status relay via stdout ✅ fixed

`electron/main.ts` stdout block 已改为简单日志输出（A 方案），不再监听 `[STAGE]`。Go 启动极快（毫秒级），loading screen 仍存在但无后端状态输入，后续可考虑简化或移除。

### Go backend reference

`design/go-setup.md` covers the Go module setup, core concept mappings (Kotlin→Go), common commands, and the current database schema. Go backend is a single `main.go` + `capsule.go` + `go.mod` — no framework, no JVM.

### TimeManager: all date arithmetic uses UTC

`TimeManager.ts` uses `Date.UTC()` + `getUTC*()` for all calendar math (day-of-week, days-in-month, etc.). This avoids timezone offset errors when `this.timeZone` differs from the system local timezone. When adding new date calculation methods, follow the same pattern — never use bare `new Date(year, month, day)` without `Date.UTC`.

### Go binary name: `taskapsule-server`

The Go backend compiles to `taskapsule-server` (not `backend-server`). Update any reference in:
- `package.json` scripts (`build:backend`)
- `electron/main.ts` (spawn path)
- `electron-builder` extraResources config

### Go dev: `go run .`

Always use `go run .` (not `go run main.go capsule.go`) — Go automatically includes all `.go` files in the current package.

### Calendar cell color animation toggle

Calendar cells have smooth 0.25s transitions on `background-color`, `box-shadow`, and `opacity` (via `::after` pseudo-element overlay in `Cell.vue`). A toggle button in `.calendar-header` switches `--cell-transition-duration` between `0.25s` and `0s` via CSS class `.no-animate` on `.calendar`. The duration is read by `Cell.vue` via `var(--cell-transition-duration, 0.25s)`.

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

`electron/main.ts` lines 58–62: when `!isProd` (development), Electron creates the window immediately and returns — skipping `killPort(9999)` and `spawn()`. The backend is managed independently via `dev:backend` (`go run .`). No double-backend conflict.

### Production: Go binary replaces Java JAR ✅ fixed

`electron/main.ts` production spawns `taskapsule-server` directly. Single existence check + `chmod` — no JRE, no JAR.

### Timezone data lives in `frontend/src/data/timezones.ts`

Calendar.vue imports `timeZoneOptions` from the shared data file. The `v-for` uses `:key="\`tz-${index}\`"` to avoid Vue's duplicate-key warnings from overlapping city-name and UTC-offset entries.

### Backend: Production startup guards on electron/main.ts ✅ fixed

`electron/main.ts` now spawns `taskapsule-server` with existence check + `chmod`. All Java/JRE/JAR logic removed.

### TimeManager: `??` not `||` for fallback values ✅ fixed

`TimeManager.ts` line 42–47 uses `??` (nullish coalescing) instead of `||`. The `||` operator treats `0` as falsy, which could cause month/day/hour/minute/second values of `0` to incorrectly trigger fallbacks. `??` only triggers on `null`/`undefined`.

### apiService uses Capsule types ✅ fixed

`apiService.ts` imports `Capsule` interface from `stores/capsule.ts`. `getByDate` returns `Capsule[]`, `create` accepts `Omit<Capsule, 'id' | 'createdAt'>`. No `any` types remain.

### Router has 404 catch-all ✅ fixed

`router/index.ts` includes `{ path: '/:pathMatch(.*)*', redirect: '/' }` as the last route. Any unrecognized hash path redirects to the home page.

## Issue tracker

`design/issues.md` contains the full known-issues list organized by P0–P3 priority. Rounds 1–5 complete. Rounds 1–4 were from the Kotlin era; Round 5 covered the Go migration (all resolved). The next round should scan the Go backend for fresh issues.

## Project layout

```
tasKapsule/
├── electron/           # Electron main + preload (TS → CommonJS → dist/)
│   ├── main.ts         # Window creation, Go binary spawn, IPC handlers
│   ├── preload.ts      # contextBridge: exposes window.api + window.electronAPI
│   └── killPort.ts     # Port cleanup utility
├── frontend/           # Vue 3 + Vite (port 9998 in dev)
│   └── src/
│       ├── components/ # Vue SFCs; Calendar/, LoadingScreen, ClockVibe, etc.
│       ├── stores/     # Pinia: theme.ts, capsule.ts, locale.ts
│       ├── router/     # vue-router (hash history)
│       ├── utils/      # apiService, healthCheck, loadingPageController, TimeManager
│       └── globalCSS/  # baseReset, themeVariables, baseNiceStyle
├── backend/            # Go (port 9999)
│   ├── main.go         # Entry point + initDB + HTTP routes + CORS
│   ├── capsule.go      # Capsule struct + 4 CRUD handlers + helpers
│   ├── schema.sql      # IDE SQL dialect reference (not used at runtime)
│   ├── go.mod          # Module declaration + deps
│   └── go.sum          # Dependency checksums (auto-generated)
├── legacy-backend-kotlin/  # Archived Kotlin/Spring Boot backend (kept for reference)
├── design/             # Design specs
    ├── color.md        # Calendar color reference (fabric-texture palette)
    ├── issues.md       # Known issues tracker (P0–P3 priority)
    └── mvp-plan.md     # MVP Phase 1: skeleton (Centro layout, calendar click, CapsuleShelf)
```

## Key conventions

- **Package manager**: pnpm (not npm/yarn). Root orchestration uses `npm-run-all`.
- **Node version**: lts/krypton (v24.14.0), managed via nvm.
- **Go**: 1.26.2. Entry point: `backend/main.go`. Build: `go build -o taskapsule-server`. Run dev: `cd backend && go run .`. Go reference: `design/go-setup.md`.
- **Database**: SQLite at `~/.taskapsule/data/app.db`. Logs at `~/.taskapsule/logs/backend.log`.
- **Electron TS**: Compiles to CommonJS, output in `electron/dist/`. Entry point: `electron/dist/main.js` (set in root `package.json` main field).
- **Path alias**: `@/` maps to `frontend/src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- **No linter or formatter config exists yet.** No test scripts.
- **Production binary name**: `taskapsule-server`. Go produces a single self-contained binary, no JRE needed. `package.json` extraResources already references `backend/taskapsule-server`.

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

- `CapsuleShelf/Capsule.vue` — single capsule card with independent expand/collapse toggle (local `expanded` ref), rounded rect design, text ellipsis via `inline-size: 100%` + `text-overflow: ellipsis`. ✅ done.
- `CapsuleShelf/CapsuleShelf.vue` — renders capsule list from `store.byCreatedAt`, no date filter, no event chain. ✅ done.
- `EgoMe.vue` — empty stub, meant for personal profile page.
- `ClockVibe.vue` — deprecated, will be removed.
- `TestPage.vue` / `TestPage1.vue` — near-duplicate test pages.
- `TestPinia.vue` — capsule store integration test page.

## Centro state

`Centro.vue` is clean — just `<Calendar />` + `<CapsuleShelf />`. No event handling, no selected capsule state. Capsule toggle is self-contained in `Capsule.vue` via local `expanded` ref.
