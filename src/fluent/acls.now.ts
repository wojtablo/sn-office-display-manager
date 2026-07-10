import { Acl } from '@servicenow/sdk/core'
import { manager, display } from './roles.now'

/**
 * Role-gated ACL matrix (SPEC.md):
 * - manager (and admin via contains): full CRUD on all records
 * - display: read ONLY its own assigned deck (assigned_account = me)
 * - no app role: no access
 * Record-level ACLs + '*' field ACLs. Multiple ACLs on the same op are OR-ed.
 */

export const slideshowCreate = Acl({
    $id: Now.ID['acl-slideshow-create'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'create',
    adminOverrides: true,
    roles: [manager],
    description: 'Managers (and admins) create slideshows',
})

export const slideshowReadManager = Acl({
    $id: Now.ID['acl-slideshow-read-manager'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'read',
    adminOverrides: true,
    roles: [manager],
    description: 'Managers (and admins) read all slideshows',
})

export const slideshowReadDisplayOwn = Acl({
    $id: Now.ID['acl-slideshow-read-display-own'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'read',
    adminOverrides: true,
    roles: [display],
    condition: 'assigned_account=javascript:gs.getUserID()',
    description: 'Display accounts read only their own assigned slideshow',
})

export const slideshowWrite = Acl({
    $id: Now.ID['acl-slideshow-write'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'write',
    adminOverrides: true,
    roles: [manager],
    description: 'Managers (and admins) update slideshows',
})

export const slideshowDelete = Acl({
    $id: Now.ID['acl-slideshow-delete'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    operation: 'delete',
    adminOverrides: true,
    roles: [manager],
    description: 'Managers (and admins) delete slideshows',
})

/* Field-level: managers write all fields; display reads all fields of records
   it can already see (record ACL gates which records). */
export const slideshowFieldsRead = Acl({
    $id: Now.ID['acl-slideshow-fields-read'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    field: '*',
    operation: 'read',
    adminOverrides: true,
    roles: [manager, display],
    description: 'Field read for app roles (record ACLs gate row access)',
})

export const slideshowFieldsWrite = Acl({
    $id: Now.ID['acl-slideshow-fields-write'],
    type: 'record',
    table: 'x_804244_odm_slideshow',
    field: '*',
    operation: 'write',
    adminOverrides: true,
    roles: [manager],
    description: 'Field write for managers (and admins)',
})
