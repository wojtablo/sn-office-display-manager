/**
 * Route-handler glue tests: handlers.src.ts against the fake Glide layer
 * (test/fakes/glide.js via jest moduleNameMapper).
 */
import { servePlayerHtml, serveDeckJson } from '../src/server/handlers.src'
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

beforeEach(() => {
    fake.__reset()
    fake.__setUser('u-claude', 'claude')
    fake.__setTable(USERS, [
        { sys_id: 'u-claude', user_name: 'claude' },
        { sys_id: 'u-screen1', user_name: 'svc.display.sd-room1' },
    ])
    fake.__setTable(SLIDESHOWS, [
        {
            sys_id: 'ss-1',
            name: 'SD Wall',
            assigned_account: 'u-screen1',
            active: true,
            links: 'https://example.com, /list.do',
            slide_duration: 10,
            refresh_interval: 30,
            hours_start: '07:00',
            hours_end: '19:00',
        },
    ])
})

describe('serveDeckJson', () => {
    test('path param screen resolves that account deck', () => {
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(res.state.contentType).toBe('application/json')
        const deck = JSON.parse(res.state.body)
        expect(deck.slideshow).toBe('SD Wall')
        expect(deck.slides).toHaveLength(2)
        expect(deck.screen).toBe('svc.display.sd-room1')
    })
    test('?screen= query param works (the poll route)', () => {
        const res = fakeResponse()
        serveDeckJson(fakeRequest({}, { screen: 'svc.display.sd-room1' }), res)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('?screen= as array takes the first value', () => {
        const res = fakeResponse()
        serveDeckJson(fakeRequest({}, { screen: ['svc.display.sd-room1', 'evil'] }), res)
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('no screen falls back to the logged-in user (empty deck for claude)', () => {
        const res = fakeResponse()
        serveDeckJson(fakeRequest(), res)
        const deck = JSON.parse(res.state.body)
        expect(deck.screen).toBe('claude')
        expect(deck.active).toBe(false)
        expect(deck.slides).toHaveLength(0)
    })
    test('unknown screen yields a harmless empty deck, still 200', () => {
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'no.such.screen' }), res)
        expect(res.state.status).toBe(200)
        const deck = JSON.parse(res.state.body)
        expect(deck.slides).toHaveLength(0)
        expect(deck.slideshow).toBe('')
    })
    test('ACL-hidden row (GlideRecordSecure) is invisible: empty deck, no leak', () => {
        fake.__setTable(SLIDESHOWS, [
            {
                sys_id: 'ss-1',
                name: 'Secret Wall',
                assigned_account: 'u-screen1',
                active: true,
                links: '/secret.do',
                __readable: false,
            },
        ])
        const res = fakeResponse()
        serveDeckJson(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        const deck = JSON.parse(res.state.body)
        expect(deck.slides).toHaveLength(0)
        expect(res.state.body).not.toContain('Secret')
    })
    test('a Glide failure still returns a valid empty deck (never 500, never a stack trace)', () => {
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
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(res.state.contentType).toBe('text/html')
        expect(res.state.body).toContain('<!DOCTYPE html>')
        expect(res.state.body).not.toContain('"__ODM_DECK_JSON__"')
        expect(res.state.body).toContain('"slideshow":"SD Wall"')
    })
    test('screen === "deck" is routed to JSON (route-collision guard)', () => {
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'deck' }, { screen: 'svc.display.sd-room1' }), res)
        expect(res.state.contentType).toBe('application/json')
        expect(JSON.parse(res.state.body).slideshow).toBe('SD Wall')
    })
    test('manager-supplied content cannot break out of the script context', () => {
        fake.__setTable(SLIDESHOWS, [
            {
                sys_id: 'ss-1',
                name: '</script><script>alert(1)</script>',
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
        fake.__failNextQuery()
        const res = fakeResponse()
        servePlayerHtml(fakeRequest({ screen: 'svc.display.sd-room1' }), res)
        expect(res.state.status).toBe(200)
        expect(res.state.contentType).toBe('text/html')
        expect(res.state.body).toContain('<!DOCTYPE html>')
    })
})
