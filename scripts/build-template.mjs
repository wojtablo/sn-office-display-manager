/**
 * build-template.mjs — compile the player template into deployable server code.
 * All generation logic lives in template-lib.js (jest-covered); this file is IO only.
 *
 * Outputs (both committed):
 *   src/server/OdmTemplates.ts   — template constant (typecheck support for handlers.src.ts)
 *   src/server/player-routes.ts  — SELF-CONTAINED deployable module (see template-lib.js)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import lib from './template-lib.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = (...p) => readFileSync(join(root, ...p), 'utf8')

const inlinedHtml = lib.inlinePlayerScript(
    read('src', 'client', 'templates', 'rotator.html'),
    read('src', 'client', 'templates', 'player.js')
)

writeFileSync(join(root, 'src', 'server', 'OdmTemplates.ts'), lib.generateTemplatesModule(inlinedHtml))
writeFileSync(
    join(root, 'src', 'server', 'player-routes.ts'),
    lib.generateRoutesModule({
        inlinedHtml,
        deckSource: read('src', 'server', 'deck.ts'),
        handlersSource: read('src', 'server', 'handlers.src.ts'),
    })
)
console.log('build-template: OdmTemplates.ts + player-routes.ts written (' + inlinedHtml.length + ' chars of HTML)')
