# Sitebuilder UI Polish — Project TODO

> **This file is the single source of truth for all UI enhancement sessions.**
> Every building, fixing, or auditing agent must read this first to stay aligned.
> Backend (`apps/sitebuilder/`) is out of scope — changes live only in `apps/sitebuilder/web/`.

---

## Project Context

**What is this?**
A domain-agnostic portal builder built on Frappe (Python/Mariadb backend) with a React + Vite frontend. The Frappe backend dynamically drives the navigation (Work Panels), page content (Site Pages + Site Blocks), user auth, and notifications mostly using frappe-react-sdk. The frontend (`web/`) is the only concern for this engagement.

**Tech Stack (frontend only):**
| Concern | Stack |
|---------|-------|
| Framework | React 19 + Vite 6 |
| Routing | React Router DOM v7 |
| Backend bridge | frappe-react-sdk ^1.11.0 |
| Styling | Tailwind CSS v4 (OKLCH tokens) |
| Components | shadcn/ui (full set), Radix UI |
| Animation | framer-motion ^12 + motion ^12 (both installed) |
| Charts | recharts 3.8 (installed, unused in UI so far) |
| Fonts | Space Grotesk Variable (sans) + Geist Mono Variable (mono) |
| Theming | next-themes + shadcn, light default, dark mode supported |

**Colour identity:**

- Primary: `oklch(0.555 0.163 48.998)` (amber-orange) light / `oklch(0.473 0.137 46.201)` dark
- Sidebar primary: `oklch(0.666 0.179 58.318)` light / `oklch(0.769 0.188 70.08)` dark
- Both light and dark are already wired in `src/index.css` with a full OKLCH token set

**Entry points:**
| Path | Purpose |
|------|---------|
| `src/App.tsx` | Root — FrappeProvider, ThemeProvider, top-level route split |
| `src/layouts/dashboard-layout.tsx` | Portal shell — SidebarProvider + AppSidebar + DashboardHeader |
| `src/portal/layout/MainContent.tsx` | Portal route tree — all `/portal/*` sub-pages |
| `src/portal/layout/AppSidebar.tsx` | shadcn Sidebar with dynamic Work Panels |
| `src/portal/layout/DashboardHeader.tsx` | Top header — sidebar trigger, breadcrumbs, search, notifications, theme toggle |
| `src/portal/nav/NavMain.tsx` | Dynamic nav from Frappe `Work Panel` doctype |
| `src/pages/portal/PageBuilder.tsx` | Visual page block editor |

---

## UI Enhancement Scope

**What "enhancement" means here:** No new features or logic changes. Pure visual polish and UX quality lift across:

1. **Visual richness** — move from plain functional UI to a crafted, modern feel (better card treatment, welcome banner, metric animations)
2. **Motion & transitions** — add page-level entry animations and view transition continuity
3. **Typography hierarchy** — tighten heading/label/value sizing consistency
4. **Component consistency** — unify hover states, active states, icon sizing, border treatment across all views
5. **Empty & loading states** — make skeletons and empty states feel intentional, not accidental
6. **Dark mode fidelity** — verify every surface looks correct in dark mode

**What is explicitly out of scope:**

- Backend logic or Frappe doctypes
- New features (new routes, new data models)
- Auth flow rewrites (minor polish only)
- The public site section (`src/site/`)

---

## Demo Dashboard Insights

**Reference:** `/Users/hekam/Downloads/sidebarshell-dashboard-layout/`

A polished single-page demo with an amber primary palette, dual-panel sidebar, and rich framer-motion animations. Key patterns to borrow:

### 1. Layout Pattern — Dual-Panel Sidebar ⚠️ (See Open Decisions)

The demo uses two separate panels:

- **IconStrip** (70px fixed): Brand icon at top, icon-only nav buttons with hover tooltip bubbles (scale + opacity), dark-mode toggle, user initials avatar at bottom. (e.g parent modules)
- **NavPanel** (210px, collapsible via `motion.div`): Contextual secondary content that changes per active tab — quick anchor links, mini stats, live status indicators. (e.g child items/tables/doctypes of a module)

The sitebuilder currently uses a single shadcn `<Sidebar collapsible="icon">`. Adopting the dual-panel pattern is a significant structural refactor. **See Open Decisions #1.**

### 2. Welcome Banner

`DashboardView.tsx:63` — Radial gradient card (`bg-radial from-primary/[0.08] to-transparent`), inline badge chip, personalised h1 with user name highlighted in `text-primary`, muted description with bold inline count. Decorative background icon (`opacity-5`).

### 3. Animated Metric Cards

`DashboardView.tsx:88` — `rounded-xl border border-border bg-card p-5` + `hover:border-primary/20 hover:shadow-xs`. Icon wrapped in `rounded-lg bg-primary/10 p-2 text-primary group-hover:scale-105`. Value in `text-2xl font-bold`. Trend line with semantic colour (emerald = up, amber = caution). Stagger animation via `containerVariants` / `cardVariants` (spring).

