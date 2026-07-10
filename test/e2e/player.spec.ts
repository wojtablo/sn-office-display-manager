import { test, expect, type Page, request } from '@playwright/test'
import {
    INSTANCE,
    ADMIN,
    STRANGER,
    SVC,
    SLIDE_DURATION,
    SLIDESHOW_NAME,
    basicAuthHeader,
    loadState,
} from './fixture-ids'

const PLAYER_URL = `/x_804244_odm_player.do?screen=${SVC.user}`

/** Interactive ServiceNow login via the classic login form. */
async function login(page: Page, user: string, pass: string): Promise<void> {
    await page.goto('/login.do', { waitUntil: 'domcontentloaded' })
    await page.fill('#user_name', user)
    await page.fill('#user_password', pass)
    await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => undefined),
        page.click('#sysverb_login'),
    ])
}

/** Set the E2E slideshow's public flag via the admin Table API. */
async function setPublic(value: boolean): Promise<void> {
    const { slideshowSysId } = loadState()
    const api = await request.newContext({
        baseURL: INSTANCE,
        extraHTTPHeaders: { Authorization: basicAuthHeader(ADMIN.user, ADMIN.pass) },
        ignoreHTTPSErrors: true,
    })
    await api.patch(`/api/now/table/x_804244_odm_slideshow/${slideshowSysId}`, {
        data: { public: value ? 'true' : 'false' },
    })
    await api.dispose()
}

test.describe('ODM player (live instance)', () => {
    test('creator/admin opens the player: deck rendered, meteor bar present, slides rotate', async ({ page }) => {
        await login(page, ADMIN.user, ADMIN.pass)
        await page.goto(PLAYER_URL, { waitUntil: 'domcontentloaded' })

        // deck injected server-side
        const deck = await page.evaluate(() => (window as any).__ODM_DECK__)
        expect(deck.slideshow).toBe(SLIDESHOW_NAME)
        expect(deck.slides.length).toBe(2)

        // player chrome
        await expect(page.locator('#frame')).toHaveCount(1)
        await expect(page.locator('#meteor')).toHaveCount(1)

        // rotation: the iframe src must change within one slide_duration (+buffer)
        const first = await page.locator('#frame').getAttribute('src')
        expect(first).toBeTruthy()
        await page.waitForTimeout(SLIDE_DURATION * 1000 + 2500)
        const second = await page.locator('#frame').getAttribute('src')
        expect(second).not.toBe(first)
    })

    test('a stranger is denied the access-denied page (not the player)', async ({ page }) => {
        await login(page, STRANGER.user, STRANGER.pass)
        await page.goto(PLAYER_URL, { waitUntil: 'domcontentloaded' })
        await expect(page.locator('body')).toContainText('Access denied')
        const deck = await page.evaluate(() => (window as any).__ODM_DECK__)
        expect(deck).toBeUndefined()
    })

    test('a public slideshow opens for everyone (the stranger)', async ({ page }) => {
        await setPublic(true)
        try {
            await login(page, STRANGER.user, STRANGER.pass)
            await page.goto(PLAYER_URL, { waitUntil: 'domcontentloaded' })
            const deck = await page.evaluate(() => (window as any).__ODM_DECK__)
            expect(deck?.slideshow).toBe(SLIDESHOW_NAME)
            await expect(page.locator('#frame')).toHaveCount(1)
        } finally {
            await setPublic(false)
        }
    })
})
