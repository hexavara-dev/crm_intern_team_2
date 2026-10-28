export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    // Map ESM-style source imports back to TypeScript at any test nesting depth.
    '^(.*?/src/.*)\\.js$': '$1.ts',
    // Resolve relative .js imports used by Node16 source modules while testing .ts files.
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: [
    // Prevent transforming node_modules (except specific ESM packages if needed)
    'node_modules/(?!(some-esm-package)/)',
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: 'tsconfig.json',
      },
    ],
  },
};
