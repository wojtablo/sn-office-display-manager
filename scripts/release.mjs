/**
 * release.mjs — one-command release for the ODM app.
 *
 * Ordering is deliberate (see DESIGN below); each step fails loud and early so a
 * broken step never leaves git, GitHub, and the instance out of sync.
 *
 *   npm run release -- patch     (or: minor | major | <explicit version>)
 *   npm run release -- patch --dry-run     print the plan, change nothing
 *
 * DESIGN
 *   1. Guards      clean tree + on main + tests pass — refuse otherwise.
 *   2. Build       compiles (incl. docs regen); a broken build aborts BEFORE any
 *                  version bump or tag exists, so there is nothing to unwind.
 *   3. Clean-check regenerated docs must already be committed (freshness gate).
 *   4. Bump        `npm version` writes package.json, commits, and tags vX.Y.Z.
 *   5. Deploy      `now-sdk install` — only AFTER the instance accepts do we push.
 *   6. Push        `git push --follow-tags` — the tag triggers the Release workflow.
 *
 * Instance credentials never leave this machine; GitHub only ever sees the tag.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const bump = args.find((a) => !a.startsWith('-')) || 'patch'
const VALID = ['patch', 'minor', 'major']
const isExplicit = /^\d+\.\d+\.\d+$/.test(bump)
if (!VALID.includes(bump) && !isExplicit) {
    fail(`Unknown release argument "${bump}". Use one of: ${VALID.join(', ')} or an explicit X.Y.Z.`)
}

function run(cmd, cmdArgs, opts = {}) {
    return execFileSync(cmd, cmdArgs, { stdio: 'pipe', encoding: 'utf8', ...opts }).trim()
}
function runInherit(cmd, cmdArgs) {
    execFileSync(cmd, cmdArgs, { stdio: 'inherit' })
}
function step(msg) {
    console.log(`\n▶ ${msg}`)
}
function fail(msg) {
    console.error(`✗ ${msg}`)
    process.exit(1)
}

// --- 1. Guards -------------------------------------------------------------
step('Checking preconditions')

// In --dry-run, guard violations are warnings (so you can preview from a dirty
// tree); in a real release they are hard failures.
const guard = (ok, msg) => {
    if (ok) return
    if (dryRun) console.warn(`  ⚠ ${msg} (would block a real release)`)
    else fail(msg)
}

const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
guard(branch === 'main', `Releases must run on 'main' (currently on '${branch}').`)
guard(!run('git', ['status', '--porcelain']), 'Working tree is not clean. Commit or stash your changes first.')

const currentVersion = JSON.parse(readFileSync('package.json', 'utf8')).version
console.log(`  current version ${currentVersion}`)

if (dryRun) {
    step('DRY RUN — would now:')
    console.log(`  1. npm test`)
    console.log(`  2. npm run build`)
    console.log(`  3. assert docs are still clean`)
    console.log(`  4. npm version ${bump}`)
    console.log(`  5. npm run deploy   (now-sdk install)`)
    console.log(`  6. git push --follow-tags`)
    process.exit(0)
}

step('Running tests')
runInherit('npm', ['test'])

// --- 2. Build (regenerates docs as a side effect) --------------------------
step('Building (template + docs + now-sdk build)')
runInherit('npm', ['run', 'build'])

// --- 3. Freshness gate: build must not have produced uncommitted changes ----
step('Verifying build/docs are committed')
const dirty = run('git', ['status', '--porcelain'])
if (dirty) {
    fail(
        'Build produced uncommitted changes (docs or generated sources are stale):\n' +
            dirty +
            '\nCommit them, then re-run the release.'
    )
}

// --- 4. Version bump (commit + tag) ----------------------------------------
step(`Bumping version (${bump})`)
runInherit('npm', ['version', bump, '-m', 'chore(release): %s'])
const newVersion = JSON.parse(readFileSync('package.json', 'utf8')).version
console.log(`  ${currentVersion} -> ${newVersion} (tag v${newVersion})`)

// --- 5. Deploy to the instance ---------------------------------------------
step('Deploying to instance (now-sdk install)')
try {
    runInherit('npm', ['run', 'deploy'])
} catch (e) {
    fail(
        `Deploy failed. The commit and tag v${newVersion} exist locally but were NOT pushed.\n` +
            `Fix the instance issue and re-deploy, or unwind with:\n` +
            `  git tag -d v${newVersion} && git reset --hard HEAD~1`
    )
}

// --- 6. Push commit + tag (fires the GitHub Release workflow) ---------------
step('Pushing commit and tag')
runInherit('git', ['push', '--follow-tags'])

console.log(`\n✓ Released v${newVersion}. The tag push triggers the GitHub Release workflow.`)
