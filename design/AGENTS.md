# AGENTS.md

## Architecture

Desktop app — Wails v3 (Go backend + Vue 3 frontend):

```
Go binary (main.go + capsule.go)
  ├── Wails v3 application framework
  ├── CapsuleService (SQLite CRUD, exposed as Wails Service)
  └── Embedded frontend assets (//go:embed frontend/dist)

Vue 3 frontend (frontend/src/)
  ├── Communicates via window.wails.Call.ByName(...)
  ├── Auto-generated bindings in frontend/bindings/
  └── Pinia stores, Vue Router (hash history), GSAP animations
```

- The Go binary is the **entire application**. It embeds `frontend/dist` at compile time via `//go:embed`.
- There is **no separate HTTP server**, no Electron, no preload scripts, no ipcMain/ipcRenderer.
- IPC happens through Wails v3's built-in service binding: Go methods are auto-exposed to the frontend.
- The old Electron + Go HTTP REST architecture is archived in git history — no longer active.

## Dev commands (run from repo root)

| Command | What it does |
|---|---|
| `wails3 dev -config ./build/config.yml` | Start Wails dev mode (frontend Vite + Go backend, hot reload) |
| `task dev` | Same as above (Taskfile shortcut) |
| `cd frontend && pnpm dev` | Vite dev server only (frontend standalone) |
| `pnpm dev:frontend` | Root shortcut for frontend dev |
| `pnpm build:frontend` | Production frontend build (`cd frontend && pnpm build`) |
| `task build` | Platform-specific production build (Go cross-compile + embedded frontend) |

Wails v3 ties the Vite dev server (port 5173) and Go backend together — a single `wails3 dev` command replaces the old `pnpm dev` (which ran 3 separate processes).

## Build config

`build/config.yml` defines the Wails v3 build:

```yaml
version: 3
name: "taskapsule"
binaryName: "taskapsule"
assetDir: "frontend/dist"
devServerUrl: "http://localhost:5173"
frontend:
  dir: "frontend"
  install: [pnpm install]
  build: [pnpm run build]
  dev: [pnpm run dev]
```

`Taskfile.yml` at the repo root orchestrates platform-specific builds via `build/linux/Taskfile.yml`, `build/windows/Taskfile.yml`, `build/darwin/Taskfile.yml`. Each platform task:
- Runs `go mod tidy`
- Builds frontend (`pnpm run build`)
- Generates icons
- Runs `go build` with platform-specific `GOOS`/`GOARCH` and production flags (`-trimpath -ldflags="-w -s"`)

## Project layout

