/**
 * generate-docs.mjs — derive docs/ pages (and the README fact block) from source.
 *
 * Reads the declarative Fluent metadata (src/fluent/*.now.ts) and the server
 * sources via the TypeScript compiler API and renders a technical reference.
 *
 * Design rules:
 *  - DETERMINISTIC: no timestamps, no absolute paths, stable ordering. The CI
 *    diff-gate (`npm run docs && git diff --exit-code`) depends on this.
 *  - Machine-owned sections live between BEGIN:generated / END:generated markers
 *    and are overwritten every run. Prose lives between BEGIN:manual / END:manual
 *    markers and is preserved verbatim across regenerations.
 *
 * Run: npm run docs   (also runs as part of `npm run build`)
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (...p) => readFileSync(join(root, ...p), 'utf8')
const rel = (abs) => relative(root, abs).split('\\').join('/')

// ---------------------------------------------------------------------------
// AST helpers
// ---------------------------------------------------------------------------

/** Parse a source file into a ts.SourceFile (comments retained). */
function parse(absPath) {
    return ts.createSourceFile(absPath, readFileSync(absPath, 'utf8'), ts.ScriptTarget.Latest, true)
}

/** Convert a literal AST node into a plain JS value; opaque nodes become {__ref}. */
function nodeToValue(node, sf) {
    if (!node) return undefined
    switch (node.kind) {
        case ts.SyntaxKind.StringLiteral:
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
            return node.text
        case ts.SyntaxKind.NumericLiteral:
            return Number(node.text)
        case ts.SyntaxKind.TrueKeyword:
            return true
        case ts.SyntaxKind.FalseKeyword:
            return false
        case ts.SyntaxKind.NullKeyword:
            return null
        case ts.SyntaxKind.ArrayLiteralExpression:
            return node.elements.map((e) => nodeToValue(e, sf))
        case ts.SyntaxKind.ObjectLiteralExpression: {
            const obj = {}
            for (const prop of node.properties) {
                if (ts.isPropertyAssignment(prop)) {
                    const key = prop.name.text ?? prop.name.getText(sf)
                    obj[key] = nodeToValue(prop.initializer, sf)
                }
            }
            return obj
        }
        case ts.SyntaxKind.CallExpression:
            return { __call: node.expression.getText(sf), args: node.arguments.map((a) => nodeToValue(a, sf)) }
        default:
            // identifiers, member/element access, template exprs — keep as source text
            return { __ref: node.getText(sf) }
    }
}

/** First sentence of the leading block comment for a node (or a file, if node omitted). */
function leadingSummary(sf, node) {
    const full = sf.getFullText()
    const pos = node ? node.getFullStart() : 0
    const ranges = ts.getLeadingCommentRanges(full, pos) || []
    if (!ranges.length) return ''
    const raw = full.slice(ranges[0].pos, ranges[0].end)
    return firstSentence(stripComment(raw))
}

function stripComment(raw) {
    return raw
        .replace(/^\/\*+/, '')
        .replace(/\*+\/$/, '')
        .replace(/^\s*\/\/+/gm, '')
        .split('\n')
        .map((l) => l.replace(/^\s*\*?\s?/, '').trimEnd())
        .join('\n')
        .trim()
}

function firstSentence(text) {
    const clean = text.replace(/\s+/g, ' ').trim()
    const m = /^(.*?[.!?])(\s|$)/.exec(clean)
    return (m ? m[1] : clean).trim()
}

/** Deep-resolve {__ref: NAME} nodes against a file-local symbol table (const literals). */
function resolveRefs(value, symbols) {
    if (Array.isArray(value)) return value.map((v) => resolveRefs(v, symbols))
    if (value && typeof value === 'object') {
        if (value.__ref !== undefined && Object.prototype.hasOwnProperty.call(symbols, value.__ref)) {
            return symbols[value.__ref]
        }
        const out = {}
        for (const [k, v] of Object.entries(value)) out[k] = resolveRefs(v, symbols)
        return out
    }
    return value
}

