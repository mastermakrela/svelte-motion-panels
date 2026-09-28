# Benchmark: wrap the core vs. rewrite natively in runes

## Why

`svelte-motion-panels` wraps the framework-agnostic `motion-panels` core. The core keeps sizes in Motion `MotionValue`s, writes them straight to inline styles (`bindStyle` in `src/lib/internal.ts`), and animates folds with Motion's `animate`. The other option would be to rewrite the engine in Svelte 5 runes, with sizes held in `$state` / `Tween` and written through `style:` directives. The question is whether that rewrite would bring measurably better performance or UX, or a smaller bundle.

To find out, `src/lib/native/` contains a minimal native engine. It is experimental, used only by the benchmark, and not exported from `$lib/index.ts`. `src/routes/bench` runs both implementations side by side with the same config.

## Setup

- Machine: Apple M4 Pro, 24 GB, macOS 27.2 (26B5091g), 120 Hz display (rAF gap is 8.33 ms)
- Browser: Chrome Canary 156.0.8075.0 (UA `Chrome/156.0.0.0`), driven via chrome-devtools MCP, window 1600×1000. Each frame is 768 px wide.
- Versions: svelte 5.57.1, motion 13.4.4, motion-panels 0.6.1, vite 8.3.1
- Config on both sides: horizontal group with a sidebar (`280` px, `minSize 160`, `maxSize "45%"`, bound `size` + `collapsed`), a separator, the fill, a separator, and an end panel (`200` px)
- Native engine: `Tween` from `svelte/motion` with the house curve (250 ms, `cubic-bezier(0.32, 0.72, 0, 1)` solved in JS). `prefersReducedMotion` makes it instant. I picked `Tween` over WAAPI because a Tween keeps the animated size in Svelte state, so it goes through the same reactive graph as a drag. That is the "idiomatic runes" path being measured. WAAPI would skip Svelte entirely.

## What was measured

Everything comes from `src/routes/bench/+page.svelte` (the **Run** button). Each value is the **median of 5 reps**, taken after a discarded warm-up rep per mode. Which implementation goes first alternates per rep, and sizes are reset and allowed to settle between measurements.

- **Drag burst**: one `pointerdown` on the first separator, then 2000 synthetic `pointermove`s along a triangle wave of ±60 px (220–340 px, so the size never clamps into a no-op). There is a `flushSync()` after every event so both sides do one DOM write per move. Without it the burst would only show that Svelte batches. The time is total `performance.now()` wall time. **+ forced layout** reads the fill's `offsetWidth` after each move, so every move also pays for style recalc and layout.
- **Spread drag**: 60 moves paced by rAF over 1 s, which is what a real, coalesced drag looks like. Reports frames seen, mean and max rAF gap, and the mean handler time per move.
- **Fold**: toggles `collapsed` 20 times and waits for `onFoldEnd` each time (1.5 s timeout). Reports the median time to fold end and the mean and max rAF gap during the folds.
- **Layout stress**: the same set of measurements with 12 nested groups inside each fill. Groups alternate between horizontal and vertical, and each level has a `30%` panel plus separator. Percent sizes re-resolve on every ancestor resize: the core does it through `ResizeObserver` → `refit` → MotionValue jump, the native engine through `bind:clientWidth` → `$state` → `$derived` → effect → `Tween.set`.
- **Bundle size**: `bun run bench:size` (`scripts/bench-size.ts`) runs four Vite library builds, each minified with the Svelte runtime included. They are a trivial baseline component, the wrapper trio, the native trio, and `motion` (`animate` + `motionValue`) plus the `motion-panels` core on their own. The builds use the same `process.env.NODE_ENV` define as `vite.config.ts`.

## Results

### Bundle size

| entry                                       |  minified |     gzip |   brotli | gzip Δ vs baseline |
| ------------------------------------------- | --------: | -------: | -------: | -----------------: |
| baseline (Svelte runtime + a counter)       |  34.95 kB | 11.05 kB |  9.90 kB |                  — |
| wrapper (`$lib` + motion-panels + motion)   | 161.56 kB | 47.66 kB | 42.52 kB |      **+36.61 kB** |
| native (`$lib/native` + `svelte/motion`)    |  72.49 kB | 21.83 kB | 19.59 kB |      **+10.79 kB** |
| `motion` alone (`animate`, `motionValue`)   |  78.45 kB | 23.00 kB | 20.59 kB |                  — |
| core alone (motion-panels exports + motion) |  89.92 kB | 26.89 kB | 24.07 kB |                  — |

