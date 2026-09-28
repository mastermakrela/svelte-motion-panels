<!--
@component
Prose with `backticked` words set as code chips.
-->
<script lang="ts">
	import { CHIP, chips } from './prose.js';

	let { text }: { text: string } = $props();
</script>

{#each chips(text) as part, index (index)}{#if index % 2}<code class={CHIP}>{part}</code
		>{:else}{part}{/if}{/each}
