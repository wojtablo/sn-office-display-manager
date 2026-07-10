/**
 * GENERATED FILE — do not edit by hand.
 * Sources: src/client/templates/rotator.html + player.js, src/server/deck.ts,
 *          src/server/handlers.src.ts
 * Regenerate: npm run build (scripts/build-template.mjs)
 */

import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide'

// ===== deck.ts (verbatim) =====
/**
 * ODM deck building — pure functions only (no Glide APIs) so jest can cover
 * every branch. The Glide wrapper lives in player-routes.ts.
 */

export interface Slide {
    url: string
}

export interface Deck {
    screen: string
    slideshow: string
    active: boolean
    slides: Slide[]
    slideDuration: number
    refreshInterval: number
    hoursStart: string
    hoursEnd: string
}

/**
 * Parse the `links` field into slide URLs.
 * Rules (SPEC.md):
 * - split on commas and/or newlines; trim; skip empties and `#` comments
 * - literal commas inside a URL must be %2C-encoded (documented sharp edge)
 * - entries must be absolute (http/https) or root-relative (`/...`);
 *   bare relative paths are rejected (player lives under /api/...)
 * - invalid entries are skipped, never break the deck
 */
export function parseLinks(raw: string | null | undefined): Slide[] {
    if (!raw || typeof raw !== 'string') return []
    const out: Slide[] = []
    const entries = raw.split(/[,\n\r]+/)
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i].trim()
        if (!entry || entry.charAt(0) === '#') continue
        if (/^https?:\/\/\S+$/i.test(entry) || /^\/\S*$/.test(entry)) {
            out.push({ url: entry })
        }
        // anything else (bare relative, garbage) is skipped by design
    }
    return out
}

/** Coerce a numeric field with a floor and default. */
export function toPositiveInt(value: unknown, fallback: number, min: number): number {
    const n = typeof value === 'string' ? parseInt(value, 10) : typeof value === 'number' ? value : NaN
    if (isNaN(n) || n < min) return fallback
    return Math.floor(n)
}

/** Raw record fields as strings (what GlideRecord.getValue returns). */
export interface SlideshowFields {
    name?: string | null
    links?: string | null
    slide_duration?: string | number | null
    refresh_interval?: string | number | null
    hours_start?: string | null
    hours_end?: string | null
    active?: string | boolean | null
}

/** Build the deck object served to the player. `screen` = user_name of the account. */
export function buildDeck(screen: string, fields: SlideshowFields | null): Deck {
    if (!fields) {
        return {
            screen: screen,
            slideshow: '',
            active: false,
            slides: [],
            slideDuration: 30,
            refreshInterval: 60,
            hoursStart: '',
            hoursEnd: '',
        }
    }
    return {
        screen: screen,
        slideshow: fields.name || '',
        active: fields.active === true || fields.active === 'true' || fields.active === '1',
        slides: parseLinks(fields.links),
        slideDuration: toPositiveInt(fields.slide_duration, 30, 1),
        refreshInterval: toPositiveInt(fields.refresh_interval, 60, 10),
        hoursStart: fields.hours_start || '',
        hoursEnd: fields.hours_end || '',
    }
}

/**
 * Serialize a deck for injection into the HTML template.
 * `<` is unicode-escaped so manager-supplied content (`links`, names) can never
 * produce `</script>` or any other tag inside the script context.
 */
export function escapeDeckJson(deck: Deck): string {
    return JSON.stringify(deck).replace(/</g, '\\u003c')
}

/** Token in the template that gets replaced (including its quotes). */
export const DECK_TOKEN_LITERAL = '"__ODM_DECK_JSON__"'

/** Inject the deck into the template HTML. Throws if the token is missing (build defect). */
export function injectDeck(templateHtml: string, deck: Deck): string {
    const idx = templateHtml.indexOf(DECK_TOKEN_LITERAL)
    if (idx === -1) {
        throw new Error('ODM template is missing the deck injection token')
    }
    return templateHtml.replace(DECK_TOKEN_LITERAL, escapeDeckJson(deck))
}

