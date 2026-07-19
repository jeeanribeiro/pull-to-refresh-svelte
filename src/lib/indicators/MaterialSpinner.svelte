<script lang="ts">
	import type { IndicatorProps } from '../types.js';

	let { progress, refreshing }: IndicatorProps = $props();

	// The original component derived everything from the pull position measured
	// in sixths of the maximum pull. Normalized: the arc finishes drawing and
	// the disc completes a full turn exactly at the arm threshold (progress 1).
	const u = $derived(progress * 1.5);
	const rotation = $derived(u * 360 - 180);
	const arrowScale = $derived(Math.max(0, Math.min(1, u - 0.5)));
	const opacity = $derived(Math.max(0.5, Math.min(1, u - 0.5)));
	const draw = $derived(Math.max(0, Math.min(1000, u * 1000 - 500)));
</script>

<span
	class="material-spinner"
	class:refreshing
	aria-hidden="true"
	style:--opacity={opacity}
	style:--rotation="{rotation}deg"
	style:--draw="-{draw}ms"
	style:--arrow-scale={arrowScale}
></span>

<style>
	.material-spinner {
		align-items: center;
		background-color: var(--ptr-indicator-bg, #fbfaf8);
		border-radius: 50%;
		box-shadow: rgba(0, 0, 0, 0.2) 0 1px 5px;
		display: flex;
		height: var(--ptr-indicator-size, 38px);
		justify-content: center;
		position: relative;
		transform: rotateZ(var(--rotation));
		width: var(--ptr-indicator-size, 38px);
	}

	/* Arrow head: scales in as the pull approaches the threshold. */
	.material-spinner::before {
		border-bottom: 5px solid var(--ptr-material-color, #4169e1);
		border-left: 5px solid transparent;
		border-right: 5px solid transparent;
		height: 0;
		margin-left: 11px;
		margin-top: 16px;
		position: absolute;
		transform: rotateZ(220deg) scale(var(--arrow-scale));
		width: 0;
	}

	/* Arc: draws itself via a clip-path animation scrubbed with a negative
	   animation-delay (--draw) while the animation itself stays paused. */
	.material-spinner::after {
		animation: border-progress-in 1000ms;
		animation-delay: var(--draw);
		animation-play-state: paused;
		border-radius: 50%;
		border: 3px solid var(--ptr-material-color, #4169e1);
		box-sizing: border-box;
		clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 60%);
		height: 22px;
		transform: rotateZ(max(calc(160deg + var(--rotation) * -1), -100deg));
		width: 22px;
	}

	.material-spinner::after,
	.material-spinner::before {
		content: '';
		display: block;
		opacity: var(--opacity);
	}

	@keyframes border-progress-in {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		25% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
		75% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
		}
		100% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 60%);
		}
	}

	.refreshing::before {
		display: none;
	}

	.refreshing::after {
		animation:
			rotate 1.5s linear infinite,
			border-progress-in-out 1.5s linear infinite;
		animation-play-state: running;
		animation-delay: 0ms;
		border: 3px solid var(--ptr-material-color, #4169e1);
	}

	@keyframes rotate {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes border-progress-in-out {
		0% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
		12.5% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 0, 100% 0, 100% 0);
		}
		25% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 100% 100%, 100% 100%);
		}
		37.5% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 100%);
		}
		50% {
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 0);
		}
		50.01% {
			clip-path: polygon(50% 50%, 0 0, 0 100%, 100% 100%, 100% 0, 0 0);
		}
		62.5% {
			clip-path: polygon(50% 50%, 0 0, 0 100%, 100% 100%, 100% 0, 100% 0);
		}
		75% {
			clip-path: polygon(50% 50%, 0 0, 0 100%, 100% 100%, 100% 100%, 100% 100%);
		}
		87.5% {
			clip-path: polygon(50% 50%, 0 0, 0 100%, 0 100%, 0 100%, 0 100%);
		}
		100% {
			clip-path: polygon(50% 50%, 0 0, 0 0, 0 0, 0 0, 0 0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.refreshing::after {
			animation: none;
			clip-path: polygon(50% 50%, 0 0, 100% 0, 100% 100%, 0 100%, 0 60%);
		}
	}
</style>
