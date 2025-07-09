import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options';

require('dotenv').config()

export default defineConfig<TestOptions>({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  expect: {
    timeout: 2000,
    toMatchSnapshot: {maxDiffPixels: 50}
  },
  use: {
    baseURL: 'http://localhost:4200',
    globalsQaURL: 'http://www.globalsqa.com/demo-site/draganddrop/',
    trace: 'on-first-retry',
    video: {
      mode: 'on',
      size: { width: 1920, height: 1080} // high res
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'dev',
      use: {
         ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4200'  
      },
    },

    {
      name: 'staging',
      use: {
         ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4201'  
      },
    },
    {
      name: 'mobile',
      testMatch: 'testMobile.spec.ts',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:4200',
  },

});
