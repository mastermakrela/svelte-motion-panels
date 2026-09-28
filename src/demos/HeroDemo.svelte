<!--
@component
The hero reel: four views of one layout, cycled every few seconds. Any drag,
fold or view pick holds the reel; hovering pauses it; prefers-reduced-motion
keeps it still.
-->
<script lang="ts">
	import { Group, Panel, Separator } from '$lib/index.js';
	import { animate } from 'motion';
	import type { Attachment } from 'svelte/attachments';
	import { fade } from 'svelte/transition';

	import Agent from './hero/Agent.svelte';
	import Code from './hero/Code.svelte';
	import Files from './hero/Files.svelte';
	import Output from './hero/Output.svelte';
	import Slab from './hero/Slab.svelte';
	import Ticker from './hero/Ticker.svelte';
	import { SEPARATOR } from './shared/index.js';
	import { still } from './shared/still.svelte.js';

	interface View {
		agent: number;
		files: number;
		id: string;
		label: string;
		lead?: boolean;
		output: number;
	}

	type Side = 'agent' | 'files' | 'output';

	const VIEWS: View[] = [
		{ agent: 0, files: 160, id: 'code', label: 'Code', output: 104 },
		{ agent: 232, files: 160, id: 'split', label: 'Split', output: 104 },
		{ agent: 232, files: 160, id: 'pair', label: 'Pair', lead: true, output: 104 },
		{ agent: 0, files: 0, id: 'focus', label: 'Focus', lead: true, output: 0 }
	];

	const DWELL = 3600;

	const SIDES: Side[] = ['agent', 'files', 'output'];

	const tier = (room: number) => (room < 380 ? 0 : room < 560 ? 1 : 2);

	// Squeeze a view into the room there is: drop the agent, then the files.
	const fit = (view: View, room: number): Record<Side, number> => ({
		agent: room < 560 ? 0 : Math.min(view.agent, Math.round(room * 0.36)),
		files: room < 380 ? 0 : Math.min(view.files, Math.round(room * 0.26)),
		output: view.output
	});

	const FOLD = { bounce: 0.1, type: 'spring', visualDuration: 0.34 } as const;
	const TRAVEL = { bounce: 0.16, type: 'spring', visualDuration: 0.42 } as const;

	let active = $state('split');
	let order = $state(['files', 'agent']);
	const folded = $state<Record<Side, boolean>>({ agent: false, files: false, output: false });
	const size = $state<Record<Side, number>>({ agent: 232, files: 160, output: 104 });
	let held = $state(false);
	let hover = $state(false);

	// Plain bookkeeping, never rendered.
	let shown = VIEWS[1];
	let pending: string[] | null = null;
	let room = 0;

	const running = $derived(!(held || hover || still.current));

	const apply = (view: View) => {
		const last = shown;
		const next = fit(view, room);
		shown = view;
		active = view.id;
		for (const side of SIDES) {
			folded[side] = next[side] === 0;
			size[side] = next[side] || size[side];
		}

		const lead = view.lead ? ['agent', 'files'] : ['files', 'agent'];
		if (Boolean(view.lead) === Boolean(last.lead)) {
			return;
		}
		// Wait for a fold to land before the sides trade places.
		const before = fit(last, room);
		if (SIDES.some((side) => (next[side] === 0) !== (before[side] === 0))) {
			pending = lead;
		} else {
			pending = null;
			order = lead;
		}
	};

	const settled = () => {
		if (pending) {
			order = pending;
			pending = null;
		}
	};

	const hold = () => {
		held = true;
	};

	$effect(() => {
		if (!running) {
			return;
		}
		const at = VIEWS.findIndex((view) => view.id === active);
		const step = setTimeout(() => apply(VIEWS[(at + 1) % VIEWS.length]), DWELL);

		return () => clearTimeout(step);
	});

	// Refit the current view whenever the stage crosses a width tier.
	const measure: Attachment<HTMLElement> = (stage) => {
		const observer = new ResizeObserver(([entry]) => {
			const width = entry?.contentRect.width ?? 0;
			const was = room;
			room = width;
			if (!held && (was === 0 || tier(was) !== tier(width))) {
				apply(shown);
			}
		});
		observer.observe(stage);

		return () => observer.disconnect();
	};

	// The sliding highlight behind the picked view (framer's layoutId).
	let placed = false;
	const highlight: Attachment<HTMLElement> = (bar) => {
		const pill = bar.querySelector<HTMLElement>('[data-pill]');
		const button = bar.querySelector<HTMLElement>(`[data-view="${active}"]`);
		if (!pill || !button) {
			return;
		}
		const to = { width: button.offsetWidth, x: button.offsetLeft };
		const controls = animate(
			pill,
			to,
			placed && !still.current
				? { bounce: 0.2, type: 'spring', visualDuration: 0.3 }
				: { duration: 0 }
		);
		placed = true;

		return () => controls.stop();
	};

	const status = $derived(
		held ? 'resume' : hover ? 'drag a seam or a panel' : running ? 'auto' : 'still'
	);

	// The sides first and last, the workspace between: one keyed each moves the
	// two side panels when the order flips instead of remounting them.
	const row = $derived([order[0], 'seam-a', 'workspace', 'seam-b', order[1]]);

	const enter = $derived({ duration: still.current ? 0 : 220 });
