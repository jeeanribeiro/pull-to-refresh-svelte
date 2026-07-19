import { expect, test, type Page } from '@playwright/test';

async function mouseDrag(page: Page, x: number, y: number, dy: number, steps = 15) {
	await page.mouse.move(x, y);
	await page.mouse.down();
	for (let i = 1; i <= steps; i++) {
		await page.mouse.move(x, y + (dy * i) / steps);
	}
	await page.mouse.up();
}

async function touchDrag(page: Page, x: number, y: number, dy: number, steps = 15) {
	const cdp = await page.context().newCDPSession(page);
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{ x, y }]
	});
	for (let i = 1; i <= steps; i++) {
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{ x, y: y + (dy * i) / steps }]
		});
	}
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await cdp.detach();
}

test.beforeEach(async ({ page }) => {
	await page.goto('/');
});

test('a mouse pull past the threshold refreshes the iOS feed', async ({ page, isMobile }) => {
	test.skip(!!isMobile, 'desktop gesture');
	const feed = page.getByTestId('feed-ios');
	const box = (await feed.boundingBox())!;
	await mouseDrag(page, box.x + box.width / 2, box.y + 40, 320);

	await expect(page.getByTestId('refresh-count-ios')).toHaveText('1');
	await expect(feed.locator('li').first()).toContainText('Refreshed (#1)');
});

test('a short pull springs back without refreshing', async ({ page, isMobile }) => {
	test.skip(!!isMobile, 'desktop gesture');
	const feed = page.getByTestId('feed-material');
	const box = (await feed.boundingBox())!;
	await mouseDrag(page, box.x + box.width / 2, box.y + 40, 45);

	// Give a would-be refresh time to land before asserting it never did.
	await page.waitForTimeout(1800);
	await expect(page.getByTestId('refresh-count-material')).toHaveText('0');
});

test('no pull can start while the list is scrolled down', async ({ page, isMobile }) => {
	test.skip(!!isMobile, 'desktop gesture');
	const feed = page.getByTestId('feed-material');
	await feed.evaluate((el) => {
		el.scrollTop = 200;
	});
	const box = (await feed.boundingBox())!;
	await mouseDrag(page, box.x + box.width / 2, box.y + 40, 320);

	await page.waitForTimeout(1800);
	await expect(page.getByTestId('refresh-count-material')).toHaveText('0');
});

test('a real touch pull refreshes the Material feed', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'touch gesture');
	const phone = page.getByTestId('phone-material');
	await phone.scrollIntoViewIfNeeded();
	const feed = page.getByTestId('feed-material');
	const box = (await feed.boundingBox())!;
	await touchDrag(page, box.x + box.width / 2, box.y + 40, 320);

	await expect(page.getByTestId('refresh-count-material')).toHaveText('1');
	await expect(feed.locator('li').first()).toContainText('Refreshed (#1)');
});

test('a sideways touch drag never arms the pull', async ({ page, isMobile }) => {
	test.skip(!isMobile, 'touch gesture');
	const feed = page.getByTestId('feed-ios');
	const box = (await feed.boundingBox())!;
	const cdp = await page.context().newCDPSession(page);
	const y = box.y + 60;
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{ x: box.x + 40, y }]
	});
	for (let i = 1; i <= 10; i++) {
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{ x: box.x + 40 + i * 12, y: y + i }]
		});
	}
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await cdp.detach();

	await page.waitForTimeout(1800);
	await expect(page.getByTestId('refresh-count-ios')).toHaveText('0');
});
