import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, test, vi } from 'vitest';

import CollapseFixture from '../tests/CollapseFixture.svelte';
import PanelFixture from '../tests/PanelFixture.svelte';
import SeparatorFixture from '../tests/SeparatorFixture.svelte';

/** The grips in the group: the standalone Separator's and the panel's own edge grip. */
const grips = () => {
	const all = screen.queryAllByRole('separator');

	return {
		edge: all.filter((grip) => grip.hasAttribute('data-motion-panels-edge')).length,
		total: all.length
	};
};

describe('Panel', () => {
	test('wires the separator to the sized panel', () => {
		render(PanelFixture, { size: 240 });
		const grip = screen.getByRole('separator');

		expect(grip.getAttribute('aria-valuenow')).toBe('240');
		expect(grip.getAttribute('aria-orientation')).toBe('vertical');
		expect(grip.getAttribute('aria-label')).toBe('Resize panel');
		expect(grip.tabIndex).toBe(0);
		expect(grip.parentElement?.hasAttribute('data-motion-panels-separator')).toBe(true);
	});

	test('marks the filling panel and sizes the sized one from its motion value', () => {
		render(PanelFixture, { size: 240 });
		const fill = screen.getByTestId('fill');
		const content = screen.getByTestId('sized');

		expect(fill.hasAttribute('data-motion-panels-fill')).toBe(true);
		expect(content.style.width).toBe('240px');
		expect(content.parentElement?.style.width).toBe('240px');
	});

	test('a new size prop is synced into the controller', async () => {
		const { rerender } = render(PanelFixture, { size: 240 });
		const grip = screen.getByRole('separator');

		await rerender({ size: 300 });
		await tick();

		expect(grip.getAttribute('aria-valuenow')).toBe('300');
	});

	test('a vertical group turns the separator horizontal', () => {
		render(PanelFixture, { orientation: 'vertical' });

		expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('horizontal');
	});

	test('with keepMounted off, collapsing keeps the content mounted until the fold ends', async () => {
		const log: string[] = [];
		const { rerender } = render(CollapseFixture, { log });

		expect(log).toEqual(['mount']);

		await rerender({ collapsed: true });
		await tick();

		// Never unmounted and created again when the fold starts.
		expect(log).toEqual(['mount']);
		await vi.waitFor(() => expect(log).toEqual(['mount', 'unmount']));

		await rerender({ collapsed: false });
		await vi.waitFor(() => expect(log).toEqual(['mount', 'unmount', 'mount']));
	});

	test('a separator added or removed at runtime re-places the panel grip', async () => {
		const { rerender } = render(SeparatorFixture);

		expect(grips()).toEqual({ edge: 0, total: 1 });

		await rerender({ separated: false });
		await tick();

		// The panel lost its separator, so it grows its own edge grip.
		expect(grips()).toEqual({ edge: 1, total: 1 });

		await rerender({ separated: true });
		await tick();

		expect(grips()).toEqual({ edge: 0, total: 1 });
	});
});
