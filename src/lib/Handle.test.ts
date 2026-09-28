import { render, screen } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { afterEach, describe, expect, test, vi } from 'vitest';

import HandleFixture from '../tests/HandleFixture.svelte';
import ReorderFixture from '../tests/ReorderFixture.svelte';

const press = (button: Element, key: string) => {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key });
	flushSync(() => button.dispatchEvent(event));

	return event;
};

afterEach(() => {
	vi.restoreAllMocks();
});

describe('Handle', () => {
	test('renders nothing without a group order', () => {
		render(HandleFixture);

		expect(screen.queryAllByRole('button')).toHaveLength(0);
	});

	test('renders nothing with an order but no onOrderChange', () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		render(HandleFixture, { order: ['files', 'outline'] });

		expect(screen.queryAllByRole('button')).toHaveLength(0);
	});

	test('labels itself with the panel value', () => {
		render(HandleFixture, { onOrderChange: vi.fn(), order: ['files', 'outline'] });
		const [first] = screen.getAllByRole('button');

		expect(first?.getAttribute('aria-label')).toBe('Move files');
		expect(first?.getAttribute('type')).toBe('button');
		expect(first?.style.touchAction).toBe('none');
	});

	test('carries a panel past its neighbour along the group axis', () => {
		const onOrderChange = vi.fn();
		render(HandleFixture, { onOrderChange, order: ['files', 'outline'] });
		const event = press(screen.getByRole('button', { name: 'Move files' }), 'ArrowRight');

		expect(onOrderChange).toHaveBeenCalledWith(['outline', 'files']);
		expect(event.defaultPrevented).toBe(true);
	});

	test('turns the keys round in an RTL row', () => {
		const onOrderChange = vi.fn();
		render(HandleFixture, { onOrderChange, order: ['files', 'outline'], rtl: true });
		press(screen.getByRole('button', { name: 'Move outline' }), 'ArrowRight');

		expect(onOrderChange).toHaveBeenCalledWith(['outline', 'files']);
	});

	test('stays put at the ends of the order and off the axis', () => {
		const onOrderChange = vi.fn();
		render(HandleFixture, { onOrderChange, order: ['files', 'outline'] });
		const start = press(screen.getByRole('button', { name: 'Move files' }), 'ArrowLeft');
		const edge = press(screen.getByRole('button', { name: 'Move outline' }), 'ArrowRight');
		const across = press(screen.getByRole('button', { name: 'Move files' }), 'ArrowDown');

		expect(onOrderChange).not.toHaveBeenCalled();
		expect(start.defaultPrevented).toBe(false);
		expect(edge.defaultPrevented).toBe(false);
		expect(across.defaultPrevented).toBe(false);
	});

	test('a press without movement reorders nothing', () => {
		const onOrderChange = vi.fn();
		render(HandleFixture, { onOrderChange, order: ['files', 'outline'] });
		const handle = screen.getByRole('button', { name: 'Move files' });
		handle.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, pointerId: 1 })
		);
		window.dispatchEvent(new PointerEvent('pointermove', { clientX: 11, pointerId: 1 }));
		window.dispatchEvent(new PointerEvent('pointerup', { clientX: 11, pointerId: 1 }));

		expect(onOrderChange).not.toHaveBeenCalled();
	});

	test('a release after the group lost its order still gives pointer events back', async () => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
		const { rerender } = render(HandleFixture, {
			onOrderChange: vi.fn(),
			order: ['files', 'outline']
		});
		const handle = screen.getByRole('button', { name: 'Move files' });
		const root = document.querySelector('[data-motion-panels-fill]')?.parentElement;
		handle.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0, clientX: 10, pointerId: 1 })
		);
		flushSync(() =>
			window.dispatchEvent(new PointerEvent('pointermove', { clientX: 30, pointerId: 1 }))
		);

		expect(root?.style.pointerEvents).toBe('none');

		await rerender({ onOrderChange: undefined, order: undefined });
		flushSync(() =>
			window.dispatchEvent(new PointerEvent('pointerup', { clientX: 30, pointerId: 1 }))
		);

		expect(root?.style.pointerEvents).toBe('');
	});

	test('separators resize the panel next to them after a reorder', () => {
		render(ReorderFixture);
		const seam = (name: string) => screen.getByRole('separator', { name });

		expect(seam('seam-a').getAttribute('aria-valuenow')).toBe('180');
		expect(seam('seam-b').getAttribute('aria-valuenow')).toBe('130');

		press(screen.getByRole('button', { name: 'Move files' }), 'ArrowRight');

		expect(seam('seam-a').getAttribute('aria-valuenow')).toBe('130');
		expect(seam('seam-b').getAttribute('aria-valuenow')).toBe('180');
	});
});
