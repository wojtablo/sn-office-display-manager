# Implementation Plan: Office Display Manager (ODM)

> Source of truth: `SPEC.md` (converged 2026-07-10, 10 iterations). Scope `x_804244_odm`, ServiceNow SDK 4.4+, Australia release.

## Overview

Build a scoped app with one custom table (`x_804244_odm_slideshow`), three roles, a
Scripted REST API that serves a fully custom HTML player (template-as-code, injected
deck JSON) plus a JSON deck route, and a locally-testable player template
(`rotator.html` + `player.js`: timer rotation, meteor progress bar, working-hours
standby, live polling). Verification = jest on pure logic + manual runbook checklist.

## Architecture Decisions (from SPEC.md — do not re-litigate)

- Player served by Scripted REST (`text/html`), zero platform UI runtime; SDK 4.x front-end/UiPage is the documented Plan B.
- Template compiled into `OdmTemplates.ts` script include by `scripts/build-template.mjs`.
- Routing `/player/{screen}` by tech-account `user_name`; no-param variant = logged-in user.
- Role-gated ACLs: display = read own assigned deck only; manager/admin = all; no role = nothing.
- `links` = comma/newline-separated, `%2C` rule; single `slide_duration`; `hours_*` as HH:MM strings, fail open.

## Dependency Graph

```
T1 scaffold ──► T2 walking skeleton (REST→HTML proof)  ◄─ HIGHEST RISK, DO FIRST
   │                    │
   │   ┌────────────────┴────────────── CHECKPOINT 1 ─────────────┐
   │   ▼                                                          ▼
   │  Phase A (local, no instance)                Phase B (instance-side)
   │  T3 player.js logic + jest                   T5 table fluent
   │  T4 rotator.html shell + meteor bar          T6 roles + ACLs + BR + menu
   │  (T3,T4) ─► T7 build-template.mjs            T5 ─► T8 OdmPlayerApi (parser/deck/escape)
   │                    │                                         │
   │                    └──────────► T9 REST routes wired ◄───────┘
   │                                (template + deck + idle paths)
   │                                        │
   │                              CHECKPOINT 3 (E2E on instance)
   │                                        ▼
   │                       T10 ACL + behavior checklist pass
   │                       T11 runbook
   │                       T12 overnight soak (≥12 h)
```

Phase A and Phase B are **parallelizable** after Checkpoint 1; they converge at T9.

---

## Task List

### Phase 0: Foundation & risk retirement

#### Task 1: Scaffold the SDK project
**Description:** `now-sdk init` for scope `x_804244_odm` / app "Office Display Manager"; wire `package.json` scripts (`build`, `deploy`, `lint`, `test`, `dev:template` placeholder), ESLint+Prettier, jest config, `.gitignore` (auth artifacts!), `git init` + first commit.
**Acceptance:**
- [ ] `npx now-sdk build` succeeds on the empty app
- [ ] `npm run lint` and `npm test` run (0 tests OK)
- [ ] `.gitignore` excludes SDK auth/build artifacts
**Verify:** `npm run lint && npm test && npx now-sdk build`
**Dependencies:** none · **Files:** project root, `now.config.json`, `package.json` · **Scope:** M

#### Task 2: Walking skeleton — prove REST serves chrome-free HTML
**Description:** Minimal `rest-api.now.ts` (RestApi fluent) + trivial script returning hardcoded `<html><body>ODM OK</body></html>` with `Content-Type: text/html` via `getStreamWriter()`. Deploy; open authenticated in a browser.
**Acceptance:**
- [ ] `GET /api/x_804244_odm/player` renders "ODM OK" in a browser tab with **zero platform chrome**
- [ ] Unauthenticated request → 401, not a login-page redirect loop
**Verify:** manual browser check on dev instance (logged in + incognito)
**Dependencies:** T1 · **Files:** `src/fluent/rest-api.now.ts` · **Scope:** S
**⚠ Risk gate:** if this fails (headers stripped, HTML sanitized, auth weirdness), STOP — switch to Plan B (SDK front-end/UiPage) per Decision Log before building anything else.

### Checkpoint 1: Architecture proven
- [ ] Build+deploy round-trip works; REST-served HTML renders; human confirms before fan-out.

---

### Phase A: Local player (no instance needed — parallel with Phase B)