</script>

<figure
	class="overflow-hidden border"
	onpointerenter={() => (hover = true)}
	onpointerleave={() => (hover = false)}
>
	<div class="flex flex-wrap items-center gap-2 border-b bg-card p-2">
		<div class="relative flex items-center gap-0.5" {@attach highlight}>
			<span data-pill class="absolute inset-y-0 left-0 bg-accent-soft" aria-hidden="true"></span>
			{#each VIEWS as view (view.id)}
				<button
					type="button"
					data-view={view.id}
					aria-pressed={view.id === active}
					class={[
						'relative px-2.5 py-1.5 text-[12px] transition-colors',
						view.id === active ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
					]}
					onclick={() => {
						hold();
						apply(view);
					}}
				>
					{view.label}
					{#if view.id === active && running}
						<span
							class="motion-loop absolute inset-x-0 bottom-0 h-px origin-left bg-accent/60"
							style="animation: dwell {DWELL}ms linear forwards"
						></span>
					{/if}
				</button>
			{/each}
		</div>
		<button
			type="button"
			aria-label={held ? 'Resume the reel' : 'Stop the reel'}
			class="kicker ml-auto hidden items-center gap-1.5 text-muted-foreground/50 transition-colors hover:text-foreground min-[420px]:flex"
			onclick={() => (held = !held)}
		>
			<span
				class={[
					'motion-loop size-1.5 rounded-full',
					running ? 'bg-foreground/70' : 'bg-muted-foreground/40'
				]}
				style:animation={running ? 'breathe 2.4s infinite' : undefined}
			></span>
			{status}
		</button>
	</div>
	<div class="relative h-[300px] bg-well p-2.5 min-[900px]:h-[420px]">
		<div
			class="pointer-events-none absolute inset-0 bg-linear-to-b from-foreground/[0.05] to-transparent"
		></div>
		<div class="relative h-full" {@attach measure}>
			<Group
				{order}
				onOrderChange={(next) => {
					hold();
					order = next;
				}}
				orientation="horizontal"
				transition={TRAVEL}
			>
				{#each row as item (item)}
					{#if item === 'workspace'}
						<Panel>
							<Group orientation="vertical" transition={TRAVEL}>
								<Panel class="p-[3px]">
									<Slab bleed label="Workspace.svelte">
										<Code />
									</Slab>
								</Panel>
								<Separator aria-label="Resize output" class={SEPARATOR} />
								<Panel
									bind:size={size.output}
									bind:collapsed={folded.output}
									keepMounted={false}
									maxSize={168}
									minSize={56}
									transition={FOLD}
									onCollapsedChange={hold}
									onSizeChange={hold}
									onFoldEnd={settled}
									class="p-[3px]"
								>
									<div class="h-full" in:fade|global={enter}>
										<Slab label="Output">
											{#snippet badge()}
												<Ticker folded={folded.output} value={size.output} />
											{/snippet}
											<Output />
										</Slab>
									</div>
								</Panel>
							</Group>
						</Panel>
					{:else if item === 'seam-a' || item === 'seam-b'}
						<Separator
							aria-label="Resize {item === 'seam-a' ? order[0] : order[1]}"
							class={SEPARATOR}
						/>
					{:else if item === 'files'}
						<Panel
							value="files"
							bind:size={size.files}
							bind:collapsed={folded.files}
							keepMounted={false}
							maxSize={260}
							minSize={112}
							transition={FOLD}
							onCollapsedChange={hold}
							onSizeChange={hold}
							onFoldEnd={settled}
							class="p-[3px]"
						>
							<div class="h-full" in:fade|global={enter}>
								<Slab label="Files">
									{#snippet badge()}
										<Ticker folded={folded.files} value={size.files} />
									{/snippet}
									<Files />
								</Slab>
							</div>
						</Panel>
					{:else}
						<Panel
							value="agent"
							bind:size={size.agent}
							bind:collapsed={folded.agent}
							keepMounted={false}
							maxSize={340}
							minSize={168}
							transition={FOLD}
							onCollapsedChange={hold}
							onSizeChange={hold}
							onFoldEnd={settled}
							class="p-[3px]"
						>
							<div class="h-full" in:fade|global={enter}>
								<Slab label="Agent">
									{#snippet badge()}
										<Ticker folded={folded.agent} value={size.agent} />
									{/snippet}
									<Agent />
								</Slab>
							</div>
						</Panel>
					{/if}
				{/each}
			</Group>
		</div>
	</div>
</figure>
