import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia; svelte/motion queries prefers-reduced-motion.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: (query: string): MediaQueryList =>
			({
				matches: false,
				media: query,
				onchange: null,
				addEventListener: () => {},
				removeEventListener: () => {},
				addListener: () => {},
				removeListener: () => {},
				dispatchEvent: () => false
			}) as MediaQueryList
	});
}

// jsdom does not implement PointerEvent. The component only reads MouseEvent
// fields plus pointerId / pointerType / isPrimary, so a small shim is enough
// to drive realistic pointer sequences in component tests.
if (typeof window !== 'undefined' && !('PointerEvent' in window)) {
	class PointerEventShim extends MouseEvent {
		pointerId: number;
		pointerType: string;
		isPrimary: boolean;

		constructor(type: string, params: PointerEventInit = {}) {
			super(type, params);
			this.pointerId = params.pointerId ?? 1;
			this.pointerType = params.pointerType ?? 'mouse';
			this.isPrimary = params.isPrimary ?? true;
		}
	}

	Object.defineProperty(window, 'PointerEvent', { value: PointerEventShim });
	Object.defineProperty(globalThis, 'PointerEvent', { value: PointerEventShim });
}
