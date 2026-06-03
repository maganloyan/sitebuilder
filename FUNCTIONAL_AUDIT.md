# Sitebuilder — Functional Audit

> What we have, what works, what's broken, what's missing.

---

## Big Picture

| Feature Area | Built | Working E2E | Broken | Missing |
|---|:---:|:---:|:---:|:---:|
| Admin portal (sidebar, CRUD, dashboard) | ✅ | ✅ | Minor | — |
| Auth (login, signup, password) | ✅ | ✅ | — | Email verify, password reset |
| Work Panel (sidebar nav + portal pages) | ✅ | Mostly | Published flag ignored, empty group pages | — |
| Site Page (public page rendering) | ✅ | Mostly | Overlay, legacy Web Template split | Visual drag-drop builder |
| Site Block (code generation) | ✅ | Partial | No auto-regen on save | — |
| block_generator.py | ✅ | 2/4 functions | 2 dead functions (wrong doctype name) | Auto-trigger on save |
| form_builder.py | ✅ | ❌ Nothing | Wrong import path, no UI button | DynamicForm component, desk button |
| React ListView / DynamicTable | ✅ | ✅ | — | — |
| React FormView / DocForm | ✅ | Mostly | Hook-in-effect bug, missing display_field | — |
| Public page renderer (DynamicPage) | ✅ | Mostly | Wrong component name, overlay ignored | Runtime block imports |

---

## ✅ What Works End-to-End

1. **Admin portal CRUD** — `/portal/app/:doctype` → ListView → FormView/CreateView → DocForm. Works for every doctype automatically via `get_doctype_fields`.

2. **Portal sidebar** — Work Panel list → NavMain groups by `group_label` → collapsible tree → DynamicPanel renders `page_blocks`. Full chain functional.

3. **Dashboard overview** — Stat cards (Work Panel, Site Page, Portal User, Notification Log counts), Quick Access grid, Recent Notifications. All live from Frappe.

4. **Auth flow** — Login, Signup (2-step), ProtectedRoute guards `/portal/*`.

5. **Site Block "Generate Template" button** — copies `code` field to `.tsx` file in `web/src/components/${folder}/`. Works when `code` is populated.

6. **Site Block "Generate Blank Fields" button** — auto-builds typed TSX from `fields` child table. Works when `fields` are defined.

7. **Edit Values dialog** (Frappe desk) — reads Site Block fields, builds a dialog, saves JSON back to `web_template_values`. Works for type="Page Block".

8. **Public page rendering** — `/:pageName` → `DynamicPage` → fetches Site Page → dynamically imports `.tsx` blocks → applies styling from `getBlockStyles`. Works **if** the `.tsx` file was generated and the build includes it.

9. **TanStack table** — sorting, filtering, pagination, bulk delete, column visibility. All functional.

10. **FieldRenderer** — Data, Text, Check, Date, Select, Link, Attach, Attach Image, Currency, Int, Float. All functional.

---

## ❌ What's Broken

### Critical (will crash or silently fail)

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `FormView.tsx:33` | `const res = await useFrappeGetCall` — hook called inside `useEffect`. Crashes in React Strict Mode | Delete that line; the `fetch()` below it already works |
| 2 | `api.py get_doctype_fields` | `display_field` not included in returned field data. Link fields never get their display hint | Add `"display_field": field.display_field` to the dict |
| 3 | `block_generator.py:273,314` | `generate_all_page_components` and `generate_page_components_for_type` call `frappe.get_all('Page Component')` — doctype was renamed to `Site Block`. Both throw `DoesNotExistError` | Replace `'Page Component'` with `'Site Block'` |
| 4 | `App.tsx:17` | `import.meta.env.VTE_BASE_PATH` — typo (`VTE` not `VITE`). `basename` is always `undefined`. Breaks subpath deployments | Fix to `VITE_BASE_PATH` |

### High (missing wiring)

