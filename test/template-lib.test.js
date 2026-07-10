const {
    inlinePlayerScript,
    stripLocalImports,
    generateRoutesModule,
    SCRIPT_TAG,
    DECK_TOKEN_LITERAL,
} = require('../scripts/template-lib.js')

describe('inlinePlayerScript', () => {
    const html = `<html>${'<script src="player.js"></script>'}<script>window.__ODM_DECK__ = "__ODM_DECK_JSON__";</script></html>`

    test('replaces the script tag with inline content', () => {
        const out = inlinePlayerScript(html, 'var x = 1')
        expect(out).not.toContain(SCRIPT_TAG)
        expect(out).toContain('<script>\nvar x = 1\n</script>')
    })
    test('throws when the script tag is missing', () => {
        expect(() => inlinePlayerScript('<html></html>', 'x')).toThrow(/player\.js/)
    })
    test('throws when the injection token is missing', () => {
        expect(() => inlinePlayerScript('<html><script src="player.js"></script></html>', 'x')).toThrow(
            /__ODM_DECK_JSON__/
        )
    })
})

describe('stripLocalImports', () => {
    test('strips relative imports', () => {
        const src = "import { a } from './deck'\nimport { b } from '../other'\nconst keep = 1\n"
        expect(stripLocalImports(src)).toBe('const keep = 1\n')
    })
    test('strips @servicenow/glide imports', () => {
        const src = "import { gs, GlideRecord } from '@servicenow/glide'\nexport function f() {}\n"
        expect(stripLocalImports(src)).toBe('export function f() {}\n')
    })
    test('keeps type-only relative imports out too', () => {
        const src = "import { buildDeck, type Deck } from './deck'\nlet x\n"
        expect(stripLocalImports(src)).toBe('let x\n')
    })
    test('does not touch non-import lines mentioning import', () => {
        const src = "// import stays in comments? no: only real import lines go\nconst s = \"import { x } from './y'\"\n"
        expect(stripLocalImports(src)).toBe(src)
    })
})

describe('generateRoutesModule', () => {
    const parts = {
        inlinedHtml: '<html>"quotes" and \\ backslashes</html>',
        deckSource: "import { x } from './nope'\nexport function buildDeck() { return 1 }\n",
        handlersSource:
            "import { gs } from '@servicenow/glide'\nimport { buildDeck } from './deck'\nexport function servePlayerHtml() { return buildDeck() }\n",
    }

    test('emits exactly one @servicenow/glide import', () => {
        const out = generateRoutesModule(parts)
        expect(out.match(/@servicenow\/glide/g)).toHaveLength(1)
    })
    test('contains no relative imports (self-contained)', () => {
        const out = generateRoutesModule(parts)
        expect(out).not.toMatch(/^import .*['"]\./m)
    })
    test('embeds the HTML as a valid JS string literal', () => {
        const out = generateRoutesModule(parts)
        const m = /export const ROTATOR_HTML: string =\n\s+(".*")/m.exec(out)
        expect(m).not.toBeNull()
        expect(JSON.parse(m[1])).toBe(parts.inlinedHtml)
    })
    test('is deterministic', () => {
        expect(generateRoutesModule(parts)).toBe(generateRoutesModule(parts))
    })
    test('keeps exported functions from both sources', () => {
        const out = generateRoutesModule(parts)
        expect(out).toContain('export function buildDeck()')
        expect(out).toContain('export function servePlayerHtml()')
    })
})