```
tasKapsule/
├── main.go                     # Wails v3 entry point: app creation, window, asset embedding
├── capsule.go                  # CapsuleService: ServiceStartup/Shutdown, CRUD methods
├── go.mod / go.sum             # Go module (wails/v3 + modernc.org/sqlite)
├── wails.json                  # Wails v3 project metadata
├── build/
│   ├── config.yml              # Wails v3 build configuration
│   ├── Taskfile.yml            # Common build tasks (go mod tidy, bindings, icons)
│   ├── linux/Taskfile.yml      # Linux build
│   ├── windows/Taskfile.yml    # Windows build
│   ├── darwin/Taskfile.yml     # macOS build
│   ├── appicon.png / icon.png / icon.ico / icon.icns
├── frontend/                   # Vue 3 + Vite
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── bindings/               # Wails v3 auto-generated TypeScript bindings
│   │   └── github.com/comardom/taskapsule/backend/
│   │       ├── models.ts       # Capsule, CapsulesResponse classes
│   │       ├── capsuleservice.ts  # CreateCapsule, GetCapsules, etc.
│   │       └── index.ts
│   ├── src/
│   │   ├── main.ts             # Vue app entry
│   │   ├── App.vue
│   │   ├── components/
│   │   │   ├── Calendar/       # Calendar.vue, CalendarBody.vue, CalendarBodyTransition.vue, Cell.vue, Clock.vue, WeatherWidget.vue, CitySelector.vue, calendarAnimations.ts
│   │   │   ├── CapsuleShelf/   # CapsuleShelf.vue, Capsule.vue, CreateCapsuleModal.vue, ConfirmDialog.vue, ImportExportDialog.vue
│   │   │   ├── Centro.vue, Placeholder.vue, LoadingScreen.vue, LoadingRectangle.vue, CopyrightFooter.vue
│   │   │   ├── TestPage.vue, TestPage1.vue, EgoMe.vue, GlassTest.vue, NewGlassTest.vue
│   │   ├── composables/
│   │   │   ├── useCalendarAction.ts   # Module-level ref event bus (Calendar ↔ CapsuleShelf)
│   │   │   └── useWeather.ts          # Open-Meteo weather API
│   │   ├── data/
│   │   │   ├── nameOfDaysOfWeek.ts    # 曜日 arrays (Zh/Jp/En)
│   │   │   └── timezones.ts          # 126 IANA timezone options
│   │   ├── globalCSS/
│   │   │   ├── baseReset.css
│   │   │   ├── themeVariables.css     # Full light/dark theme (~50 custom properties)
│   │   │   ├── baseNiceStyle.css
│   │   │   └── fonts.css
│   │   ├── router/index.ts            # Hash-based routing
│   │   ├── stores/
│   │   │   ├── capsule.ts             # Capsule CRUD state (Options API)
│   │   │   ├── theme.ts               # Dark/light mode (Composition API)
│   │   │   ├── locale.ts              # Language + timezone
│   │   │   └── font.ts                # Body font selection
│   │   └── utils/
│   │       ├── apiService.ts          # Typed wrapper around auto-generated bindings
│   │       ├── loadingPageController.ts  # Backend health check + loading screen
│   │       └── TimeManager.ts         # Timezone-aware date math (all UTC)
│   └── dist/                          # Built frontend (go:embed target)
├── license/
├── design/                            # Design documents, issues tracker
└── package.json                       # Root: scripts only (dev:frontend, build:frontend)
```

## IPC Communication

**Wails v3 Service Bindings:**

1. Go backend exposes `CapsuleService` as a Wails Service (registered in `main.go:17-18`)
2. Wails auto-generates TypeScript bindings into `frontend/bindings/` via `wails3 generate bindings`
3. Frontend calls Go methods through generated typed functions:
   ```ts
   import { GetCapsules, CreateCapsule } from '../../bindings/github.com/comardom/taskapsule/backend/capsuleservice'
   ```
4. `apiService.ts` wraps these generated bindings with a convenient `capsuleApi` object

**Module-level Event Bus:**

`useCalendarAction.ts` provides shared `ref`s for Calendar ↔ CapsuleShelf communication:
- `pendingCreateDate` — right-click calendar date → CapsuleShelf opens create modal
- `navigateToDate` — double-click calendar date → CapsuleShelf switches to dual-column view

## Key conventions

- **Package manager**: pnpm (not npm/yarn)
- **Go**: 1.26.4. Entry point: `main.go`. Build: `go build -o taskapsule`. Run dev: `wails3 dev`.
- **Database**: SQLite at `~/.taskapsule/data/app.db`. WAL mode enabled. Indices on `classification`, `is_with_schedule`, `schedule_start_at`.
- **Path alias**: `@/` maps to `frontend/src/` (configured in `vite.config.ts` and `tsconfig.app.json`).
- **No linter or formatter config exists yet.** No test scripts.
- **Capsule type**: Single source of truth is `frontend/bindings/.../backend/models.ts` (auto-generated from Go struct). Other modules import `Capsule` from `@/utils/apiService.ts`.

## Critical gotchas

### CSS viewport units use logical-axis suffixes

