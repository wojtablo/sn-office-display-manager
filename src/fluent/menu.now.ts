import { ApplicationMenu, Record } from '@servicenow/sdk/core'

/**
 * Navigator: "Office Display Manager"
 * - My slideshows  -> any authenticated user; filtered to created-by-me OR assigned-to-me
 * - All slideshows -> platform admin only; unfiltered
 * Module visibility is navigation only; ACLs are the enforcement layer.
 */
export const odmMenu = ApplicationMenu({
    $id: Now.ID['odm-app-menu'],
    title: 'Office Display Manager',
    name: 'Office Display Manager',
    description: 'Slideshows for office displays',
    active: true,
    order: 100,
})

export const mySlideshowsModule = Record({
    $id: Now.ID['module-my-slideshows'],
    table: 'sys_app_module',
    data: {
        title: 'My slideshows',
        application: odmMenu,
        link_type: 'FILTER',
        name: 'x_804244_odm_slideshow',
        filter: 'sys_created_by=javascript:gs.getUserName()^ORassigned_account=javascript:gs.getUserID()',
        hint: 'Slideshows you created or that are assigned to your account',
        active: true,
        order: 100,
    },
})

export const allSlideshowsModule = Record({
    $id: Now.ID['module-all-slides'],
    table: 'sys_app_module',
    data: {
        title: 'All slideshows',
        application: odmMenu,
        link_type: 'LIST',
        name: 'x_804244_odm_slideshow',
        roles: ['admin'],
        hint: 'All slideshows (administration)',
        active: true,
        order: 200,
    },
})
