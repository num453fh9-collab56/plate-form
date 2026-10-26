# Hirelyx — 2026 Premium Agency Redesign

Reference benchmark: **planeks.net** (studied for navigation architecture, page
depth and conversion structure). No code, copy, imagery or styling was taken
from it — the visual identity, content and components here are original to
Hirelyx and built on its existing blue/green brand mark.

---

## 1. What did not change

The redesign is a presentation layer on top of the existing production app.
Nothing in the following list was rewritten, replaced or removed:

| Area | Status |
| --- | --- |
| Framework (Next.js 16.3.5 App Router, React 19, TypeScript strict) | unchanged |
| Supabase auth, database, storage, realtime, row-level security | unchanged |
| Stripe checkout, invoices, webhooks (`/api/checkout`, `/api/pay-invoice`, `/api/stripe/webhook`) | unchanged |
| Login / signup / OTP / Google sign-in / 2FA (`AuthModal`, `lib/auth.tsx`, `/api/auth/*`) | unchanged |
| Client portal, projects, invoices, bookings, notifications, dashboard | unchanged |
| AI support chat (`ChatWidget`, `/api/chat`, `/api/team-chat`) | unchanged |
| Language and currency selectors (`lib/i18n.tsx`, `lib/currency.tsx`) | unchanged, still in header and footer |
| Contact backend (`/api/contact` — reCAPTCHA + rate limit + email) | extended, not replaced |
| Security headers, CSP middleware, rate limiting | unchanged |
| Service price points | carried over verbatim (see §6) |
| Team profiles, photos, bios, certifications | carried over verbatim |
| All 29 API routes | unchanged except `/api/contact` |

The one behavioural change to a shared surface: `src/app/layout.tsx` now wraps
`{children}` in `<main id="main">` and renders the new header and footer.
`src/app/settings/page.tsx` had its own `<main>` and now uses a `<div>` to avoid
nested landmarks.

---

## 2. Design system

`src/app/hirelyx.css` (~1,510 lines) is loaded **after** `globals.css`. Every
class is namespaced `hx-`, so the 9,268-line legacy stylesheet continues to
serve the dashboard, portal and onboarding flows untouched. No CSS framework was
added and no runtime style engine is in the critical path.

**Tokens** — colour, type scale, spacing rhythm, radii, elevation, motion, all
as CSS custom properties on `:root`. `.hx-ink` re-points the semantic aliases so
any block can become a dark section without per-element overrides.

**Palette** — azure `#0b5fd0` primary and growth green `#16a34a`, both taken
from the existing Hirelyx mark, over an off-white paper (`#f7f8fc`) with deep
navy (`#080e1c`) contrast sections. Contrast was checked: muted body text is
4.75:1 on white, muted text on ink is 6.6:1, white on brand is 5.9:1, error red
is 5.4:1 — all at or above WCAG AA for their size.

**Type** — Inter for body (already present) plus **Sora** for display headings,
both self-hosted through `next/font` with `display: swap`. Fluid `clamp()` scale
from 0.7rem kickers to a 4.25rem hero.

**Components** — buttons (5 variants × 3 sizes), cards, panels, icon tiles,
chips, check lists, section headers, numbered process steps, stat strips,
pricing tiers, case-study cards, linked rows, testimonial blocks, team cards,
accordion (JS and native `<details>` variants), breadcrumbs, filter pills, form
controls, sticky sub-nav, mega menu, drawer, footer, closing CTA.

**Motion** — subtle only: 3px card lifts, arrow slides, a 0.22s mega-panel
entrance, scroll-reveal, and a dashed-line animation in the hero composition.
Every animation is inside `@media (prefers-reduced-motion: no-preference)`, and
the hero's SVG `animateMotion` packets are hidden under `reduce`.

---

## 3. Content architecture

All marketing content is typed data, so new entries need no layout code.

```
src/lib/content/
  types.ts       Service, Solution, ExpertiseArea, Industry, CaseStudy, Faq…
  services.ts    6 services  → /services/[slug]
  solutions.ts   5 solutions → /solutions/[slug]
  expertise.ts   5 areas + 6 industries → /expertise/[slug]
  portfolio.ts   9 case studies → /portfolio/[slug]
  process.ts     7 delivery stages + "why Hirelyx"
  team.ts        3 team members (carried over verbatim)
  faq.ts         16 site FAQs
  nav.ts         mega menu, footer columns, legal links — single source of truth
```

`src/lib/seo.ts` centralises the canonical origin, `pageMetadata()` and the
structured-data builders.

---

## 4. Navigation