The bundle table was re-measured on the final code (2026-09-28). The runtime tables below predate the later review fixes to `Panel.svelte`, `Separator.svelte` and `Slot.svelte`; those only added subscriptions that fire on state changes, and the per-pointermove path (MotionValue → `bindStyle`) is unchanged. They also predate the restyle of the `/bench` page, which changed styling only; the measurement code is unchanged. Most of the ~26 kB gzip gap is Motion's hybrid `animate` engine (23 kB gzip on its own).

### Drag

Production build (`bun run build && bunx vite preview`), **run A**. Load average was not recorded during this run; it had no dropped frames:

| metric                              | normal: wrapper | normal: native | stress: wrapper | stress: native |
| ----------------------------------- | --------------: | -------------: | --------------: | -------------: |
| burst, 2000 moves (ms)              |            14.8 |           35.9 |            13.3 |           32.1 |
| burst per move (µs)                 |             7.4 |          17.95 |            6.65 |          16.05 |
| burst + forced layout (ms)          |            49.5 |           74.0 |           116.2 |          119.9 |
| spread: frames seen (60 moves / 1s) |             121 |            121 |             121 |            121 |
| spread: mean / max frame gap (ms)   |     8.33 / 10.4 |    8.33 / 10.3 |     8.33 / 10.3 |    8.33 / 10.3 |
| spread: handler per move (µs)\*     |             143 |            352 |             133 |            257 |

Production build, **run B**. This rerun happened while the machine was under background load (load average ~8: Time Machine `backupd`, Spotlight, XProtect, each ~80% CPU), and it shows up as dropped frames on **both** sides:

| metric                            | normal: wrapper | normal: native | stress: wrapper | stress: native |
| --------------------------------- | --------------: | -------------: | --------------: | -------------: |
| burst, 2000 moves (ms)            |            39.5 |          159.0 |            46.9 |          153.2 |
| burst + forced layout (ms)        |           326.7 |          592.8 |           760.7 |         1044.0 |
| spread: frames seen               |             112 |            108 |             114 |            116 |
| spread: mean / max frame gap (ms) |     9.02 / 17.0 |    9.34 / 17.3 |     8.92 / 17.9 |    8.69 / 17.5 |
| spread: handler per move (µs)\*   |             352 |            568 |             312 |            697 |

Dev server (`vite dev`, the shared instance on :5174):

| metric                            | normal: wrapper | normal: native | stress: wrapper | stress: native |
| --------------------------------- | --------------: | -------------: | --------------: | -------------: |
| burst, 2000 moves (ms)            |             9.1 |          122.7 |            10.9 |          121.3 |
| burst + forced layout (ms)        |            42.6 |          143.2 |           117.3 |          198.2 |
| spread: frames seen               |             121 |            121 |             121 |            121 |
| spread: mean / max frame gap (ms) |     8.33 / 10.3 |    8.33 / 10.3 |     8.33 / 10.2 |    8.33 / 10.2 |
| spread: handler per move (µs)\*   |              75 |            258 |             178 |            407 |

\* Pages that are not cross-origin isolated get `performance.now()` coarsened to 100 µs, so these per-move values are averages of quantised readings. Treat them as rough. The burst totals, which are tens of ms, are not affected.

### Fold

| build / mode          | wrapper: median to fold end | native: median to fold end | wrapper: gap mean / max | native: gap mean / max | missed fold ends |
| --------------------- | --------------------------: | -------------------------: | ----------------------: | ---------------------: | ---------------: |
| prod A, normal        |                    253.6 ms |                   255.9 ms |          8.34 / 10.3 ms |         8.34 / 10.4 ms |            0 / 0 |
| prod A, stress        |                    252.7 ms |                  257.75 ms |          8.34 / 10.3 ms |         8.34 / 10.3 ms |            0 / 0 |
| prod B (load), normal |                   257.85 ms |                  257.05 ms |          8.41 / 32.9 ms |         8.39 / 24.7 ms |            0 / 0 |
| prod B (load), stress |                   258.45 ms |                  257.95 ms |           8.6 / 33.4 ms |         8.64 / 33.6 ms |            0 / 0 |
| dev, normal           |                    250.5 ms |                   257.6 ms |          8.34 / 10.3 ms |         8.33 / 10.4 ms |            0 / 0 |
| dev, stress           |                   252.15 ms |                  257.75 ms |          8.34 / 10.4 ms |         8.33 / 10.4 ms |            0 / 0 |

### Nested stress: main-thread trace

