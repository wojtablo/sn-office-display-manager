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
        if (/^https?:\/\/\S+$/i.test(entry) || (entry.charAt(0) === '/' && /^\/\S*$/.test(entry))) {
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
