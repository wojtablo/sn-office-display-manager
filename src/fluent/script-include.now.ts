import { ScriptInclude } from '@servicenow/sdk/core'

/**
 * Bridge for the direct UI page: Jelly can only call classic Script Includes,
 * so this thin class require()s the server module and returns the fully
 * rendered player HTML (deck + session token injected server-side).
 *
 * The module path embeds the app VERSION, which the SDK bumps on every release.
 * A hardcoded version silently breaks the .do page after the next bump (the
 * require path stops resolving), so we resolve the current version at runtime
 * from sys_app instead — the require path always tracks the deployed module.
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

    /** Current deployed version of this scoped app (module require paths embed it). */
    _appVersion: function () {
        var app = new GlideRecord('sys_app');
        return app.get('scope', 'x_804244_odm') ? String(app.getValue('version')) : '';
    },

    /** Returns the complete player HTML document for the given screen (or the logged-in user). */
    getHtml: function (screen) {
        var path = 'x_804244_odm/office-display-manager/' + this._appVersion() + '/src/server/player-routes.ts';
        var routes = require(path);
        // the direct-UI-page output pipeline rejects DOCTYPE declarations (XXE guard)
        return String(routes.renderPlayerHtml(screen || '')).replace(/^<!DOCTYPE[^>]*>\s*/i, '');
    },

    type: 'OdmPlayerPage'
};`,
})
