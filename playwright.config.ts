import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  timeout: 30000,
  use: {
    browserName: 'chromium',
    headless: true,
  },
});