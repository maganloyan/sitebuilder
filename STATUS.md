# Sitebuilder — Living Status

> **Session contract:** Read this file first. Do only what is in **🔴 Current Task**. Mark it done. Update this file before closing.

---

## 🔴 Current Task — Visual Page Builder (Phase 2: Block Field Inspector)

**Phase 1 shipped ✅** — route `/portal/page-builder/:pageName` live, block sidebar, canvas with reorder/remove, Save → `save_page_blocks` API.

**Entry point:** Site Page list → row ⋯ menu → "Page Builder"

### Phase 2 scope
- Inspector panel: when a block is selected, show its editable fields (from `SiteBlock.fields`) as a mini form
- Each field edit writes into `web_template_values` (JSON stored on the `Site Page Item`)
- Live preview iframe (low priority — requires `yarn build` cycle for new blocks anyway)

### Key files
| File | Role |
|---|---|
| `web/src/pages/portal/PageBuilder.tsx` | Page builder UI |
| `sitebuilder/sitebuilder/api.py` | `save_page_blocks` endpoint |
| `web/src/builder/views/ListActions.tsx` | `extraMenuItems` prop (Page Builder entry) |
| `web/src/portal/layout/MainContent.tsx` | Route `/page-builder/:pageName` |

---

## ✅ Completed (don't redo these)

### Infrastructure
- React SPA moved from `menumate/web` → `sitebuilder/web`
- All `menumate`/`taywaan` references purged from Python and frontend
- `block_generator.py` → `app_name = "sitebuilder"`
- `form_builder.py` → fixed import path `@/components/forms/DynamicForm`
- `hooks.py` → `website_route_rules` + Portal User `doc_events` wired
- `siteapi.py` deleted (dead code)

### Design System
- Indigo primary tokens (oklch), DM Sans, 8px radius
- Light + dark mode, chart colors, `bg-background` body fix
- shadcn preset `b4P9gaT2u` applied

### Auth
- Login → split-screen (brand panel + form)
- Signup → 2-step with progress indicator
- ForgotPassword → `/forgot-password` route, calls Frappe reset_password API

### Admin Portal
- Sidebar (NavMain) reads from Work Panel with `published=1` filter
- Navbar title derives from URL (no hardcoded "Admin Panel")
- Dashboard: stat cards (Work Panel, Site Page, Portal User, Notifications)
- Single doctype support: ListView auto-redirects, DocForm cleans breadcrumb
- `/dashboard` route removed, consolidated into `/portal`

### Data Layer
- `api.py get_doctype_fields` now returns `issingle` + `display_field`
- ListView: removed redundant `useFrappeGetDocList` call (was causing 417)
- DynamicTable: TanStack Table, server-side sort/filter/pagination, bulk delete
- DocForm: sticky header, shadcn Tabs, Card sections, create + edit modes
- ChildTable: collapsible, row expand Sheet, move up/down, confirm delete

### Block Generator
- `SiteBlock.on_update` auto-triggers `.tsx` generation on code/fields change
- `generate_all_page_components` / `generate_page_components_for_type` fixed

### UI/UX
- FieldRenderer: removed `bg-accent` from all inputs, fixed DatePicker, removed `eval()`
- LinkField: removed duplicate label, added clear button, check marks
- FileUpload: drag-and-drop zone, progress bar, shape detection (logo/cover)
- Attach Image: hover overlay with Change/Remove for logo (square) and cover (wide)
- DynamicPage.tsx: renamed internal component, overlayStyles now rendered
- DynamicPanel.tsx: group parent shows child card grid instead of blank page

---

## 🗺 Backlog (tackle after Current Task)

1. **Visual page builder Phase 2** — block field inspector + `web_template_values` editing
2. **Block template library** — Hero, CTA, Features, Testimonials, Navbar, Footer starters
3. **Email verification** — "verify your email" gate before portal access
4. **Site Settings UI** — verify `/portal/app/site-settings` works end-to-end
5. **Password reset landing** — `/update-password?key=xxx` page
6. **Portal User profile** — `/me` route and profile page
7. **Notifications page** — `/notifications` route

---

## Architecture Decisions

| Decision | Choice | Why |
|---|---|---|
| Frontend location | `sitebuilder/web/` | Self-contained, no menumate dependency |
| Block generation | Auto on SiteBlock.on_update | No manual button needed |
| Single doctypes | docId === doctype detection | Works with Frappe's name=doctype pattern |
| Child table UX | Collapsible + row expand Sheet | Shows all fields without overwhelming the form |
| Portal nav | Work Panel doctype | Dynamic, publishable, hierarchical |

---

## Known Issues / Watchlist

- `DynamicPage` dynamic import requires full `yarn build` after new blocks — no runtime loading
- `FormView.tsx` child table fields still use raw `fetch()` — works but messy
- `form_builder.py generate_form()` generates files with no UI to embed them into a Site Page yet
- `DynamicForm.tsx` imports `toast` from `@/lib/portal-toast` — verify this module exists
