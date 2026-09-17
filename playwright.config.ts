import { defineConfig } from "@playwright/test";

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgresql://postgres@127.0.0.1:55432/bk_test";
if (!new URL(process.env.DATABASE_URL).pathname.endsWith("_test")) throw new Error("Tests require a database whose name ends with _test");
process.env.AUTH_SECRET = "integration-test-secret-only-not-for-deployment-12345";
process.env.AUTH_URL = "http://localhost:3100";
process.env.AUTH_TRUST_HOST = "true";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3100";
process.env.CONTACT_EMAIL = "contact@example.test";
process.env.UPLOAD_DIR = ".local/test-uploads";

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 1, timeout: 90000,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure", screenshot: "only-on-failure" },
  webServer: {
    command: "npm run start -- --port 3100", url: "http://localhost:3100/api/health", reuseExistingServer: false, timeout: 120000,
  },
});
