/**
 * Route-handler glue tests: handlers.src.ts against the fake Glide layer
 * (test/fakes/glide.js via jest moduleNameMapper).
 *
 * Access model: opening a screen's player is allowed only for the slideshow's
 * creator, its assigned service account, or a platform admin.
 */
import { servePlayerHtml, serveDeckJson, renderPlayerHtml } from '../src/server/handlers.src'
const fake = require('../test/fakes/glide.js')

function fakeRequest(pathParams: Record<string, string> = {}, queryParams: Record<string, unknown> = {}) {
    return { pathParams, queryParams }
}

function fakeResponse() {
    const state = { contentType: '', status: 0, body: '' }
    return {
        state,
        setContentType: (t: string) => (state.contentType = t),
        setStatus: (s: number) => (state.status = s),
        getStreamWriter: () => ({ writeString: (s: string) => (state.body += s) }),
    }
}

const SLIDESHOWS = 'x_804244_odm_slideshow'
const USERS = 'sys_user'

/** Reset fixtures. `creator` created SD Wall; it is assigned to svc.display.sd-room1. */
function seed() {
    fake.__reset()
    fake.__setTable(USERS, [
        { sys_id: 'u-creator', user_name: 'creator' },
        { sys_id: 'u-screen1', user_name: 'svc.display.sd-room1' },
        { sys_id: 'u-mallory', user_name: 'mallory' },
    ])
    fake.__setTable(SLIDESHOWS, [
        {
            sys_id: 'ss-1',
            name: 'SD Wall',
            sys_created_by: 'creator',
            assigned_account: 'u-screen1',
            active: true,
            links: 'https://example.com, /list.do',
            slide_duration: 10,
            refresh_interval: 30,
            hours_start: '07:00',
            hours_end: '19:00',
        },
    ])
}

const asCreator = () => fake.__setUser('u-creator', 'creator')
const asServiceAccount = () => fake.__setUser('u-screen1', 'svc.display.sd-room1')
const asAdmin = () => fake.__setUser('u-admin', 'admin.user', ['admin'])
const asStranger = () => fake.__setUser('u-mallory', 'mallory')

beforeEach(seed)

describe('access control (creator / service account / admin, else denied)', () => {
    test('creator sees the deck', () => {
        asCreator()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('service account sees its own deck', () => {
        asServiceAccount()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('platform admin sees any deck', () => {
        asAdmin()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('a stranger is denied: 403, no data leak', () => {
        asStranger()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(403)
        expect(res.state.body).toContain('access_denied')
        expect(res.state.body).not.toContain('SD Wall')
        expect(res.state.body).not.toContain('example.com')
    })
    test('stranger on the HTML route gets the access-denied page, not the player', () => {
        asStranger()
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(403)
        expect(res.state.contentType).toBe('text/html')
        expect(res.state.body).toContain('Access denied')
        expect(res.state.body).not.toContain('SD Wall')
    })
    test('renderPlayerHtml (direct UI page) denies a stranger', () => {
        asStranger()
        const html = renderPlayerHtml('svc.display.sd-room1')
        expect(html).toContain('Access denied')
        expect(html).not.toContain('SD Wall')
        expect(html).not.toContain('__ODM_DECK__')
    })
})

describe('serveDeckJson resolution', () => {
    test('?screen= query param works (the poll route)', () => {
        asCreator()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({}, { screen: 'svc.display.sd-room1' }), res)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('?screen= as array takes the first value', () => {
        asCreator()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({}, { screen: ['svc.display.sd-room1', 'evil'] }), res)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('no screen falls back to the logged-in user (empty deck when none assigned)', () => {
        asCreator()
        const res = fakeResponse()
        serveDeckJson(fakeRequest(), res)
        const deck = JSON.parse(res.state.body)
        expect(deck.screen).toBe('creator')
        expect(deck.active).toBe(false)
        expect(deck.slides).toHaveLength(0)
    })
    test('unknown screen yields a harmless empty deck, still 200', () => {
        asCreator()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'no.such.screen' }), res)
        expect(res.state.status).toBe(200)
        const deck = JSON.parse(res.state.body)
        expect(deck.slides).toHaveLength(0)
        expect(deck.slideshow).toBe('')
    })
    test('a Glide failure still returns a valid empty deck (never 500, never a stack trace)', () => {
        asCreator()
        fake.__failNextQuery()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        const deck = JSON.parse(res.state.body)
        expect(deck.slides).toHaveLength(0)
        expect(res.state.body).not.toMatch(/error|exception/i)
    })
})

describe('servePlayerHtml', () => {
    test('serves the template with the deck injected', () => {
        asCreator()
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(res.state.contentType).toBe('text/html')
        expect(res.state.body).toContain('<!DOCTYPE html>')
        expect(res.state.body).not.toContain('"__ODM_DECK_JSON__"')
        expect(res.state.body).toContain('"slideshow":"SD Wall"')
    })
    test('screen === "deck" is routed to JSON (route-collision guard)', () => {
        asCreator()
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'deck' }, { screen: 'svc.display.sd-room1' }), res)
        expect(res.state.contentType).toBe('application/json')
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('creator-supplied content cannot break out of the script context', () => {
        asCreator()
        fake.__setTable(SLIDESHOWS, [
            {
                sys_id: 'ss-1',
                name: '</script><script>alert(1)</script>',
                sys_created_by: 'creator',
                assigned_account: 'u-screen1',
                active: true,
                links: '/a',
            },
        ])
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        const injected = /window\.__ODM_DECK__ = (\{.*?\});/.exec(res.state.body)
        expect(injected).not.toBeNull()
        expect((injected as RegExpExecArray)[1]).not.toContain('</script>')
    })
    test('a Glide failure still serves the idle-card template, never an error page', () => {
        asCreator()
        fake.__failNextQuery()
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(res.state.contentType).toBe('text/html')
        expect(res.state.body).toContain('<!DOCTYPE html>')
    })
})

describe('renderPlayerHtml (direct UI page path)', () => {
    test('returns the finished document with deck and token injected', () => {
        asCreator()
        const html = renderPlayerHtml('svc.display.sd-room1')
        expect(html).toContain('<!DOCTYPE html>')
        expect(html).not.toContain('"__ODM_DECK_JSON__"')
        expect(html).toContain('"slideshow":"SD Wall"')
        expect(html).toContain('"token":"fake-session-token-123"')
    })
    test('empty screen resolves the logged-in user', () => {
        asCreator()
        const html = renderPlayerHtml('')
        expect(html).toContain('"screen":"creator"')
    })
    test('a Glide failure degrades to the idle deck, never throws', () => {
        asCreator()
        fake.__failNextQuery()
        const html = renderPlayerHtml('svc.display.sd-room1')
        expect(html).toContain('<!DOCTYPE html>')
        expect(html).toContain('"slides":[]')
    })
})

describe('session token (X-UserToken for cookie-based REST polling)', () => {
    test('logged-in player HTML carries the session token for polling', () => {
        asCreator()
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(res.state.body).toContain('"token":"fake-session-token-123"')
    })
    test('deck JSON carries the session token too (keeps the shell token fresh)', () => {
        asCreator()
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(JSON.parse(res.state.body).token).toBe('fake-session-token-123')
    })
})
