import type { Config } from 'jest';
const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|sass|scss)$': '<rootDir>/test/styleMock.tsx',
        // for mocking css imports while testing
    },
    coverageProvider: 'v8',
    // collectCoverageFrom: [
    //     'src/**/*.{ts,tsx}',
    //     '!src/**/*.d.ts',
    //     '!src/**/*.test.{ts,tsx}',
    //     '!src/**/*.spec.{ts,tsx}',
    // ],
    // coverageThreshold: {
    //     global: {
    //         branches: 70,
    //         functions: 70,
    //         lines: 70,
    //         statements: 70,
    //     },
    // },
};
export default config;

// const config = {
//     preset: 'ts-jest',
//     testEnvironment: 'jsdom',
//     setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
//     moduleNameMapper: {
//         '^src/(.*)$': '<rootDir>/src/$1',
//     },

// };
// module.exports = config;
