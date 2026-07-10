/**
 * ODM player route handlers (Scripted REST + direct UI page).
 * The heavy lifting (parsing, deck shape, injection escaping) is in deck.ts
 * (pure, jest-covered); this file is the thin Glide layer.
 *
 * SECURITY MODEL (no app roles — checked at open time):
 * Opening a screen's player is allowed only when the current user is
 *   - the CREATOR of the slideshow (sys_created_by), OR
 *   - the SERVICE ACCOUNT the slideshow is assigned to (assigned_account), OR
 *   - a platform admin.
 * Otherwise → access-denied page. The record is read with a plain GlideRecord
 * (not GlideRecordSecure) precisely so we can tell "no slideshow" (idle) apart
 * from "exists but you may not see it" (denied) and enforce the rule ourselves.
 */
import { gs, GlideRecord } from '@servicenow/glide'
import { ROTATOR_HTML } from './OdmTemplates'
import { buildDeck, injectDeck, escapeDeckJson, type Deck, type SlideshowFields } from './deck'

type DecisionStatus = 'play' | 'idle' | 'denied'
interface Decision {
    status: DecisionStatus
    screen: string
    fields: SlideshowFields | null
}

/** Resolve a screen name (technical account user_name) to a sys_user sys_id. */
function userSysIdFor(screenName: string): string | null {
    const gr = new GlideRecord('sys_user')
    gr.addQuery('user_name', screenName)
    gr.setLimit(1)
    gr.query()
    return gr.next() ? gr.getUniqueValue() : null
}

/**
 * Decide what the caller may see for `screenParam` (empty = the logged-in user).
 * Applies the creator/service-account/admin rule. Never throws.
 */
function resolveDecision(screenParam: string): Decision {
    const userId = gs.getUserID()
    const userName = gs.getUserName()

    let screen = screenParam ? String(screenParam) : ''
    let targetUserId: string | null
    if (screen) {
        targetUserId = userSysIdFor(screen)
    } else {
        targetUserId = userId
        screen = userName
    }
    if (!targetUserId) return { status: 'idle', screen: screen, fields: null }

    const gr = new GlideRecord('x_804244_odm_slideshow')
    gr.addQuery('assigned_account', targetUserId)
    gr.addQuery('active', true)
    gr.setLimit(1)
    gr.query()
    if (!gr.next()) return { status: 'idle', screen: screen, fields: null }

    const publicFlag = gr.getValue('public')
    const isPublic = publicFlag === '1' || publicFlag === 'true'
    const isCreator = gr.getValue('sys_created_by') === userName
    const isServiceAccount = gr.getValue('assigned_account') === userId
    const isAdmin = gs.hasRole('admin')
    if (!isPublic && !isCreator && !isServiceAccount && !isAdmin) {
        return { status: 'denied', screen: screen, fields: null }
    }

    const active = gr.getValue('active')
    return {
        status: 'play',
        screen: screen,
        fields: {
            name: gr.getValue('name'),
            links: gr.getValue('links'),
            slide_duration: gr.getValue('slide_duration'),
            refresh_interval: gr.getValue('refresh_interval'),
            hours_start: gr.getValue('hours_start'),
            hours_end: gr.getValue('hours_end'),
            active: active === '1' || active === 'true',
        },
    }
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

/** Full-screen access-denied document (served in place of the player). */
const ACCESS_DENIED_HTML =
    '<html lang="en"><head><meta charset="utf-8" /><title>ODM — access denied</title></head>' +
    '<body style="margin:0;display:grid;place-items:center;height:100vh;background:#000;' +
    'color:#9aa0a6;font-family:sans-serif;text-align:center">' +
    '<div><h1 style="color:#e8eaed">Access denied</h1>' +
    '<p>You are not the creator or the service account of this slideshow.</p></div></body></html>'

/** Deck (with token) for a play/idle decision. */
function deckFrom(decision: Decision): Deck {
    const deck = buildDeck(decision.screen, decision.fields)
    deck.token = sessionToken()
    return deck
}

/**
 * Server-side render for the direct UI page (/x_804244_odm_player.do):
 * the browser gets the finished document, nothing client-side.
 * Never throws: any failure degrades to the idle-card deck.
 */
export function renderPlayerHtml(screen: string): string {
    try {
        const decision = resolveDecision(screen ? String(screen) : '')
        if (decision.status === 'denied') return ACCESS_DENIED_HTML
        return injectDeck(ROTATOR_HTML, deckFrom(decision))
    } catch (e) {
        try {
            return injectDeck(ROTATOR_HTML, buildDeck(screen || '', null))
        } catch (e2) {
            return '<html><body>ODM: player unavailable</body></html>'
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
    response.setContentType('text/html')
    try {
        const decision = resolveDecision(screen)
        if (decision.status === 'denied') {
            response.setStatus(403)
            response.getStreamWriter().writeString(ACCESS_DENIED_HTML)
            return
        }
        response.setStatus(200)
        response.getStreamWriter().writeString(injectDeck(ROTATOR_HTML, deckFrom(decision)))
    } catch (e) {
        try {
            response.setStatus(200)
            response.getStreamWriter().writeString(injectDeck(ROTATOR_HTML, buildDeck(screen || '', null)))
        } catch (e2) {
            response.setStatus(500)
        }
    }
}

/** GET /player/deck?screen=... and GET /player/{screen}/deck -> deck JSON (polling). */
export function serveDeckJson(request: any, response: any): void {
    const fromPath = pathParam(request, 'screen')
    const screen = fromPath && fromPath !== 'deck' ? fromPath : queryParam(request, 'screen')
    response.setContentType('application/json')
    try {
        const decision = resolveDecision(screen)
        if (decision.status === 'denied') {
            response.setStatus(403)
            response.getStreamWriter().writeString('{"error":"access_denied"}')
            return
        }
        response.setStatus(200)
        response.getStreamWriter().writeString(escapeDeckJson(deckFrom(decision)))
    } catch (e) {
        try {
            response.setStatus(200)
            response.getStreamWriter().writeString(escapeDeckJson(buildDeck(screen || '', null)))
        } catch (e2) {
            response.setStatus(500)
        }
    }
}
