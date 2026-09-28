import { animate, stagger } from 'motion';
import { reducedMotion } from 'motion-panels';
import type { Attachment } from 'svelte/attachments';

/**
 * The staggered entrance of a list (framer's `staggerChildren` variants):
 * each child rises 6px and fades in, 45ms after the one before. Children
 * start hidden in the markup, so the first frame never shows them settled.
 */
export const rise: Attachment<HTMLElement> = (list) => {
	const items = [...list.children] as HTMLElement[];
	if (reducedMotion.get()) {
		for (const item of items) {
			item.style.opacity = '1';
			item.style.transform = 'none';
		}

		return;
	}
	const controls = animate(
		items,
		{ opacity: [0, 1], y: [6, 0] },
		{ delay: stagger(0.045, { startDelay: 0.08 }), duration: 0.32, ease: 'easeOut' }
	);

	return () => controls.stop();
};

/** The hidden starting pose `rise` animates from. */
export const HIDDEN = 'opacity: 0; transform: translateY(6px);';
