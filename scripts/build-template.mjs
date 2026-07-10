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

const banner =
    '/**\n' +
    ' * GENERATED FILE — do not edit by hand.\n' +
    ' * Sources: src/client/templates/rotator.html + player.js, src/server/deck.ts,\n' +
    ' *          src/server/handlers.src.ts\n' +
    ' * Regenerate: npm run build (scripts/build-template.mjs)\n' +
    ' */\n\n'

/* 1) OdmTemplates.ts — template constant (kept so handlers.src.ts typechecks) */
const templatesOut =
    banner +
    '/** The complete player HTML document (player.js inlined). */\n' +
    'export const ROTATOR_HTML: string =\n    ' +
    JSON.stringify(inlined) +
    '\n'
writeFileSync(join(root, 'src', 'server', 'OdmTemplates.ts'), templatesOut)

/* 2) player-routes.ts — SELF-CONTAINED deployable module.
   The platform cannot resolve extensionless module-to-module imports
   (ModuleResolutionException on Australia patch3), so the deployed handler
   module concatenates its dependencies instead of importing them. Only the
   '@servicenow/glide' import survives — fluent-to-module imports are compiled
   to full extensionful requires by the SDK and are unaffected. */
const stripLocalImports = (src) =>
    src
        .split('\n')
        .filter((line) => !/^import\s.*['"](\.{1,2}\/|@servicenow\/glide)/.test(line))
        .join('\n')

const deckSrc = readFileSync(join(root, 'src', 'server', 'deck.ts'), 'utf8')
const handlersSrc = readFileSync(join(root, 'src', 'server', 'handlers.src.ts'), 'utf8')

const routesOut =
    banner +
    "import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide'\n\n" +
    '// ===== deck.ts (verbatim) =====\n' +
    stripLocalImports(deckSrc) +
    '\n// ===== template constant =====\n' +
    'export const ROTATOR_HTML: string =\n    ' +
    JSON.stringify(inlined) +
    '\n\n// ===== handlers.src.ts (local imports stripped) =====\n' +
    stripLocalImports(handlersSrc) +
    '\n'
writeFileSync(join(root, 'src', 'server', 'player-routes.ts'), routesOut)

console.log('build-template: OdmTemplates.ts + player-routes.ts written (' + inlined.length + ' chars of HTML)')