/** Collect top-level `export const NAME = Callee({...})` artifacts from a Fluent file. */
function collectArtifacts(sf) {
    // First pass: file-local const literals, so references like CREATOR_OR_ASSIGNED resolve.
    const symbols = {}
    for (const stmt of sf.statements) {
        if (!ts.isVariableStatement(stmt)) continue
        for (const decl of stmt.declarationList.declarations) {
            if (decl.initializer && ts.isIdentifier(decl.name)) {
                const v = nodeToValue(decl.initializer, sf)
                if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') symbols[decl.name.text] = v
            }
        }
    }
    const out = []
    for (const stmt of sf.statements) {
        if (!ts.isVariableStatement(stmt)) continue
        const isExport = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        if (!isExport) continue
        for (const decl of stmt.declarationList.declarations) {
            const init = decl.initializer
            if (!init || !ts.isCallExpression(init) || !ts.isIdentifier(init.expression)) continue
            out.push({
                exportName: decl.name.getText(sf),
                kind: init.expression.text,
                summary: leadingSummary(sf, stmt),
                props: resolveRefs(nodeToValue(init.arguments[0], sf) || {}, symbols),
            })
        }
    }
    return out
}

// ---------------------------------------------------------------------------
// Markdown rendering helpers
// ---------------------------------------------------------------------------

const esc = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n+/g, ' ').trim()
const yn = (v) => (v === true ? 'yes' : v === false ? 'no' : '')
const code = (v) => (v === '' || v === undefined || v === null ? '' : '`' + String(v) + '`')

function table(headers, rows) {
    const head = `| ${headers.join(' | ')} |`
    const sep = `| ${headers.map(() => '---').join(' | ')} |`
    const body = rows.map((r) => `| ${r.map(esc).join(' | ')} |`).join('\n')
    return [head, sep, body].join('\n')
}

/** Render an opaque reference/call value as readable text. */
function refText(v) {
    if (v == null) return ''
    if (typeof v === 'object') {
        if (v.__ref) return v.__ref
        if (v.__call) return v.__call + '(…)'
    }
    return String(v)
}

// ---------------------------------------------------------------------------
// Per-kind section renderers
// ---------------------------------------------------------------------------

function renderTables(items) {
    if (!items.length) return '_No tables defined._'
    return items
        .map((t) => {
            const p = t.props
            const schema = p.schema || {}
            const rows = Object.entries(schema).map(([field, col]) => {
                const type = col?.__call || ''
                const cp = (col?.args && col.args[0]) || {}
                const ref = cp.referenceTable ? `→ ${cp.referenceTable}` : ''
                return [
                    code(field),
                    type.replace(/Column$/, ''),
                    esc(cp.label),
                    yn(cp.mandatory),
                    cp.maxLength ?? '',
                    cp.default === undefined ? '' : code(cp.default),
                    esc([ref, cp.hint].filter(Boolean).join(' — ')),
                ]
            })
            const flags = [
                p.accessibleFrom && `accessibleFrom: ${p.accessibleFrom}`,
                p.actions && `actions: ${p.actions.join(', ')}`,
                p.audit === true && 'audit',
                p.allowWebServiceAccess === true && 'Table API access',
            ]
                .filter(Boolean)
                .join(' · ')
            return [
                `### \`${p.name}\` — ${esc(p.label || t.exportName)}`,
                t.summary && `\n${t.summary}\n`,
                table(['Field', 'Type', 'Label', 'Mandatory', 'Max', 'Default', 'Notes'], rows),
                flags && `\n_${flags}_`,
            ]
                .filter(Boolean)
                .join('\n')
        })
        .join('\n\n')
}

