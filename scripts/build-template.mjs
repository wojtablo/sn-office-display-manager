/**
 * build-template.mjs — compile the player template into a server-side constant.
 *
 * Inlines src/client/templates/player.js into rotator.html (replacing the
 * <script src="player.js"> tag so the served document is a single file), then
 * emits src/server/OdmTemplates.ts exporting the HTML as a string constant.
 *
 * Deterministic: same inputs -> byte-identical output (no timestamps).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const templatesDir = join(root, 'src', 'client', 'templates')

const playerJs = readFileSync(join(templatesDir, 'player.js'), 'utf8')
const rotatorHtml = readFileSync(join(templatesDir, 'rotator.html'), 'utf8')

const SCRIPT_TAG = '<script src="player.js"></script>'
if (!rotatorHtml.includes(SCRIPT_TAG)) {
    console.error(`build-template: expected '${SCRIPT_TAG}' in rotator.html — not found, aborting.`)
    process.exit(1)
}
const inlined = rotatorHtml.replace(SCRIPT_TAG, '<script>\n' + playerJs + '\n</script>')

if (!inlined.includes('"__ODM_DECK_JSON__"')) {
    console.error('build-template: injection token "__ODM_DECK_JSON__" missing from rotator.html — aborting.')
    process.exit(1)
}

const out =
    '/**\n' +
    ' * GENERATED FILE — do not edit by hand.\n' +
    ' * Source: src/client/templates/rotator.html + player.js\n' +
    ' * Regenerate: npm run build (scripts/build-template.mjs)\n' +
    ' */\n\n' +
    '/** Injection token replaced by the server with escaped deck JSON. */\n' +
    "export const DECK_TOKEN = '\"__ODM_DECK_JSON__\"'\n\n" +
    '/** The complete player HTML document (player.js inlined). */\n' +
    'export const ROTATOR_HTML: string =\n    ' +
    JSON.stringify(inlined) +
    '\n'

writeFileSync(join(root, 'src', 'server', 'OdmTemplates.ts'), out)
console.log('build-template: src/server/OdmTemplates.ts written (' + inlined.length + ' chars of HTML)')
