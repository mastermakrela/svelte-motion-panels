import type { MotionValue, Transition } from 'motion';
import type { PanelGroup } from 'motion-panels';
import type { Attachment } from 'svelte/attachments';
import { createContext } from 'svelte';
import { createSubscriber } from 'svelte/reactivity';

/**
 * The `useSyncExternalStore` of this adapter: `current` reads `get()` and,
 * when read inside an effect or the template, subscribes so the reader re-runs
 * on every notification.
 */
export const store = <T>(subscribe: (listener: () => void) => () => void, get: () => T) => {
	const track = createSubscriber(subscribe);

	return {
		get current() {
			track();

			return get();
		}
	};
};

const [getGroupContext, setGroupContext, hasGroupContext] = createContext<PanelGroup>();

export const setGroup = setGroupContext;

/** The enclosing group, or `null` at the root (Group reads this to know it is nested). */
export const getParentGroup = () => (hasGroupContext() ? getGroupContext() : null);

export const getGroup = () => {
	const group = getParentGroup();
	if (!group) {
		throw new Error('Motion Panels: Panel and Separator must be inside a Group');
	}

	return group;
};

/**
 * What a reorderable group shares with its slots and handles. Every field is a
 * live getter over Group's props and state, so readers inside effects and
 * templates stay reactive.
 */
export interface Reordering {
	carry: (carrying: boolean) => void;
	readonly carrying: boolean;
	readonly transition: Transition | undefined;
	/** The group's `reorder` prop: whether carried panels travel animated. */
	readonly travel: boolean;
	// Bivariant on purpose: a group of one value form still hands its order over.
	onOrderChange(order: unknown[]): void;
	readonly order: unknown[];
	/**
	 * A horizontal RTL row: pointer-driven reordering steps through `order` in
	 * reading order, so hand it `order.toReversed()` and reverse the answer.
	 */
	readonly reversed: boolean;
}

/**
 * `current` is `null` unless the group has both `order` and `onOrderChange`
 * (React's `ReorderContext` value). A wrapper, since a context value itself
 * can not change after it is set.
 */
export interface ReorderContext {
	readonly current: Reordering | null;
}

export const [getReorder, setReorder] = createContext<ReorderContext>();

/**
 * What a reorder handle needs from the slot it sits in: the value it carries
 * and `start`, which begins carrying the slot from a pointerdown on the handle
 * (React's version hands over Motion's `DragControls` for the same job).
 * `null` directly under a Group, so a handle never reaches through a nested
 * group into an outer slot.
 */
export interface Grip {
	start(event: PointerEvent): void;
	readonly value: unknown;
}

const [getGripContext, setGripContext, hasGripContext] = createContext<Grip | null>();

export const setGrip = setGripContext;

export const getGrip = () => (hasGripContext() ? getGripContext() : null);

const px = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/**
 * Writes a MotionValue straight into one inline style property and keeps it
 * there on every change, without going through Svelte state — the same thing
 * `motion.div` does with a MotionValue in `style`, so a drag never re-renders.
 *
 * Svelte rewrites the whole inline style when an element's `style` attribute
 * string changes, which wipes what this wrote. Pass that string's getter as
 * `watch`: reading it here re-runs the attachment right after such a rewrite.
 */
export const bindStyle =
	<T extends number | string>(
		value: MotionValue<T>,
		property: string,
		map: (value: T) => string = px,
		watch?: () => unknown
	): Attachment<HTMLElement> =>
	(element) => {
		watch?.();
		const write = (latest: T) => element.style.setProperty(property, map(latest));
		write(value.get());

		return value.on('change', write);
	};

/**
 * Writes inline style properties that change at runtime one by one, the way
 * `style:` directives do, for elements a directive can not reach (a component's
 * root, or a property name picked per axis). Unlike a changing `style`
 * attribute it never rewrites the whole inline style, so what `bindStyle`
 * wrote on the same element survives.
 */
export const liveStyle =
	(get: () => Record<string, string | undefined>): Attachment<HTMLElement> =>
	(element) => {
		for (const [property, value] of Object.entries(get())) {
			if (value === undefined) {
				element.style.removeProperty(property);
			} else {
				element.style.setProperty(property, value);
			}
		}
	};