function renderRest(items, scope) {
    if (!items.length) return '_No REST APIs defined._'
    return items
        .map((a) => {
            const p = a.props
            const base = `/api/${scope}/${p.serviceId}`
            const rows = (p.routes || []).map((r) => [
                code(r.method),
                code(base + (r.path === '/' ? '' : r.path)),
                esc(r.produces),
                code(refText(r.script)),
                esc(r.shortDescription),
            ])
            return [
                `### ${esc(p.name || a.exportName)} — base \`${base}\``,
                a.summary && `\n${a.summary}\n`,
                table(['Method', 'Path', 'Produces', 'Handler', 'Description'], rows),
            ]
                .filter(Boolean)
                .join('\n')
        })
        .join('\n\n')
}

function renderBusinessRules(items) {
    if (!items.length) return '_No business rules defined._'
    const rows = items.map((a) => {
        const p = a.props
        return [
            esc(p.name || a.exportName),
            code(p.table),
            esc(p.when),
            esc((p.action || []).join(', ')),
            p.order ?? '',
            esc(p.description || a.summary),
        ]
    })
    return table(['Rule', 'Table', 'When', 'Actions', 'Order', 'Purpose'], rows)
}

function renderAcls(items) {
    if (!items.length) return '_No ACLs defined._'
    const rows = items.map((a) => {
        const p = a.props
        const rule = p.condition ? code(p.condition) : p.script ? code(p.script) : ''
        return [
            code(p.table),
            esc(p.operation),
            esc(p.type),
            yn(p.adminOverrides),
            esc(rule),
            esc(p.description || a.summary),
        ]
    })
    return table(['Table', 'Operation', 'Type', 'Admin override', 'Condition / script', 'Purpose'], rows)
}

function renderUiPolicies(items) {
    if (!items.length) return '_No UI policies defined._'
    const rows = items.map((a) => {
        const p = a.props
        const actions = (p.actions || [])
            .map(
                (act) =>
                    `${act.field}: ${Object.entries(act)
                        .filter(([k]) => k !== 'field')
                        .map(([k, v]) => `${k}=${v}`)
                        .join(', ')}`
            )
            .join('; ')
        return [code(p.table), esc(p.shortDescription || a.summary), p.conditions ? code(p.conditions) : '(always)', esc(actions)]
    })
    return table(['Table', 'Description', 'Condition', 'Actions'], rows)
}

function renderScriptIncludes(items) {
    if (!items.length) return '_No script includes defined._'
    const rows = items.map((a) => [
        code(a.props.name || a.exportName),
        esc(a.props.accessibleFrom),
        esc(a.props.description || a.summary),
    ])
    return table(['Name', 'Accessible from', 'Purpose'], rows)
}

function renderUiPages(items) {
    if (!items.length) return '_No UI pages defined._'
    const rows = items.map((a) => [
        code(a.props.endpoint),
        yn(a.props.direct),
        esc(a.props.category),
        esc(a.props.description || a.summary),
    ])
    return table(['Endpoint', 'Direct', 'Category', 'Purpose'], rows)
}

function renderForms(items) {
    if (!items.length) return '_No forms defined._'
    return items
        .map((a) => {
            const p = a.props
            const sections = (p.sections || [])
                .map((s) => {
                    const fields = collectFormFields(s).join(', ')
                    return `- **${esc(s.caption)}**: ${fields}`
                })
                .join('\n')
            return [`### ${code(p.table)} form`, a.summary && `\n${a.summary}\n`, sections].filter(Boolean).join('\n')
        })
        .join('\n\n')
}

function collectFormFields(node, acc = []) {
    if (Array.isArray(node)) {
        node.forEach((n) => collectFormFields(n, acc))
    } else if (node && typeof node === 'object') {
        if (node.type === 'table_field' && node.field) acc.push('`' + node.field + '`')
        for (const [k, v] of Object.entries(node)) {
            if (k !== 'type' && k !== 'field') collectFormFields(v, acc)
        }
    }
    return acc
}

