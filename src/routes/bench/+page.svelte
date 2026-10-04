<!--
Benchmark: the shipped wrapper ($lib, over the motion-panels core) against the
experimental native runes engine ($lib/native). See BENCHMARK.md.
-->
<script lang="ts">
	import { flushSync, onMount, tick } from 'svelte';

	import { Group, Panel, Separator } from '#lib/index.js';
	import NativeGroup from '#lib/native/NativeGroup.svelte';
	import NativePanel from '#lib/native/NativePanel.svelte';
	import NativeSeparator from '#lib/native/NativeSeparator.svelte';

	type Impl = 'wrap' | 'native';
	type Metrics = Record<string, number>;
	type Results = {
		userAgent: string;
		dev: boolean;
		reps: number;
		modes: Record<string, Record<Impl, Metrics>>;
	};

	const IMPLS: Impl[] = ['wrap', 'native'];
	const REPS = 5;
	const BURST = 2000;
	const SPREAD_MOVES = 60;
	const FOLDS = 20;
	const DEPTH = 12;

	// Both sides share one config: sidebar 280px (min 160, max 45%), fill, end 200px.
	const sidebar = $state<Record<Impl, number>>({ wrap: 280, native: 280 });
	const collapsed = $state<Record<Impl, boolean>>({ wrap: false, native: false });
	const end = $state<Record<Impl, number>>({ wrap: 200, native: 200 });

	let stress = $state(false);
	let running = $state(false);
	let status = $state('idle');
	let results = $state.raw<Results | null>(null);

	const roots: Partial<Record<Impl, HTMLElement>> = {};
	const foldWaiters: Record<Impl, (() => void) | null> = { wrap: null, native: null };
	const foldEnded = (impl: Impl) => {
		foldWaiters[impl]?.();
		foldWaiters[impl] = null;
	};

	const frame = () => new Promise<number>((resolve) => requestAnimationFrame(resolve));
	const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

	const median = (values: number[]) => {
		const sorted = values.toSorted((a, b) => a - b);
		const middle = Math.floor(sorted.length / 2);

		return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
	};

	/** Records rAF timestamps until stopped; reports frame count, mean and max gap. */
	const watchFrames = () => {
		const stamps: number[] = [];
		let on = true;
		const loop = (now: number) => {
			stamps.push(now);
			if (on) requestAnimationFrame(loop);
		};
		requestAnimationFrame(loop);

		return () => {
			on = false;
			const gaps = stamps.slice(1).map((stamp, index) => stamp - stamps[index]);

			return {
				frames: stamps.length,
				mean: gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0,
				max: gaps.length ? Math.max(...gaps) : 0
			};
		};
	};

	const separatorOf = (impl: Impl) => {
		const grip = roots[impl]?.querySelector<HTMLElement>('[role="separator"]');
		if (!grip) throw new Error(`no separator for ${impl}`);

		return grip;
	};

	const pointer = (type: string, clientX: number, clientY: number) =>
		new PointerEvent(type, {
			bubbles: true,
			cancelable: true,
			clientX,
			clientY,
			button: 0,
			buttons: type === 'pointerup' ? 0 : 1,
			pointerId: 1,
			pointerType: 'mouse',
			isPrimary: true
		});

	/** Triangle wave in [-60, 60] px so the sidebar stays within its bounds (never clamps to a no-op). */
	const wave = (index: number) => {
		const phase = (index * 2) % 240;

		return phase < 120 ? phase - 60 : 180 - phase;
	};

	const reset = async (impl: Impl) => {
		collapsed[impl] = false;
		sidebar[impl] = 280;
		end[impl] = 200;
		await tick();
		await sleep(400);
	};

	/** A synthetic drag on the first separator. `step` runs one move; returns its offset source. */
	const drag = async (impl: Impl, moves: (move: (index: number) => void) => Promise<void>) => {
		const grip = separatorOf(impl);
		const box = grip.getBoundingClientRect();
		const x = box.left + box.width / 2;
		const y = box.top + box.height / 2;
		grip.dispatchEvent(pointer('pointerdown', x, y));
		// Cross the 3px pan threshold both engines share before measuring.
		grip.dispatchEvent(pointer('pointermove', x + 5, y));
		flushSync();
		let last = x;
		await moves((index) => {
			last = x + wave(index);
			grip.dispatchEvent(pointer('pointermove', last, y));
			flushSync();
		});
		grip.dispatchEvent(pointer('pointerup', last, y));
		flushSync();
	};

	const measureBurst = async (impl: Impl, layout: boolean) => {
		const fill = roots[impl]?.querySelector<HTMLElement>(
			'[data-motion-panels-fill], [data-native-fill]'
		);
		let elapsed = 0;
		await drag(impl, async (move) => {
			const start = performance.now();
			for (let index = 0; index < BURST; index += 1) {
				move(index);
				// Read layout so every move pays style + layout, not just the write.
				if (layout) void fill?.offsetWidth;
			}
			elapsed = performance.now() - start;
		});

		return elapsed;
	};

	const measureSpread = async (impl: Impl) => {
		let handler = 0;
		let result = { frames: 0, mean: 0, max: 0 };
		await drag(impl, async (move) => {
			const stop = watchFrames();
			const start = performance.now();
			let sent = 0;
			while (sent < SPREAD_MOVES) {
				const now = await frame();
				const due = Math.min(SPREAD_MOVES, Math.ceil(((now - start) / 1000) * SPREAD_MOVES));
				while (sent < due) {
					const t = performance.now();
					move(sent * 5);
					handler += performance.now() - t;
					sent += 1;
				}
			}
			await frame();
			result = stop();
		});

		return { ...result, handler: handler / SPREAD_MOVES };
	};

	const measureFolds = async (impl: Impl) => {
		const means: number[] = [];
		const maxes: number[] = [];
		const durations: number[] = [];
		let timeouts = 0;
		for (let index = 0; index < FOLDS; index += 1) {
			const done = new Promise<boolean>((resolve) => {
				foldWaiters[impl] = () => resolve(true);
				setTimeout(() => resolve(false), 1500);
			});
			const stop = watchFrames();
			const start = performance.now();
			collapsed[impl] = !collapsed[impl];
			const ended = await done;
			durations.push(performance.now() - start);
			const gaps = stop();
			if (!ended) timeouts += 1;
			means.push(gaps.mean);
			maxes.push(gaps.max);
			await frame();
		}

		return {
			foldMs: median(durations),
			foldGapMean: means.reduce((a, b) => a + b, 0) / means.length,
			foldGapMax: Math.max(...maxes),
			foldTimeouts: timeouts
		};
	};

	const measure = async (impl: Impl): Promise<Metrics> => {
		await reset(impl);
		const burst = await measureBurst(impl, false);
		await reset(impl);
		const burstLayout = await measureBurst(impl, true);
		await reset(impl);
		const spread = await measureSpread(impl);
		await reset(impl);
		const folds = await measureFolds(impl);
		await reset(impl);

		return {
			burstMs: burst,
			burstPerMoveUs: (burst / BURST) * 1000,
			burstLayoutMs: burstLayout,
			spreadFrames: spread.frames,
			spreadGapMean: spread.mean,
			spreadGapMax: spread.max,
			spreadHandlerUs: spread.handler * 1000,
			...folds
		};
	};

	/**
	 * Synthetic PointerEvents have no active pointer behind them, so Chrome throws
	 * NotFoundError from setPointerCapture. Stub capture for both engines alike.
	 */
	const withSyntheticCapture = async <T,>(work: () => Promise<T>) => {
		const proto = HTMLElement.prototype;
		const capture = proto.setPointerCapture;
		const releaseCapture = proto.releasePointerCapture;
		proto.setPointerCapture = () => {};
		proto.releasePointerCapture = () => {};
		try {
			return await work();
		} finally {
			proto.setPointerCapture = capture;
			proto.releasePointerCapture = releaseCapture;
		}
	};

	const setStress = async (on: boolean) => {
		stress = on;
		await tick();
		await sleep(400);
	};

	type Mode = 'normal' | 'stress';
	type Sample = { mode: Mode; impl: Impl; metrics: Metrics };
	const PROGRESS = 'svelte-motion-panels:bench-progress';

	/** Per mode: 5 reps, alternating which side goes first. */
	const plan = (['normal', 'stress'] as Mode[]).flatMap((mode) =>
		Array.from({ length: REPS }, (_, rep) =>
			(rep % 2 ? IMPLS.toReversed() : IMPLS).map((impl) => ({ mode, impl, rep }))
		).flat()
	);

	const summarise = (samples: Sample[]) => {
		const modes: Results['modes'] = {};
		for (const mode of ['normal', 'stress'] as Mode[]) {
			const byImpl = {} as Record<Impl, Metrics>;
			for (const impl of IMPLS) {
				const mine = samples.filter((sample) => sample.mode === mode && sample.impl === impl);
				byImpl[impl] = Object.fromEntries(
					Object.keys(mine[0].metrics).map((key) => [
						key,
						Math.round(median(mine.map((sample) => sample.metrics[key])) * 100) / 100
					])
				);
			}
			modes[mode] = byImpl;
		}

		return modes;
	};

	/**
	 * Runs the plan, saving each finished sample to sessionStorage: a dev-server
	 * full reload mid-run then resumes (with `?resume` in the URL) instead of
	 * starting over. Every (re)start and every mode switch warms both sides up first.
	 */
	const run = async (resume = false) => {
		if (document.visibilityState !== 'visible') {
			status = 'tab not visible: rAF is throttled, refusing to measure';

			return;
		}
		running = true;
		const samples: Sample[] = resume ? JSON.parse(sessionStorage.getItem(PROGRESS) ?? '[]') : [];
		try {
			await withSyntheticCapture(async () => {
				let warm: Mode | null = null;
				for (const step of plan.slice(samples.length)) {
					if (warm !== step.mode) {
						await setStress(step.mode === 'stress');
						status = `${step.mode}: warm-up`;
						for (const impl of IMPLS) await measure(impl);
						warm = step.mode;
					}
					status = `${step.mode}: rep ${step.rep + 1}/${REPS} ${step.impl}`;
					samples.push({ mode: step.mode, impl: step.impl, metrics: await measure(step.impl) });
					sessionStorage.setItem(PROGRESS, JSON.stringify(samples));
				}
			});
			sessionStorage.removeItem(PROGRESS);
			results = {
				userAgent: navigator.userAgent,
				dev: import.meta.env.DEV,
				reps: REPS,
				modes: summarise(samples)
			};
			Object.assign(window, { __benchResults: results });
			status = 'done';
		} catch (error) {
			status = `failed: ${String(error)}`;
		} finally {
			running = false;
		}
	};

	onMount(() => {
		if (new URLSearchParams(location.search).has('resume')) void run(true);
	});

	/** One spread drag or one fold series, for a DevTools performance trace around it. */
	const one = (impl: Impl, kind: 'spread' | 'fold', on: boolean) =>
		withSyntheticCapture(async () => {
			await setStress(on);
			await reset(impl);

			return kind === 'spread' ? measureSpread(impl) : measureFolds(impl);
		});

	$effect(() => {
		Object.assign(window, { __benchOne: one });
	});

	const LABELS: Record<string, string> = {
		burstMs: `Drag burst, ${BURST} moves (ms)`,
		burstPerMoveUs: 'Drag burst per move (µs)',
		burstLayoutMs: `Drag burst + forced layout, ${BURST} moves (ms)`,
		spreadFrames: `Spread drag: frames seen (${SPREAD_MOVES} moves / 1s)`,
		spreadGapMean: 'Spread drag: mean frame gap (ms)',
		spreadGapMax: 'Spread drag: max frame gap (ms)',
		spreadHandlerUs: 'Spread drag: handler per move (µs)',
		foldMs: 'Fold: median duration to fold end (ms)',
		foldGapMean: 'Fold: mean frame gap (ms)',
		foldGapMax: 'Fold: max frame gap (ms)',
		foldTimeouts: `Fold: folds without fold end (of ${FOLDS})`
	};
