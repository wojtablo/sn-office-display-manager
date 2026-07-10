import { UiPage } from '@servicenow/sdk/core'

/**
 * Bootstrap page for the ODM player: /x_804244_odm_player.do?screen=<user_name>
 *
 * Why it exists: the platform rejects cookie-only REST calls without an
 * X-UserToken header (CSRF protection), and a browser address bar cannot send
 * headers. This classic (non-direct) UI Page owns the session's g_ck token,
 * fetches the real player HTML from the Scripted REST route with that token,
 * and document.write()s it. Anonymous visitors get the platform login
 * redirect for free, then land back here.
 *
 * The page is a shim ONLY — the player itself remains template-as-code served
 * by REST. The bootstrap source (player-bootstrap.html) uses no Jelly
 * interpolation (no dollar-brace anywhere).
 */
export const playerBootstrap = UiPage({
    $id: Now.ID['odm-player-bootstrap'],
    endpoint: 'x_804244_odm_player.do',
    category: 'general',
    direct: false,
    description: 'ODM player bootstrap: fetches /api/x_804244_odm/player with the session token and replaces the document',
    html: Now.include('../server/UiPage/player-bootstrap.html'),
})
