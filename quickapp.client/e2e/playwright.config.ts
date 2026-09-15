import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const baseURL = process.env.BASE_URL ?? process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4200';
const apiUrl = process.env.API_URL ?? 'http://localhost:5225';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  retries: isCI ? 2 : 0,
  reporter: isCI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'never' }], ['list']],
  outputDir: '../test-results',
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : [
        {
          command: 'dotnet run --project ../QuickApp.Server --no-launch-profile',
          cwd: '..',
          env: {
            ASPNETCORE_URLS: apiUrl,
            ASPNETCORE_ENVIRONMENT: 'Development'
          },
          url: `${apiUrl}/swagger/v1/swagger.json`,
          timeout: 180_000,
          reuseExistingServer: !isCI,
          stdout: isCI ? 'pipe' : 'ignore'
        },
        {
          command: 'npm run start:e2e',
          cwd: '..',
          env: {
            ASPNETCORE_URLS: apiUrl
          },
          url: baseURL,
          timeout: 240_000,
          reuseExistingServer: !isCI,
          stdout: isCI ? 'pipe' : 'ignore'
        }
      ]
});
