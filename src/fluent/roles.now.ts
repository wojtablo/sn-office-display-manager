import { Role } from '@servicenow/sdk/core'

/**
 * ODM roles per SPEC.md (role-gated access model):
 * - manager: full CRUD on all slideshows (flat, no ownership conditions)
 * - display: technical kiosk accounts; read-only on their assigned slideshow
 * - admin: contains manager; delegated app administration, sole access to "All slides" module
 */
export const manager = Role({
    name: 'x_804244_odm.manager',
    description: 'Authors and administers all ODM slideshows',
})

export const display = Role({
    name: 'x_804244_odm.display',
    description: 'Technical kiosk accounts; read-only access to their assigned slideshow',
})

export const admin = Role({
    name: 'x_804244_odm.admin',
    description: 'Delegated ODM administration; contains manager',
    containsRoles: [manager],
})
