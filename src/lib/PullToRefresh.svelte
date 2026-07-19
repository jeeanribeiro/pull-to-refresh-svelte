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
		indicator,
		children,
		class: className = ''
	}: Props = $props();

	const SETTLE_MS = 350;

	let phase = $state<PullPhase>('idle');

	// The original read window.screen.availHeight at init, which crashes SSR.
	// Measure lazily on the client instead; $effect never runs on the server.
	let viewportMax = $state(320);
	const effectiveMaxPull = $derived(maxPull ?? viewportMax);

	$effect(() => {
		viewportMax = Math.max(160, window.screen.availHeight / 2);
	});

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

	let startY = 0;

	function onTouchStart(event: TouchEvent): void {
		if (disabled || phase === 'refreshing' || phase === 'settling') return;
		const touch = event.touches[0];
		if (!touch) return;
		startY = touch.clientY;
		phase = 'pulling';
	}

	function onTouchMove(event: TouchEvent): void {
		if (phase !== 'pulling' && phase !== 'armed') return;
		const touch = event.touches[0];
		if (!touch) return;
		const pos = rubberBand(touch.clientY - startY, effectiveMaxPull);
		position.set(pos, { duration: 0 });
		phase = pos >= threshold ? 'armed' : 'pulling';
	}

	function onTouchEnd(): void {
		if (phase === 'armed') {
			void refresh();
		} else if (phase === 'pulling') {
			settle();
		}
	}

	function onTouchCancel(): void {
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

	$effect(() => {
		if (disabled) return;
		window.addEventListener('touchstart', onTouchStart as EventListener);
		window.addEventListener('touchmove', onTouchMove as EventListener);
		window.addEventListener('touchend', onTouchEnd as EventListener);
		window.addEventListener('touchcancel', onTouchCancel as EventListener);
		return () => {
			window.removeEventListener('touchstart', onTouchStart as EventListener);
			window.removeEventListener('touchmove', onTouchMove as EventListener);
			window.removeEventListener('touchend', onTouchEnd as EventListener);
			window.removeEventListener('touchcancel', onTouchCancel as EventListener);
		};
	});
</script>

<div class="ptr {className}" data-phase={phase}>
	<div class="ptr-indicator" style:transform="translate3d(0, {position.current}px, 0)">
		{#if indicator}
			{@render indicator(snapshot)}
		{:else if resolvedPlatform === 'ios'}
			<IosSpinner {progress} {refreshing} />
		{:else}
			<MaterialSpinner {progress} {refreshing} />
		{/if}
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
		pointer-events: none;
		position: absolute;
		right: 0;
		top: calc(-1 * var(--ptr-indicator-size, 38px) - 10px);
		will-change: transform;
		z-index: var(--ptr-z-index, 999);
	}
</style>
