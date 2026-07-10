# ODM Runbook — Display Setup & Verification

> App: Office Display Manager (`x_804244_odm`)
> **Browser/display URL:** `https://<instance>/x_804244_odm_player.do?screen=<screen>`
> (direct page — your player HTML only, zero platform markup; login redirect and
> session tokens handled automatically).
> The raw REST routes under `/api/x_804244_odm/player` are for API clients with
> basic auth/tokens; opening them cookie-only in a browser yields 401 by platform
> design (X-UserToken requirement).

## 1. Setting up a new screen

1. **Create the technical account** (admin): `sys_user`, user_name per naming
   convention `svc.display.<location>` (e.g. `svc.display.sd-room1`), strong password.
   No app role needed — the account can open only the slideshow assigned to it.
2. **Author the slideshow** (manager, from your desk): *Office Display Manager →
   My slideshows → New*:
   - **Links** — comma-separated URLs (newlines also work). Rules:
     - absolute (`https://...`) or root-relative (`/sys_report_template.do?...`) only
     - a literal comma inside a URL must be encoded as `%2C`
       (e.g. `sysparm_query=state%3D1%2Cpriority%3D2`), otherwise the entry splits
     - start an entry with `#` to temporarily disable it
   - **Service account** — the screen's technical account
   - **Slide duration / Working hours / Refresh interval** — as needed
   - **Active** — checked
3. **Launch on the display** (once, via Bomgar):
   1. Open the browser on the display machine, log into the instance as the
      technical account.
   2. Navigate to `https://<instance>/x_804244_odm_player.do?screen=<screen-user-name>`
      (omit `?screen=` to use the logged-in account). Not signed in? The platform
      redirects to login and back automatically.
   3. Full-screen it (F11) — better: launch Chrome with `--kiosk <url>`.
   4. Disconnect Bomgar. Done — the loop runs; edits from your desk apply within
      one refresh interval.

### Kiosk hygiene (display machine, not the app)
- Disable OS sleep, screensaver, and automatic updates-with-reboot during hours.
- Browser autostart on boot with the player URL (`--kiosk --noerrdialogs --disable-session-crashed-bubble`).
- Auto-login of the OS user after power loss.

## 1a. Previewing a screen (admins & managers)

Anyone with the admin role (app `x_804244_odm.admin` or platform admin) — and any
manager — can see exactly what a screen is playing without touching it: log into the
instance and open that screen's player URL in a browser tab:

```
/x_804244_odm_player.do?screen=<screen-user-name>       — the live view (loop, meteor bar)
/api/x_804244_odm/player/<screen-user-name>/deck        — deck JSON (API clients / basic auth)
```

Display accounts cannot do the reverse — they only ever read their own deck.

## 2. Content guidance

- **Same-instance URLs always work** (dashboards, reports, lists — same origin).
  Platform Analytics dashboard URLs make premium wall content.
- **External sites**: most send `X-Frame-Options`/CSP and will show a refusal
  message for their slide duration; the loop advances regardless. Prefer each
  tool's *embed/kiosk* URL variant (Grafana `?kiosk`, Power BI publish-to-web,
  Tableau embed, YouTube `/embed/`...).
- Kiosk-level workaround for must-have blocked sites: a header-stripping browser
  extension on the display profile only (accepted risk on a no-human kiosk).
  **Never** proxy third-party pages through the instance.

## 3. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Browser shows JSON `401` | You opened the raw `/api/...` URL — use `/x_804244_odm_player.do?screen=...` instead (or the session expired: it redirects to login) |
| `400 Bad Request` | Trailing slash on the URL — remove it |
| Idle card "No active slideshow" | Nothing assigned to this account, `Active` unchecked, or the account can't read the deck (check role + assignment) |
| Idle card on `/player/<screen>` | `<screen>` misspelled (must equal the tech account `user_name`), or the calling session lacks read rights on that deck |
| A slide shows "refused to connect" | Target site blocks iframing — see content guidance above |
| One entry of the deck missing | Unencoded comma split it, or it's a bare relative URL (must start `/` or `https://`) |
| Black screen with a clock | Working-hours standby — expected outside the window; check `hours_start`/`hours_end` |
| Deck edits don't appear | Wait one `refresh_interval`; check the record is the one assigned to *this* account |

## 4. Verification checklist (release gate)

Executed 2026-07-10 against dev395356 (Australia patch3) — all automated items pass:

- [x] `npm test` — 58 tests green (parser, hours window incl. overnight+fail-open, rotation, injection escaping)
- [x] `npm run build && npm run deploy` — clean round-trip
- [x] `GET /api/x_804244_odm/player` returns chrome-free HTML, `Content-Type: text/html`
- [x] Unauthenticated request → 401; trailing slash → 400 (documented)
- [x] Deck JSON correct for assigned slideshow; `#` entries skipped; `%2C` respected
- [x] Deck injected into HTML (`window.__ODM_DECK__ = {...}`), `<` escaped (`<`) — no script breakout
- [x] Business rule rejects a second active slideshow per account (403 with message)
- [x] Live update: `links` PATCH visible on next deck fetch
- [x] Kill switch: `active=false` → empty deck; restore works
- [x] ACL matrix (real accounts `odm.test.manager` / `svc.display.test1`):
  - manager creates ✓, reads all ✓, edits records created by others ✓
  - display reads own deck ✓, list shows only own record ✓, other screens' decks come back empty ✓, create 403 ✓, write-own 403 ✓
- [ ] **Visual pass (human):** open `src/client/templates/rotator.html` locally — meteor bar fills/resets, standby appears outside mock hours, idle card on empty deck
- [ ] **Visual pass (instance):** open `/x_804244_odm_player.do` as `svc.display.test1` in a browser — SD Test Wall loops
- [ ] **Overnight soak (≥ 12 h)** on a real display — SPEC success criterion 3.
      If the session dies: this is instance session/SSO policy (SPEC Open
      Question 1), not app code — check `glide.ui.session_timeout` and SSO
      exemptions for `svc.display.*` accounts.

## 5. Test fixtures on dev395356

| Object | Value |
|---|---|
| Slideshows | `E2E Test Wall` (claude) · `SD Test Wall` (svc.display.test1, 10 s) · `NOC Wall - Incidents` (svc.display.test2, 3 same-instance lists incl. a `%2C`-encoded query, 20 s, 07–19) · `Lobby Welcome` (svc.display.lobby, external pages + a `#`-disabled entry, 45 s, 06–22) · `Weekend Draft` (svc.display.test2, **inactive** — activating it demonstrates the uniqueness rule) |
| Test manager | `odm.test.manager` (role `x_804244_odm.manager`) |
| Test displays | `svc.display.test1`, `svc.display.test2`, `svc.display.lobby` (role `x_804244_odm.display`) |
| Player URLs | `/x_804244_odm_player.do?screen=svc.display.test2` (NOC) · `?screen=svc.display.lobby` (signage) · `?screen=svc.display.test1` · deck JSON (API): `/api/x_804244_odm/player/<screen>/deck` |

Passwords for test accounts were set at creation on 2026-07-10; rotate or delete
these fixtures before any real rollout.
