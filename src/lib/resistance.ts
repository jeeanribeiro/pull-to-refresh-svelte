/**
 * Log-based rubber-band easing, carried over from the original component.
 *
 * Finger travel is damped so the indicator moves ~0.79x the finger near the
 * top and asymptotically approaches `maxPull / 2` as the pull deepens —
 * the same "the further you pull, the heavier it gets" feel as native
 * overscroll.
 *
 * @param distance raw downward finger travel in px (values <= 0 return 0)
 * @param maxPull  travel at which resistance saturates
 */
export function rubberBand(distance: number, maxPull: number): number {
	if (distance <= 0 || maxPull <= 0) return 0;
	const d = Math.min(distance, maxPull);
	return (d * (Math.log(2 + (maxPull - d) / maxPull) / Math.log(2))) / 2;
}
