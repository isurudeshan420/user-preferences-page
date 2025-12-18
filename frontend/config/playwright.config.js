module.exports = {
    testDir: "./tests/e2e",
    timeout: 30000,
    use: { headless: true },
    webServer: {
        command: "npx http-server -p 5173 -c-1 ./public",
        url: "http://127.0.0.1:5173/index.html",
        reuseExistingServer: true
    }
};
