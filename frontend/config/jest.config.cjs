module.exports = {
    rootDir: "..",
    testEnvironment: "node",
    testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
    testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/tests/e2e/"]
};