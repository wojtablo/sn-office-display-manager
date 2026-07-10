import { defineConfig, devices } from '@playwright/test'

// Load a local, gitignored .env if present (Node >= 20.12 / 22). Inline env still wins.
try {
    ;(process as unknown as { loadEnvFile: (p?: string) => void }).loadEnvFile('.env')
} catch {
    /* no .env or older Node — rely on real env vars */
}

/**
 * E2E config — drives a real browser against a live ServiceNow instance.
 * Secrets come from env (never committed). Required:
 *   ODM_INSTANCE       e.g. https://dev395356.service-now.com
 *   ODM_ADMIN_USER / ODM_ADMIN_PASS      (creates fixtures; is creator+admin)
 *   ODM_STRANGER_USER / ODM_STRANGER_PASS (a user who is neither creator nor the service account)
 * The E2E service account + slideshow are created/destroyed by global setup/teardown.
 */
const instance = process.env.ODM_INSTANCE || 'https://dev395356.service-now.com'

export default defineConfig({
    testDir: './test/e2e',
    globalSetup: './test/e2e/global-setup.ts',
    globalTeardown: './test/e2e/global-teardown.ts',
    fullyParallel: false, // shared instance state
    workers: 1,
    retries: 0,
    timeout: 60_000,
    reporter: [['list']],
    use: {
        baseURL: instance,
        ignoreHTTPSErrors: true,
        headless: true,
        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