// ===== template constant =====
export const ROTATOR_HTML: string =
    "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>ODM Player</title>\n<style>\n    html, body { margin: 0; padding: 0; height: 100%; background: #000; overflow: hidden; }\n    #frame {\n        position: absolute; inset: 0; width: 100%; height: 100%;\n        border: 0; background: #000;\n    }\n    /* ---- meteor progress bar (bottom) ---- */\n    #meteor { position: fixed; left: 0; right: 0; bottom: 0; height: 6px; pointer-events: none; z-index: 20; }\n    #meteor .trail {\n        position: absolute; left: 0; top: 0; bottom: 0; width: 0%;\n        background: linear-gradient(90deg, rgba(224,32,32,0) 0%, rgba(224,32,32,.35) 55%, #e02020 100%);\n        border-radius: 0 3px 3px 0;\n    }\n    #meteor .head {\n        position: absolute; top: 50%; width: 12px; height: 12px; margin: -6px 0 0 -6px;\n        background: #fff;\n        border-radius: 50%;\n        box-shadow:\n            0 0 4px 2px #ff5a5a,\n            0 0 12px 6px rgba(224, 32, 32, .8),\n            0 0 28px 12px rgba(224, 32, 32, .45);\n    }\n    /* ---- overlays (standby / idle) ---- */\n    .overlay {\n        position: absolute; inset: 0; z-index: 10; display: none;\n        background: #000; color: #9aa0a6;\n        font-family: -apple-system, \"Segoe UI\", Roboto, Arial, sans-serif;\n        text-align: center;\n    }\n    .overlay.visible { display: grid; place-items: center; }\n    .overlay .big { font-size: 5vw; color: #e8eaed; margin: 0 0 .4em; }\n    .overlay .small { font-size: 1.6vw; margin: 0; }\n    #standby .clock { font-size: 8vw; color: #5f6368; margin: 0 0 .2em; font-variant-numeric: tabular-nums; }\n</style>\n</head>\n<body>\n<iframe id=\"frame\" title=\"slide\" sandbox=\"allow-scripts allow-same-origin allow-forms\"></iframe>\n\n<div id=\"standby\" class=\"overlay\">\n    <div>\n        <p class=\"clock\">--:--</p>\n        <p class=\"small\" id=\"standby-info\">Outside working hours</p>\n    </div>\n</div>\n\n<div id=\"idle\" class=\"overlay\">\n    <div>\n        <p class=\"big\">Office Display Manager</p>\n        <p class=\"small\" id=\"idle-info\">No active slideshow is assigned to this screen.</p>\n    </div>\n</div>\n\n<div id=\"meteor\" aria-hidden=\"true\"><div class=\"trail\"></div><div class=\"head\"></div></div>\n\n<script>\n/**\n * ODM player — pure logic module.\n * Plain browser script (no ES module syntax: must load over file:// and inline\n * into the served template). Exposes window.ODMPlayer for the shell and\n * module.exports for jest.\n *\n * Everything here is a pure function: no DOM, no timers, no fetch.\n */\n(function (global) {\n    'use strict'\n\n    /**\n     * Parse \"HH:MM\" (24h) into minutes since midnight.\n     * @returns {number|null} minutes, or null when unparsable\n     */\n    function parseHHMM(value) {\n        if (typeof value !== 'string') return null\n        var m = /^([01]?\\d|2[0-3]):([0-5]\\d)$/.exec(value.trim())\n        if (!m) return null\n        return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)\n    }\n\n    /**\n     * Working-hours check. Fail open: invalid/missing window means \"always on\"\n     * (never blank a screen because of a typo). Supports overnight windows\n     * (e.g. 22:00-06:00). start === end is treated as always on.\n     * @param {number} nowMinutes minutes since local midnight\n     * @param {string} startStr \"HH:MM\"\n     * @param {string} endStr \"HH:MM\"\n     */\n    function isWithinHours(nowMinutes, startStr, endStr) {\n        var start = parseHHMM(startStr)\n        var end = parseHHMM(endStr)\n        if (start === null || end === null) return true\n        if (start === end) return true\n        if (start < end) return nowMinutes >= start && nowMinutes < end\n        // overnight window\n        return nowMinutes >= start || nowMinutes < end\n    }\n\n    /** Minutes since local midnight for a Date. */\n    function minutesOfDay(date) {\n        return date.getHours() * 60 + date.getMinutes()\n    }\n\n    /** Next slide index, wrapping. Single-slide decks return 0 again (the shell still reloads the iframe). */\n    function nextIndex(current, deckLength) {\n        if (!deckLength || deckLength <= 0) return 0\n        return (current + 1) % deckLength\n    }\n\n    /**\n     * Normalize a raw injected/polled deck into a safe shape.\n     * Never throws; unusable input yields an empty deck (idle card).\n     */\n    function normalizeDeck(raw) {\n        var d = raw && typeof raw === 'object' ? raw : {}\n        var slides = []\n        if (Array.isArray(d.slides)) {\n            for (var i = 0; i < d.slides.length; i++) {\n                var s = d.slides[i]\n                if (s && typeof s.url === 'string' && s.url.length > 0) slides.push({ url: s.url })\n            }\n        }\n        var duration = typeof d.slideDuration === 'number' && d.slideDuration > 0 ? d.slideDuration : 30\n        var refresh = typeof d.refreshInterval === 'number' && d.refreshInterval >= 10 ? d.refreshInterval : 60\n        return {\n            screen: typeof d.screen === 'string' ? d.screen : '',\n            slideshow: typeof d.slideshow === 'string' ? d.slideshow : '',\n            active: d.active !== false,\n            slides: slides,\n            slideDuration: duration,\n            refreshInterval: refresh,\n            hoursStart: typeof d.hoursStart === 'string' ? d.hoursStart : '',\n            hoursEnd: typeof d.hoursEnd === 'string' ? d.hoursEnd : '',\n        }\n    }\n\n    /** A deck is playable when active with at least one slide. */\n    function isPlayable(deck) {\n        return !!deck && deck.active === true && deck.slides.length > 0\n    }\n\n    /** Stable fingerprint for poll change detection. */\n    function fingerprint(deck) {\n        var d = normalizeDeck(deck)\n        var urls = []\n        for (var i = 0; i < d.slides.length; i++) urls.push(d.slides[i].url)\n        return [\n            d.slideshow,\n            d.active ? '1' : '0',\n            String(d.slideDuration),\n            String(d.refreshInterval),\n            d.hoursStart,\n            d.hoursEnd,\n            urls.join('\u0001'),\n        ].join('\u0002')\n    }\n\n    /** True when a freshly polled deck differs from the current one. */\n    function deckChanged(currentDeck, polledDeck) {\n        return fingerprint(currentDeck) !== fingerprint(polledDeck)\n    }\n\n    /**\n     * Decide what the player should be doing right now.\n     * Owns the precedence: idle (no playable deck) > standby (outside hours) > play.\n     * Pure — the shell just executes the returned state.\n     * @returns {'play'|'standby'|'idle'}\n     */\n    function resolveState(deck, nowMinutes) {\n        if (!isPlayable(deck)) return 'idle'\n        if (!isWithinHours(nowMinutes, deck.hoursStart, deck.hoursEnd)) return 'standby'\n        return 'play'\n    }\n\n    /**\n     * Append a per-cycle cache-buster so re-showing the same URL reloads the\n     * iframe (single-slide decks must not show stale dashboards all day).\n     * Never throws; non-strings pass through untouched.\n     */\n    function addCacheBuster(url, n) {\n        if (typeof url !== 'string') return url\n        return url + (url.indexOf('?') === -1 ? '?' : '&') + '_odm=' + n\n    }\n\n    var ODMPlayer = {\n        parseHHMM: parseHHMM,\n        isWithinHours: isWithinHours,\n        minutesOfDay: minutesOfDay,\n        nextIndex: nextIndex,\n        normalizeDeck: normalizeDeck,\n        isPlayable: isPlayable,\n        fingerprint: fingerprint,\n        deckChanged: deckChanged,\n        resolveState: resolveState,\n        addCacheBuster: addCacheBuster,\n    }\n\n    global.ODMPlayer = ODMPlayer\n    /* eslint-disable-next-line no-undef */\n    if (typeof module !== 'undefined' && module.exports) module.exports = ODMPlayer\n})(typeof window !== 'undefined' ? window : globalThis)\n\n</script>\n<script>\n/* Deck injection point. The server replaces the quoted token with the escaped\n   deck JSON object. When the token survives (local file:// dev), the shell\n   falls back to the mock deck below. */\nwindow.__ODM_DECK__ = \"__ODM_DECK_JSON__\";\n\n/* Local development mock — used only when the token was not replaced. */\nwindow.__ODM_MOCK_DECK__ = {\n    screen: 'local.mock',\n    slideshow: 'Local mock deck',\n    active: true,\n    slides: [\n        { url: 'https://www.wikipedia.org' },\n        { url: 'https://example.com' },\n        { url: 'https://this-will-refuse-iframing.google.com' }\n    ],\n    slideDuration: 8,\n    refreshInterval: 60,\n    hoursStart: '00:01',\n    hoursEnd: '23:59'\n};\n</script>\n<script>\n(function () {\n    'use strict'\n    var P = window.ODMPlayer\n\n    var frame = document.getElementById('frame')\n    var standby = document.getElementById('standby')\n    var standbyClock = standby.querySelector('.clock')\n    var standbyInfo = document.getElementById('standby-info')\n    var idle = document.getElementById('idle')\n    var idleInfo = document.getElementById('idle-info')\n    var trail = document.querySelector('#meteor .trail')\n    var head = document.querySelector('#meteor .head')\n    var meteor = document.getElementById('meteor')\n\n    var deck = P.normalizeDeck(\n        typeof window.__ODM_DECK__ === 'object' && window.__ODM_DECK__ !== null\n            ? window.__ODM_DECK__\n            : window.__ODM_MOCK_DECK__\n    )\n\n    var index = 0\n    var cycle = 0\n    var slideStartedAt = 0\n    var slideTimer = null\n    var state = 'boot' // 'boot' | 'play' | 'standby' | 'idle' — owned here, never sniffed from the DOM\n\n    function setOverlays(next) {\n        standby.className = next === 'standby' ? 'overlay visible' : 'overlay'\n        idle.className = next === 'idle' ? 'overlay visible' : 'overlay'\n        meteor.style.display = next === 'play' ? 'block' : 'none'\n        if (next !== 'play') {\n            try { frame.src = 'about:blank' } catch (e) { /* keep running */ }\n        }\n    }\n\n    /** Show slide `i` and re-arm the advance timer. Only ever called in 'play'. */\n    function showSlide(i) {\n        try {\n            cycle++\n            frame.src = P.addCacheBuster(deck.slides[i].url, cycle)\n        } catch (e) { /* a broken slide must never stall the loop */ }\n        slideStartedAt = Date.now()\n        if (slideTimer) clearTimeout(slideTimer)\n        slideTimer = setTimeout(advance, deck.slideDuration * 1000)\n    }\n\n    /** Timer path: next slide, then re-evaluate state (hours may have flipped mid-slide). */\n    function advance() {\n        index = P.nextIndex(index, deck.slides.length)\n        applyState(true)\n    }\n\n    /**\n     * Reconcile the shell with resolveState(). `forceShow` re-renders the\n     * current slide even if we were already playing (timer advance, deck swap);\n     * without it, watchdog/poll calls leave an in-progress slide alone.\n     */\n    function applyState(forceShow) {\n        try {\n            var next = P.resolveState(deck, P.minutesOfDay(new Date()))\n            if (next !== 'play') {\n                if (slideTimer) clearTimeout(slideTimer)\n                slideTimer = null\n                if (next === 'idle') {\n                    idleInfo.textContent = deck.screen\n                        ? 'No active slideshow is assigned to \"' + deck.screen + '\".'\n                        : 'No active slideshow is assigned to this screen.'\n                } else {\n                    standbyInfo.textContent = (deck.screen ? deck.screen + ' — ' : '') +\n                        'resumes at ' + (deck.hoursStart || '--:--')\n                }\n                setOverlays(next)\n                state = next\n                return\n            }\n            var wasPlaying = state === 'play'\n            state = 'play'\n            setOverlays('play')\n            if (!wasPlaying || forceShow) showSlide(index)\n        } catch (e) { /* never die */ }\n    }\n\n    /* meteor bar animation */\n    function animateBar() {\n        try {\n            var pct = 0\n            if (slideStartedAt && deck.slideDuration > 0 && state === 'play') {\n                pct = Math.min(100, ((Date.now() - slideStartedAt) / (deck.slideDuration * 1000)) * 100)\n            }\n            trail.style.width = pct + '%'\n            head.style.left = pct + '%'\n        } catch (e) { /* cosmetic only */ }\n        window.requestAnimationFrame(animateBar)\n    }\n\n    /* standby clock */\n    setInterval(function () {\n        try {\n            var now = new Date()\n            standbyClock.textContent =\n                ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2)\n        } catch (e) { /* cosmetic only */ }\n    }, 1000)\n\n    /* working-hours watchdog: re-evaluate every 30 s (no-op while state is unchanged) */\n    setInterval(function () {\n        try {\n            if (P.resolveState(deck, P.minutesOfDay(new Date())) !== state) applyState(false)\n        } catch (e) { /* never die */ }\n    }, 30000)\n\n    /* deck polling: live updates + session keep-alive; also the idle-retry path */\n    function poll() {\n        try {\n            if (window.location.protocol === 'file:') return // local dev: no server\n            var m = /^(.*\\/player)(\\/|$)/.exec(window.location.pathname)\n            var base = m ? m[1] : window.location.pathname.replace(/\\/$/, '')\n            var url = base + '/deck?screen=' + encodeURIComponent(deck.screen || '')\n            fetch(url, { headers: { Accept: 'application/json' } })\n                .then(function (r) { return r.ok ? r.json() : null })\n                .then(function (fresh) {\n                    if (!fresh) return\n                    if (P.deckChanged(deck, fresh)) {\n                        deck = P.normalizeDeck(fresh)\n                        index = 0\n                        applyState(true) // restart from slide 0 of the new deck\n                    }\n                })\n                .catch(function () { /* transient network errors are fine */ })\n        } catch (e) { /* never die */ }\n    }\n    setInterval(poll, Math.max(10, deck.refreshInterval) * 1000)\n\n    /* boot */\n    applyState(true)\n    window.requestAnimationFrame(animateBar)\n})()\n</script>\n</body>\n</html>\n"

// ===== handlers.src.ts (local imports stripped) =====
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
 * Serve the deck for `screen`, falling back to an idle-card deck on any Glide
 * failure — the player must never receive an error page or a stack trace.
 */
function respondSafely(response: any, screen: string, write: (response: any, deck: Deck) => void): void {
    try {
        write(response, deckForScreen(screen))
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

