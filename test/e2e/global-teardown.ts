import { request } from '@playwright/test'
import { INSTANCE, ADMIN, basicAuthHeader, loadState } from './fixture-ids'

/** Removes the E2E slideshow (and the service account if we created it). */
export default async function globalTeardown(): Promise<void> {
    const state = loadState()
    const api = await request.newContext({
        baseURL: INSTANCE,
        extraHTTPHeaders: { Authorization: basicAuthHeader(ADMIN.user, ADMIN.pass), Accept: 'application/json' },
        ignoreHTTPSErrors: true,
    })
    if (state.slideshowSysId) await api.delete(`/api/now/table/x_804244_odm_slideshow/${state.slideshowSysId}`)
    if (state.svcCreated && state.svcSysId) await api.delete(`/api/now/table/sys_user/${state.svcSysId}`)
    await api.dispose()
}
