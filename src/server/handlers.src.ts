/**
 * ODM player route handlers (Scripted REST).
 * The heavy lifting (parsing, deck shape, injection escaping) is in deck.ts
 * (pure, jest-covered); this file is the thin Glide layer.
 *
 * Security: slideshow reads go through GlideRecordSecure, so the table ACLs
 * decide what the calling session may see. No rights / unknown screen / no
 * deck all collapse into the same harmless empty deck (idle card) — no data,
 * no stack traces.
 */
import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide'
import { ROTATOR_HTML } from './OdmTemplates'
import { buildDeck, injectDeck, escapeDeckJson, type Deck, type SlideshowFields } from './deck'

/** ACL-checked lookup of the active slideshow assigned to a user. */
function slideshowFieldsFor(userSysId: string): SlideshowFields | null {
    const gr = new GlideRecordSecure('x_804244_odm_slideshow')
    gr.addQuery('assigned_account', userSysId)
    gr.addQuery('active', true)
    gr.setLimit(1)
    gr.query()
    if (gr.next()) {
        const active = gr.getValue('active')
        return {
            name: gr.getValue('name'),
            links: gr.getValue('links'),
            slide_duration: gr.getValue('slide_duration'),
            refresh_interval: gr.getValue('refresh_interval'),
            hours_start: gr.getValue('hours_start'),
            hours_end: gr.getValue('hours_end'),
            active: active === '1' || active === 'true',
        }
    }
    return null
}

/** Resolve a screen name (technical account user_name) to a sys_user sys_id. */
function userSysIdFor(screenName: string): string | null {
    const gr = new GlideRecord('sys_user')
    gr.addQuery('user_name', screenName)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr.getUniqueValue() : null
}

/** Deck for an explicit screen name, or for the logged-in user when empty. */
function deckForScreen(screenParam: string): Deck {
    let screen = screenParam ? String(screenParam) : ''
    let userSysId: string | null
    if (screen) {
        userSysId = userSysIdFor(screen)
    } else {
        userSysId = gs.getUserID()
        screen = gs.getUserName()
    }
    const fields = userSysId ? slideshowFieldsFor(userSysId) : null
    return buildDeck(screen, fields)
}

function pathParam(request: any, name: string): string {
    try {
        const v = request.pathParams && request.pathParams[name]
        return v ? String(v) : ''
    } catch (e) {
        return ''
    }
}

function queryParam(request: any, name: string): string {
    try {
        const v = request.queryParams && request.queryParams[name]
        if (!v) return ''
        return String(Array.isArray(v) ? v[0] : v)
    } catch (e) {
        return ''
    }
}

function writeJson(response: any, deck: Deck): void {
    response.setContentType('application/json')
    response.setStatus(200)
    response.getStreamWriter().writeString(escapeDeckJson(deck))
}

function writeHtml(response: any, deck: Deck): void {
    response.setContentType('text/html')
    response.setStatus(200)
    response.getStreamWriter().writeString(injectDeck(ROTATOR_HTML, deck))
}

/**
 * Session token for the template's authenticated polling (X-UserToken).
 * Must NEVER throw — a token failure degrades polling, not the deck.
 * Scoped API first (GlideSession), global variant as fallback.
 */
function sessionToken(): string {
    try {
        const t = gs.getSession().getSessionToken()
        if (t) return String(t)
    } catch (e) {
        /* fall through */
    }
    try {
        return String(gs.getSessionToken() || '')
    } catch (e) {
        return ''
    }
}

/**
 * Serve the deck for `screen`, falling back to an idle-card deck on any Glide
 * failure — the player must never receive an error page or a stack trace.
 * The session token rides along so the template can poll with X-UserToken
 * (the platform rejects cookie-only REST calls without it).
 */
function respondSafely(response: any, screen: string, write: (response: any, deck: Deck) => void): void {
    try {
        const deck = deckForScreen(screen)
        deck.token = sessionToken()
        write(response, deck)
    } catch (e) {
        try {
            write(response, buildDeck(screen || '', null))
        } catch (e2) {
            response.setStatus(500)
        }
    }
}

/** GET /player and GET /player/{screen} -> the player HTML document. */
export function servePlayerHtml(request: any, response: any): void {
    const screen = pathParam(request, 'screen')
    // route-matching guard: if a client requests /player/deck, serve deck JSON
    if (screen === 'deck') {
        serveDeckJson(request, response)
        return
    }
    respondSafely(response, screen, writeHtml)
}

/** GET /player/deck?screen=... and GET /player/{screen}/deck -> deck JSON (polling). */
export function serveDeckJson(request: any, response: any): void {
    const fromPath = pathParam(request, 'screen')
    const screen = fromPath && fromPath !== 'deck' ? fromPath : queryParam(request, 'screen')
    respondSafely(response, screen, writeJson)
}
