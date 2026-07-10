import { RestApi } from '@servicenow/sdk/core'
import { servePlayerSkeleton } from '../server/player-routes'

/**
 * ODM player API — serves the fully custom HTML player and its deck JSON.
 * URI base: /api/x_804244_odm/player
 * Unversioned by design (SPEC: permanent screen URLs).
 */
export const playerApi = RestApi({
    $id: Now.ID['odm-player-api'],
    name: 'ODM Player',
    serviceId: 'player',
    produces: 'text/html',
    routes: [
        {
            $id: Now.ID['route-player-base'],
            name: 'Player (logged-in user)',
            path: '/',
            method: 'GET',
            script: servePlayerSkeleton,
            shortDescription: 'Serves the ODM player HTML for the logged-in user',
        },
    ],
})
