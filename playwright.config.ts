import { defineConfig, devices } from '@playwright/test';
import { Env } from './src/config/Env';

export const UI_BASE_URL = Env.uiBaseUrl;
export const API_BASE_URL = Env.apiBaseUrl;
const WORKBENCH_AUTH_FILE = 'playwright/.auth/workbench.json';

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
    video: 'retain-on-failure',
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
      use: { ...devices['Desktop Chrome'], baseURL: UI_BASE_URL, testIdAttribute: 'data-test' },
    },
    {
      name: 'workbench-setup',
      testDir: './tests/workbench',
      testMatch: /auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: Env.workbenchBaseUrl },
    },
    {
      name: 'workbench-public',
      testDir: './tests/workbench/public',
      use: { ...devices['Desktop Chrome'], baseURL: Env.workbenchBaseUrl },
    },
    {
      name: 'workbench',
      testDir: './tests/workbench/authenticated',
      dependencies: ['workbench-setup'],
      use: { ...devices['Desktop Chrome'], baseURL: Env.workbenchBaseUrl, storageState: WORKBENCH_AUTH_FILE },
    },
  ],
});