function renderNavigation(menus, records) {
    if (!menus.length && !records.length) return '_No navigation defined._'
    const parts = []
    for (const m of menus)
        parts.push(`**Application menu:** ${esc(m.props.title || m.exportName)} — ${esc(m.props.description || m.summary)}`)
    const rows = records
        .filter((r) => r.props.table === 'sys_app_module')
        .map((r) => {
            const d = r.props.data || {}
            return [esc(d.title), esc(d.link_type), code(d.name), esc((d.roles || []).join(', ') || 'any'), esc(d.hint)]
        })
    if (rows.length) parts.push(table(['Module', 'Type', 'Target', 'Roles', 'Hint'], rows))
    return parts.join('\n\n')
}

// ---------------------------------------------------------------------------
// Application code (server + client) — exported functions & interfaces
// ---------------------------------------------------------------------------

function renderExportedFunctions(absPath) {
    if (!existsSync(absPath)) return ''
    const sf = parse(absPath)
    const rows = []
    for (const stmt of sf.statements) {
        const isExport = stmt.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
        if (!isExport) continue
        if (ts.isFunctionDeclaration(stmt) && stmt.name) {
            const params = stmt.parameters.map((pp) => pp.name.getText(sf)).join(', ')
            rows.push([code(`${stmt.name.text}(${params})`), esc(leadingSummary(sf, stmt))])
        } else if (ts.isInterfaceDeclaration(stmt)) {
            rows.push([code(`interface ${stmt.name.text}`), esc(leadingSummary(sf, stmt))])
        }
    }
    if (!rows.length) return ''
    return `#### \`${rel(absPath)}\`\n\n${table(['Export', 'Purpose'], rows)}`
}

// ---------------------------------------------------------------------------
// File inventory
// ---------------------------------------------------------------------------

const INVENTORY_DIRS = ['src', 'scripts']
const CODE_EXT = /\.(ts|js|mjs|html)$/

function walk(absDir, acc = []) {
    for (const name of readdirSync(absDir).sort()) {
        if (name === '.DS_Store') continue
        const abs = join(absDir, name)
        if (statSync(abs).isDirectory()) walk(abs, acc)
        else if (CODE_EXT.test(name)) acc.push(abs)
    }
    return acc
}

function filePurpose(absPath) {
    const text = readFileSync(absPath, 'utf8')
    const header = firstBlockComment(text, absPath)
    const summary = firstSentence(stripComment(header))
    // "Generated" only when THIS file's own header carries the banner (not a
    // builder script that merely emits the banner string elsewhere).
    return /GENERATED FILE/.test(header) ? `_(generated)_ ${summary}` : summary
}

function firstBlockComment(text, absPath = '') {
    if (absPath.endsWith('.html')) {
        const h = /<!--[\s\S]*?-->/.exec(text)
        return h ? h[0] : ''
    }
    const m = /\/\*[\s\S]*?\*\//.exec(text) || /(?:^|\n)\s*(?:\/\/.*(?:\n|$))+/.exec(text)
    return m ? m[0] : ''
}

function renderInventory() {
    const rows = []
    for (const d of INVENTORY_DIRS) {
        const abs = join(root, d)
        if (!existsSync(abs)) continue
        for (const f of walk(abs)) rows.push([code(rel(f)), esc(filePurpose(f))])
    }
    return table(['File', 'Purpose'], rows)
}

// ---------------------------------------------------------------------------
// Tests (Jest unit + Playwright E2E)
// ---------------------------------------------------------------------------

const TEST_FILE = /\.(test|spec)\.(ts|js)$/

function walkTests(absDir, acc = []) {
    if (!existsSync(absDir)) return acc
    for (const name of readdirSync(absDir).sort()) {
        if (name === '.DS_Store') continue
        const abs = join(absDir, name)
        if (statSync(abs).isDirectory()) walkTests(abs, acc)
        else if (TEST_FILE.test(name)) acc.push(abs)
    }
    return acc
}

