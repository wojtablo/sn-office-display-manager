const P = require('../src/client/templates/player.js')

describe('parseHHMM', () => {
    test.each([
        ['07:00', 420],
        ['00:00', 0],
        ['23:59', 1439],
        ['7:05', 425],
        [' 19:00 ', 1140],
    ])('parses %s', (input, expected) => {
        expect(P.parseHHMM(input)).toBe(expected)
    })

    test.each([['24:00'], ['12:60'], ['noon'], [''], [null], [undefined], [1200], ['12'], ['12:5']])(
        'rejects %s',
        (input) => {
            expect(P.parseHHMM(input)).toBeNull()
        }
    )
})

describe('isWithinHours', () => {
    const at = (hhmm) => P.parseHHMM(hhmm)

    test('normal window: inside', () => {
        expect(P.isWithinHours(at('12:00'), '07:00', '19:00')).toBe(true)
    })
    test('normal window: before start', () => {
        expect(P.isWithinHours(at('06:59'), '07:00', '19:00')).toBe(false)
    })
    test('normal window: at start (inclusive)', () => {
        expect(P.isWithinHours(at('07:00'), '07:00', '19:00')).toBe(true)
    })
    test('normal window: at end (exclusive)', () => {
        expect(P.isWithinHours(at('19:00'), '07:00', '19:00')).toBe(false)
    })
    test('overnight window 22:00-06:00: late evening inside', () => {
        expect(P.isWithinHours(at('23:30'), '22:00', '06:00')).toBe(true)
    })
    test('overnight window 22:00-06:00: early morning inside', () => {
        expect(P.isWithinHours(at('05:59'), '22:00', '06:00')).toBe(true)
    })
    test('overnight window 22:00-06:00: midday outside', () => {
        expect(P.isWithinHours(at('12:00'), '22:00', '06:00')).toBe(false)
    })
    test('fail open: invalid start', () => {
        expect(P.isWithinHours(at('03:00'), 'garbage', '19:00')).toBe(true)
    })
    test('fail open: missing values', () => {
        expect(P.isWithinHours(at('03:00'), '', '')).toBe(true)
    })
    test('start === end means always on', () => {
        expect(P.isWithinHours(at('03:00'), '09:00', '09:00')).toBe(true)
    })
})

describe('nextIndex', () => {
    test('advances', () => expect(P.nextIndex(0, 3)).toBe(1))
    test('wraps', () => expect(P.nextIndex(2, 3)).toBe(0))
    test('single-slide deck stays at 0 (shell reloads iframe every cycle)', () =>
        expect(P.nextIndex(0, 1)).toBe(0))
    test('empty deck is safe', () => expect(P.nextIndex(5, 0)).toBe(0))
})

describe('normalizeDeck', () => {
    test('null input yields empty, non-playable deck with defaults', () => {
        const d = P.normalizeDeck(null)
        expect(d.slides).toEqual([])
        expect(d.slideDuration).toBe(30)
        expect(d.refreshInterval).toBe(60)
        expect(P.isPlayable(d)).toBe(false)
    })
    test('drops slide entries without a url', () => {
        const d = P.normalizeDeck({ slides: [{ url: '/a' }, {}, { url: '' }, null, { url: 'https://b' }] })
        expect(d.slides).toEqual([{ url: '/a' }, { url: 'https://b' }])
    })
    test('rejects non-positive duration and too-small refresh', () => {
        const d = P.normalizeDeck({ slideDuration: -5, refreshInterval: 1 })
        expect(d.slideDuration).toBe(30)
        expect(d.refreshInterval).toBe(60)
    })
    test('inactive deck is not playable even with slides', () => {
        const d = P.normalizeDeck({ active: false, slides: [{ url: '/a' }] })
        expect(P.isPlayable(d)).toBe(false)
    })
})

describe('deckChanged', () => {
    const base = {
        slideshow: 'Wall',
        active: true,
        slides: [{ url: '/a' }, { url: '/b' }],
        slideDuration: 30,
        refreshInterval: 60,
        hoursStart: '07:00',
        hoursEnd: '19:00',
    }
    test('identical decks: no change', () => {
        expect(P.deckChanged(base, JSON.parse(JSON.stringify(base)))).toBe(false)
    })
    test('url edit detected', () => {
        expect(P.deckChanged(base, { ...base, slides: [{ url: '/a' }, { url: '/c' }] })).toBe(true)
    })
    test('reorder detected', () => {
        expect(P.deckChanged(base, { ...base, slides: [{ url: '/b' }, { url: '/a' }] })).toBe(true)
    })
    test('duration edit detected', () => {
        expect(P.deckChanged(base, { ...base, slideDuration: 45 })).toBe(true)
    })
    test('kill switch detected', () => {
        expect(P.deckChanged(base, { ...base, active: false })).toBe(true)
    })
    test('hours edit detected', () => {
        expect(P.deckChanged(base, { ...base, hoursEnd: '20:00' })).toBe(true)
    })
})
