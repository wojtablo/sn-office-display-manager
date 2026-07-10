/** Jest config: plain JS tests + ts-jest for server-module tests. */
module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    transform: {
        '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
    },
    moduleNameMapper: {
        '^@servicenow/glide$': '<rootDir>/test/fakes/glide.js',
    },
    testPathIgnorePatterns: ['/node_modules/', '/fakes/', '/e2e/'],
    collectCoverageFrom: [
        'src/client/templates/player.js',
        'src/server/deck.ts',
        'src/server/handlers.src.ts',
        'scripts/template-lib.js',
    ],
    coverageThreshold: {
        global: { statements: 80, branches: 80, functions: 80, lines: 80 },
    },
}
