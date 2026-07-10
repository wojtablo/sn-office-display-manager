import { RestApi } from '@servicenow/sdk/core'
import { servePlayerHtml, serveDeckJson } from '../server/player-routes'

/**
 * ODM player API — serves the fully custom HTML player and its deck JSON.
 * URI base: /api/x_804244_odm/player (no trailing slash!)
 * Unversioned by design (SPEC: permanent screen URLs).
 *
 * Routes:
 *   GET /player                  -> HTML, deck of the logged-in user
 *   GET /player/deck?screen=...  -> JSON deck (player polling)
 *   GET /player/{screen}         -> HTML, deck of that screen's account
 *   GET /player/{screen}/deck    -> JSON deck
 *
 * Auth: platform authentication required (session cookie or basic).
 * Data access: ACL-enforced in the handlers via GlideRecordSecure.
 */
export const playerApi = RestApi({
    $id: Now.ID['odm-player-api'],
    name: 'ODM Player',
    serviceId: 'player',
    routes: [
        {
            $id: Now.ID['route-player-base'],
            name: 'Player (logged-in user)',
            path: '/',
            method: 'GET',
            script: servePlayerHtml,
            produces: 'text/html',
            shortDescription: 'ODM player HTML for the logged-in user',
        },
        {
            $id: Now.ID['route-deck-base'],
            name: 'Deck (query param)',
            path: '/deck',
            method: 'GET',
            script: serveDeckJson,
            produces: 'application/json',
            parameters: [
                {
                    $id: Now.ID['param-deck-screen'],
                    name: 'screen',
                    shortDescription: 'Technical account user_name of the screen',
                },
            ],
            shortDescription: 'Deck JSON for polling',
        },
        {
            $id: Now.ID['route-player-screen'],
            name: 'Player (screen)',
            path: '/{screen}',
            method: 'GET',
            script: servePlayerHtml,
            produces: 'text/html',
            shortDescription: 'ODM player HTML for a specific screen',
        },
        {
            $id: Now.ID['route-deck-screen'],
            name: 'Deck (screen)',
            path: '/{screen}/deck',
            method: 'GET',
            script: serveDeckJson,
            produces: 'application/json',
            shortDescription: 'Deck JSON for a specific screen',
        },
    ],
})
