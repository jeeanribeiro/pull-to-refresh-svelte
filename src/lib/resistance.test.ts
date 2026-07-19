import { describe, expect, it } from 'vitest';
import { rubberBand } from './resistance.js';

const MAX = 400;

describe('rubberBand', () => {
	it('returns 0 for non-positive travel', () => {
		expect(rubberBand(0, MAX)).toBe(0);
		expect(rubberBand(-50, MAX)).toBe(0);
	});

	it('returns 0 for a degenerate max pull', () => {
		expect(rubberBand(100, 0)).toBe(0);
		expect(rubberBand(100, -10)).toBe(0);
	});

	it('moves at roughly 0.79x near the top of the pull', () => {
		const out = rubberBand(10, MAX);
		expect(out).toBeGreaterThan(7.5);
		expect(out).toBeLessThan(8.5);
	});

	it('is strictly monotonic across the pull range', () => {
		let prev = 0;
		for (let d = 10; d <= MAX; d += 10) {
			const out = rubberBand(d, MAX);
			expect(out).toBeGreaterThan(prev);
			prev = out;
		}
	});

	it('saturates at half the max pull', () => {
		expect(rubberBand(MAX, MAX)).toBeCloseTo(MAX / 2, 10);
	});

	it('clamps travel beyond the max pull', () => {
		expect(rubberBand(MAX * 3, MAX)).toBe(rubberBand(MAX, MAX));
	});

	it('always damps the raw travel', () => {
		for (let d = 5; d <= MAX; d += 5) {
			expect(rubberBand(d, MAX)).toBeLessThan(d);
		}
	});
});
