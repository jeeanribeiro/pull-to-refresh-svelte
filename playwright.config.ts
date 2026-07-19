import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://localhost:43133',
		trace: 'on-first-retry'
	},
	webServer: {
		command: 'pnpm exec vite preview --port 43133 --strictPort',
		port: 43133,
		reuseExistingServer: !process.env.CI,
		timeout: 60_000
	},
	projects: [
		{
			name: 'desktop-chromium',
			use: { ...devices['Desktop Chrome'] }
		},
		{
			name: 'mobile-chromium',
			use: { ...devices['Pixel 7'] }
		}
	]
});
