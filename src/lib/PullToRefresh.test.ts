import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import { createRawSnippet, flushSync } from 'svelte';
import PullToRefresh from './PullToRefresh.svelte';
import type { PullProgress } from './types.js';

const children = createRawSnippet(() => ({
	render: () => '<div data-testid="content" style="height: 300px">content</div>'
}));

interface SetupOptions {
	onrefresh?: () => Promise<void> | void;
	platform?: 'auto' | 'ios' | 'material';
	threshold?: number;
	maxPull?: number;
	indicator?: ReturnType<typeof createRawSnippet<[PullProgress]>>;
}

function setup(options: SetupOptions = {}) {
	const onrefresh = options.onrefresh ?? vi.fn();
	const { container } = render(PullToRefresh, {
		props: {
			onrefresh,
			platform: options.platform ?? 'material',
			threshold: options.threshold ?? 80,
			maxPull: options.maxPull ?? 400,
			indicator: options.indicator,
			children
		}
	});
	const root = container.querySelector('.ptr') as HTMLDivElement;
	return { root, onrefresh };
}

function firePointer(
	target: EventTarget,
	type: 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel',
	x: number,
	y: number
) {
	target.dispatchEvent(
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX: x,
			clientY: y,
			pointerId: 1,
			isPrimary: true,
			pointerType: 'touch'
		})
	);
	flushSync();
}

/** Locks the direction with a small downward move, then pulls to `travel`. */
function pull(root: HTMLElement, travel: number, { release = true } = {}) {
	firePointer(root, 'pointerdown', 0, 100);
	firePointer(window, 'pointermove', 0, 112); // past the 8px slop: lock down
	firePointer(window, 'pointermove', 0, 112 + travel);
	if (release) firePointer(window, 'pointerup', 0, 112 + travel);
}

describe('PullToRefresh', () => {
	it('starts idle with the indicator hidden', () => {
		const { root } = setup();
		expect(root).toHaveAttribute('data-phase', 'idle');
		expect(root.querySelector('.ptr-indicator.idle')).not.toBeNull();
		expect(root).toHaveAttribute('aria-busy', 'false');
	});

	it('refreshes when pulled past the threshold', async () => {
		let resolve!: () => void;
		const onrefresh = vi.fn(() => new Promise<void>((r) => (resolve = r)));
		const { root } = setup({ onrefresh });

		pull(root, 250, { release: false });
		expect(root).toHaveAttribute('data-phase', 'armed');

		firePointer(window, 'pointerup', 0, 362);
		expect(onrefresh).toHaveBeenCalledOnce();
		expect(root).toHaveAttribute('data-phase', 'refreshing');
		expect(root).toHaveAttribute('aria-busy', 'true');
		expect(screen.getByRole('status')).toHaveTextContent('Refreshing content');

		resolve();
		await waitFor(() => expect(root).toHaveAttribute('data-phase', 'idle'), { timeout: 2000 });
		expect(onrefresh).toHaveBeenCalledOnce();
	});

	it('settles without refreshing below the threshold', async () => {
		const { root, onrefresh } = setup();
		pull(root, 40);
		expect(onrefresh).not.toHaveBeenCalled();
		await waitFor(() => expect(root).toHaveAttribute('data-phase', 'idle'), { timeout: 2000 });
	});

	it('hands horizontal drags back to the browser', () => {
		const { root, onrefresh } = setup();
		firePointer(root, 'pointerdown', 0, 100);
		firePointer(window, 'pointermove', 50, 103); // sideways intent
		firePointer(window, 'pointermove', 50, 400); // deep pull, but too late
		firePointer(window, 'pointerup', 50, 400);
		expect(onrefresh).not.toHaveBeenCalled();
		expect(root).toHaveAttribute('data-phase', 'idle');
	});

	it('ignores upward drags', () => {
		const { root, onrefresh } = setup();
		firePointer(root, 'pointerdown', 0, 300);
		firePointer(window, 'pointermove', 0, 250);
		firePointer(window, 'pointerup', 0, 250);
		expect(onrefresh).not.toHaveBeenCalled();
		expect(root).toHaveAttribute('data-phase', 'idle');
	});

	it('does not arm while the document is scrolled', () => {
		vi.spyOn(Element.prototype, 'scrollTop', 'get').mockReturnValue(120);
		const { root, onrefresh } = setup();
		pull(root, 250);
		expect(onrefresh).not.toHaveBeenCalled();
		expect(root).toHaveAttribute('data-phase', 'idle');
	});

	it('lets a mid-scroll nested list swallow the drag', () => {
		const { root, onrefresh } = setup();
		const content = screen.getByTestId('content');
		content.style.overflowY = 'auto';
		Object.defineProperties(content, {
			scrollHeight: { value: 900, configurable: true },
			clientHeight: { value: 300, configurable: true },
			scrollTop: { value: 150, configurable: true }
		});
		firePointer(content, 'pointerdown', 0, 100);
		firePointer(window, 'pointermove', 0, 112);
		firePointer(window, 'pointermove', 0, 360);
		firePointer(window, 'pointerup', 0, 360);
		expect(onrefresh).not.toHaveBeenCalled();
		expect(root).toHaveAttribute('data-phase', 'idle');
	});

	it('settles when the pointer is cancelled mid-pull', async () => {
		const { root, onrefresh } = setup();
		pull(root, 250, { release: false });
		firePointer(window, 'pointercancel', 0, 362);
		expect(onrefresh).not.toHaveBeenCalled();
		await waitFor(() => expect(root).toHaveAttribute('data-phase', 'idle'), { timeout: 2000 });
	});

	it('ticks the vibration motor when the pull arms', () => {
		const vibrate = vi.fn();
		Object.defineProperty(navigator, 'vibrate', {
			value: vibrate,
			configurable: true,
			writable: true
		});
		const { root } = setup();
		pull(root, 250, { release: false });
		expect(vibrate).toHaveBeenCalledExactlyOnceWith(10);
		// deeper travel must not re-tick
		firePointer(window, 'pointermove', 0, 380);
		expect(vibrate).toHaveBeenCalledOnce();
		firePointer(window, 'pointerup', 0, 380);
	});

	it('renders the 12-bar spinner for the ios platform', () => {
		const { root } = setup({ platform: 'ios' });
		expect(root.querySelectorAll('.ios-spinner .bar')).toHaveLength(12);
		expect(root.querySelector('.material-spinner')).toBeNull();
	});

	it('renders the material spinner for the material platform', () => {
		const { root } = setup({ platform: 'material' });
		expect(root.querySelector('.material-spinner')).not.toBeNull();
		expect(root.querySelector('.ios-spinner')).toBeNull();
	});

	it('renders a custom indicator snippet instead of the built-ins', () => {
		const indicator = createRawSnippet<[PullProgress]>(() => ({
			render: () => '<span data-testid="custom-indicator">custom</span>'
		}));
		const { root } = setup({ indicator });
		expect(screen.getByTestId('custom-indicator')).toBeInTheDocument();
		expect(root.querySelector('.material-spinner')).toBeNull();
		expect(root.querySelector('.ios-spinner')).toBeNull();
	});
});
