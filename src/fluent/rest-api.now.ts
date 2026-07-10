import { RestApi } from '@servicenow/sdk/core'
import { serveDeckJson } from '../server/player-routes'

/**
 * ODM player API — a single route: the deck JSON the player template polls.
 * URI: GET /api/x_804244_odm/player/deck?screen=<user_name>
 *
 * The player HTML is NOT served here — it comes from the direct UI page
 * /x_804244_odm_player.do, which renders in-process (see script-include.now.ts).
 * This route exists only so the running player can poll for live deck changes.
 *
 * Auth: platform authentication required (session cookie or basic).
 * Access: creator / assigned service account / admin / public — enforced in the handler.
 */
export const playerApi = RestApi({
    $id: Now.ID['odm-player-api'],
    name: 'ODM Player',
    serviceId: 'player',
    routes: [
        {
            $id: Now.ID['route-deck-base'],
            name: 'Deck',
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
            shortDescription: 'Deck JSON for the player to poll',
        },
    ],
})