#### Task 3: `player.js` — pure logic + jest
**Description:** ES module exporting pure functions: rotation state machine (advance/wrap, single-slide reload), working-hours window check (HH:MM parse, overnight span, fail-open on invalid), deck-diff (poll change detection). No DOM code.
**Acceptance:**
- [ ] Jest covers: rotation incl. 1-slide deck; hours incl. 22:00–06:00 and garbage input → always-on; deck-diff
- [ ] ≥ 80% coverage on the module
**Verify:** `npm test`
**Dependencies:** T1 · **Files:** `src/client/templates/player.js`, `test/player.test.js` · **Scope:** M

#### Task 4: `rotator.html` — shell, meteor bar, standby/idle screens
**Description:** Full-screen iframe layout; **meteor progress bar** (bottom-anchored, red trail, glowing head, fills over `slide_duration`, resets per slide); working-hours standby screen (black, clock + screen name); idle card (no deck / error). Mock `__ODM_DECK__` so the file runs by double-clicking it. Thin DOM wiring around `player.js`, everything try/catch-wrapped.
**Acceptance:**
- [ ] Opens locally, loops mock deck, meteor bar syncs to duration and resets per slide
- [ ] Setting mock hours to exclude "now" → standby screen; inclusive → plays
- [ ] Idle card shows when mock deck is empty
**Verify:** manual local browser run (Chrome) against mock deck variants
**Dependencies:** T3 · **Files:** `src/client/templates/rotator.html` · **Scope:** M

#### Task 7: `build-template.mjs` — template → `OdmTemplates.ts`
**Description:** Node script: inline `player.js` into `rotator.html`, emit `src/server/OdmTemplates.ts` exporting the HTML string; wire into `npm run build` ahead of `now-sdk build`.
**Acceptance:**
- [ ] `npm run build` regenerates `OdmTemplates.ts` deterministically; output HTML identical in behavior to local file
- [ ] Generated file passes lint; committed to git
**Verify:** `npm run build` twice → identical output; diff inspection
**Dependencies:** T3, T4 · **Files:** `scripts/build-template.mjs`, `src/server/OdmTemplates.ts`, `package.json` · **Scope:** S

### Checkpoint 2: Local player complete
- [ ] Full player behavior demonstrable on a laptop with zero instance access; jest green; build generates the template constant.

---

### Phase B: Data model & access (instance-side)

#### Task 5: Slideshow table
**Description:** `table.now.ts` per SPEC data model (name, description, assigned_account→sys_user, links 8000, slide_duration def 30, hours_start "07:00", hours_end "19:00", active def true, refresh_interval def 60); form layout + list via `List`/`Form` fluent; field hint on `links` stating comma separation + `%2C` rule.
**Acceptance:**
- [ ] Deploys; record creatable via platform form; defaults correct; hint visible
**Verify:** `npm run build && npm run deploy`, manual form check
**Dependencies:** T1 · **Files:** `src/fluent/table.now.ts` · **Scope:** M

#### Task 6: Roles, ACLs, uniqueness rule, menu
**Description:** `roles.now.ts` (admin contains manager; display), `acls.now.ts` per role-gated matrix (display: read own assigned only; manager/admin: all CRUD; no role: nothing), `business-rules.now.ts` (reject second **active** slideshow for same `assigned_account`), `menu.now.ts` ("Office Display Manager": *My slideshows* [manager+display, filter created-by-me OR assigned-to-me], *All slides* [admin]).
**Acceptance:**
- [ ] Impersonation: display reads own deck only, cannot create/write; manager edits any; role-less sees nothing; modules appear per role
- [ ] BR blocks duplicate active assignment with a clear message
**Verify:** manual impersonation matrix on dev instance (checklist from SPEC Testing section)
**Dependencies:** T5 · **Files:** `src/fluent/roles.now.ts`, `acls.now.ts`, `business-rules.now.ts`, `menu.now.ts` · **Scope:** M

#### Task 8: `OdmPlayerApi` — parser, deck builder, injection escaper
**Description:** Script include: `parseLinks()` (comma/newline split, trim, `#` skip, absolute/root-relative validation, bare-relative rejection), `buildDeck()` (GlideRecord: resolve account → active slideshow → deck object incl. hours + refresh_interval), `escapeForInjection()` (`JSON.stringify` + `</script>` → `<\/script>`). Pure parts mirrored as importable TS for jest.
**Acceptance:**
- [ ] Jest: parser edge cases (`%2C`, comma-in-URL corruption documented behavior, comments, garbage), escaper breakout attempt neutralized
- [ ] Deck for a known account returns correct order/duration/hours
**Verify:** `npm test`; on-instance background script sanity check
**Dependencies:** T5 (schema), T1 · **Files:** `src/server/OdmPlayerApi.ts`, `test/parser.test.js` · **Scope:** M

