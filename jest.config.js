const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig");

module.exports = {
  preset: "ts-jest",
  setupFiles: ["dotenv/config"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  testEnvironment: "node",
  testMatch: ["**/src/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
};
