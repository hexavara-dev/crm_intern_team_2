export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    // ONLY map .js to .ts for files within src/
    '^(\.{1,2}/src/.*)\\.js$': '$1.ts',
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