What the stress rows above do and do not show: `ResizeObserver` callbacks are delivered at the next rendering opportunity, not on a forced layout. So in both stress bursts (with and without `offsetWidth`), the 12 nested percent panels are never re-resolved. Their `ResizeObserver` → `refit` / `bind:clientWidth` → reactive propagation does not run, and `burst + forced layout` in stress measures relayout of more nodes, nothing more. `spread: handler per move` does not include it either, because the RO callbacks run outside the event dispatch. Nested propagation is exercised only by the frame-paced spread drag (no dropped frames on either side in runs A and dev) and by this trace:

This is one DevTools performance trace per side, taken on the production build: one stress-mode spread drag including its reset, a window of about 1.8 s. Main-thread busy time was **130 ms (wrapper)** vs **138 ms (native)**. The wrapper did 383 style recalcs and 384 layouts; the native side did 307 and 307. It is a single sample, and it covers the reset's fold animation as well.

## Caveats

- **The native engine is a floor, not a peer.** It skips a lot of what the wrapper's `Panel.svelte` and the core do: overshoot, bare-edge grips, grip intersections / multi-panel drags, reorder, fill `pin` / anchoring during folds, RTL, `defaultSize` / double-click reset, Escape-to-cancel, and `keepMounted={false}` unmounting. It also skips the core's `sync` on every prop change and its `available()` room calculation (which calls `getComputedStyle`). Any gap here is an upper bound on what a rewrite of the full feature set would save.
- **An asymmetry both ways:** the native engine writes the bound `size` on **every** move, which is the idiomatic runes way to do it. The wrapper reports `onSizeChange` / `size` only on drag end. So native runs the parent's `$state` update per move and the wrapper does not. On the other side, the wrapper computes more per move (overshoot curve, grips bookkeeping).
- **Layout differs slightly.** The wrapper's separator slot is 0 px wide and its 4 px grip overlays the neighbouring panels. The native separator takes up 4 px of flex space, so the native fill is 8 px narrower.
- **Synthetic events.** The events are `PointerEvent`s built in JS with `pointerId: 1`. Chrome throws `NotFoundError` from `setPointerCapture` for them because no real pointer is active, so during a run the harness stubs `setPointerCapture` / `releasePointerCapture` on `HTMLElement.prototype` for both sides alike. Only the happy path is tested: no pointer cancellation, no touch.
- **Tween vs Motion `animate`.** Both run on the main thread through rAF. Motion animates a MotionValue here, not an element, so there is no WAAPI offload. Tween resolves on the first frame after 250 ms has elapsed, and Motion fires `animationComplete` on its own frame loop, which explains the ~3–5 ms difference in "time to fold end". Neither reached a compositor-only path.
- **One machine, one browser, one display (120 Hz), in a noisy environment.** Two other agents were editing and serving the repo at the same time. Run B shows how much background load moves the absolute numbers. Compare the two columns within a run, not across runs. Firefox, Safari and low-end or mobile CPUs were not measured, and a 4× CPU throttle would push the per-move costs toward the frame budget.
- **Dev mode inflates the Svelte side much more** (13× burst gap vs 2.4× in prod), because runes carry dev-only bookkeeping (ownership/tagging/`$inspect` plumbing). Base any conclusion on the production numbers.

## Interpretation

Per event, the native runes path costs more than the wrapper's direct MotionValue writes: 2.4–4× per move across the two production runs (≈18–80 µs vs ≈7–20 µs per move on an M4 Pro, depending on background load). Both are far below a 120 Hz frame budget (8.3 ms). In the frame-paced drag and in folds, the two are indistinguishable: 121/121 frames, identical max gaps, fold end within ~5 ms. Once layout is forced, layout dominates and the gap shrinks (to ~3% in the nested case). The nested reactive propagation itself only showed up as 130 vs 138 ms of main-thread time in a single trace. The clear, measurable win of a native rewrite is bundle size: about 26 kB gzip less, mostly Motion's `animate`. That would have to be weighed against the features the floor engine above does not implement.

## How to reproduce

```sh
bun install
bun run bench:size                    # bundle table
bun run build && bunx vite preview    # production numbers (the dev server works too, but inflates Svelte's cost)
# open http://localhost:4173/bench and press Run (≈3.5 min), or open /bench?resume:
# it auto-runs, and after a full page reload it resumes from sessionStorage.
# Results: the tables on the page, and window.__benchResults as JSON.
# window.__benchOne('wrap' | 'native', 'spread' | 'fold', stress) runs one series for a DevTools trace.
```

Keep the bench tab in the foreground (background tabs get throttled rAF, and the harness refuses to start when hidden), and keep the machine idle.
