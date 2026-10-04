/**
 * EXPERIMENTAL, BENCHMARK-ONLY — not exported from `#lib/index.ts`.
 *
 * A minimal "native Svelte 5 runes" panel engine, written only to compare
 * against the shipped wrapper around `motion-panels` (see BENCHMARK.md). It
 * covers one scenario — sized panels either side of one fill panel — and
 * drives every size through `$state` / `Tween.current` → `style:` directives,
 * where the wrapper writes MotionValues straight into the DOM.
 *
 * Tween over WAAPI: the question is what idiomatic runes cost, and a Tween
 * keeps the animated size in Svelte state (so it flows through the same
 * reactive graph as a drag), whereas WAAPI would bypass Svelte entirely.
 */
import { createContext, untrack } from 'svelte';
import { prefersReducedMotion, Tween } from 'svelte/motion';
import { SvelteMap } from 'svelte/reactivity';

export type Size = number | `${number}%`;
export type Orientation = 'horizontal' | 'vertical';

/** The house curve of motion-panels: 250ms, cubic-bezier(0.32, 0.72, 0, 1). */
export const DURATION = 250;

/** CSS cubic-bezier(x1, y1, x2, y2) as an easing function (Newton-Raphson, then bisection). */
const cubicBezier = (x1: number, y1: number, x2: number, y2: number) => {
	const at = (a: number, b: number, t: number) =>
		((1 - 3 * b + 3 * a) * t + (3 * b - 6 * a)) * t * t + 3 * a * t;
	const slope = (a: number, b: number, t: number) =>
		3 * (1 - 3 * b + 3 * a) * t * t + 2 * (3 * b - 6 * a) * t + 3 * a;

	return (x: number) => {
		if (x <= 0 || x >= 1) return x <= 0 ? 0 : 1;
		let t = x;
		for (let i = 0; i < 8; i++) {
			const error = at(x1, x2, t) - x;
			if (Math.abs(error) < 1e-6) return at(y1, y2, t);
			const d = slope(x1, x2, t);
			if (Math.abs(d) < 1e-6) break;
			t -= error / d;
		}
		let low = 0;
		let high = 1;
		t = x;
		while (high - low > 1e-6) {
			if (at(x1, x2, t) < x) low = t;
			else high = t;
			t = (low + high) / 2;
		}

		return at(y1, y2, t);
	};
};

export const houseEase = cubicBezier(0.32, 0.72, 0, 1);

const PAN_THRESHOLD = 3;
const KEY_STEP = 10;
const KEY_STEP_FAST = 50;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const toPixels = (value: Size, extent: number) =>
	typeof value === 'string' ? (Number.parseFloat(value) / 100) * extent : value;

const hasFillAfter = (node: Element): boolean => {
	const next = node.nextElementSibling;

	return !!next && (next.hasAttribute('data-native-fill') || hasFillAfter(next));
};

export class NativeGroupState {
	width = $state(0);
	height = $state(0);
	readonly panels = new SvelteMap<Element, NativePanelState>();
	readonly horizontal: boolean;

	constructor(orientation: Orientation) {
		this.horizontal = orientation === 'horizontal';
	}

	get extent() {
		return this.horizontal ? this.width : this.height;
	}

	/** A separator resizes the sized panel on the side away from the fill. */
	panelFor(separator: Element) {
		const next = separator.nextElementSibling;
		const neighbour = next?.hasAttribute('data-native-fill')
			? separator.previousElementSibling
			: next;

		return neighbour ? this.panels.get(neighbour) : undefined;
	}
}

export const [getNativeGroup, setNativeGroup, hasNativeGroup] = createContext<NativeGroupState>();

/** Live getters over NativePanel's props, plus writers for its bindables. */
export interface NativePanelOptions {
	readonly collapsed: boolean | undefined;
	readonly collapsible: boolean;
	readonly maxSize: Size | undefined;
	readonly minSize: Size | undefined;
	readonly size: Size;
	onFoldEnd: () => void;
	setCollapsed: (collapsed: boolean) => void;
	setSize: (size: Size) => void;
}

export class NativePanelState {
	/** The rendered size. Drags jump it; prop changes tween it. */
	readonly width: Tween<number>;
	dragging = $state(false);
	/** The panel sits before the fill, so it grows towards the end. */
	end = $state(true);

	#element: HTMLElement | null = null;
	#pressed: number | null = null;
	#session = { max: 0, min: 0, sign: 1, start: 0 };
	#unlock: (() => void) | null = null;
	#seen: { collapsed: boolean; size: Size };