#### Task 9: Wire the three REST routes (convergence task)
**Description:** Replace skeleton with real routes: `GET /player/{screen}` (resolve → deck → inject into `OdmTemplates` HTML → stream), `GET /player` (logged-in user), `GET /player/{screen}/deck` (JSON). Role requirement on routes; idle-card paths (no deck / no rights / unknown screen) return the template with empty deck, never an error page or data leak.
**Acceptance:**
- [ ] Real slideshow plays at `/api/x_804244_odm/player/<screen>` under the tech account
- [ ] `/deck` returns matching JSON; poll picks up an edit within one `refresh_interval`
- [ ] Unknown screen / no-rights → idle card; no stack traces, no other users' data
**Verify:** manual E2E on dev instance with 2 accounts (manager + display)
**Dependencies:** T7, T8, T6 · **Files:** `src/fluent/rest-api.now.ts`, `src/server/OdmPlayerApi.ts` · **Scope:** M

### Checkpoint 3: E2E works on the instance
- [ ] Manager authors deck → display account plays it → live edit propagates → kill switch idles the screen. Human review before hardening.

---

### Phase C: Hardening & handover

#### Task 10: Full manual verification pass
**Description:** Execute the SPEC Testing checklist end-to-end: ACL impersonation matrix, BR uniqueness, kill switch, standby window (near-future hours), blocked external URL advances on schedule, meteor bar sync.
**Acceptance:** every checklist item ticked or filed as a defect and fixed
**Verify:** checklist run recorded in `docs/runbook.md`
**Dependencies:** T9 · **Scope:** S (no new code expected)

#### Task 11: `docs/runbook.md`
**Description:** Display setup (Bomgar flow, kiosk hygiene: autostart, F11/kiosk mode, sleep off), the `%2C` rule with examples, embed-URL guidance for external sites (incl. header-stripping-extension option + proxy prohibition), session/SSO policy actions (Open Question 1), Platform Analytics URL patterns, troubleshooting (401, idle card causes), verification checklist.
**Acceptance:** a colleague can set up a new screen using only the runbook
**Verify:** peer walkthrough (or self-walkthrough on a clean browser profile)
**Dependencies:** T9 (accurate URLs/behavior) · **Files:** `docs/runbook.md` · **Scope:** S

#### Task 12: Overnight soak
**Description:** ≥ 12 h unattended run on a real (or simulated kiosk) display; monitor for stalls, session loss, memory creep (single tab, days-long target).
**Acceptance:** SPEC success criterion 3 met, or failure root-caused (if session policy is the cause → escalate per Open Question 1, not a code fix)
**Verify:** timestamped screen check + browser console after the soak
**Dependencies:** T10, T11 · **Scope:** S

### Checkpoint 4: Done
- [ ] All SPEC Success Criteria (1, 2, 2a, 2b, 3, 3a, 4, 5, 6, 7) demonstrably met.

---

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| REST route can't stream browser-renderable HTML (headers/sanitization) | **High** — kills core architecture | T2 walking skeleton first; documented Plan B (SDK front-end/UiPage) in Decision Log |
| SDK fluent gaps vs. docs (RestApi/BusinessRule quirks on 4.x) | Med | Verified against SDK API reference during research; generic `Record` fallback; discover in T2/T5, not late |
| Instance session/SSO kills unattended session (Open Question 1) | **High** — product-level | Not solvable in code: runbook guidance + policy conversation; soak test (T12) surfaces it early |
| `%2C` sharp edge corrupts manager-pasted URLs | Med | Field hint + runbook (T5/T11); parser skips invalid entries so deck never breaks |
| Uniqueness BR race / bypass via import | Low | BR + checklist test in T6; ATF later (roadmap) |
| Jest ↔ instance JS divergence (ES module vs. Rhino script include) | Med | Pure logic lives in TS/ESM compiled by SDK; only thin GlideRecord wrapper is instance-only |

## Parallelization

- After Checkpoint 1: **Phase A (T3,T4,T7)** and **Phase B (T5,T6,T8)** can run as two parallel streams (even two sessions); they only converge at T9.
- T11 (runbook) can be drafted any time after T2; finalized after T9.

## Open Questions (carried from SPEC)

1. Instance session/SSO policy for technical accounts — needed by T11/T12, not before.
2. Dev instance URL + credentials for `now-sdk auth` — needed at T1.