```
Home | Services ▾ | Solutions ▾ | Expertise ▾ | Portfolio | About Us | Insights | Contact     [Start a Project]
```

**Services mega menu** — four groups:

| Group | Links |
| --- | --- |
| Development | Python Development · WordPress Development · All services |
| Python Capabilities | FastAPI · Pydantic · Pytest · API Development |
| AI Engineering | Custom AI Agents · MCP Server Development · Prompt Engineering · AI & LLM Expertise |
| Digital Marketing | SEO · Web Analytics · Social Media Marketing · Meta Ads |

**Solutions** — Operations & AI (process automation, AI workflows, intelligent
support) / Build & Grow (custom software, digital growth).

**Expertise** — Specialisation / Tech Stack / Industries.

Each panel carries a dark feature card with its own CTA.

Desktop behaviour: opens on hover *and* on click; triggers are real `<button>`s
with `aria-expanded` / `aria-controls`; Escape and outside-click close; panels
are keyboard-reachable; the open panel closes on route change without a stale
frame. Mobile: full-height drawer with disclosure groups, background scroll
locked, animated burger.

**Every navigation href resolves to a real page or to an anchor that exists on
the target page.** Verified: all 30 routes return 200, the `#pydantic-models`,
`#pytest-fixtures`, `#stack`, `#capabilities` and `#industries` anchors are all
present in the rendered HTML.

---

## 5. Routes

### New

| Route | Rendering |
| --- | --- |
| `/solutions` | static |
| `/solutions/[slug]` × 5 | SSG |
| `/expertise` | static |
| `/expertise/[slug]` × 5 | SSG |
| `/portfolio/[slug]` × 9 | SSG |

### Rebuilt

`/` · `/services` · `/services/[slug]` · `/portfolio` · `/about` ·
`/how-it-works` · `/contact` · `/blog` · `/faq` · `/help` · `/privacy` ·
`/terms` · `/accessibility` · `not-found`

The homepage was a client component gated on `useAuth` with three autoplaying
background videos. It is now a fully prerendered server component whose largest
contentful element is text, with an inline-SVG hero — no image or video request
in the critical path.

`/services/[slug]` was a client component using `useParams` with **no metadata
export**, so none of the six service pages had a unique title, description or
canonical URL. It is now statically generated with per-page metadata and
structured data.

### Redirects (308 permanent — the method-preserving equivalent of 301)

| From | To |
| --- | --- |
| `/services/programming` | `/services/python-development` |
| `/services/marketing` | `/services/digital-marketing` |
| `/services/prompt` | `/services/prompt-engineering` |
| `/services/social-ai` | `/services/digital-marketing` |
| `/services/n8n` | `/solutions/business-process-automation` |
| `/insights`, `/insights/:slug` | `/blog`, `/blog/:slug` |

`/services/ai-agents` kept its slug. `/blog` kept its route so indexed article
URLs still work; "Insights" is only the navigation label. All six redirects
verified returning 308 to the right destination.

---

## 6. Services and pricing provenance

| Service | Slug | Pricing |
| --- | --- | --- |
| Python Development | `python-development` | $499 / $1,499 / Custom — **carried over** from "Programming & Tech" |
| WordPress Development | `wordpress-development` | $499 / $1,499 / Custom — **reuses** the web-build price points; feature lists rewritten. **Confirm before publishing.** |
| Digital Marketing | `digital-marketing` | $499 / $1,499 / $3,499 per month — **carried over** |
| Custom AI Agents | `ai-agents` | $799 / $2,499 / Custom — **carried over** |
| MCP Server Development | `mcp-server-development` | **Quote-only.** Three scope-based engagement models, no prices invented. |
| Prompt Engineering | `prompt-engineering` | $299 / $799 / Custom — **carried over** |

Provenance is documented in a header comment in `src/lib/content/services.ts`.

Every service page has genuinely distinct content — its own intro, four
client-side problems, six capabilities, deliverables, technology list, five
process steps, pricing or engagement models, and five FAQs. No page is another
with the nouns swapped.

**Consolidated services.** "Social Media AI & Animation" and "n8n & Workflow
Automation" are not in the requested six. Their capability content was folded
into Digital Marketing (AI-assisted content production) and into the Business
Process Automation solution plus the Automation & Integrations expertise page
respectively, and both old URLs now redirect. Nothing was deleted outright, but
this is a scope decision worth confirming.

---

## 7. Lead generation

`ProjectInquiryForm` — four steps: service → budget and timing → brief →
contact details.

- Progress indicator as an ordered list with per-step state (not colour alone)
  plus a `role="progressbar"`
