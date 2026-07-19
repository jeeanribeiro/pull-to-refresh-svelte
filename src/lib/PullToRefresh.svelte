<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';
	import type { Snippet } from 'svelte';
	import { rubberBand } from './resistance.js';
	import { detectPlatform } from './platform.js';
	import type { Platform, PullPhase, PullProgress } from './types.js';
	import IosSpinner from './indicators/IosSpinner.svelte';
	import MaterialSpinner from './indicators/MaterialSpinner.svelte';

	interface Props {
		/** Called when a pull is released past the threshold. The indicator spins until the promise settles. */
		onrefresh: () => Promise<void> | void;
		/** Indicator style. `auto` picks iOS on Apple touch devices, Material elsewhere. */
		platform?: Platform;
		/** Resisted travel (px) required to arm a refresh. */
		threshold?: number;
		/** Raw finger travel (px) at which resistance saturates. Defaults to half the viewport height, measured on the client. */
		maxPull?: number;
		/** Disables the gesture entirely. */
		disabled?: boolean;
		/** Fire a short haptic tick (where supported) when the pull arms. */
		vibrate?: boolean;
		/** Announced to screen readers while the refresh runs. */
		refreshingLabel?: string;
		/** Custom indicator snippet; receives a live progress snapshot. */
		indicator?: Snippet<[PullProgress]>;
		/** Content the gesture is attached to. */
		children: Snippet;
		/** Extra classes for the wrapper element. */
		class?: string;
	}

	let {
		onrefresh,
		platform = 'auto',
		threshold = 80,
		maxPull,
		disabled = false,
		vibrate = true,
		refreshingLabel = 'Refreshing content',
		indicator,
		children,
		class: className = ''
	}: Props = $props();

	const SETTLE_MS = 350;
	const DIRECTION_SLOP = 8;

	let root = $state<HTMLDivElement>();
	let phase = $state<PullPhase>('idle');

	// The original read window.screen.availHeight at init, which crashes SSR.
	// Measure per gesture instead: SSR never touches window, and the value
	// stays correct after a device rotation.
	function effectiveMaxPull(): number {
		if (maxPull !== undefined) return maxPull;
		if (typeof window === 'undefined') return 320;
		return Math.max(160, window.screen.availHeight / 2);
	}

	const position = new Tween(0, { duration: 0, easing: quintOut });
	const progress = $derived(position.current / threshold);
	const refreshing = $derived(phase === 'refreshing');
	const resolvedPlatform = $derived(platform === 'auto' ? detectPlatform() : platform);
	const snapshot = $derived<PullProgress>({
		progress,
		position: position.current,
		phase,
		refreshing
	});

	// The original listened to touch events only, so the gesture was dead on
	// desktop. Pointer Events cover touch, mouse and pen with one code path.
	let pointerId = -1;
	let startX = 0;
	let startY = 0;
	let tracking = false;

	function isScrollable(el: Element): boolean {
		if (el.scrollHeight <= el.clientHeight) return false;
		const { overflowY } = getComputedStyle(el);
		return overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';
	}

	/**
	 * The original armed on any downward drag anywhere on the page. A pull
	 * may only begin when the content under the finger is scrolled to the
	 * top: walk from the event target up to the wrapper looking for the
	 * nearest scroll container, falling back to the document.
	 */
	function gateScrollTop(from: Element | null): number {
		let el: Element | null = from;
		while (el && el !== root) {
			if (isScrollable(el)) return el.scrollTop;
			el = el.parentElement;
		}
		if (root && isScrollable(root)) return root.scrollTop;
		return document.scrollingElement?.scrollTop ?? 0;
	}

	function stopTracking(): void {
		tracking = false;
		pointerId = -1;
	}

	function onPointerDown(event: PointerEvent): void {
		if (disabled || phase === 'refreshing' || phase === 'settling') return;
		if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
		if (gateScrollTop(event.target as Element | null) > 0) return;
		pointerId = event.pointerId;
		startX = event.clientX;
		startY = event.clientY;
		tracking = true;
	}

	function onPointerMove(event: PointerEvent): void {
		if (!tracking || event.pointerId !== pointerId) return;
		if (phase === 'idle') {
			// Direction lock: the raw clientY delta used to win even when the
			// user was clearly panning sideways or scrolling up.
			const dx = event.clientX - startX;
			const dy = event.clientY - startY;
			if (Math.abs(dx) < DIRECTION_SLOP && Math.abs(dy) < DIRECTION_SLOP) return;
			if (Math.abs(dx) > dy) {
				stopTracking();
				return;
			}
			phase = 'pulling';
			startY = event.clientY; // measure the pull from the lock point
		}
		const pos = rubberBand(event.clientY - startY, effectiveMaxPull());
		position.set(pos, { duration: 0 });
		const next = pos >= threshold ? 'armed' : 'pulling';
		if (next === 'armed' && phase !== 'armed' && vibrate) {
			navigator.vibrate?.(10);
		}
		phase = next;
	}

	function onPointerUp(event: PointerEvent): void {
		if (!tracking || event.pointerId !== pointerId) return;
		stopTracking();
		if (phase === 'armed') {
			void refresh();
		} else if (phase === 'pulling') {
			settle();
		}
	}

	function onPointerCancel(event: PointerEvent): void {
		if (!tracking || event.pointerId !== pointerId) return;
		stopTracking();
		if (phase === 'pulling' || phase === 'armed') settle();
	}

	async function refresh(): Promise<void> {
		phase = 'refreshing';
		void position.set(threshold, { duration: SETTLE_MS });
		try {
			await onrefresh();
		} finally {
			settle();
		}
	}

	function settle(): void {
		phase = 'settling';
		void position.set(0, { duration: SETTLE_MS }).then(() => {
			if (phase === 'settling') phase = 'idle';
		});
	}

	/**
	 * While a pull is active the browser must not start scrolling (which
	 * would fire pointercancel and kill the gesture). This is the only
	 * non-passive listener, it is scoped to the component instead of the
	 * window, and it only prevents the default mid-pull.
	 */
	function interceptTouchMove(event: TouchEvent): void {
		if (phase === 'pulling' || phase === 'armed') event.preventDefault();
	}

	$effect(() => {
		const el = root;
		if (disabled || !el) return;
		const passive: AddEventListenerOptions = { passive: true };
		// The gesture must start inside the component, not anywhere on the page.
		el.addEventListener('pointerdown', onPointerDown, passive);
		window.addEventListener('pointermove', onPointerMove, passive);
		window.addEventListener('pointerup', onPointerUp, passive);
		window.addEventListener('pointercancel', onPointerCancel, passive);
		el.addEventListener('touchmove', interceptTouchMove, { passive: false });
		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', onPointerUp);
			window.removeEventListener('pointercancel', onPointerCancel);
			el.removeEventListener('touchmove', interceptTouchMove);
		};
	});
