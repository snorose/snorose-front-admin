/**
 * 어드민 실제 API QA의 인증·조회·변경 프로젝트와 실행 환경을 정의합니다.
 * dev DB 충돌을 피하기 위해 Chromium 한 개 worker로 순차 실행합니다.
 */
import { defineConfig, devices } from '@playwright/test';

import { E2E_AUTH_FILE } from './e2e/shared/e2e-env';

const appUrl = 'http://localhost:5173';
const slowMo = Number(process.env.E2E_SLOW_MO ?? 0);

export default defineConfig({
  testDir: './e2e',
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: appUrl,
    headless: true,
    launchOptions: slowMo > 0 ? { slowMo } : undefined,
    serviceWorkers: 'block',
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'dev-auth',
      testMatch: /setup\/auth\.setup\.ts/,
    },
    {
      name: 'dev-read',
      use: {
        ...devices['Desktop Chrome'],
        storageState: E2E_AUTH_FILE,
      },
      testMatch: /features\/.*\.read\.spec\.ts/,
      dependencies: ['dev-auth'],
    },
    {
      name: 'dev-write',
      use: {
        ...devices['Desktop Chrome'],
        storageState: E2E_AUTH_FILE,
      },
      testMatch: /features\/.*\.write\.spec\.ts/,
      dependencies: ['dev-auth'],
    },
  ],
  webServer: {
    command: 'npm run dev -- --host localhost --port 5173',
    url: appUrl,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
