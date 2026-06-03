# Sitebuilder SaaS — Full Product Plan

**Product:** Portal Builder for Frappe/ERPNext developers
**Model:** Monthly/yearly subscription
**Target:** Developer signs up → connects their Frappe site → builds portals visually → publishes

---

## Current State (Already Built)

| Area | Status |
|------|--------|
| React frontend + design system | ✅ Done |
| Auth (login, signup, social) | ✅ Done |
| Admin portal (sidebar, dashboard, Work Panel nav) | ✅ Done |
| Public pages (DynamicPage via Site Page doctype) | ✅ Done |
| Block code generator | ✅ Done |
| Generic CRUD (ListView + DocForm) | ✅ Done |
| Core doctypes (Site Block, Site Page, Work Panel, Site Settings) | ✅ Done |

---

## Phase 1 — Marketing & Acquisition (Week 1–2)

**Goal:** Get people to the door.

- [ ] **Landing page** — Hero, features grid, social proof, CTA
- [ ] **Pricing page** — 3 tiers (Free / Pro / Team), comparison table, FAQ
- [ ] **Blog/docs shell** — placeholder pages, SEO meta
- [ ] **Footer** — links, legal, newsletter
- [ ] **Email verification** — after signup, verify email before portal access
- [ ] **Password reset** — forgot password flow

---

## Phase 2 — Onboarding & Workspace (Week 3–4)

**Goal:** First user in, first portal created.

- [ ] **Workspace doctype** — name, owner, plan, frappe_url, api_key, api_secret
- [ ] **Connect Frappe site flow** — enter site URL + API key → validate connection → store
- [ ] **Onboarding wizard** — step 1: create workspace → step 2: connect site → step 3: create first page
- [ ] **Workspace switcher** — users can belong to multiple workspaces (like Vercel teams)
- [ ] **API key management** — generate/rotate keys scoped to a workspace

---

## Phase 3 — Visual Page Builder (Week 5–8)

**Goal:** The core product — drag and drop blocks onto pages.

- [ ] **Page canvas** — iframe preview of the live page
- [ ] **Block sidebar** — list of available Site Blocks, drag onto canvas
- [ ] **Block inspector** — right panel: fill in block field values (title, image, text, etc.)
- [ ] **Page tree** — left panel: all pages in the site, nested structure
- [ ] **Publish/unpublish toggle** — per page
- [ ] **Template library** — pre-built page templates (landing page, portfolio, menu, etc.)
- [ ] **Undo/redo** — history stack for page edits
- [ ] **Mobile preview** — toggle desktop / tablet / mobile canvas width

---

## Phase 4 — Billing (Week 9–10)

**Goal:** Make money.

- [ ] **Stripe integration** — `stripe` Python lib + webhook handler
- [ ] **Plan tiers:**

| Feature | Free | Pro ($29/mo) | Team ($79/mo) |
|---------|------|-------------|--------------|
| Sites | 1 | 5 | Unlimited |
| Published pages | 5 | Unlimited | Unlimited |
| Custom domain | ❌ | ✅ | ✅ |
| Team members | 1 | 1 | 5 |
| Block templates | Basic | All | All + custom |

- [ ] **Upgrade prompt** — when limit hit, modal → upgrade CTA
- [ ] **Billing portal** — Stripe customer portal (invoices, plan change, cancel)
- [ ] **Webhook handler** — handle `invoice.paid`, `customer.subscription.deleted`, etc.

---

## Phase 5 — Growth Features (Week 11–13)

**Goal:** Retention and virality.

- [ ] **Custom domains** — map `portal.customer.com` → their site (DNS CNAME + SSL via Let's Encrypt)
- [ ] **Team collaboration** — invite by email, roles (Owner / Editor / Viewer)
- [ ] **Page analytics** — views, bounce rate (lightweight, no third-party)
- [ ] **Activity log** — who changed what, when
- [ ] **Comments / feedback** — reviewers can leave comments on pages before publish

---

## Phase 6 — Launch (Week 14)

**Goal:** Ship it.

- [ ] **Public docs** — Getting Started, Connecting your site, Block reference, API reference
- [ ] **In-app help** — tooltips, empty states with guidance, onboarding checklist
- [ ] **Beta program** — invite 10–20 Frappe developers, collect feedback
- [ ] **ProductHunt launch** — assets, tagline, demo GIF
- [ ] **Production deployment** — Frappe Cloud or VPS, SSL, backups, monitoring

---

## Technical Decisions to Make Before Building

| Decision | Options |
|----------|---------|
| **Multi-tenancy model** | Single Frappe site with workspace isolation (simpler) vs. one site per customer (more isolated) |
| **Builder canvas** | iframe-based live preview vs. virtual DOM editor (iframe is simpler, matches real output) |
| **Custom domains** | Frappe routing + Nginx config generation vs. Cloudflare proxy (Cloudflare is faster to ship) |
| **Email** | Frappe's built-in email vs. Resend/Postmark API (Resend recommended — better deliverability) |
| **Analytics** | Self-hosted Plausible vs. Frappe custom doctype tracking (Plausible is 1 docker container) |

---

## Recommended Order

1. **Phase 1** — Land page + pricing live this week → start collecting waitlist signups immediately
2. **Phase 2** — Workspace + onboarding in parallel
3. **Phase 3** — Visual builder is the core differentiator, most build time
4. **Phase 4** — Billing before public launch
5. **Phase 5 + 6** — Post-launch growth
