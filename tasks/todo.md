# ODM — Task Checklist

> Detail per task: `tasks/plan.md`. Spec: `SPEC.md`. Do not start a task before its dependencies are checked off.

## Phase 0 — Foundation & risk retirement
- [x] **T1** Scaffold SDK project — DONE 2026-07-10: converted existing `x_804244_odm` app from PDI dev395356 (`--from`), auth profile `odm-pdi`, build+deploy round-trip verified, git initialized. NOTE: lint/jest deliberately deferred to T3 (first testable module). Spec roles deployed early (part of T6): admin/manager/display live on instance, old `user`/`service_account` deleted.
  - Verify: `npm run build && npm run deploy` ✓
- [ ] **T2** Walking skeleton: REST route streams hardcoded HTML, renders chrome-free in browser ⚠ RISK GATE
  - Verify: browser (authenticated) shows "ODM OK"; incognito → 401

### ☑ Checkpoint 1 — architecture proven (human review)

## Phase A — Local player (parallel with Phase B)
- [ ] **T3** `player.js` pure logic (rotation, hours window, deck-diff) + jest ≥80%
  - Verify: `npm test`
- [ ] **T4** `rotator.html` shell: meteor bar, standby screen, idle card, mock deck
  - Verify: local browser run — loop / standby / idle all reachable via mock variants
- [ ] **T7** `build-template.mjs` → `OdmTemplates.ts`, wired into `npm run build`
  - Verify: `npm run build` twice → deterministic output, lint passes

### ☑ Checkpoint 2 — local player complete

## Phase B — Data model & access (parallel with Phase A)
- [ ] **T5** Slideshow table fluent + form/list + `links` field hint (`%2C` rule)
  - Verify: deploy, create record via form, defaults correct
- [ ] **T6** Roles ✓ (done with T1) + ACL matrix + uniqueness BR + menu (My slideshows / All slides)
  - Verify: impersonation matrix + duplicate-active-assignment rejected
- [ ] **T8** `OdmPlayerApi`: parseLinks / buildDeck / escapeForInjection + jest
  - Verify: `npm test`; background-script sanity check on instance

## Convergence
- [ ] **T9** Wire real REST routes: `/player/{screen}`, `/player`, `/player/{screen}/deck`
  - Verify: E2E with manager + display accounts; live edit propagates; idle paths safe

### ☑ Checkpoint 3 — E2E on instance (human review)

## Phase C — Hardening & handover
- [ ] **T10** Full manual verification pass (SPEC Testing checklist)
- [ ] **T11** `docs/runbook.md` (screen setup, kiosk hygiene, `%2C`, embed guidance, session policy)
  - Verify: clean-profile walkthrough
- [ ] **T12** Overnight soak ≥ 12 h (SPEC criterion 3)

### ☑ Checkpoint 4 — all SPEC success criteria met