The codebase uses `dvb`/`dvi`/`svb`/`svi` (CSS Viewport Units Level 3). These are valid:
- `dvb` = dynamic viewport **b**lock size, `dvi` = dynamic viewport **i**nline size
- `svb` = small viewport block size, `svi` = small viewport inline size

They work in Chromium 108+. Do NOT replace them with `dvh`/`dvw`.

### Vue Router uses hash history

`router/index.ts` uses `createWebHashHistory`. Wails loads via embedded file server — hash-based routing is required. Do not change to `createWebHistory`.

### TimeManager: all date arithmetic uses UTC

`TimeManager.ts` uses `Date.UTC()` + `getUTC*()` for all calendar math (day-of-week, days-in-month, etc.). This avoids timezone offset errors when `this.timeZone` differs from the system local timezone. When adding new date calculation methods, follow the same pattern — never use bare `new Date(year, month, day)` without `Date.UTC`.

### Cell.vue glass effect via CSS variables

`Cell.vue` renders a glassmorphism `<div class="flex-block">` using four CSS variables from `themeVariables.css`:

| Variable | CSS property | Light value | Dark value |
|---|---|---|---|
| `--cell-backdrop-filter` | `backdrop-filter` | `blur(0.04rem)` | `blur(0.06rem)` |
| `--cell-border` | `border` | `0.125rem solid rgba(255,255,255,0.15)` | `0.125rem solid rgba(255,255,255,0.05)` |
| `--cell-bg` | `background` | `linear-gradient(180deg, rgba(255,255,255,0.25), transparent)` | `linear-gradient(180deg, rgba(255,255,255,0.07), transparent)` |
| `--cell-box-shadow` | `box-shadow` | `0 1.1rem 1.25rem rgba(0,0,0,0.2)` | `0 0.95rem 1.5rem rgba(0,0,0,0.7)` |

No `::after` pseudo-element.

### Theme: index.html and store use the same localStorage key

Both `index.html` (inline anti-FOUC script) and `stores/theme.ts` read/write key `'app-theme'` with `'dark'` fallback. Keep them in sync.

### Native widget dark mode via `color-scheme`

`themeVariables.css` sets `color-scheme: dark` on `[data-theme='dark']`. This tells Chromium to render native widgets (scrollbars, `<select>` dropdowns, `<input type="date">` panels) in dark mode automatically. Do not remove `color-scheme: dark`.

### `--this-month-height-in-dvi` CSS variable false positive

This variable is set at runtime via JS (`style.setProperty()` in `CalendarBody.vue`), not declared in any `.css` file. VS Code / CSS linters will flag it as unresolved — this is a **false positive**. To silence it, use the `var()` fallback syntax:

```css
block-size: var(--this-month-height-in-dvi, auto);
```

The `auto` fallback also prevents height collapse before `onMounted` fires.

### Timezone data lives in `frontend/src/data/timezones.ts`

Calendar.vue imports `timeZoneOptions` for the `<select>` in `.calendar-tail`. The `v-for` uses `:key="\`tz-${index}\`"` to avoid Vue's duplicate-key warnings.

### Day name arrays

`nameOfDaysOfWeek.ts` exports `Zh曜日`, `Jp曜日`, `En曜日`. `'Thur'` in `En曜日` is intentional (author preference), not a typo.

### TypeScript bindings are auto-generated

`frontend/bindings/` is generated by `wails3 generate bindings` — do NOT manually edit these files. They are regenerated whenever Go service methods or models change.

### Capsule type: single source of truth

The canonical `Capsule` type is the auto-generated class in `bindings/.../backend/models.ts`. `apiService.ts` re-exports it. All other modules (`stores/capsule.ts`, components) import from `apiService.ts`. Do not define a separate `Capsule` interface.

### Loading screen polls backend health

`loadingPageController.ts` polls `capsuleApi.getAllPaginated(1, 1)` at 500ms intervals (max 10 retries = 5 seconds) to confirm the Wails backend is ready. On failure, displays an error message and stops polling.

