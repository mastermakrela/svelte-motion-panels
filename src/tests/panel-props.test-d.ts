// Type-level checks, run by `bun run check` (svelte-check), not by vitest.
import type { ComponentProps } from 'svelte';

import type { Panel } from '#lib/index.js';

type Props = ComponentProps<typeof Panel<number>>;

export const sized: Props = { collapsed: true, size: 30 };
export const fill: Props = { pin: true };

// @ts-expect-error a sized panel can not pin
export const sizedPin: Props = { pin: true, size: 30 };
// @ts-expect-error only a sized panel collapses
export const fillCollapsed: Props = { collapsed: true, pin: true };
