import { UiPage } from '@servicenow/sdk/core'

/**
 * The browser entry point: /x_804244_odm_player.do?screen=<user_name>
 *
 * direct: true — the platform adds NOTHING (no UI16/Polaris wrapper, no
 * platform JS/CSS). The page server-side renders the finished player document
 * (template + deck + session token) via the OdmPlayerPage script include and
 * prints it raw. Login redirect for anonymous visitors comes free.
 *
 * The player itself stays template-as-code (rotator.html + player.js); this
 * page is just the session-authenticated delivery path — the platform rejects
 * cookie-only REST calls (X-UserToken CSRF rule), so REST alone cannot serve
 * a browser address bar.
 */
export const playerPage = UiPage({
    $id: Now.ID['odm-player-page'],
    endpoint: 'x_804244_odm_player.do',
    category: 'general',
    direct: true,
    description: 'ODM player — serves the fully rendered player HTML for a screen',
    html: Now.include('../server/UiPage/player-page.html'),
})
