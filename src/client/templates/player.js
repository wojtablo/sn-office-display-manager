/**
 * ODM player — pure logic module.
 * Plain browser script (no ES module syntax: must load over file:// and inline
 * into the served template). Exposes window.ODMPlayer for the shell and
 * module.exports for jest.
 *
 * Everything here is a pure function: no DOM, no timers, no fetch.
 */
(function (global) {
    'use strict'

    /**
     * Parse "HH:MM" (24h) into minutes since midnight.
     * @returns {number|null} minutes, or null when unparsable
     */
    function parseHHMM(value) {
        if (typeof value !== 'string') return null
        var m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim())
        if (!m) return null
        return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
    }

    /**
     * Working-hours check. Fail open: invalid/missing window means "always on"
     * (never blank a screen because of a typo). Supports overnight windows
     * (e.g. 22:00-06:00). start === end is treated as always on.
     * @param {number} nowMinutes minutes since local midnight
     * @param {string} startStr "HH:MM"
     * @param {string} endStr "HH:MM"
     */
    function isWithinHours(nowMinutes, startStr, endStr) {
        var start = parseHHMM(startStr)
        var end = parseHHMM(endStr)
        if (start === null || end === null) return true
        if (start === end) return true
        if (start < end) return nowMinutes >= start && nowMinutes < end
        // overnight window
        return nowMinutes >= start || nowMinutes < end
    }

    /** Minutes since local midnight for a Date. */
    function minutesOfDay(date) {
        return date.getHours() * 60 + date.getMinutes()
    }

    /** Next slide index, wrapping. Single-slide decks return 0 again (the shell still reloads the iframe). */
    function nextIndex(current, deckLength) {
        if (!deckLength || deckLength <= 0) return 0
        return (current + 1) % deckLength
    }

    /**
     * Normalize a raw injected/polled deck into a safe shape.
     * Never throws; unusable input yields an empty deck (idle card).
     */
    function normalizeDeck(raw) {
        var d = raw && typeof raw === 'object' ? raw : {}
        var slides = []
        if (Array.isArray(d.slides)) {
            for (var i = 0; i < d.slides.length; i++) {
                var s = d.slides[i]
                if (s && typeof s.url === 'string' && s.url.length > 0) slides.push({ url: s.url })
            }
        }
        var duration = typeof d.slideDuration === 'number' && d.slideDuration > 0 ? d.slideDuration : 30
        var refresh = typeof d.refreshInterval === 'number' && d.refreshInterval >= 10 ? d.refreshInterval : 60
        return {
            screen: typeof d.screen === 'string' ? d.screen : '',
            slideshow: typeof d.slideshow === 'string' ? d.slideshow : '',
            active: d.active !== false,
            slides: slides,
            slideDuration: duration,
            refreshInterval: refresh,
            hoursStart: typeof d.hoursStart === 'string' ? d.hoursStart : '',
            hoursEnd: typeof d.hoursEnd === 'string' ? d.hoursEnd : '',
            token: typeof d.token === 'string' ? d.token : '',
        }
    }

    /** A deck is playable when active with at least one slide. */
    function isPlayable(deck) {
        return !!deck && deck.active === true && deck.slides.length > 0
    }

    /** Stable fingerprint for poll change detection. */
    function fingerprint(deck) {
        var d = normalizeDeck(deck)
        var urls = []
        for (var i = 0; i < d.slides.length; i++) urls.push(d.slides[i].url)
        return [
            d.slideshow,
            d.active ? '1' : '0',
            String(d.slideDuration),
            String(d.refreshInterval),
            d.hoursStart,
            d.hoursEnd,
            urls.join('\u0001'),
        ].join('\u0002')
    }

    /** True when a freshly polled deck differs from the current one. */
    function deckChanged(currentDeck, polledDeck) {
        return fingerprint(currentDeck) !== fingerprint(polledDeck)
    }

    /**
     * Decide what the player should be doing right now.
     * Owns the precedence: idle (no playable deck) > standby (outside hours) > play.
     * Pure — the shell just executes the returned state.
     * @returns {'play'|'standby'|'idle'}
     */
    function resolveState(deck, nowMinutes) {
        if (!isPlayable(deck)) return 'idle'
        if (!isWithinHours(nowMinutes, deck.hoursStart, deck.hoursEnd)) return 'standby'
        return 'play'
    }

    /**
     * Append a per-cycle cache-buster so re-showing the same URL reloads the
     * iframe (single-slide decks must not show stale dashboards all day).
     * Never throws; non-strings pass through untouched.
     */
    function addCacheBuster(url, n) {
        if (typeof url !== 'string') return url
        return url + (url.indexOf('?') === -1 ? '?' : '&') + '_odm=' + n
    }

    var ODMPlayer = {
        parseHHMM: parseHHMM,
        isWithinHours: isWithinHours,
        minutesOfDay: minutesOfDay,
        nextIndex: nextIndex,
        normalizeDeck: normalizeDeck,
        isPlayable: isPlayable,
        fingerprint: fingerprint,
        deckChanged: deckChanged,
        resolveState: resolveState,
        addCacheBuster: addCacheBuster,
    }

    global.ODMPlayer = ODMPlayer
    /* eslint-disable-next-line no-undef */
    if (typeof module !== 'undefined' && module.exports) module.exports = ODMPlayer
})(typeof window !== 'undefined' ? window : globalThis)
