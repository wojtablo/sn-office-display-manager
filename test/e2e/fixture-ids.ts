/**
 * Shared fixture constants + the env-derived config for E2E.
 * The sys_ids of created records are written here at global-setup time via a
 * JSON side-file (fixture-state.json) so the specs and teardown can read them.
 */
import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Required env var — E2E must never silently fall back to a hardcoded instance,
 * account, or credential. Missing config fails loud. See .env.example.
 */
function required(name: string): string {
    const v = process.env[name]
    if (!v) throw new Error(`${name} is required for E2E — set it in .env (see .env.example)`)
    return v
}

export const INSTANCE = required('ODM_INSTANCE')
export const ADMIN = { user: required('ODM_ADMIN_USER'), pass: required('ODM_ADMIN_PASS') }
export const STRANGER = { user: required('ODM_STRANGER_USER'), pass: required('ODM_STRANGER_PASS') }

/**
 * The disposable E2E service account (created and destroyed by
 * global-setup/teardown). Its password is random per run and never persisted or
 * committed — no test ever logs in as this account; the admin only creates and
 * deletes it. So the password need never be stable or known outside this process.
 */
export const SVC = { user: 'svc.display.e2e', pass: 'E2e-' + randomBytes(18).toString('base64url') }

/** Short rotation so the test doesn't wait long. */
export const SLIDE_DURATION = 2
export const SLIDESHOW_NAME = 'E2E Player Test'

const STATE_FILE = join(__dirname, 'fixture-state.json')

export interface FixtureState {
    slideshowSysId: string
    svcSysId: string
    svcCreated: boolean
}

export function saveState(s: FixtureState): void {
    writeFileSync(STATE_FILE, JSON.stringify(s, null, 2))
}
export function loadState(): FixtureState {
    if (!existsSync(STATE_FILE)) throw new Error('fixture-state.json missing — did global-setup run?')
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'))
}

export function basicAuthHeader(user: string, pass: string): string {
    return 'Basic ' + Buffer.from(user + ':' + pass).toString('base64')
}
