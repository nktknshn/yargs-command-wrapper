module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // collectCoverage: true,
  transform: {
    '^.+\\.tsx?$': ['ts-jest',]
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest',]
  },
  testRegex: ['test-', '.*\\.spec\\.ts$'],
  moduleFileExtensions: ['ts', 'js'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    }
  },
  roots: [
    "<rootDir>/test/",
    "<rootDir>/src/",
  ],
  modulePathIgnorePatterns: ["test/test-types.ts"]
}
