const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path Next.js app to load next.config.js and .env files in test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest", // Use ts-jest for TypeScript
  moduleNameMapper: {
    "^@/components/(.*)$": "<rootDir>/src/ui/$1",
    "^@/services/(.*)$": "<rootDir>/src/services/$1",
    "^@/context/(.*)$": "<rootDir>/src/context/$1",
    // Add more as needed
  },
};

// Custom Jest config to be merged.
module.exports = createJestConfig(customJestConfig);
