import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export const UI_BASE_URL = process.env.UI_BASE_URL ?? 'https://www.saucedemo.com';
export const VD_BASE_URL = process.env.VD_BASE_URL ?? 'https://uat.vitalitydrive.com/vitality-drive-workbench/';
export const API_BASE_URL = process.env.API_BASE_URL ?? 'https://jsonplaceholder.typicode.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Set PW_NO_VIDEO=1 where Playwright's ffmpeg can't be installed (e.g. macOS 12).
    video: process.env.PW_NO_VIDEO ? 'off' : 'retain-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: API_BASE_URL,
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        // Set PW_CHANNEL=chrome to use an installed Google Chrome instead of bundled Chromium
        // (needed on OSes where Playwright can't download Chromium, e.g. macOS 12).
        channel: process.env.PW_CHANNEL || undefined,
        baseURL: UI_BASE_URL,
        testIdAttribute: 'data-test',
      },
    },
    {
      // Vitality Drive Workbench (UAT). Needs VD_USER / VD_PASSWORD; skipped otherwise.
      name: 'vitality',
      testDir: './tests/vitality',
      // Shared UAT account and server: run serially and allow for slower responses.
      fullyParallel: false,
      workers: 1,
      timeout: 60_000,
      expect: { timeout: 15_000 },
      use: {
        ...devices['Desktop Chrome'],
        channel: process.env.PW_CHANNEL || undefined,
        baseURL: VD_BASE_URL,
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