</script>

<div class="ptr {className}" data-phase={phase} aria-busy={refreshing} bind:this={root}>
	<div
		class="ptr-indicator"
		class:idle={phase === 'idle'}
		aria-hidden="true"
		style:transform="translate3d(0, {position.current}px, 0)"
	>
		{#if indicator}
			{@render indicator(snapshot)}
		{:else if resolvedPlatform === 'ios'}
			<IosSpinner {progress} {refreshing} />
		{:else}
			<MaterialSpinner {progress} {refreshing} />
		{/if}
	</div>
	<div class="ptr-status" role="status" aria-live="polite">
		{refreshing ? refreshingLabel : ''}
	</div>
	{@render children()}
</div>

<style>
	.ptr {
		position: relative;
	}

	.ptr-indicator {
		display: flex;
		justify-content: center;
		left: 0;
		opacity: 1;
		pointer-events: none;
		position: absolute;
		right: 0;
		top: calc(-1 * var(--ptr-indicator-size, 38px) - 10px);
		transition: opacity 150ms ease-out;
		will-change: transform;
		z-index: var(--ptr-z-index, 999);
	}

	.ptr-indicator.idle {
		opacity: 0;
	}

	.ptr-status {
		border: 0;
		clip-path: inset(50%);
		height: 1px;
		margin: -1px;
		overflow: hidden;
		padding: 0;
		position: absolute;
		white-space: nowrap;
		width: 1px;
	}
</style>
