/**
 * template-lib.js — pure generation logic for the ODM build (CJS so jest can
 * require it; build-template.mjs imports it via ESM/CJS interop).
 */
'use strict'

const SCRIPT_TAG = '<script src="player.js"></script>'
const DECK_TOKEN_LITERAL = '"__ODM_DECK_JSON__"'

const BANNER =
    '/**\n' +
    ' * GENERATED FILE — do not edit by hand.\n' +
    ' * Sources: src/client/templates/rotator.html + player.js, src/server/deck.ts,\n' +
    ' *          src/server/handlers.src.ts\n' +
    ' * Regenerate: npm run build (scripts/build-template.mjs)\n' +
    ' */\n\n'

/** Inline player.js into the template. Throws loudly on structural defects. */
function inlinePlayerScript(rotatorHtml, playerJs) {
    if (!rotatorHtml.includes(SCRIPT_TAG)) {
        throw new Error(`expected '${SCRIPT_TAG}' (player.js include) in rotator.html — not found`)
    }
    const inlined = rotatorHtml.replace(SCRIPT_TAG, '<script>\n' + playerJs + '\n</script>')
    if (!inlined.includes(DECK_TOKEN_LITERAL)) {
        throw new Error('injection token "__ODM_DECK_JSON__" missing from rotator.html')
    }
    return inlined
}

/**
 * Drop local (relative) and @servicenow/glide import lines. Used to make the
 * deployed module self-contained: the platform cannot resolve extensionless
 * module-to-module imports (ModuleResolutionException, Australia patch3).
 */
function stripLocalImports(source) {
    return source
        .split('\n')
        .filter((line) => !/^import\s.*['"](\.{1,2}\/|@servicenow\/glide)/.test(line))
        .join('\n')
}

/** Emit OdmTemplates.ts content (kept so handlers.src.ts typechecks). */
function generateTemplatesModule(inlinedHtml) {
    return (
        BANNER +
        '/** The complete player HTML document (player.js inlined). */\n' +
        'export const ROTATOR_HTML: string =\n    ' +
        JSON.stringify(inlinedHtml) +
        '\n'
    )
}

/** Emit the SELF-CONTAINED deployable player-routes.ts content. */
function generateRoutesModule({ inlinedHtml, deckSource, handlersSource }) {
    return (
        BANNER +
        "import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide'\n\n" +
        '// ===== deck.ts (verbatim) =====\n' +
        stripLocalImports(deckSource) +
        '\n// ===== template constant =====\n' +
        'export const ROTATOR_HTML: string =\n    ' +
        JSON.stringify(inlinedHtml) +
        '\n\n// ===== handlers.src.ts (local imports stripped) =====\n' +
        stripLocalImports(handlersSource) +
        '\n'
    )
}

module.exports = {
    SCRIPT_TAG,
    DECK_TOKEN_LITERAL,
    BANNER,
    inlinePlayerScript,
    stripLocalImports,
    generateTemplatesModule,
    generateRoutesModule,
}
