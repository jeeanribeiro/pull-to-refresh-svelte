import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectPlatform } from './platform.js';

function stubNavigator(userAgent: string, maxTouchPoints = 0) {
	vi.stubGlobal('navigator', { userAgent, maxTouchPoints });
}

describe('detectPlatform', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('detects iPhones', () => {
		stubNavigator(
			'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15',
			5
		);
		expect(detectPlatform()).toBe('ios');
	});

	it('detects iPads masquerading as macOS', () => {
		stubNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 5);
		expect(detectPlatform()).toBe('ios');
	});

	it('keeps material for touchless macOS', () => {
		stubNavigator('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15', 0);
		expect(detectPlatform()).toBe('material');
	});

	it('detects Android as material', () => {
		stubNavigator('Mozilla/5.0 (Linux; Android 15; Pixel 8) AppleWebKit/537.36', 5);
		expect(detectPlatform()).toBe('material');
	});

	it('falls back to material when navigator is missing (SSR)', () => {
		vi.stubGlobal('navigator', undefined);
		expect(detectPlatform()).toBe('material');
	});
});
