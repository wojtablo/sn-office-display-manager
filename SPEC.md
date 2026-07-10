# Spec: Office Display Manager (ODM)

> ServiceNow scoped application `x_804244_odm`, built with the ServiceNow SDK (Fluent API, TypeScript).
> Status: **DRAFT — awaiting approval** · Target release: Australia · Last updated: 2026-07-10

## Objective

Enable teams to run slideshows of URLs (ServiceNow dashboards, reports, and external
web pages) on physical office displays, with easy administration from a normal user
account.

**Users:**

| Persona | Account | Role | Needs |
|---|---|---|---|
| Manager (e.g. Service Desk lead) | Normal account | `x_804244_odm.manager` | Author slideshows (links, duration, working hours); change what a display shows without touching it; works from the "My slideshows" module (can administer all records via list filters) |
| Display (kiosk) | Technical account, one per physical screen | `x_804244_odm.display` | Log in once (via Bomgar), open player URL, run an infinite slide loop unattended; sees "My slideshows" (its assigned deck) |
| App admin | Normal account | `x_804244_odm.admin` (contains `manager`) | Delegated app administration; sole access to the "All slides" module; **preview any screen's slideshow** by opening its player URL (`/player/<screen>`) or deck JSON |

Employees without an app role have **no access** — no module, no records, 401/idle on the REST routes.

**Naming convention (operational, not enforced):** one technical account per screen,
named after its location, e.g. `svc.display.sd-room1`. Since slideshows bind to
accounts, the account name *is* the screen identity — the slideshow list answers
"what plays where" without any CI linkage.

**Operating flow (lifecycle stages):**

| Stage | Actor / account | What happens |
|---|---|---|
| 1. Setup (once per screen) | Admin | Create technical account per display, grant `x_804244_odm.display`, note the account↔screen mapping via naming convention |
| 2. Authoring | Manager (normal account) | Create **Slideshow**: fill `links` (comma-separated URLs), set `slide_duration` and working hours, set `assigned_account` to the screen's technical account, check `active` |
| 3. Launch (once per screen) | Anyone at the screen, via Bomgar | Log into ServiceNow as the technical account, open **`/x_804244_odm_player.do?screen=<screen>`** (bootstrap page → player takes over the tab) → the loop starts, disconnect Bomgar |
| 4. Unattended run | Technical account (no human) | Player loops slides indefinitely; polling keeps the session alive and picks up content changes |
| 5. Live update | Manager (normal account) | Edit the slideshow (links, duration, hours, assignment) from their desk; the display reflects changes within one `refresh_interval`. Kill switch: uncheck `active` → player shows idle screen |

**Start model (decided): stateless.** Opening the player page under the technical
account *is* starting the slideshow; closing the browser stops it. There is no
server-side running state, no start button — the `active` flag is the only control.

**Primary use case (concrete):** A Service Desk manager has 3 wall displays in the
team space. Admin creates `svc.display.sd-room1/2/3`. The manager builds three
slideshows — e.g. *SD Queue Wall* (incident dashboard → SLA report → company news
page, 30 s per slide, working hours 07:00–19:00) — and assigns one per account. Each screen is launched once
via Bomgar. From then on the manager tunes content entirely from their own desk, and
the slideshow list shows at a glance what each screen is playing.

