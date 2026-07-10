import { parseLinks, buildDeck, escapeDeckJson, injectDeck, toPositiveInt, DECK_TOKEN_LITERAL } from '../src/server/deck'

describe('parseLinks', () => {
    test('comma-separated URLs', () => {
        expect(parseLinks('https://a.example/x, https://b.example/y')).toEqual([
            { url: 'https://a.example/x' },
            { url: 'https://b.example/y' },
        ])
    })
    test('newline-separated also works', () => {
        expect(parseLinks('https://a.example/x\n/sys_report_template.do?jvar_report_id=1')).toEqual([
            { url: 'https://a.example/x' },
            { url: '/sys_report_template.do?jvar_report_id=1' },
        ])
    })
    test('mixed separators, blank entries and whitespace', () => {
        expect(parseLinks(' https://a.example ,\n\n , /b ,')).toEqual([{ url: 'https://a.example' }, { url: '/b' }])
    })
    test('# comment entries are skipped', () => {
        expect(parseLinks('#disabled https://a.example\n/live')).toEqual([{ url: '/live' }])
    })
    test('%2C keeps a comma-containing query in one slide', () => {
        const url = '/incident_list.do?sysparm_query=state%3D1%2Cpriority%3D2'
        expect(parseLinks(url)).toEqual([{ url }])
    })
    test('unencoded comma in query splits the URL (documented sharp edge)', () => {
        const parsed = parseLinks('/list.do?sysparm_query=state=1,priority=2')
        // the first fragment survives as a root-relative URL; the tail is invalid and dropped
        expect(parsed).toEqual([{ url: '/list.do?sysparm_query=state=1' }])
    })
    test('bare relative paths are rejected', () => {
        expect(parseLinks('sys_report.do?x=1')).toEqual([])
    })
    test('garbage, empty and null are safe', () => {
        expect(parseLinks('not a url')).toEqual([])
        expect(parseLinks('')).toEqual([])
        expect(parseLinks(null)).toEqual([])
        expect(parseLinks(undefined)).toEqual([])
    })
    test('ftp and javascript schemes are rejected', () => {
        expect(parseLinks('ftp://a.example/x, javascript:alert(1)')).toEqual([])
    })
})

describe('toPositiveInt', () => {
    test('string numbers parse', () => expect(toPositiveInt('45', 30, 1)).toBe(45))
    test('below minimum falls back', () => expect(toPositiveInt('0', 30, 1)).toBe(30))
    test('garbage falls back', () => expect(toPositiveInt('abc', 60, 10)).toBe(60))
    test('null falls back', () => expect(toPositiveInt(null, 60, 10)).toBe(60))
})

describe('buildDeck', () => {
    test('null fields yield inactive empty deck naming the screen', () => {
        const d = buildDeck('svc.display.sd-room1', null)
        expect(d.screen).toBe('svc.display.sd-room1')
        expect(d.active).toBe(false)
        expect(d.slides).toEqual([])
    })
    test('GlideRecord-style string fields are coerced', () => {
        const d = buildDeck('svc.display.sd-room1', {
            name: 'SD Queue Wall',
            links: '/a, /b',
            slide_duration: '20',
            refresh_interval: '45',
            hours_start: '07:00',
            hours_end: '19:00',
            active: 'true',
        })
        expect(d).toEqual({
            screen: 'svc.display.sd-room1',
            slideshow: 'SD Queue Wall',
            active: true,
            slides: [{ url: '/a' }, { url: '/b' }],
            slideDuration: 20,
            refreshInterval: 45,
            hoursStart: '07:00',
            hoursEnd: '19:00',
            token: '',
        })
    })
    test('active "false" string maps to false', () => {
        expect(buildDeck('s', { active: 'false' }).active).toBe(false)
    })
})

describe('escapeDeckJson / injectDeck', () => {
    const template = '<html><script>window.__ODM_DECK__ = "__ODM_DECK_JSON__";</script></html>'

    test('injects parseable JSON', () => {
        const deck = buildDeck('s', { name: 'D', links: '/a', active: 'true' })
        const html = injectDeck(template, deck)
        const m = /window\.__ODM_DECK__ = (.*);<\/script>/.exec(html)
        expect(m).not.toBeNull()
        const parsed = JSON.parse((m as RegExpExecArray)[1])
        expect(parsed.slideshow).toBe('D')
    })
    test('script breakout attempt is neutralized', () => {
        const evil = buildDeck('s', {
            name: '</script><script>alert(1)</script>',
            links: '/a?x=</script>',
            active: 'true',
        })
        const json = escapeDeckJson(evil)
        expect(json).not.toContain('</script>')
        expect(json).toContain('\\u003c')
        const html = injectDeck(template, evil)
        // the only </script> tag left is the template's own closer
        expect(html.match(/<\/script>/g)).toHaveLength(1)
    })
    test('CDATA terminator in manager content cannot break the CDATA wrapper', () => {
        const evil = buildDeck('s', { name: 'x]]>y', links: '/a?q=]]>', active: 'true' })
        expect(escapeDeckJson(evil)).not.toContain(']]>')
    })
    test('missing token throws (build defect must be loud)', () => {
        expect(() => injectDeck('<html></html>', buildDeck('s', null))).toThrow(/injection token/)
    })
    test('token constant matches what build-template emits', () => {
        expect(template).toContain(DECK_TOKEN_LITERAL)
    })
})