| # | File | Bug | Fix |
|---|------|-----|-----|
| 5 | `NavMain.tsx` | `published` flag not filtered — all Work Panels appear in sidebar including unpublished ones | Add `filters: [["published", "=", 1]]` |
| 6 | `SiteBlock.on_update()` | Only clears cache. Never triggers `.tsx` regeneration. Code/field changes require manual button click | Call `generate_page_component_template` if `code` changed, `generate_frontend_component` if `fields` changed |
| 7 | `form_builder.py` | Every generated file imports `@/components/tests/DynamicForm` — that directory doesn't exist. Also no Frappe desk button to trigger it | Fix import path + create desk button in `site_form.js` |
| 8 | `site_page.js` | Type="Section" fetches from `Web Template` (legacy Frappe doctype), not `Site Block`. Two parallel systems, no clean path | Migrate Section type to use Site Block or clearly document the split |

### Medium (confusing but non-breaking)

| # | File | Issue |
|---|------|-------|
| 9 | `DynamicPage.tsx` | Internal component named `DynamicPanel` (wrong name for file). Confusing in React DevTools and error traces |
| 10 | `DynamicPage.tsx` + `DynamicPanel.tsx` | `overlayStyles` from `getBlockStyles` is computed but never rendered. `add_overlay` field has zero effect |
| 11 | Work Panel groups | `is_group=true` panels have a route. Navigating to them loads DynamicPanel which renders nothing (no `page_blocks` on group containers) |
| 12 | `block_generator.py` | Generated components use `import { Button } from "../ui/button"` — relative path breaks if `folder_name` is not `blocks` |

---

## 🔴 What's Missing

### Core functionality gaps

| # | Area | What's Missing |
|---|------|---------------|
| 1 | **Visual page builder** | No drag-and-drop canvas. Adding blocks to a Site Page requires going into Frappe desk → Site Page form → adding rows manually to the `page_blocks` child table. There is no visual editor in the React app. |
| 2 | **Block library UI** | No page in the React portal to browse available Site Blocks, preview them, or add them to a page. Only accessible via Frappe desk. |
| 3 | **Live preview** | No way to preview a page before publishing from within the React app. |
| 4 | **Runtime block imports** | Vite resolves `import('@/components/${folder}/${label}.tsx')` at build time. A new Site Block generated after the last build won't load until the project is rebuilt. No runtime fallback. |
| 5 | **Email verification** | After signup, no email is sent to verify the address. Users go straight into the portal. |
| 6 | **Password reset** | No "forgot password" flow exists. The link is on the login page but the route is not implemented. |
| 7 | **Auto-rebuild on block generate** | When `generate_page_component_template` writes a `.tsx` file, the Vite dev server hot-reloads it. But in production, a `yarn build` is required — there's no automation. |
| 8 | **Portal User ↔ User sync** | `hooks.py` has the `doc_events` for Portal User commented out. Creating a Frappe User does not automatically create a Portal User. |
| 9 | **`form_builder.py` full stack** | `generate_form()` exists but: no UI button, no target component, no real usage. The entire form generation feature is scaffolded but not built. |
| 10 | **Site Block template library** | No pre-built starter blocks (Hero, CTA, Features, Testimonials, etc.). Developers must build everything from scratch. |

---

## 🗑 Dead Code (Safe to Delete)

| File / Location | Reason |
|---|---|
| `siteapi.py` (entire file) | 100% commented out. Old version of block_generator logic. |
| `block_generator.generate_all_page_components` | Calls non-existent `'Page Component'` doctype |
| `block_generator.generate_page_components_for_type` | Same broken doctype reference |
| `utils.py → utils_get_referenced_doctype` | Duplicate of `utils_get_referenced_doc` with hardcoded `"items"` field |
| `FormView.tsx:33` `const res = await useFrappeGetCall` | Unused dead reference |

---

## Priority Fix Order

### Fix first (before adding any feature)
1. `FormView.tsx` — delete the hook-in-effect line
2. `api.py` — add `display_field` to `get_doctype_fields` response
3. `App.tsx` — fix `VTE_BASE_PATH` typo
4. `block_generator.py` — fix `'Page Component'` → `'Site Block'`
5. `NavMain.tsx` — add `published` filter

### Fix second (makes the builder actually work)
6. `SiteBlock.on_update` — auto-trigger generation on save
7. `form_builder.py` — fix import path, add desk button
8. Work Panel groups — render child index instead of blank page
9. `DynamicPage.tsx` — rename internal component + apply overlayStyles

### Build next (missing core features)
10. Visual page builder canvas (Phase 3 of SaaS plan)
11. Block library UI
12. Email verification + password reset
13. Portal User auto-sync
14. Pre-built block templates
