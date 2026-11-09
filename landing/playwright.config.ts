import { defineConfig, devices } from "@playwright/test";

// Tests de bout en bout : vrai site (build de production) + faux Supabase/Resend locaux.
const MOCK = "http://127.0.0.1:4010";

export default defineConfig({
  testDir: "e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:3100" },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
  ],
  webServer: [
    { command: "node e2e/mock-services.mjs", url: `${MOCK}/__calls`, reuseExistingServer: true },
    {
      command: "npx next start -p 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: false,
      env: {
        SUPABASE_URL: MOCK,
        SUPABASE_SECRET_KEY: "sb_secret_test",
        RESEND_API_URL: MOCK,
        RESEND_API_KEY: "re_test",
        NOTIFY_EMAIL: "donutsdonuts.lyonpartdieu@gmail.com",
      },
    },
  ],
});
