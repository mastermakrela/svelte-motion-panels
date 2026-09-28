<!--
@component
A reference table: every cell but the last is a code chip, the last is prose.
Stacks into blocks on narrow screens.
-->
<script lang="ts">
	import { CHIP } from './prose.js';

	let { head, rows }: { head?: string[]; rows: readonly (readonly string[])[] } = $props();
</script>

<div class="relative mt-5 w-full overflow-x-auto">
	<table class="w-full text-[14px]">
		{#if head}
			<thead class="max-sm:hidden">
				<tr class="border-b">
					{#each head as cell, index (cell)}
						<th
							class={[
								'kicker pt-0 pb-2.5 text-left align-bottom font-medium whitespace-nowrap text-muted-foreground/60',
								index === head.length - 1 ? 'w-full pl-4' : 'pr-4'
							]}
						>
							{cell}
						</th>
					{/each}
				</tr>
			</thead>
		{/if}
		<tbody class="max-sm:block">
			{#each rows as cells (cells[0])}
				<tr class="border-b last:border-0 max-sm:block max-sm:py-2">
					{#each cells as cell, index (index)}
						{#if index === cells.length - 1}
							<td
								class="w-full py-2.5 pl-4 align-top text-muted-foreground max-sm:block max-sm:w-auto max-sm:pt-1 max-sm:pl-0"
							>
								{cell}
							</td>
						{:else}
							<td
								class="py-2.5 pr-4 align-top whitespace-nowrap max-sm:block max-sm:py-1 max-sm:pr-0"
							>
								<code class={CHIP}>{cell}</code>
							</td>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
