import { UiPolicy } from '@servicenow/sdk/core'

/**
 * Player link is system-maintained (see the 'maintain player link' business
 * rule) — always read-only on the form. Empty condition = always applies.
 * The business rule still writes the value server-side (UI policies only
 * affect the form UI, not server writes).
 */
export const playerLinkReadOnly = UiPolicy({
    $id: Now.ID['uip-player-link-readonly'],
    table: 'x_804244_odm_slideshow',
    shortDescription: 'Player link is read-only (system-maintained)',
    active: true,
    global: true,
    onLoad: true,
    conditions: '',
    actions: [{ field: 'player_link', readOnly: true }],
})
