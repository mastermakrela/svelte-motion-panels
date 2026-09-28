import type { Transition } from 'motion';
import { reducedMotion } from 'motion-panels';
import { backOut, cubicOut, quadOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';

/**
 * Fold presets. There are no motion poses on a Svelte Panel: the panel edge
 * takes `transition`, and the content brings its own `in:` transition, which
 * plays as the panel unfolds when `keepMounted={false}` remounts it.
 */
export type Fold = 'fade' | 'scale' | 'flip' | 'snap' | 'spring';

interface Preset {
	/** How the preset reads in the demo footer. */
	code: string;
	enter: TransitionConfig | null;
	transition?: Transition;
}

export const FOLDS: Record<Fold, Preset> = {
	fade: {
		code: 'in:fade={{ duration: 350 }}',
		enter: { duration: 350, css: (t: number) => `opacity: ${t}` }
	},
	scale: {
		code: 'in:scale={{ start: 0.85 }}',
		enter: {
			duration: 250,
			easing: cubicOut,
			css: (t: number) => `transform: scale(${0.85 + 0.15 * t})`
		}
	},
	flip: {
		// No built-in flips a card in, so this one is folds.ts's own `fold` transition.
		code: "in:fold={'flip'}",
		enter: {
			duration: 280,
			easing: quadOut,
			css: (t: number) => `transform: perspective(500px) rotateY(${-75 * (1 - t)}deg)`
		}
	},
	snap: {
		code: '',
		enter: null,
		transition: { duration: 0 }
	},
	spring: {
		code: 'in:scale={{ start: 0.9, duration: 700, easing: backOut }}',
		enter: {
			duration: 700,
			easing: backOut,
			css: (t: number) => `transform: scale(${0.9 + 0.1 * t})`
		},
		transition: { bounce: 0.4, duration: 0.7, type: 'spring' }
	}
};

export const FOLD_NAMES = Object.keys(FOLDS) as Fold[];

/**
 * The content transition for a preset: `<div in:fold={name}>`. Instant under
 * prefers-reduced-motion, like the panel edge itself.
 */
export const fold = (_node: Element, name: Fold): TransitionConfig =>
	(!reducedMotion.get() && FOLDS[name].enter) || { duration: 0 };

/** The panel's own fold timing for a preset, if it sets one. */
export const timingOf = (name: Fold): Transition | undefined => FOLDS[name].transition;
