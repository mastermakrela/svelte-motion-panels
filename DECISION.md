# Wrap the core, or rewrite with runes?

**Decision: wrap the published `motion-panels` core. Hand-roll only the drag-to-reorder gesture.**
The Svelte adapter lives in `src/lib/` and mirrors upstream `src/react/` file for file
(`Group`, `Panel`, `Separator`, `Slot`, `Handle`, `internal`), so the React docs map onto it
one-to-one and upstream fixes are easy to port.

## Prior art

Nobody has done this yet (checked 2026-09-27):

- npm has only the upstream package. `svelte-motion-panels`, `motion-panels-svelte` and
  `@motion-panels/svelte` are all unclaimed.
- The upstream repo has one fork with zero commits ahead, no issues, no PRs, discussions off.
- The only real port anywhere is Compose Multiplatform: <https://github.com/rock3r/compose-motion-panels>.
- Closest Svelte-native libraries: [paneforge](https://github.com/svecosystem/paneforge) (port of
  react-resizable-panels; collapse is instant, not animated), shadcn-svelte Resizable (wraps
  paneforge), [svelte-splitpanes](https://github.com/orefalo/svelte-splitpanes) (snapping is a jump).
  None animate fold, collapse or snap the way motion-panels does.

## Why wrap

1. **The core is genuinely framework-free.** The package root export (`motion-panels`) has no
   React in it at all. `react` is an optional peer, and the docs' "Core, without React" section
   says outright that it is "the whole surface an adapter for another framework has to cover".
   The author designed for exactly this.
2. **The hard part is in the core, and it is tested.** About 1,000 lines cover the things a
   rewrite would get subtly wrong: reciprocal bounds against the room the other panels leave,
   the overshoot curve at min/max, grip intersections where a horizontal and a vertical separator
   cross (both move together), body cursor lock with Escape to cancel, RTL, reduced motion,
   percent sizes that follow the group, `aria-value*` bookkeeping, keyboard stepping. Upstream
   ships ~650 lines of tests for it. A rewrite re-derives all of that with fresh bugs and then
   has to track upstream fixes by hand.
3. **API parity with the React adapter.** The adapter imports the published `motion-panels`
   core, not a vendored copy, and mirrors the React adapter's props and file layout, so
   upstream docs, options and fixes transfer directly. It ships as an independent package that
   depends on `motion-panels`, with attribution to its author. A runes rewrite would drift
   from the core's API and lose that parity.
4. **Performance is not the differentiator.** The core drives sizes through `MotionValue`s. The
   adapter binds those straight to `element.style` in an attachment (the same thing React's
   `motion.div` does), so a drag never touches Svelte state and never re-renders anything.
   The benchmark below measures this against an idiomatic runes engine.

## What is NOT a wrapper

Upstream's reorder drag (carrying a panel past its neighbour) comes from `motion/react`'s
`Reorder.Group` / `Reorder.Item` / `useDragControls`. Vanilla `motion` has no drag gesture, so
the Svelte adapter implements the carry itself: pointer capture on `Handle`, transform along
the group axis, swap when the centre crosses a sibling's midpoint, then the core's
`reorder.measure` / `reorder.play` FLIP for the siblings. This is the one place where the
Svelte version has its own gesture code rather than the core's.

## Deliberate Svelte-isms

- `size` and `collapsed` are `$bindable`. `bind:size` replaces React's `size` + `onSizeChange`
  pair; the callback still fires for consumers who want it. Consequence: a plain `size={240}`
  is uncontrolled (the panel keeps a dragged size where React would snap back), because Svelte
  cannot tell a bound prop from a plain one. To control or veto, use a function binding:
  `bind:size={() => size, (next) => { if (ok(next)) size = next }}`.
- No framer `initial` / `animate` / `exit` poses on content. Put Svelte `in:` / `out:`
  transitions on your own content instead.
- `children` is a snippet; `class` and `style` pass through to the root element.

## Costs of wrapping (honest list)

- `motion` (the hybrid `animate` engine) is a peer dependency. It is the bulk of the bundle;
  see BENCHMARK.md for bytes.
- The core's dev-only warnings ship in production for every consumer, because its `DEV` check is
  `typeof process === 'undefined' || NODE_ENV !== 'production'`, which is true in every browser.
  The demo site defines `process` in production builds to strip them. Worth an upstream issue.
- The core is `0.x`; its API can move. The adapter pins `^0.6.1`.

## Benchmark (summary; full method and tables in BENCHMARK.md)

A minimal runes engine (`src/lib/native/`, benchmark-only, not exported) was measured against
the wrapper on the same layout, production build, Apple M4 Pro, Chrome Canary, 120 Hz.

| Metric (median of 5)                         |    Wrapper (core + MotionValue) | Native runes (`$state` + `Tween`) |
| -------------------------------------------- | ------------------------------: | --------------------------------: |
| 2000 synthetic pointermoves, total           |                         14.8 ms |                           35.9 ms |
| same, with forced layout each move           |                         49.5 ms |                           74.0 ms |
| frame-paced drag, 60 moves over 1 s          | 121/121 frames, max gap 10.4 ms |   121/121 frames, max gap 10.3 ms |
| fold, time to fold end                       |                        253.6 ms |                          255.9 ms |
| 12 nested groups, main-thread time (1 trace) |                          130 ms |                            138 ms |
| bundle over the Svelte runtime, gzip         |                        +36.6 kB |                          +10.8 kB |

Reading: per pointer event the wrapper is 2 to 4 times cheaper than idiomatic runes, because
it writes MotionValues straight to `element.style` and never touches the reactive graph. At
real drag rates and in folds the two are indistinguishable. The one clear win of a rewrite is
about 26 kB gzip, almost all of it Motion's `animate` engine, and the native engine that
achieves it lacks overshoot, grip intersections, reorder, pinning, RTL, reset and cancel. So
the rewrite buys bundle size, not UX or speed, and diverges from the core's API. Wrapping stands.