### 4. View Transition Animation

`App.tsx:201` — `<AnimatePresence mode="wait">` around the active view with `key={activeTab}`, `initial/animate/exit` on `opacity` + `y: 10`. Duration 0.2s. Easy to replicate at the portal route level.

### 5. Progress Bar Animation

`DashboardView.tsx:185` — `motion.div` with `initial={{ width: 0 }}` animated to `${percent}%` over 1.2s ease-out. Used inside a `rounded-full bg-secondary` track.

### 6. Header Breadcrumb Pill

`Header.tsx:68` — Active page label wrapped in `bg-primary/10 px-2 py-0.5 rounded-sm text-primary font-extrabold text-xs` — very effective low-effort highlight. Easily adoptable in `DashboardHeader.tsx`.

### 7. NavPanel Context Awareness

`NavPanel.tsx` — Secondary panel changes its content (quick anchors, sprint stats, live diagnostics) based on the active tab. In sitebuilder context this could show contextual sub-navigation or a mini-summary for the active Work Panel section.

### 8. IconStrip Hover Tooltip Bubbles

`IconStrip.tsx:77` — `absolute left-16 scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 bg-foreground text-background text-xs font-bold rounded px-2 py-1 shadow-lg pointer-events-none whitespace-nowrap z-50 transition-all duration-150 origin-left` — elegant tooltip without any tooltip library.

### 9. Card Status Indicators (Task Priority)

`DashboardView.tsx:253` — `bg-rose-100 text-rose-700` / `bg-amber-100 text-amber-700` / `bg-blue-100 text-blue-700` for high/medium/low. Dark-mode equivalents via `/30` opacity. Directly usable in list views.

### 10. Compact Mode

`SettingsView.tsx` — `compactMode` boolean toggle that reduces all padding. Could be adopted as a user preference in `SettingsPage`.

---

## Phase Breakdown

> Start with the **Dashboard** — it's the first thing a user sees after login and the highest-ROI surface. Work outward from there.

---

### Phase 1 — Dashboard Overview (Highest Priority)

**Target file:** `src/portal/layout/MainContent.tsx` (`DashboardOverview` component)

- [x] **Welcome banner** — Radial gradient hero section, time-based greeting, user first name, live count of unread notifications or active panels
- [x] **Enhanced stat cards** — Icon in `bg-primary/10 rounded-lg`, hover border + shadow, value typography bump to `text-3xl font-bold`, trend badge with semantic colour
- [x] **Card stagger animation** — `containerVariants` + `cardVariants` via framer-motion, spring physics
- [x] **Animated progress bar** — For a "completion" or "health" metric (e.g., % of panels published, unread ratio)
- [x] **Quick Access grid** — Richer card style for Work Panel links (icon treatment, description line, hover state)
- [x] **Recent Notifications** — Better visual treatment for notification items (avatar, time-relative label, unread dot)
- [x] **View enter animation** — Fade + slide up on DashboardOverview mount (via route-level AnimatePresence)

---

### Phase 2 — Shell & Navigation

**Target files:** `DashboardHeader.tsx`, `AppSidebar.tsx`, `NavMain.tsx`, `dashboard-layout.tsx`

