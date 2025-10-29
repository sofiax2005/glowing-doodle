// backend/jest.config.js

module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/src/__tests__"],
  moduleFileExtensions: ["js", "json"],
  collectCoverage: true,
  coverageDirectory: "<rootDir>/coverage",
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/__tests__/fixtures/",
    "/__tests__/integration/"
  ],
  testMatch: [
    "**/src/__tests__/**/*.test.js",
    "**/src/**/*.test.js"
  ],
  transform: {}
};
