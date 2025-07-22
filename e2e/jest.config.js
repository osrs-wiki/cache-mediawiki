const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("../tsconfig");

module.exports = {
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/../",
  }),
  testEnvironment: "node",
  testMatch: ["**/e2e/**/*.e2e.ts"],
  testTimeout: 60000, // E2E tests may take longer
  displayName: "E2E Tests",
};