- [x] **Header breadcrumb pill** — Wrap active page label in `bg-primary/10 text-primary rounded-sm px-2` (port from demo `Header.tsx:68`)
- [x] **Header backdrop blur** — `backdrop-blur-md bg-background/80` + `sticky top-0` on header
- [x] **AppSidebar brand section** — Better logo treatment, improved spacing, brand name typography
- [x] **NavMain active state review** — The left-border accent (`shadow-[inset_3px_0_0_0_var(--sidebar-primary)]`) is good; ensure hover states and group labels are visually distinct
- [x] **NavMain group label styling** — `text-[10px] uppercase tracking-wider font-semibold` (matches demo pattern)
- [x] **Sidebar collapsible fix** — `dashboard-layout.tsx` passes `collapsible="icon"` but `AppSidebar.tsx` overrides with `collapsible="offcanvas"`. Pick one and be intentional.
- [ ] **Dual-panel sidebar** _(conditional on Open Decision #1 — skipped per recommendation)_

---

### Phase 3 — Page Transitions & Motion System

**Target files:** `MainContent.tsx`, individual view components

- [x] **Route-level AnimatePresence** — Wrap `<Routes>` content in `AnimatePresence mode="wait"` with a shared `motion.div` keyed to the current path
- [x] **Page entry animation** — `opacity: 0 → 1`, `y: 10 → 0`, duration 0.2s for all portal sub-pages
- [x] **Stagger lists** — `containerVariants` on list/card grids (ListView, stat grids)
- [x] **Skeleton polish** — Ensure all loading skeletons match the real content shape exactly

---

### Phase 4 — Auth Pages

**Target files:** `src/auth/Login.tsx`, `Signup.tsx`, `ForgotPassword.tsx`, `src/layouts/auth-layout.tsx`

- [ ] **Login page** — Brand identity, better card treatment, improved input field styling
- [ ] **Signup page** — Consistent with Login
- [ ] **ForgotPassword** — Consistent with Login
- [ ] **Auth layout** — Ensure the wrapper is visually balanced (split layout or centred card)

---

### Phase 5 — Content Views

**Target files:** `src/builder/views/`, `src/pages/portal/PageBuilder.tsx`, `src/pages/portal/NotificationsPage.tsx`, `src/pages/portal/SettingsPage.tsx`

- [ ] **ListView toolbar** — Tighter search + filter + bulk action bar visual treatment
- [ ] **ListView table** — Cleaner row hover state, better column headers
- [ ] **FormView layout** — Section grouping, label/value hierarchy
- [ ] **PageBuilder** — Action bar polish, canvas block hover/selected state, block library visual treatment
- [ ] **NotificationsPage** — Empty state, read/unread visual distinction
- [ ] **SettingsPage** — Section layout consistency, compact mode toggle

---

### Phase 6 — Global Polish

**Target files:** `src/index.css`, `src/components/ui/`, `src/components/kit/`

- [ ] **Empty state system** — Consistent empty state pattern (icon + heading + description + optional CTA) for all list views
- [ ] **Dark mode audit** — Walk every Phase 1–5 surface in dark mode; fix any surface colour, border, or shadow issues
- [ ] **Typography scale review** — Ensure heading/body/label/caption sizing is consistent across all pages
- [ ] **Focus & accessibility** — Verify keyboard navigation and focus rings on interactive elements
- [ ] **Mobile responsiveness** — Sidebar on mobile (sheet behaviour), header on small screens

---

## Open Decisions

These must be resolved before the relevant phase begins. Sessions should NOT implement these without explicit sign-off.

### Decision 1 — Sidebar Architecture (blocks Phase 2)

**Question:** Adopt the demo's dual-panel layout (IconStrip 70px + NavPanel 210px, collapsible) or keep the single shadcn sidebar?

| Option                            | Pros                                                                          | Cons                                                                                    |
| --------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Dual-panel** (demo pattern)     | More visual distinction, contextual secondary nav, icon rail always visible   | Significant refactor, loses shadcn sidebar state management, CollapseMenu compatibility |
| **Keep shadcn sidebar** (current) | Less risk, less code, stays in shadcn ecosystem, already works with NavMain   | Less visually distinctive, no always-visible icon rail                                  |
| **Hybrid**                        | Add a thin icon rail as a decoration layer on top of shadcn's collapsed state | Medium complexity, may conflict with shadcn's collapsible icon mode                     |

> **Recommendation:** Keep the shadcn sidebar for now (less risk, already functional), but polish its visual treatment heavily. Revisit after Phase 2 is complete.

---

### Decision 2 — Animation Library (blocks Phase 3)

**Question:** Use `framer-motion` or `motion` (both are installed — they are the same library, `motion` is the new package name)?

> **Recommendation:** Use `motion` (the newer `motion/react` import) consistently. It's the same library the demo uses. Remove the `framer-motion` duplicate after migration.

---

### Decision 3 — Contextual NavPanel (blocks Phase 2)

**Question:** Should the sidebar show contextual secondary content per active section (like the demo's NavPanel), or stay generic?

In sitebuilder, the nav is dynamically driven from Frappe Work Panels, so contextual content would need to come from the backend. This adds complexity.

> **Recommendation:** Skip contextual NavPanel. Keep the sidebar generic but well-styled.

---

### Decision 4 — Compact Mode (blocks Phase 5)

**Question:** Should a compact density mode be implemented as a user preference stored in Frappe User settings, or local storage only?

> **Recommendation:** Local storage only (simpler, no backend change). Wire to `SettingsPage` as a visual preference toggle.

---

### Decision 5 — Sidebar Collapsible Mode (must resolve in Phase 2)

**Question:** `dashboard-layout.tsx` passes `collapsible="icon"` to `AppSidebar`, but `AppSidebar.tsx` overrides it with `collapsible="offcanvas"`. Which behaviour is intentional?

- `icon` = sidebar collapses to icon-only rail (shadcn built-in)
- `offcanvas` = sidebar slides off-screen entirely

> **Recommendation:** Use `collapsible="icon"` (the layout's intent). Remove the override in `AppSidebar.tsx`. This enables the shadcn icon-rail behaviour without a custom implementation.

---

## Session Guidance

When picking up a task:

1. Read the **Phase** section for your task to understand scope
2. Check **Open Decisions** — if a decision blocks your task, flag it before implementing
3. Reference the **Demo Dashboard Insights** section for specific code patterns to borrow
4. Only edit files under `apps/sitebuilder/web/src/`
5. Run `yarn dev` and verify visually at `http://localhost:8080` (or configured port) before marking done
6. Dark mode and light mode both need to be checked for every change

**Key constraint:** The nav items (Work Panels) are fetched from Frappe at runtime. Do not hardcode nav items — keep `NavMain.tsx` pulling from `useFrappeGetDocList`.