### Input validation

The Go backend (`capsule.go`) validates `classification` (must be one of: note, urgent, favourite, sms, inspiration) and `scheduleStatus` (must be one of: pending, executing, completed, cancelled, blocked) before insert/update. Unknown values are rejected.

## i18n & timezone

### locale store (`stores/locale.ts`)

Composition API style. Persists to localStorage. Fields:

| Field | Values | Key |
|---|---|---|
| `locale` | `'zh'` / `'ja'` / `'en'` | `'locale'` |
| `timeZone` | IANA timezone string | `'timezone'` |

### How Calendar components use it

```
Calendar.vue (layout shell)
├── Clock.vue             ← receives displayYear/displayMonth as props
├── CalendarBody.vue      ← receives all props, owns grid computation
│   ├── localeStore.locale   → 曜日缩写 computed → selects Zh曜日/Jp曜日/En曜日
│   ├── localeStore.timeZone → watch → timeManager.setTimeZone() + refreshCalendar()
│   └── timeManager.get此月天数ByYM() / get曜日ByYMD() → grid data computed
└── calendar-tail         ← two <select> dropdowns for timezone + locale
```

- **Always access `localeStore.locale` directly** (via Pinia reactive proxy). Do NOT destructure with `const { locale } = useLocaleStore()` — loses reactivity.
- CalendarBody refreshes every 60s (`setInterval` in `onMounted`, cleared in `onUnmounted`). This handles midnight rollover.

### Language / timezone UI

```html
<select v-model="localeStore.timeZone"> ... </select>  <!-- IANA timezone list -->
<select v-model="localeStore.locale"> ... </select>    <!-- zh/ja/en -->
```

Both are bound directly to the Pinia store via `v-model`. Changes persist to localStorage automatically via `watchEffect`.

## Calendar color scheme

Color spec lives at `design/color.md`. The palette uses a "fabric texture" aesthetic — subtle alternating color pairs for a barely-perceptible linen-like grain.

### Cell highlighting (selected + today)

CalendarBody uses `selectedDay` + `selectedMonth` (absolute month number, 0-indexed) to track the selected cell.

#### Three visual states

| State | Class | Appearance |
|---|---|---|
| Selected (any region) | `cell-blue` | Blue gradient (light) / pink gradient (dark) + white text |
| Today, another day selected | `cell-gray-with-shadow` | Inset shadow (depressed) + dimmed text |
| Default (not selected, not today) | (none) | Normal cell background |

#### Cross-month corner fallback (`watch(monthKey)`)

When the user scrolls to a new month and the current highlight would be invisible in the new grid, it falls back to the grid corner determined by scroll direction:
- Scroll forward (future) → top-left corner
- Scroll backward (past) → bottom-right corner

#### Interaction split

| Event | Function | Effect |
|---|---|---|
| single click | `singleClick(day, month)` | Sets `selectedDay`, `selectedMonth`, `capsuleStore.selectedDate` |
| double click | `doubleClick(day, month)` | Same + `setNavigateToDate()` → CapsuleShelf switches to dual + scroll |
| right click | `handleRightClick(day, month, $event)` | Opens create modal with pre-filled date |

### Theme variable inventory

Calendar-specific variables (from `themeVariables.css`):

