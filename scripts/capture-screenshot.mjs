// Captures the README hero image from the running demo site.
// Usage: node scripts/capture-screenshot.mjs [url]
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:43132/';
mkdirSync('docs/assets', { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
	viewport: { width: 1180, height: 1200 },
	deviceScaleFactor: 2
});
await page.goto(base, { waitUntil: 'networkidle' });

async function pull(feed, dy, { release = true, steps = 12 } = {}) {
	const box = await page.getByTestId(feed).boundingBox();
	const x = box.x + box.width / 2;
	const y = box.y + 40;
	await page.mouse.move(x, y);
	await page.mouse.down();
	for (let i = 1; i <= steps; i++) {
		await page.mouse.move(x, y + (dy * i) / steps);
	}
	if (release) await page.mouse.up();
}

// iOS phone: release past the threshold so the 12-bar spinner is animating.
await pull('feed-ios', 320);
// Material phone: hold mid-pull so the arc is partially drawn with the arrow in.
await pull('feed-material', 96, { release: false });

const section = await page.locator('section').first().boundingBox();
await page.screenshot({
	path: 'docs/assets/demo.png',
	clip: {
		x: Math.max(0, section.x - 24),
		y: Math.max(0, section.y - 16),
		width: Math.min(1180, section.width + 48),
		height: section.height + 32
	}
});
await page.mouse.up();
await browser.close();
console.log('wrote docs/assets/demo.png');