/** describe() titles + test-case count (test.each rows counted individually). */
function analyzeTestFile(absPath) {
    const sf = parse(absPath)
    const describes = []
    let cases = 0
    // record the first-arg string title of a describe()/test.describe() call
    const addDescribe = (node) => {
        const n = node.arguments[0]
        if (n && (ts.isStringLiteral(n) || n.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral)) describes.push(n.text)
    }
    const visit = (node) => {
        if (ts.isCallExpression(node)) {
            const e = node.expression
            if (ts.isIdentifier(e)) {
                // describe(...) / test(...) / it(...)
                if (e.text === 'describe') addDescribe(node)
                else if (e.text === 'test' || e.text === 'it') cases += 1
            } else if (ts.isPropertyAccessExpression(e) && ts.isIdentifier(e.expression)) {
                // test.describe(...) (Playwright) / test.only(...) / it.skip(...)
                if (e.name.text === 'describe') addDescribe(node)
                else if (
                    (e.expression.text === 'test' || e.expression.text === 'it') &&
                    (e.name.text === 'only' || e.name.text === 'skip')
                ) {
                    cases += 1
                }
            } else if (
                ts.isCallExpression(e) &&
                ts.isPropertyAccessExpression(e.expression) &&
                ts.isIdentifier(e.expression.expression) &&
                (e.expression.expression.text === 'test' || e.expression.expression.text === 'it') &&
                e.expression.name.text === 'each'
            ) {
                // test.each([...])(...) — count the rows
                const arr = e.arguments[0]
                cases += arr && ts.isArrayLiteralExpression(arr) ? arr.elements.length : 1
            }
        }
        ts.forEachChild(node, visit)
    }
    visit(sf)
    return { describes, cases }
}

function renderTests() {
    const files = walkTests(join(root, 'test'))
    if (!files.length) return '_No tests found._'
    const unit = []
    const e2e = []
    for (const abs of files) {
        const { describes, cases } = analyzeTestFile(abs)
        const row = [code(rel(abs)), cases, esc(describes.join(' · ') || '—')]
        ;(rel(abs).includes('/e2e/') ? e2e : unit).push(row)
    }
    const total = (rows) => rows.reduce((n, r) => n + r[1], 0)
    const parts = [
        `**Unit (Jest):** ${total(unit)} cases across ${unit.length} files — run \`npm test\`. ` +
            `**End-to-end (Playwright):** ${total(e2e)} cases against a live instance — run \`npm run test:e2e\`. ` +
            '(Counts derived from source; `test.each` rows counted individually.)',
    ]
    if (unit.length) parts.push('### Unit tests (Jest)\n\n' + table(['File', 'Cases', 'Suites'], unit))
    if (e2e.length) parts.push('### End-to-end tests (Playwright)\n\n' + table(['File', 'Cases', 'Suites'], e2e))
    return parts.join('\n\n')
}

// ---------------------------------------------------------------------------
// Marker-block assembly
// ---------------------------------------------------------------------------

/** Extract the preserved body of a manual block from prior content, else default. */
function manualBlock(prev, key, def) {
    const re = new RegExp(`<!-- BEGIN:manual:${key} -->\\n?([\\s\\S]*?)\\n?<!-- END:manual:${key} -->`)
    const m = prev && re.exec(prev)
    const body = m ? m[1] : def
    return `<!-- BEGIN:manual:${key} -->\n${body}\n<!-- END:manual:${key} -->`
}