</script>

<svelte:head>
	<title>Benchmark · svelte-motion-panels</title>
</svelte:head>

{#snippet filler(label: string)}
	<div class="box">{label}</div>
{/snippet}

{#snippet wrapNest(depth: number)}
	{#if depth > 0}
		<Group orientation={depth % 2 ? 'vertical' : 'horizontal'}>
			<Panel size="30%" minSize="5%" class="nest">{depth}</Panel>
			<Separator class="grip" />
			<Panel class="nest">{@render wrapNest(depth - 1)}</Panel>
		</Group>
	{:else}
		{@render filler('leaf')}
	{/if}
{/snippet}

{#snippet nativeNest(depth: number)}
	{#if depth > 0}
		<NativeGroup orientation={depth % 2 ? 'vertical' : 'horizontal'}>
			<NativePanel size="30%" minSize="5%" class="nest">{depth}</NativePanel>
			<NativeSeparator class="grip" />
			<NativePanel class="nest">{@render nativeNest(depth - 1)}</NativePanel>
		</NativeGroup>
	{:else}
		{@render filler('leaf')}
	{/if}
{/snippet}

<main class="mx-auto w-full max-w-[1220px] px-5 pt-12 pb-24 min-[900px]:px-8 min-[900px]:pt-16">
	<h1
		class="text-[26px] leading-[1.15] font-medium tracking-[-0.025em] text-balance min-[900px]:text-[30px]"
	>
		Wrapper vs native runes: benchmark
	</h1>
	<p class="mt-4 max-w-[68ch] text-pretty text-muted-foreground">
		Wrapper ($lib over the motion-panels core) against the experimental native runes engine. See
		<a
			class="text-foreground underline decoration-accent/40 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
			href="https://github.com/mastermakrela/svelte-motion-panels/blob/main/BENCHMARK.md"
			rel="noreferrer"
			target="_blank">BENCHMARK.md</a
		> in the repo.
	</p>
	<p class="controls">
		<button
			type="button"
			onclick={() => run()}
			disabled={running}
			class="inline-flex h-10 items-center bg-accent px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-[color-mix(in_oklab,var(--accent),black_12%)] focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 dark:text-background"
			>Run</button
		>
		<label class="text-[14px] text-muted-foreground">
			<input type="checkbox" bind:checked={stress} disabled={running} />
			Layout stress ({DEPTH} nested groups per side)
		</label>
		<output data-testid="status" class="kicker text-muted-foreground">{status}</output>
	</p>

	<div class="stage">
		<section>
			<h2 class="kicker mb-2 text-muted-foreground">$lib (wrapper over motion-panels)</h2>
			<div class="frame" bind:this={roots.wrap}>
				<Group orientation="horizontal">
					<Panel
						bind:size={sidebar.wrap}
						bind:collapsed={collapsed.wrap}
						minSize={160}
						maxSize="45%"
						onFoldEnd={() => foldEnded('wrap')}
						class="panel"
					>
						{@render filler(`sidebar ${sidebar.wrap}px`)}
					</Panel>
					<Separator class="grip" />
					<Panel class="panel fill">
						{#if stress}{@render wrapNest(DEPTH)}{:else}{@render filler('fill')}{/if}
					</Panel>
					<Separator class="grip" />
					<Panel bind:size={end.wrap} class="panel">{@render filler('end')}</Panel>
				</Group>
			</div>
		</section>
		<section>
			<h2 class="kicker mb-2 text-muted-foreground">$lib/native (runes + Tween)</h2>
			<div class="frame" bind:this={roots.native}>
				<NativeGroup orientation="horizontal">
					<NativePanel
						bind:size={sidebar.native}
						bind:collapsed={collapsed.native}
						minSize={160}
						maxSize="45%"
						onFoldEnd={() => foldEnded('native')}
						class="panel"
					>
						{@render filler(`sidebar ${sidebar.native}px`)}
					</NativePanel>
					<NativeSeparator class="grip" />
					<NativePanel class="panel fill">
						{#if stress}{@render nativeNest(DEPTH)}{:else}{@render filler('fill')}{/if}
					</NativePanel>
					<NativeSeparator class="grip" />
					<NativePanel bind:size={end.native} class="panel">{@render filler('end')}</NativePanel>
				</NativeGroup>
			</div>
		</section>
	</div>

	{#if results}
		<p class="meta">
			{results.dev ? 'DEV build' : 'production build'} · median of {results.reps} reps · {results.userAgent}
		</p>
		{#each Object.entries(results.modes) as [mode, byImpl] (mode)}
			<table>
				<caption class="kicker pb-2.5 text-muted-foreground">{mode}</caption>
				<thead>
					<tr><th>Metric</th><th>wrapper</th><th>native</th></tr>
				</thead>
				<tbody>
					{#each Object.keys(byImpl.wrap) as key (key)}
						<tr>
							<td>{LABELS[key] ?? key}</td>
							<td>{byImpl.wrap[key]}</td>
							<td>{byImpl.native[key]}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		{/each}
	{/if}
</main>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 1.5rem;
		align-items: center;
		margin-block: 2rem 2.5rem;
	}

	.stage {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 640px), 1fr));
		gap: 2rem;
	}

	.frame {
		width: 100%;
		max-width: 900px;
		height: 320px;
		border: 1px solid var(--border);
		background: var(--well);
	}

	.frame :global(.panel),
	.frame :global(.nest) {
		background: var(--muted);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--muted-foreground);
		overflow: hidden;
	}

	.frame :global(.fill) {
		background: var(--background);
	}

	.frame :global(.grip) {
		background: color-mix(in oklab, var(--muted-foreground) 35%, transparent);
		flex-basis: 4px;
		min-width: 4px;
		min-height: 4px;
	}

	.box {
		padding: 0.5rem;
	}

	.meta {
		margin-top: 2.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--muted-foreground);
		overflow-wrap: anywhere;
	}

	table {
		border-collapse: collapse;
		margin-block: 1.5rem;
		font-size: 0.875rem;
	}

	caption {
		text-align: left;
	}

	th,
	td {
		border-bottom: 1px solid var(--border);
		padding: 0.4rem 0 0.4rem 1.5rem;
		text-align: right;
	}

	th {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		font-weight: 500;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--muted-foreground);
	}

	td {
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
	}

	td:first-child,
	th:first-child {
		padding-left: 0;
		text-align: left;
	}

	td:first-child {
		font-family: inherit;
	}
</style>
