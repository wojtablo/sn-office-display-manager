import { BusinessRule } from '@servicenow/sdk/core'

/**
 * SPEC.md invariant: at most ONE active slideshow per assigned account.
 * Before insert/update, when the record is active and has an assigned account,
 * abort if another active slideshow already claims the same account.
 */
export const uniqueActiveAssignment = BusinessRule({
    $id: Now.ID['br-unique-active-assignment'],
    name: 'ODM: unique active slideshow per account',
    table: 'x_804244_odm_slideshow',
    when: 'before',
    action: ['insert', 'update'],
    order: 100,
    active: true,
    description:
        'Rejects a second active slideshow for the same service account. The player resolves exactly one deck per screen.',
    script: `(function executeRule(current, previous /*null when async*/) {
    if (!current.active || current.assigned_account.nil()) {
        return;
    }
    var other = new GlideRecord('x_804244_odm_slideshow');
    other.addQuery('assigned_account', current.getValue('assigned_account'));
    other.addQuery('active', true);
    other.addQuery('sys_id', '!=', current.getUniqueValue());
    other.setLimit(1);
    other.query();
    if (other.next()) {
        gs.addErrorMessage(
            'Service account "' + current.assigned_account.getDisplayValue() +
            '" already has an active slideshow: "' + other.getValue('name') +
            '". Deactivate it first, or assign a different account.'
        );
        current.setAbortAction(true);
    }
})(current, previous);`,
})

/**
 * Keeps `player_link` in sync with the assigned service account:
 * <instance>/x_804244_odm_player.do?screen=<user_name>. Cleared when
 * no account is assigned.
 */
export const maintainPlayerLink = BusinessRule({
    $id: Now.ID['br-maintain-player-link'],
    name: 'ODM: maintain player link',
    table: 'x_804244_odm_slideshow',
    when: 'before',
    action: ['insert', 'update'],
    order: 200,
    active: true,
    description: 'Sets the read-only player_link field from the assigned service account',
    script: `(function executeRule(current, previous /*null when async*/) {
    var link = '';
    if (!current.assigned_account.nil()) {
        var base = String(gs.getProperty('glide.servlet.uri') || '');
        if (base && base.charAt(base.length - 1) !== '/') {
            base += '/';
        }
        var screen = String(current.assigned_account.user_name);
        link = base + 'x_804244_odm_player.do?screen=' + encodeURIComponent(screen);
    }
    current.setValue('player_link', link);
})(current, previous);`,
})