function generatedBlock(key, body) {
    return `<!-- BEGIN:generated:${key} -->\n${body}\n<!-- END:generated:${key} -->`
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const pkg = JSON.parse(read('package.json'))
const nowConfig = JSON.parse(read('now.config.json'))
const scope = nowConfig.scope

// Gather Fluent artifacts (sorted files → deterministic output)
const fluentDir = join(root, 'src', 'fluent')
const fluentFiles = readdirSync(fluentDir)
    .filter((f) => f.endsWith('.now.ts'))
    .sort()
const artifacts = []
for (const f of fluentFiles) artifacts.push(...collectArtifacts(parse(join(fluentDir, f))))
const byKind = (k) => artifacts.filter((a) => a.kind === k)

const restBases = byKind('RestApi').map((a) => `/api/${scope}/${a.props.serviceId}`)
const uiEndpoints = byKind('UiPage').map((a) => a.props.endpoint)

// App fact block (also mirrored into README)
const appFacts = table(
    ['Property', 'Value'],
    [
        ['Application', esc(nowConfig.name)],
        ['Scope', code(scope)],
        ['Version', code(pkg.version)],
        ['REST base', restBases.map(code).join(', ')],
        ['Browser entry', uiEndpoints.map(code).join(', ')],
    ]
)

const appCode = [
    renderExportedFunctions(join(root, 'src', 'server', 'deck.ts')),
    renderExportedFunctions(join(root, 'src', 'server', 'handlers.src.ts')),
]
    .filter(Boolean)
    .join('\n\n')

// Docs live under docs/ as separate pages. Manual (authored) blocks migrate from
// the legacy single-file DOCUMENTATION.md on the first split.
const legacyDoc = existsSync(join(root, 'DOCUMENTATION.md')) ? read('DOCUMENTATION.md') : ''
const docsDir = join(root, 'docs')
mkdirSync(docsDir, { recursive: true })
const docPath = join(docsDir, 'documentations.md')
const testsPath = join(docsDir, 'tests.md')
const prevDoc = existsSync(docPath) ? readFileSync(docPath, 'utf8') : legacyDoc
const prevTests = existsSync(testsPath) ? readFileSync(testsPath, 'utf8') : legacyDoc

const GEN_NOTE =
    '<!-- Generated by scripts/generate-docs.mjs on `npm run build`. Do not edit generated\n' +
    '     pages by hand — change the source and rerun. Authored prose (Overview / Architecture\n' +
    '     notes on the Overview page) lives in BEGIN:manual / END:manual blocks and is preserved. -->'

const pageMd = (title, body) => [`# ${nowConfig.name} — ${title}`, '', GEN_NOTE, '', ...body, ''].join('\n')

// The landing page (documentations.md → index.html) carries the authored blocks.
const overviewPage = pageMd('Overview', [
    manualBlock(
        prevDoc,
        'overview',
        '## Overview\n\n_Describe what the application does and how the pieces fit together. This block is yours to edit; the generator never overwrites it._'
    ),
    '',
    '## Application',
    '',
    generatedBlock('app', appFacts),
    '',
    manualBlock(prevDoc, 'architecture', '## Architecture notes\n\n_Authored architecture notes go here._'),
])

// Topic pages — fully generated, one file each (docs/<slug>.md → <slug>.html).
const topicPages = [
    { slug: 'data-model', title: 'Data model', body: ['## Data model', '', generatedBlock('tables', renderTables(byKind('Table')))] },
    { slug: 'rest-api', title: 'REST API', body: ['## REST API', '', generatedBlock('rest', renderRest(byKind('RestApi'), scope))] },
    {
        slug: 'access-control',
        title: 'Access control',
        body: ['## Access control (ACLs)', '', generatedBlock('acls', renderAcls(byKind('Acl')))],
    },
    {
        slug: 'business-logic',
        title: 'Business logic',
        body: [
            '## Business rules',
            '',
            generatedBlock('business-rules', renderBusinessRules(byKind('BusinessRule'))),
            '',
            '## Script includes',
            '',
            generatedBlock('script-includes', renderScriptIncludes(byKind('ScriptInclude'))),
            '',
            '## Application code',
            '',
            generatedBlock('app-code', appCode || '_No exported server functions found._'),
        ],
    },
    {
        slug: 'user-interface',
        title: 'User interface',
        body: [
            '## Forms',
            '',
            generatedBlock('forms', renderForms(byKind('Form'))),
            '',
            '## UI policies',
            '',
            generatedBlock('ui-policies', renderUiPolicies(byKind('UiPolicy'))),
            '',
            '## UI pages',
            '',
            generatedBlock('ui-pages', renderUiPages(byKind('UiPage'))),
            '',
            '## Navigation',
            '',
            generatedBlock('navigation', renderNavigation(byKind('ApplicationMenu'), byKind('Record'))),
        ],
    },
    { slug: 'reference', title: 'Reference', body: ['## File inventory', '', generatedBlock('inventory', renderInventory())] },
]

// Tests are their own page (docs/tests.md).
const testsDoc = [
    `# ${nowConfig.name} — Testing`,
    '',
    '<!-- Generated by scripts/generate-docs.mjs. Prose lives in BEGIN:manual blocks;',
    '     the table is regenerated from the test sources. -->',
    '',
    manualBlock(
        prevTests,
        'testing',
        'Two layers, so most coverage is fast and instance-free:\n\n' +
            '- **Unit tests (Jest)** cover the pure logic — the `links` parser, deck building, ' +
            'injection escaping, the player rotation/working-hours state machine, and the template ' +
            'generator — plus the Glide handler layer against an in-memory fake (`test/fakes/glide.js`), ' +
            'so no instance is needed and every branch is reachable.\n' +
            '- **End-to-end tests (Playwright)** drive a real browser against a live instance: log in, ' +
            'open the direct player page, and assert the deck renders, slides rotate, and the open-time ' +
            'access check allows the creator / service account / admin (and `public` decks) while denying ' +
            'strangers. Fixtures (a disposable service account + slideshow) are created and torn down ' +
            'automatically; secrets come from a gitignored `.env` (`ODM_ADMIN_PASS`, `ODM_STRANGER_PASS`, …).\n\n' +
            'The table below is generated from the test sources.'
    ),
    '',
    generatedBlock('tests', renderTests()),
    '',
].join('\n')

const cleanup = (s) => s.replace(/\n{3,}/g, '\n\n').trimEnd() + '\n'
writeFileSync(docPath, cleanup(overviewPage))
writeFileSync(testsPath, cleanup(testsDoc))
for (const p of topicPages) writeFileSync(join(docsDir, `${p.slug}.md`), cleanup(pageMd(p.title, p.body)))
// Docs moved into docs/; drop the legacy root file so it stops lingering.
if (existsSync(join(root, 'DOCUMENTATION.md'))) rmSync(join(root, 'DOCUMENTATION.md'))

// README fact block (create a default README if absent)
const readmePath = join(root, 'README.md')
let readme = existsSync(readmePath) ? readFileSync(readmePath, 'utf8') : defaultReadme(nowConfig.name)
const reReadme = /<!-- BEGIN:generated:app -->\n?[\s\S]*?\n?<!-- END:generated:app -->/
readme = readme.replace(reReadme, generatedBlock('app', appFacts))
writeFileSync(readmePath, readme.replace(/[ \t]+$/gm, ''))

console.log(
    `generate-docs: ${topicPages.length + 2} docs pages (overview + ${topicPages
        .map((p) => p.slug)
        .join(', ')} + tests) + README written (${artifacts.length} Fluent artifacts).`
)

function defaultReadme(name) {
    return [
        `# ${name}`,
        '',
        'ServiceNow scoped application, built with the ServiceNow Fluent SDK.',
        '',
        '<!-- BEGIN:generated:app -->',
        '<!-- END:generated:app -->',
        '',
        '## Development',
        '',
        '```bash',
        'npm install',
        'npm run build      # build template, regenerate docs, now-sdk build',
        'npm test           # jest',
        'npm run deploy     # now-sdk install (uses .now/ credential alias)',
        '```',
        '',
        '## Release',
        '',
        '```bash',
        'npm run release -- patch   # build, test, bump, deploy, tag, push',
        '```',
        '',
        'The technical reference lives in [`docs/`](./docs/) as topic pages (published to GitHub Pages with sidebar nav). Start at [docs/documentations.md](./docs/documentations.md).',
        '',
        '## Authentication',
        '',
        'Authenticate the SDK once per machine (credentials are stored under `.now/`, gitignored):',
        '',
        '```bash',
        'npx now-sdk auth --add <instance-url>',
        '```',
        '',
    ].join('\n')
}
