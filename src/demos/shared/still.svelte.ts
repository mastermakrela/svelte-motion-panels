import { reducedMotion } from 'motion-panels';
import { createSubscriber } from 'svelte/reactivity';

const subscribe = createSubscriber((update) => reducedMotion.subscribe(update));

/** prefers-reduced-motion, through the same store the panels watch. Reactive. */
export const still = {
	get current() {
		subscribe();

		return reducedMotion.get();
	}
};