| Variable | Light | Dark | Used by |
|---|---|---|---|
| `--calendar-frame-bg` | `rgb(241 222 222 / 0.78)` | `rgb(25 39 50 / 0.51)` | `.calendar` panel background |
| `--calendar-cell-bg` | `#F3F3F3` | `#2C2C32` | `Cell.thisMonth` background |
| `--calendar-cell-bg-alt` | `#F2F2F2` | `#2a2c30` | Fabric grain alternate |
| `--calendar-cell-text` | `#666666` | `#B0B0B8` | This-month text color |
| `--calendar-cell-other-bg` | `#E1E1E1` | `#1E1E22` | Non-month cell background |
| `--calendar-cell-other-text` | `#FFFFFF` | `#3E3E46` | Non-month text (deliberately low contrast) |
| `--calendar-today-bg-start` | `rgb(113 152 240 / 0.92)` | `rgb(244 114 182 / 0.73)` | Today gradient start |
| `--calendar-today-bg-end` | `rgb(78 120 232 / 0.87)` | `rgb(219 39 119 / 0.61)` | Today gradient end |
| `--calendar-today-text` | `#FFFFFF` | `#FFFFFF` | Today text color |
| `--calendar-today-unselected-text` | `rgb(136 131 131 / 0.7)` | `rgb(170 170 170 / 0.6)` | Today text when another day selected |
| `--calendar-grid-line` | `#DADBDF` | `#3A3A40` | Cell border color |

Note: Dark mode today uses **pink** gradient (not blue).

## Pinia stores

| Store | Style | Persisted keys | Purpose |
|---|---|---|---|
| `theme` | Composition | `'app-theme'` | Dark/light mode |
| `capsule` | Options | — | Capsule CRUD state, pagination |
| `locale` | Composition | `'locale'`, `'timezone'` | Language + timezone |
| `font` | Composition | `'font-body'` | Body font selection |

### Capsule store: `_resolveFullyLoaded` array pattern

`waitFullyLoaded()` returns a Promise that resolves after background pagination completes. Uses an **array** to store all callers' resolvers, preventing permanent hangs when `navigateToDate` fires in rapid succession:

```ts
_resolveFullyLoaded: [] as (() => void)[],

async waitFullyLoaded(): Promise<void> {
  if (this.fullyLoaded) return;
  return new Promise(resolve => {
    this._resolveFullyLoaded.push(resolve);
  });
},

// On load complete:
for (const resolve of this._resolveFullyLoaded) resolve();
this._resolveFullyLoaded = [];
```

## Database

- **Engine**: SQLite via `modernc.org/sqlite` (pure Go, no CGO)
- **Location**: `~/.taskapsule/data/app.db`
- **Schema**: Defined in `capsule.go:92-107` (CREATE TABLE IF NOT EXISTS)
- **Pragmas**: WAL mode, busy_timeout=5000
- **Indices**: `classification`, `is_with_schedule`, `schedule_start_at`
- **COUNT cache**: Total row count cached for 30 seconds to avoid full-table scan on every paginated request
- **Migrations**: No migration system yet — schema changes require manual ALTER TABLE

### Capsule table schema

| Column | Type | Default | Notes |
|---|---|---|---|
| `id` | INTEGER | auto | PRIMARY KEY AUTOINCREMENT |
| `created_at` | TEXT | `datetime('now','localtime')` | Server-generated |
| `content_text` | TEXT | `''` | Main content |
| `audio_path` | TEXT | NULL | Audio file path |
| `attachment_paths` | TEXT | NULL | JSON array of file paths |
| `classification` | TEXT | `'note'` | note/urgent/favourite/sms/inspiration |
| `is_with_schedule` | INTEGER | 0 | 0=no schedule, 1=has schedule |
| `schedule_icon` | TEXT | NULL | |
| `schedule_content_text` | TEXT | NULL | |
| `schedule_start_at` | TEXT | NULL | YYYY-MM-DD HH:mm:ss |
| `schedule_end_at` | TEXT | NULL | YYYY-MM-DD HH:mm:ss |
| `schedule_status` | TEXT | NULL | pending/executing/completed/cancelled/blocked |
| `schedule_deadline` | TEXT | NULL | YYYY-MM-DD HH:mm:ss |
| `alarm_clocks` | TEXT | NULL | JSON array |

## Known issues

`design/issues.md` contains the full known-issues list organized by P0–P3 priority. Round 8 (2026-06-19) is the Wails v3 comprehensive scan.
