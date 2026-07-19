/** Which indicator to render. `auto` picks per device at runtime. */
export type Platform = 'auto' | 'ios' | 'material';

/** A concrete indicator style after `auto` detection. */
export type ResolvedPlatform = Exclude<Platform, 'auto'>;

/** Lifecycle of a single pull gesture. */
export type PullPhase = 'idle' | 'pulling' | 'armed' | 'refreshing' | 'settling';

/** Snapshot passed to custom indicator snippets on every frame. */
export interface PullProgress {
	/** 0 at rest, 1 exactly at the arm threshold. May exceed 1 on deep pulls. */
	progress: number;
	/** Resisted pull distance in pixels (what the indicator is translated by). */
	position: number;
	/** Current phase of the gesture state machine. */
	phase: PullPhase;
	/** Convenience flag, true while the `onrefresh` promise is pending. */
	refreshing: boolean;
}

/** Props shared by the built-in indicator components. */
export interface IndicatorProps {
	/** 0 at rest, 1 at the arm threshold. May exceed 1. */
	progress: number;
	/** True while a refresh is running. */
	refreshing: boolean;
}
