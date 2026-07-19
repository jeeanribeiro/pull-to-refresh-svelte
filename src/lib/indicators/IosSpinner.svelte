<script lang="ts">
	import type { IndicatorProps } from '../types.js';

	let { progress, refreshing }: IndicatorProps = $props();

	const BARS = 12;

	// Bars appear one by one as the pull deepens, all twelve just before the
	// arm threshold — same reveal curve as the original component, expressed
	// in terms of normalized progress instead of raw pixels.
	const revealed = $derived(Math.max(0, Math.min(1, progress * 1.45 - 0.25)) * BARS);
</script>

<span class="ios-spinner" class:refreshing aria-hidden="true">
	{#each Array(BARS), i}
		<span
			class="bar"
			style:transform="rotate({i * 30}deg) translate(0, -130%)"
			style:animation-delay="{-1 + i / BARS}s"
			hidden={!refreshing && i >= revealed}
		></span>
	{/each}
</span>

<style>
	.ios-spinner {
		align-items: center;
		background-color: var(--ptr-indicator-bg, #fbfaf8);
		border-radius: 50%;
		box-shadow: rgba(0, 0, 0, 0.2) 0 1px 5px;
		display: flex;
		height: var(--ptr-indicator-size, 38px);
		justify-content: center;
		position: relative;
		width: var(--ptr-indicator-size, 38px);
	}

	.bar {
		background: var(--ptr-ios-bar-color, #888);
		border-radius: 20px;
		box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
		height: 16%;
		left: 49%;
		opacity: 1;
		position: absolute;
		top: 43%;
		transform-origin: center;
		width: 4%;
	}

	.refreshing .bar {
		animation: fade 1s linear infinite;
	}

	@keyframes fade {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.25;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.refreshing .bar {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
