import type { ResolvedPlatform } from './types.js';

/**
 * Picks the indicator style for `platform="auto"`.
 *
 * iPadOS 13+ reports itself as macOS, so Apple touch devices are detected
 * via `maxTouchPoints` as well. Safe to call during SSR (returns
 * `material`; the component re-resolves on the client).
 */
export function detectPlatform(): ResolvedPlatform {
	if (typeof navigator === 'undefined') return 'material';
	const apple =
		/iP(hone|ad|od)/.test(navigator.userAgent) ||
		(navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1);
	return apple ? 'ios' : 'material';
}
