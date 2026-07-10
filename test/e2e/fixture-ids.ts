/**
 * Shared fixture constants + the env-derived config for E2E.
 * The sys_ids of created records are written here at global-setup time via a
 * JSON side-file (fixture-state.json) so the specs and teardown can read them.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export const INSTANCE = process.env.ODM_INSTANCE || 'https://dev395356.service-now.com'
export const ADMIN = { user: process.env.ODM_ADMIN_USER || 'claude', pass: process.env.ODM_ADMIN_PASS || '' }
export const STRANGER = {
    user: process.env.ODM_STRANGER_USER || 'svc.display.test1',
    pass: process.env.ODM_STRANGER_PASS || '',
}

/** The disposable E2E service account (created by global-setup). */
export const SVC = { user: 'svc.display.e2e', pass: process.env.ODM_SVC_PASS || '<removed-e2e-test-password>' }

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
