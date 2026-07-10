import { Acl } from '@servicenow/sdk/core'

/**
 * Ownership-based ACLs — no custom roles, and no dependency on `snc_internal`
 * (which is absent on some instances). Platform admin passes all via adminOverrides.
 *
 * - create: any authenticated (logged-in) user
 * - read:   the creator OR the assigned service account
 * - write/delete: the creator only
 *
 * Player open-time access (creator / service account / admin) is enforced
 * separately in the REST handler, not by these table ACLs.
 */

const CREATOR = 'sys_created_by=javascript:gs.getUserName()'
const CREATOR_OR_ASSIGNED = 'sys_created_by=javascript:gs.getUserName()^ORassigned_account=javascript:gs.getUserID()'

export const slideshowCreate = Acl({
    $id: Now.ID['acl-slideshow-create'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'create',
    adminOverrides: true,
    script: 'answer = gs.isLoggedIn();',
    description: 'Any authenticated user can create a slideshow',
})

export const slideshowRead = Acl({
    $id: Now.ID['acl-slideshow-read'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'read',
    adminOverrides: true,
    condition: CREATOR_OR_ASSIGNED,
    description: 'Creator or assigned service account can read the slideshow',
})

export const slideshowWrite = Acl({
    $id: Now.ID['acl-slideshow-write'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'write',
    adminOverrides: true,
    condition: CREATOR,
    description: 'Only the creator can edit the slideshow',
})

export const slideshowDelete = Acl({
    $id: Now.ID['acl-slideshow-delete'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'delete',
    adminOverrides: true,
    condition: CREATOR,
    description: 'Only the creator can delete the slideshow',
})