- Native radio/checkbox inputs inside `<fieldset>`/`<legend>`; the card styling
  is presentation only
- Per-field validation with `aria-invalid` and `aria-describedby`, errors
  announced through an `aria-live` region
- Focus moves to the new step heading on advance (never on first paint)
- Confirmation screen with a summary of what was submitted
- **Spam protection:** reCAPTCHA (existing), an off-screen honeypot the API now
  rejects, a minimum fill-time check, and the route's existing 3-per-5-minutes
  rate limit
- **Backend:** the existing `POST /api/contact`. No integration was invented.
- Service pages link to `/contact?service=<slug>`, so step one arrives answered.
  Unknown slugs are ignored rather than trusted.

File attachments: the previous form collected file *names* and put them in the
email body without uploading anything. That behaviour is preserved but the
helper text now says so explicitly and the confirmation screen repeats it.

---

## 8. SEO

- Unique `<title>` and meta description on every page via `pageMetadata()`
- Canonical URL on every page; `metadataBase` set once in the root layout
- Open Graph and Twitter tags derived from the same source as the title
- Structured data: `WebSite` + `Organization` (root), `Service`,
  `BreadcrumbList`, `FAQPage`, `HowTo` (on `/how-it-works`)
- **No `Review`, `AggregateRating` or `Product` markup** — there is no verified
  review corpus, and fabricating one is both dishonest and a manual-action risk
- Visible breadcrumbs on every interior page, matching the JSON-LD
- `sitemap.ts` generated from the content modules; placeholder case studies
  excluded because they are `noindex`
- `robots.ts` extended to exclude `/settings/`, `/auth/` and `/user/`
- Semantic HTML: one `<h1>` and one `<main>` per page (verified), logical
  heading order, real landmarks
- Internal linking: services ↔ solutions ↔ expertise ↔ case studies cross-link
  in both directions

---

## 9. Performance

- Homepage, services, solutions, expertise, portfolio and all detail pages are
  prerendered as static HTML
- Hero visual is inline SVG — no image request, no layout shift
- Fonts self-hosted by `next/font` with `swap`
- Client JavaScript on marketing pages is limited to: header, footer (language
  selector), scroll-reveal observer, FAQ accordion, portfolio filter, insights
  list and the inquiry form. Every other component is a server component.
- All images carry explicit `width`/`height`, `loading="lazy"` and
  `decoding="async"`; every `aspect-ratio` box is fixed, so CLS stays at zero
- `/portfolio/*` cache headers were already configured in `next.config.ts`

Lighthouse was **not** run — see §11.

---

## 10. Verification performed

| Check | Result |
| --- | --- |
| `next build` | passes, no errors or warnings |
| TypeScript (run by the build) | passes |
| ESLint on all new/rewritten files | 0 errors, 0 warnings |
| ESLint whole project | 26 errors / 19 warnings, all pre-existing (baseline on `main` was 27 / 25) |
| 30 routes smoke-tested | all 200; unknown path 404s |
| 6 redirects | all 308 to the correct destination |
| Metadata | unique titles, descriptions, canonicals confirmed in rendered HTML |
| Structured data | present on home (2 blocks), service (4), case study (4) |
| Document structure | exactly one `<h1>` and one `<main>` per page |
| Placeholder case study | `noindex, follow` confirmed |
| Contact preselect | `?service=mcp-server-development` renders with that option checked |
| Anchor targets | all mega-menu anchors present in HTML |
| Mobile layout audit at 390 px (Chrome DevTools Protocol, device emulation) | 19 pages: `innerWidth === clientWidth === scrollWidth === 390` on every one — no horizontal overflow |
| Desktop and mobile screenshots | homepage, service page and contact form reviewed at 1440 px and 390 px |

The mobile audit found and fixed one real bug: the "You receive:" outcome chips
in the delivery-process timeline inherited the chip default of
`white-space: nowrap`, which expanded the layout viewport to 576 px on a 390 px
screen and clipped content on the homepage and `/how-it-works`. Those chips now
wrap. Two remaining horizontal-overflow reports are deliberate scrollers inside
their own clipping containers: the technology marquee (`overflow: hidden`) and
the service page sub-nav (`overflow-x: auto`).

No automated test suite exists in this project — there is no test runner in
`package.json`, so none was run.

---

## 11. Not verified / outstanding

1. **Lighthouse / Core Web Vitals not measured.** The structure is built for
   90+ (static HTML, inline SVG hero, self-hosted fonts, minimal client JS, no
   CLS sources), but no audit was run against a deployed build. Run one before
   treating the 90+ target as met.
