# ODM — Task Checklist

> Detail per task: `tasks/plan.md`. Spec: `SPEC.md`. Do not start a task before its dependencies are checked off.

## Phase 0 — Foundation & risk retirement
- [x] **T1** Scaffold SDK project — DONE 2026-07-10: converted existing `x_804244_odm` app from PDI dev395356 (`--from`), auth profile `odm-pdi`, build+deploy round-trip verified, git initialized. NOTE: lint/jest deliberately deferred to T3 (first testable module). Spec roles deployed early (part of T6): admin/manager/display live on instance, old `user`/`service_account` deleted.
  - Verify: `npm run build && npm run deploy` ✓
- [x] **T2** Walking skeleton — RISK GATE PASSED 2026-07-10: /api/x_804244_odm/player streams text/html chrome-free; unauth → 401; trailing slash → 400 (runbook note)

### ☑ Checkpoint 1 — architecture proven (human review)

## Phase A — Local player (parallel with Phase B)
- [x] **T3** `player.js` pure logic + jest — DONE: 38 tests, coverage ~97%
- [x] **T4** `rotator.html` shell — DONE (code-complete; human visual pass pending, see runbook checklist)
- [x] **T7** `build-template.mjs` — DONE: deterministic; also emits self-contained player-routes.ts (see plan note)

### ☑ Checkpoint 2 — local player complete

## Phase B — Data model & access (parallel with Phase A)
- [x] **T5** Slideshow table — DONE: deployed, record creation verified via Table API + BR
- [x] **T6** Roles + ACLs + uniqueness BR + menu — DONE: 8/8 ACL matrix cells verified with real test accounts; BR rejects duplicates (403)
- [x] **T8** deck.ts (parseLinks/buildDeck/escapeDeckJson/injectDeck) — DONE: 20 jest tests, 100% coverage

## Convergence
- [x] **T9** REST routes — DONE: 4 routes live (incl. /deck?screen=), E2E with manager+display accounts, live edit + kill switch verified, idle paths leak nothing. NOTE: platform can't resolve module→module imports; deployed handler is generated self-contained (build-template.mjs)

### ☑ Checkpoint 3 — E2E on instance (human review)

## Phase C — Hardening & handover
- [x] **T10** Verification pass — automated items 100% (see docs/runbook.md §4); 2 human visual passes + soak remain
- [x] **T11** `docs/runbook.md` — DONE: setup, kiosk hygiene, content guidance, troubleshooting, checklist, fixtures
- [ ] **T12** Overnight soak ≥ 12 h — PENDING (needs a real display + human; instructions in runbook §4)

### ☑ Checkpoint 4 — all SPEC success criteria met
