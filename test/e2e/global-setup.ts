import { request } from '@playwright/test'
import {
    INSTANCE,
    ADMIN,
    SVC,
    SLIDE_DURATION,
    SLIDESHOW_NAME,
    basicAuthHeader,
    saveState,
} from './fixture-ids'

/**
 * Creates a disposable service account + a short-rotation slideshow assigned to
 * it, via the Table API as admin. The slideshow is created by admin, so admin
 * is both creator and platform admin; the service account is the assigned one.
 */
export default async function globalSetup(): Promise<void> {
    if (!ADMIN.pass) throw new Error('ODM_ADMIN_PASS is required for E2E')
    const api = await request.newContext({
        baseURL: INSTANCE,
        extraHTTPHeaders: { Authorization: basicAuthHeader(ADMIN.user, ADMIN.pass), Accept: 'application/json' },
        ignoreHTTPSErrors: true,
    })

    // 1. Ensure the E2E service account exists.
    const existing = await api.get(
        `/api/now/table/sys_user?sysparm_query=user_name=${SVC.user}&sysparm_fields=sys_id`
    )
    let svcSysId = (await existing.json()).result?.[0]?.sys_id as string | undefined
    let svcCreated = false
    if (!svcSysId) {
        const created = await api.post('/api/now/table/sys_user?sysparm_fields=sys_id', {
            data: { user_name: SVC.user, first_name: 'ODM', last_name: 'E2E', user_password: SVC.pass, active: 'true' },
        })
        svcSysId = (await created.json()).result.sys_id
        svcCreated = true
    } else {
        // reset password so login is deterministic
        await api.patch(`/api/now/table/sys_user/${svcSysId}`, { data: { user_password: SVC.pass } })
    }

    // 2. Clean any leftover E2E slideshow, then create a fresh one.
    const leftovers = await api.get(
        `/api/now/table/x_804244_odm_slideshow?sysparm_query=name=${encodeURIComponent(SLIDESHOW_NAME)}&sysparm_fields=sys_id`
    )
    for (const r of (await leftovers.json()).result || []) {
        await api.delete(`/api/now/table/x_804244_odm_slideshow/${r.sys_id}`)
    }
    const slideshow = await api.post('/api/now/table/x_804244_odm_slideshow?sysparm_fields=sys_id', {
        data: {
            name: SLIDESHOW_NAME,
            assigned_account: svcSysId,
            links: '/sys_user_list.do, /sys_properties_list.do',
            slide_duration: String(SLIDE_DURATION),
            active: 'true',
            public: 'false',
            hours_start: '00:01',
            hours_end: '23:59',
        },
    })
    const slideshowSysId = (await slideshow.json()).result.sys_id

    saveState({ slideshowSysId, svcSysId: svcSysId as string, svcCreated })
    await api.dispose()
}
