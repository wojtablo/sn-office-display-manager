import { ScriptInclude } from '@servicenow/sdk/core'

/**
 * Bridge for the direct UI page: Jelly can only call classic Script Includes,
 * so this thin class require()s the server module and returns the fully
 * rendered player HTML (deck + session token injected server-side).
 */
export const odmPlayerPage = ScriptInclude({
    $id: Now.ID['si-odm-player-page'],
    name: 'OdmPlayerPage',
    description: 'Renders the ODM player HTML for a screen (used by the x_804244_odm_player.do direct UI page)',
    accessibleFrom: 'package_private',
    active: true,
    script: `var OdmPlayerPage = Class.create();
OdmPlayerPage.prototype = {
    initialize: function () {},

    /** Returns the complete player HTML document for the given screen (or the logged-in user). */
    getHtml: function (screen) {
        var routes = require('x_804244_odm/office-display-manager/1.0.0/src/server/player-routes.ts');
        // the direct-UI-page output pipeline rejects DOCTYPE declarations (XXE guard)
        return String(routes.renderPlayerHtml(screen || '')).replace(/^<!DOCTYPE[^>]*>\s*/i, '');
    },

    type: 'OdmPlayerPage'
};`,
})
