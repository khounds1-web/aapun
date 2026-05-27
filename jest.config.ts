import type { Config } from "jest";

const config: Config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  transform: {
    "^.+\\.tsx?$": "<rootDir>/jest.transform.cjs",
  },
  extensionsToTreatAsEsm: [],
};

export default config;
