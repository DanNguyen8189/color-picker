import type { Config } from 'jest';
const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
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