**Additional use cases (same MVP, no extra code):**
- **NOC / ops wall** — incident queue + SLA + on-call dashboards on rotation (Australia's Platform Analytics dashboards are same-origin and iframe-friendly — premium slide content; runbook lists URL patterns)
- **War-room flip** — during a P1, reassign a screen's deck to the MI dashboard from your desk (remote swap, seconds, no Bomgar)
- **Lobby / reception signage** — HR announcements, events, external pages
- **Personal rotator** — a *manager* creates a deck assigned to themselves and opens the no-param `/player` route on a second monitor
- **Conference-room idle screen** — room calendar + company news between meetings

**Association model (decided):** Slideshow → `assigned_account` (sys_user). One active
slideshow per technical account. No CI linkage in v1 (see Out of Scope).

## Tech Stack

- **Platform:** ServiceNow, Australia release, scoped app `x_804244_odm`
- **Build tooling:** ServiceNow SDK `@servicenow/sdk` **4.4+** (4.4 is the first Australia-compatible line; use latest 4.x), Node.js ≥ 20, TypeScript
- **Metadata:** Fluent API — every artifact we ship has a **dedicated fluent type** (verified against the SDK API reference): `Table`, `Role`, `Acl`, `BusinessRule`, `RestApi`, `ScriptInclude`, `ApplicationMenu`, `List`; generic `Record` as fallback
- **Player:** fully custom HTML document ("template") served by a **Scripted REST API** with `Content-Type: text/html` — zero platform UI runtime (no UI Page, no Jelly, no Service Portal). Template is **code**: authored and tested locally, compiled into a Script Include string constant at build time.
- **Admin UI:** standard platform form/list (application menu + modules), no custom workspace
- **Server API:** same Scripted REST API serves the deck as JSON on a sibling route (for the template's live polling)
- **No external runtime dependencies** in the player template (vanilla JS; must run unattended for days)

## Commands

```bash
# One-time setup
npm install
npx now-sdk auth --add <instance-url>        # authenticate to the dev instance

# Development cycle
npm run dev:template                         # open src/client/templates/rotator.html locally (mock deck) — no instance needed
npm run build                                # build-template.mjs (rotator.html → OdmTemplates.ts) + npx now-sdk build
npm run deploy                               # npx now-sdk install — push app to authenticated instance
npm run lint                                 # eslint . --fix
npm test                                     # jest — unit tests for player logic & shared TS

# Verification
npx now-sdk build && npx now-sdk install     # full round-trip before any commit
```

(Exact script names to be wired into `package.json` during scaffolding; `now-sdk init`
generates the baseline.)

## Project Structure

```
├── SPEC.md                    → this document
├── tasks/                     → plan.md + todo.md (phase 2/3 outputs)
├── now.config.json            → SDK app config (scope x_804244_odm, app name)
├── package.json
├── src/
│   ├── fluent/                → Fluent API metadata (*.now.ts)
│   │   ├── index.now.ts       → root: app registration, exports
│   │   ├── table.now.ts       → slideshow table definition
│   │   ├── roles.now.ts       → admin / manager / display roles
│   │   ├── acls.now.ts        → table ACLs
│   │   ├── business-rules.now.ts → uniqueness rule: one active slideshow per assigned_account
│   │   ├── menu.now.ts        → "Office Display Manager" menu: My slideshows (manager+display) / All slides (admin)
│   │   └── rest-api.now.ts    → Scripted REST API + player/deck routes
│   ├── server/
│   │   ├── OdmPlayerApi.ts    → deck resolution, links parsing, hours handling, template injection
│   │   └── OdmTemplates.ts    → GENERATED: built template as string constant (build artifact, committed)
│   └── client/
│       └── templates/
│           ├── rotator.html   → template shell (markup + CSS + meteor bar), references player.js for local dev
│           └── player.js      → ALL player logic as importable pure-function module (jest-testable)
├── scripts/
│   └── build-template.mjs     → inlines player.js into rotator.html → src/server/OdmTemplates.ts
├── test/                      → jest unit tests (mirrors src/)
└── docs/
    └── runbook.md             → display setup guide + manual verification checklist
```

## Data Model

### `x_804244_odm_slideshow` — the **only** custom table
| Field | Type | Notes |
|---|---|---|
| `name` | String (display value) | required |
| `description` | String (multi-line) | |
| `assigned_account` | Reference → `sys_user` | "Service account" — the technical account that displays it; **unique among active slideshows** (enforced by business rule) |
| `links` | String (multi-line, 8000) | the slides: **comma-separated URLs** (newlines also accepted as separators — see parsing rules) |
| `slide_duration` | Integer (seconds), default 30 | duration of **one slide** — applies to every slide in the deck |
| `hours_start` | String `HH:MM` (24h), default `07:00` | working-hours window start — player shows standby screen outside the window. **String, not glide_time**: the platform Time type is a UTC datetime in disguise (fiddly APIs, doubtful Fluent support); a regex-validated string is honest and sufficient for a wall-clock window |
| `hours_end` | String `HH:MM` (24h), default `19:00` | working-hours window end. Invalid or empty `hours_*` values → player treats the deck as **always on** (fail open, never blank a screen due to a typo) |
| `active` | Boolean, default true | only active slideshows play — the manager's kill switch |
| `refresh_interval` | Integer (seconds), default 60 | how often the player polls for changes |

"Created by" = standard `sys_created_by` audit field — no custom field needed.
No slide table, no template table (template is code — see Rendering & API).

**`links` parsing rules** (server-side, pure function, jest-tested):
- Split on **commas and/or newlines**; trim each entry; skip empty entries and entries starting with `#`
- **Literal commas inside a URL must be percent-encoded (`%2C`)** — e.g. `sysparm_query=state%3D1%2Cpriority%3D2` — this is the documented rule that makes comma separation safe; the runbook and field hint state it
- Entry order = slide order
- Entries must be **absolute** (`https://...`) or **root-relative** (`/sys_report_template.do?...`). Bare relative paths are rejected — the player page lives under `/api/x_804244_odm/player/...`, so a bare `sys_report.do` would wrongly resolve under `/api/`
- Invalid entries (no parseable URL) are skipped, never break the deck

### Roles, ACLs & Navigation

**ACL matrix (slideshow table) — role-gated model:**

| Operation | `x_804244_odm.display` (tech accounts) | `x_804244_odm.manager` | `x_804244_odm.admin` |
|---|---|---|---|
| create | ✖ | ✔ | ✔ |
| read | **own assigned deck only**: `assigned_account = me` | all records | all records |
| write / delete | ✖ | all records (flat, no ownership conditions) | all records |

- Users without an app role: **no access** — no module, no records, idle card on the REST routes.
- `x_804244_odm.admin` → contains `manager`; sole role that sees the "All slides" module. **Preview guarantee:** any admin (app admin via contained `manager` read-all, platform admin via `adminOverrides`) can open any screen's `/player/{screen}` URL and see exactly what that display is playing.
- `x_804244_odm.display` → read-only on its own assigned deck + "My slideshows" module visibility (this resolves former Open Question 2: **kept, with purpose**).
- **REST routes require an app role** (display/manager/admin); record access enforced by the table ACLs — calling another screen's URL without read rights yields the idle card, never data.

**Application menu `Office Display Manager`:**

| Module | Visible to (roles) | Contents |
|---|---|---|
| My slideshows | `x_804244_odm.manager`, `x_804244_odm.display` | slideshow list filtered `sys_created_by = me OR assigned_account = me` |
| All slides | `x_804244_odm.admin` **only** (managers administer all records via list filters; their edit-all ACL right is unaffected) | unfiltered slideshow list |

Module visibility is navigation only — ACLs are the enforcement layer.

## Rendering & API (core architecture)

**The player is a fully custom HTML document served by a Scripted REST API — zero
platform UI runtime.** The template is code: developed and tested locally against a
mock deck, compiled into a Script Include string constant by the build, deployed via
SDK. Changing the template = git commit + `now-sdk install`, not a form edit.

**Routes (API namespace `x_804244_odm`):**

| Route | Returns | Behavior |
|---|---|---|
| `GET /api/x_804244_odm/player/{screen}` | `text/html` | `{screen}` = technical account `user_name` (e.g. `svc.display.sd-room1`) → resolve active slideshow via `assigned_account` → parse `links` into deck JSON → inject into template at `__ODM_DECK__` token → stream |
| `GET /api/x_804244_odm/player` | `text/html` | no param → resolve by **logged-in** user (kiosk shorthand; also how a manager previews a deck assigned to themselves) |
| `GET /api/x_804244_odm/player/{screen}/deck` | `application/json` | deck only — the template polls this every `refresh_interval` |

The screen's URL is **permanent** — swapping what a screen shows = editing
`assigned_account`/`links` from the manager's desk; the display is never touched.
A manager can also open any screen's URL in their own browser to see that screen's deck.

**Browser entry point (bootstrap page):** the platform rejects cookie-only REST calls
without an `X-UserToken` header (CSRF protection), and address bars can't send
headers — so browsers enter via a minimal classic UI Page,
**`/x_804244_odm_player.do?screen=<screen>`**, which owns the session's `g_ck`,
fetches the player HTML from the REST route with that token, and `document.write`s
it over the whole tab (escaping the Polaris shell via same-origin `window.top`).
Anonymous visitors get the platform login redirect for free. The deck JSON carries
the session token so the player's polling stays authenticated; token failures degrade
polling only, never deck resolution. The REST routes remain the API; the UI Page is a
~30-line shim, not a rendering surface (no Jelly interpolation).

**Injection safety:** deck is `JSON.stringify`-ed and `</script>`-escaped
(`<\/script>`) before token replacement — `links` content is manager-supplied and must
not be able to break out of the script context.

**Player behavior (inside the template):**
1. Boot from the injected deck (no second request for first paint).
2. Render slides in a full-screen iframe. Advance is **purely timer-driven** (per slide duration), looping forever — a slide that fails to render can never stall the loop. **Single-slide decks still reload the iframe every cycle** — otherwise a lone dashboard shows stale data all day.
3. **Blocked iframes (external URLs with X-Frame-Options/CSP):** no detection in MVP. The browser's own refusal message shows for that slide's duration, then the timer advances; managers fix it by removing the line. (Fallback-card detection = v2.)
4. **Change polling:** every `refresh_interval` seconds, fetch the `/deck` route; if changed, reload the deck seamlessly.
5. **Session keep-alive:** the poll itself keeps the session interactive; document the required instance session-timeout consideration in the runbook.
6. No active slideshow (none assigned, or manager unchecked `active`) / API error → friendly full-screen idle card naming the screen, retry every 60 s. Unauthenticated hit returns 401 — the runbook keeps the "log in first, then open the player URL" step.
7. **Slide progress indicator ("meteor bar"):** a thin progress bar fixed at the **bottom** of the screen, filling left → right over exactly `slide_duration`; **red trail with a glowing head** (meteor/comet effect — bright core + red glow via layered box-shadow, short fading tail). Resets on every slide change, so it always shows time-to-next-slide. Pure CSS/JS in the template, no dependencies.
8. **Working hours:** the deck JSON carries `hours_start`/`hours_end` as `HH:MM` strings; the template evaluates them against the **display's local clock**. Outside the window → black standby screen (small clock + screen name, no iframe loads — kind to the panel), polling continues so the player resumes automatically at `hours_start`. Overnight windows (e.g. 22:00–06:00) are handled correctly; unparsable window = always on (fail open).

## Code Style

TypeScript, ESLint + Prettier defaults. Fluent metadata example — abridged, style to imitate (full schema per Data Model):

```typescript
// src/fluent/table.now.ts
import { Table, StringColumn, IntegerColumn, BooleanColumn, ReferenceColumn } from '@servicenow/sdk/core'

export const x_804244_odm_slideshow = Table({
    name: 'x_804244_odm_slideshow',
    label: 'Slideshow',
    schema: {
        name: StringColumn({ label: 'Name', mandatory: true }),
        assigned_account: ReferenceColumn({ label: 'Service account', referenceTable: 'sys_user' }),
        links: StringColumn({ label: 'Links (comma-separated URLs)', maxLength: 8000 }),
        active: BooleanColumn({ label: 'Active', default: true }),
        slide_duration: IntegerColumn({ label: 'Slide duration (s)', default: 30 }),
    },
    display: 'name',
    accessibleFrom: 'package_private',
})
```

Conventions:
- Table/field names: `snake_case` under the `x_804244_odm_` prefix; labels in plain English.
- One Fluent concern per file (`table.now.ts`, `acls.now.ts`, `business-rules.now.ts`, …).
- Server script includes: class-per-file, JSDoc on public methods, no business logic in ACL scripts.
- Player JS (`player.js`): vanilla ES module, no framework; **pure logic (rotation, hours-window, deck-diff) exported as functions** so jest imports them; DOM wiring kept thin and defensive (every external interaction wrapped in try/catch — the page must survive days unattended).

## Testing Strategy

- **Unit (jest, `test/`):** the `links` parser (comma/newline splitting, `%2C` handling, comments, invalid/bare-relative rejection), deck building (ordering, duration), JSON injection escaping, and — imported directly from `src/client/templates/player.js` — the rotation state machine, working-hours window (incl. overnight + fail-open), and deck-diff. Target ≥ 80% coverage on these modules.
- **Local template dev:** `rotator.html` opens directly in a browser with a mock `__ODM_DECK__` — full player behavior verifiable without an instance.
- **Manual verification checklist (docs/runbook.md):**
  - ACL matrix (impersonation pass): display account reads own deck / cannot read another screen's ✓, display cannot create/write ✓, manager edits any ✓, role-less user: no modules, no records, idle on REST ✓, admin sees "All slides" / others don't ✓, unauthenticated REST hit → 401 ✓
  - Uniqueness business rule rejects a second active slideshow for the same account
  - E2E on a real display: Bomgar login → player loop → overnight run → manager live-edit propagation → blocked external URL advances on schedule
- **ATF: deferred to post-MVP** (see Out of Scope) — regression value acknowledged, MVP speed wins.
- Every task in `tasks/todo.md` carries its own verify step; `now-sdk build` must pass before any commit.

## Boundaries

- **Always:**
  - Run `npm run lint && npm test && npx now-sdk build` before committing.
  - Keep all metadata in the SDK project (no direct in-instance edits that bypass source control).
  - Enforce ACLs on the slideshow table and roles on the REST routes — never rely on UI obscurity.
  - JSON-escape (`<\/script>`) the deck before injecting into the template — `links` is user-supplied.
  - Change the player template only via `src/client/templates/` + build + deploy (template = code).
  - Update SPEC.md when a design decision changes.
- **Ask first:**
  - Adding npm dependencies (runtime or dev).
  - Any cross-scope access (reading `sys_user` beyond reference fields, `cmdb_ci`, etc.) or changes to system properties.
  - Schema changes after the slideshow table is first deployed.
  - Deploying to any instance other than the designated dev instance.
- **Never:**
  - Commit instance credentials, auth tokens, or `now-sdk` auth artifacts.
  - Grant write access to the `display` role or elevate technical accounts beyond `display` + `snc_internal` — a hijacked display session must not be able to author or modify any content.
  - Store secrets/passwords of technical accounts anywhere in the app.
  - Use `eval`/dynamic script execution in the player.

## Success Criteria

1. `npx now-sdk build && npx now-sdk install` deploys `x_804244_odm` cleanly to the dev instance.
2. A manager (role `manager`, normal account) can create a slideshow with ≥ 3 comma-separated links (mix of a ServiceNow report/dashboard URL and an external URL), a slide duration, and working hours via the platform form.
2a. The meteor progress bar fills bottom-of-screen in sync with `slide_duration` and resets on each slide change.
2b. Outside working hours the display shows the standby screen and resumes automatically at `hours_start` (verified by setting a near-future window).
3. Logging in as the technical account and opening `/api/x_804244_odm/player/<screen>` starts a full-screen loop that runs **≥ 12 hours unattended** without stalling or session loss; the served page contains zero platform UI runtime. *(Honest dependency: passing this requires the instance session/SSO policy to permit it — Open Question 1 — not just correct app code.)*
3a. `rotator.html` runs the same loop locally against the mock deck (no instance).
4. A blocked external URL does not stall the loop — the next slide appears on schedule.
5. Manager edits the `links` field (URL added/removed/reordered) → the display reflects it within one `refresh_interval` without any interaction on the display.
6. ACL matrix verified via impersonation checklist: display accounts read only their assigned deck and cannot write; role-less users have no access at all; "All slides" appears for admin only; "My slideshows" shows exactly `created by me OR assigned to me`.
7. Jest suite passes; lint clean; `docs/runbook.md` checklist fully executed once.

## Out of Scope (v1) — Roadmap Candidates

Ranked by expected value for v2 planning:

1. **Broadcast override** — one deck/flag that takes over all (or selected) screens: emergency notices, all-hands announcements. Natural extension of the assignment model.
2. **Screen heartbeat** — the deck poll doubles as a liveness signal (last-seen per screen) → "are my displays on?" dashboard. Upgrades "what plays where" from inference to proof.
3. **Scheduling** — different decks per time-of-day / shift / weekday (MVP has a single daily working-hours window; weekday config and per-shift decks are the v2 extension).
4. **Per-slide duration overrides** — dropped from MVP with the single `slide_duration` field; returns if decks need mixed pacing.
5. **Template table + picker** — multiple layouts (2-up split, ticker), runtime authoring (admin-only write — it's a code-execution surface).
6. **Slide table / related-list UX** — when per-slide metadata outgrows the `links` textarea; clean upgrade, parser output shape stays the same.
7. **CI (`cmdb_ci`) linkage** — physical-screen reporting; add a `display_ci` reference without migration pain.
8. **Blocked-iframe detection + branded fallback card** (MVP shows the browser's refusal message and advances on timer).
9. **Fade transition** — two stacked iframes, preload + cross-fade in the template; may pull into v1.1 as pure-template polish.
10. Screenshot/preview of what a display currently shows.
11. Content types beyond URLs (uploaded images/videos).
12. ATF regression suite (add once the data model stabilizes).

## Known Limitations & Risks (honest)

Written down so nobody discovers them in production:

1. **Most public websites will not render.** Anything sending `X-Frame-Options`/CSP `frame-ancestors` (Google, most news sites, most SaaS) shows a refusal message in the iframe. Realistic MVP content = same-instance dashboards/reports + pages you control + the minority of embeddable external pages. Set this expectation with managers on day one.
2. **The whole product stands on the session surviving** (Open Question 1). If SSO/MFA policy forces re-auth, screens go dark at token expiry and someone must Bomgar in. This is an instance-policy conversation, not a code fix. Mitigation to investigate: local-auth exception for `svc.display.*` accounts.
3. **Each screen consumes an interactive ServiceNow session under a real user account.** Depending on your license model, per-screen technical accounts may have licensing cost — worth a 5-minute check with whoever owns licensing *before* rollout, not after.
4. **No liveness monitoring in MVP.** A crashed browser, powered-off display, or expired session is invisible — the slideshow list says what a screen *should* play, not whether it *is* playing (heartbeat = roadmap #2).
5. **`%2C` encoding is a manager-facing sharp edge.** A pasted ServiceNow URL with a literal comma in `sysparm_query` silently splits into two broken slides. The field hint + runbook mitigate; the parser's invalid-entry skipping prevents a broken deck, but the slide is simply missing. (Accepting this was the price of comma separation.)
6. **Kiosk hygiene is out of the app's hands:** browser autostart, full-screen (F11/kiosk mode), OS sleep/screensaver disabled, auto-restart after power loss — all runbook items on the display machine, not app features.
7. **Template changes require a deploy.** Any visual tweak (including meteor-bar styling) is git + `now-sdk install` — deliberate (template = code), but it means no instance-side hotfix of the player.

## Open Questions

1. **Instance session policy:** what is `glide.ui.session_timeout` on the target instance, and are technical accounts exempt from SSO re-auth/MFA? The infinite loop depends on the session surviving — if SSO forces periodic re-login, we need the runbook to cover it (or a dedicated local-auth policy for display accounts).

## Decision Log

- 2026-07-10 — Bind slideshow to technical account (not CI); CI linkage deferred to v2.
- 2026-07-10 — Stateless player: opening the player page starts the loop; `active` flag is the only control. No server-side running state.
- 2026-07-10 — Keep 3 roles; `admin` contains `manager`, no extra table ACLs in MVP.
- 2026-07-10 — Flat manager ACLs: any manager edits any slideshow (single trust domain).
- 2026-07-10 — Screen identity via technical-account naming convention (`svc.display.<location>`).
- 2026-07-10 — Player advance is purely timer-driven; blocked-iframe detection cut from MVP (v2).
- 2026-07-10 — ATF deferred to post-MVP; MVP verification = jest + manual runbook checklist.
- 2026-07-10 — **Supersedes UI Page + GlideAjax decisions:** player is a fully custom HTML document served by a Scripted REST API (`text/html`), deck JSON on a sibling route — zero platform UI runtime.
- 2026-07-10 — Template-as-code: one player template (`rotator.html`) developed locally, compiled into a Script Include constant at build; no template table, no runtime template editing (admin-only by construction).
- 2026-07-10 — Single custom table: slides live in a `links` textarea, parsed server-side. No slide table.
- 2026-07-10 — **Supersedes newline-only separator:** `links` is comma-separated per user decision (newlines also accepted); literal commas in URLs must be `%2C`-encoded — documented in field hint + runbook.
- 2026-07-10 — One `slide_duration` per slideshow (per-slide `|seconds` overrides dropped → roadmap).
- 2026-07-10 — Working-hours window (`hours_start`/`hours_end`) evaluated on the display's local clock; outside window = black standby screen, auto-resume; overnight windows supported.
- 2026-07-10 — `hours_*` stored as validated `HH:MM` **strings**, not glide_time (Time type is a UTC datetime in disguise; string is sufficient and honest for a wall-clock window). Invalid window = fail open (always on).
- 2026-07-10 — Template split: `rotator.html` (shell/CSS) + `player.js` (pure-logic ES module) so jest imports the real player code; build inlines them into `OdmTemplates.ts`.
- 2026-07-10 — Full-audit pass: stale slide-record references removed; bare relative URLs rejected (player lives under `/api/`); uniqueness business rule added as explicit fluent artifact; Known Limitations & Risks section added.
- 2026-07-10 — Meteor progress bar: red, glowing head, bottom-anchored, fills over `slide_duration`, resets per slide — part of the MVP template.
- 2026-07-10 — URL routing: `/player/{screen}` keyed by technical-account `user_name`, deck resolved via `assigned_account` — screen URLs permanent, deck swap stays remote. No-param variant resolves by logged-in user.
- 2026-07-10 — Self-service ACL model adopted (any `snc_internal` user authors own decks), then **superseded same day** (below).
- 2026-07-10 — **Supersedes self-service:** role-gated model — `display` reads only its assigned deck (no create/write), `manager`/`admin` full access, role-less users have no access; REST routes require an app role. `display` role kept with real purpose (module visibility + read-own ACL) — former Open Question 2 resolved.
- 2026-07-10 — Application menu "Office Display Manager": module **My slideshows** (visible to `manager` + `display`, filtered `created by me OR assigned to me`) and **All slides** (visible to `x_804244_odm.admin` only — managers administer all records via list filters).
- 2026-07-10 — **Browser auth finding:** the platform refuses cookie-only REST calls without `X-UserToken` (verified: real session → 401; +token → 200), and `authentication:false` routes don't bind the session user at all (verified: empty user context). A client-side bootstrap UI Page was tried and rejected (non-direct pages bury content in the platform shell).
- 2026-07-10 — **Supersedes the bootstrap approach — direct UI Page delivery:** `/x_804244_odm_player.do?screen=...` (`direct: true`, zero platform markup) renders the finished player **server-side** via the `OdmPlayerPage` script include → `renderPlayerHtml()` (deck + session token injected; login redirect free for anonymous). Platform constraints discovered and absorbed: the direct-page pipeline parses output as XML — so no DOCTYPE (stripped by the bridge; quirks mode is harmless for this CSS), the template is polyglot (self-closed voids, CDATA-wrapped scripts), fingerprint separators are `` escape sequences (raw control chars are invalid XML), and `escapeDeckJson` also escapes `>` so manager content can't emit a CDATA terminator. REST routes remain for API/polling; template-as-code unchanged.
- 2026-07-10 — **Admin preview guarantee made explicit:** users with the admin role (app or platform) can preview any screen's slideshow via its player/deck URLs. No code change — satisfied by role containment (`admin` ⊃ `manager` read-all) + `adminOverrides` on ACLs; verified live (platform-admin account fetched another screen's deck).
- 2026-07-10 — **Implementation finding:** the Australia platform cannot resolve extensionless module-to-module imports in server modules (`ModuleResolutionException`). The deployed REST handler is therefore a **generated self-contained module** (`player-routes.ts`, emitted by `build-template.mjs` from `deck.ts` + `handlers.src.ts` + the template). Fluent→module imports are unaffected. Sources stay separate and jest-covered.
- 2026-07-10 — **Alternative considered and parked:** SDK 4.x native front-end apps (React/BYOF bundled as static UX assets behind a UiPage endpoint, no Jelly issues). Rejected for MVP: hash-routing only (no `/player/{screen}` path params), no server-side deck injection into static assets, asset size bound to attachment-size property. Documented Plan B if REST-served HTML hits an obstacle; deck JSON route would be reused as-is. SDK pinned to 4.4+ (Australia-compatible).
