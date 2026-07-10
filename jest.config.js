/** Jest config: plain JS tests + ts-jest for server-module tests. */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    },
    collectCoverageFrom: ['src/client/templates/player.js', 'src/server/deck.ts'],
    coverageThreshold: {
        global: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
}