2. **No QA on physical devices.** Layout was audited at 390 px and 1440 px
   through Chrome device emulation and screenshots, and every page is free of
   horizontal overflow, but nothing has been checked on real hardware or in
   Safari/iOS.
3. **WordPress price points are reused, not confirmed.** They match the existing
   web-build tiers. Confirm or replace before publishing.
4. **Three case studies are deliberate placeholders** —
   `wordpress-ecommerce-build`, `seo-content-engine`, `mcp-server-integration`.
   They render a visible "Content placeholder" flag, carry no results and no
   narrative outcome, and are `noindex` and excluded from the sitemap. Replace
   the placeholder text with real project data and remove the `placeholder: true`
   flag.
5. **Result figures in the six published case studies are carried over from the
   previous site** (e.g. "70% fewer support tickets", "3x follower growth").
   They are presented as client-reported with a note saying Hirelyx has not
   audited them. Verify them before publication.
6. **Portfolio cover images are illustrations, not screenshots.** Alt text says
   so. Real screens need client permission.
7. **The footer newsletter form was removed.** It never submitted anywhere — it
   only switched to a local "thanks" state, silently discarding addresses. The
   space is now the proposal CTA. Wire a real list provider and it can return.
8. **`/contact` is now server-rendered on demand** rather than static, because
   it reads `?service=` to preselect the form. If you would rather it be static,
   drop the query parameter and the preselect.
9. **`experimental.memoryBasedWorkersCount: true`** was added to
   `next.config.ts`. Without it `next build` exhausts heap on this machine
   (8 GB total, ~0.2 GB free) by spawning one prerender worker per core. Safe to
   remove on a build machine with more memory.
10. **`middleware.ts` is deprecated in Next.js 16** in favour of `proxy.ts`. It
    still works and emits a build warning. Renaming it touches the CSP and
    origin checks, so it was left alone as out of scope.
11. **Legacy components are now unreferenced** but were left in place rather
    than deleted, since several contain working logic you may want:
    `Header.tsx`, `Footer.tsx`, `HomeView.tsx`, `Landing.tsx`, `Hero.tsx`,
    `Cta.tsx`, `ContactForm.tsx`, `ContactFields.tsx`, `TeamSection.tsx`,
    `PortfolioShowcase.tsx`, `lib/navigation.ts`. `PortfolioShowcase` in
    particular still fetches live portfolio rows from Supabase — if you want
    database-driven portfolio entries alongside the typed case studies, that is
    the component to reuse.
12. **`lib/taxonomy.ts` still lists the old eight marketplace categories.** It
    drives onboarding, gig creation and skill pickers in the signed-in app, so
    it was not touched. It is now out of step with the six public service lines.
13. **Nothing was deployed.** No production change was made.

---

## 12. Files

**New**

```
REDESIGN.md
src/app/hirelyx.css
src/app/expertise/page.tsx
src/app/expertise/[slug]/page.tsx
src/app/solutions/page.tsx
src/app/solutions/[slug]/page.tsx
src/app/portfolio/[slug]/page.tsx
src/lib/seo.ts
src/lib/content/{types,services,solutions,expertise,portfolio,process,team,faq,nav}.ts
src/components/site/{SiteHeader,SiteFooter,ui,interactive,Glyph,Icons,HeroVisual,
                     TeamGrid,ProjectInquiryForm,InsightsList,FaqSearch,JsonLd}.tsx
```

**Modified**

```
next.config.ts                     redirects + build worker memory setting
src/app/layout.tsx                 new shell, Sora, main landmark, reveal observer
src/app/page.tsx                   homepage rebuilt (sections A–J)
src/app/services/page.tsx          hub rebuilt
src/app/services/[slug]/page.tsx   client → SSG with metadata
src/app/portfolio/page.tsx         filterable index
src/app/about/page.tsx             rebuilt, story and timeline preserved
src/app/how-it-works/page.tsx      seven stages, FAQs tightened
src/app/contact/page.tsx           new inquiry experience
src/app/blog/page.tsx              Insights, now actually fetching /api/blog
src/app/faq/page.tsx               search + filter, answers corrected
src/app/help/page.tsx              rebuilt, service names and stages corrected
src/app/privacy|terms|accessibility/page.tsx   document layout + TOC
src/app/not-found.tsx              rebuilt
src/app/reviews/page.tsx           service list updated to the six current lines
src/app/sitemap.ts                 generated from content modules
src/app/robots.ts                  extra private paths excluded
src/app/settings/page.tsx          nested <main> → <div>
src/app/api/contact/route.ts       honeypot rejection
```
