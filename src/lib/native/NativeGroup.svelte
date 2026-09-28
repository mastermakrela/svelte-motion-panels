<!--
@component
EXPERIMENTAL, BENCHMARK-ONLY — not exported from `$lib/index.ts`.
A row or column for NativePanel / NativeSeparator; see engine.svelte.ts.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { untrack } from 'svelte';

	import type { Orientation } from './engine.svelte.js';
	import { hasNativeGroup, NativeGroupState, setNativeGroup } from './engine.svelte.js';

	type Props = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		children?: Snippet;
		/** Read once, when the group mounts. */
		orientation?: Orientation;
	};

	let { children, orientation = 'horizontal', ...rest }: Props = $props();

	const nested = hasNativeGroup();
	const group = new NativeGroupState(untrack(() => orientation));
	setNativeGroup(group);
</script>

<div
	{...rest}
	bind:clientWidth={group.width}
	bind:clientHeight={group.height}
	style:display="flex"
	style:flex-direction={group.horizontal ? 'row' : 'column'}
	style:width="100%"
	style:height="100%"
	style:overflow={nested ? undefined : 'clip'}
>
	{@render children?.()}
</div>