	constructor(
		readonly group: NativeGroupState,
		readonly options: NativePanelOptions
	) {
		this.width = new Tween(
			untrack(() => this.target),
			{ duration: DURATION, easing: houseEase }
		);
		this.#seen = untrack(() => ({ collapsed: !!options.collapsed, size: options.size }));
	}

	/** The open size in pixels, whether or not the panel is collapsed. */
	get open() {
		return Math.round(toPixels(this.options.size, this.group.extent));
	}

	get target() {
		return this.options.collapsed ? 0 : this.open;
	}

	get min() {
		const { minSize } = this.options;

		return minSize === undefined ? 0 : toPixels(minSize, this.group.extent);
	}

	get max() {
		const { maxSize } = this.options;

		return maxSize === undefined ? Infinity : toPixels(maxSize, this.group.extent);
	}

	attach = (element: HTMLElement) => {
		this.#element = element;
		this.end = hasFillAfter(element);
		this.group.panels.set(element, this);

		return () => {
			this.#release();
			this.group.panels.delete(element);
			this.#element = null;
		};
	};

	/**
	 * Called from an effect whenever `target` changes. A change of the size or
	 * collapsed prop animates; a drag, a group resize (percent sizes) or reduced
	 * motion jumps.
	 */
	sync(target: number) {
		const { collapsed, size } = this.options;
		const changed = size !== this.#seen.size || !!collapsed !== this.#seen.collapsed;
		this.#seen = { collapsed: !!collapsed, size };
		if (target === this.width.target) return;
		if (this.dragging || !changed || prefersReducedMotion.current) {
			void this.width.set(target, { duration: 0 });
			if (changed && !this.dragging) this.options.onFoldEnd();

			return;
		}
		void this.width.set(target).then(() => this.options.onFoldEnd());
	}

	#report(pixels: number): Size {
		if (typeof this.options.size !== 'string') return pixels;
		const total = this.group.extent;

		return `${total > 0 ? Math.round((pixels / total) * 10_000) / 100 : 0}%`;
	}

	#room() {
		const fill = this.#element?.parentElement?.querySelector<HTMLElement>(
			':scope > [data-native-fill]'
		);
		const fillExtent = fill ? (this.group.horizontal ? fill.offsetWidth : fill.offsetHeight) : 0;

		return this.width.current + fillExtent;
	}

	press(point: number) {
		this.#pressed = point;
	}

	move(point: number) {
		if (this.#pressed === null) return;
		const offset = point - this.#pressed;
		if (!this.dragging) {
			if (Math.abs(offset) < PAN_THRESHOLD) return;
			const room = this.#room();
			const min = Math.min(this.min, room);
			this.#session = {
				max: Math.max(min, Math.min(this.max, room)),
				min,
				sign: this.end ? 1 : -1,
				start: this.width.current
			};
			this.#lock();
			this.dragging = true;
		}
		const { max, min, sign, start } = this.#session;
		const pixels = start + offset * sign;
		const collapse = this.options.collapsible && pixels < min / 2;
		if (collapse !== !!this.options.collapsed) this.options.setCollapsed(collapse);
		if (!collapse) this.options.setSize(this.#report(Math.round(clamp(pixels, min, max))));
	}

	release() {
		this.#pressed = null;
		if (!this.dragging) return;
		this.#release();
		this.dragging = false;
	}

	key(event: KeyboardEvent) {
		const { collapsed, collapsible } = this.options;
		if (event.key === 'Enter') {
			if (collapsible) {
				event.preventDefault();
				this.options.setCollapsed(!collapsed);
			}

			return;
		}
		const room = this.#room() - this.width.current + this.target;
		const min = Math.min(this.min, room);
		const max = Math.max(min, Math.min(this.max, room));
		const step = (event.shiftKey ? KEY_STEP_FAST : KEY_STEP) * (this.end ? 1 : -1);
		const grow = this.group.horizontal ? 'ArrowRight' : 'ArrowDown';
		const shrink = this.group.horizontal ? 'ArrowLeft' : 'ArrowUp';
		const moves: Record<string, number> = {
			End: max,
			Home: min,
			[grow]: this.target + step,
			[shrink]: this.target - step
		};
		const next = moves[event.key];
		if (next === undefined) return;
		event.preventDefault();
		const value = clamp(next, min, max);
		if (collapsed && value > 0) this.options.setCollapsed(false);
		this.options.setSize(this.#report(Math.round(value)));
	}

	#lock() {
		const { style } = document.body;
		const saved = { cursor: style.cursor, userSelect: style.userSelect };
		style.cursor = this.group.horizontal ? 'col-resize' : 'row-resize';
		style.userSelect = 'none';
		this.#unlock = () => Object.assign(style, saved);
	}

	#release() {
		this.#unlock?.();
		this.#unlock = null;
	}
}
