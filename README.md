# svelte-motion-panels

Resizable panels for Svelte 5, animated with [Motion](https://motion.dev). Think `react-resizable-panels`, except the folding, collapsing and snapping are real animations. Unstyled, written with runes, and with no layout library underneath.

Built on [motion-panels](https://motion-panels.letstri.dev) by [Valerii Strilets](https://github.com/letstri). Demos and docs: <https://motion-panels.mastermakrela.com>.

This is an independent Svelte adapter over the [`motion-panels`](https://github.com/letstri/motion-panels) core: the framework-agnostic resizing engine and its [docs](https://motion-panels.letstri.dev) are the work of Valerii Strilets. The core does bounds, drags, keyboard, folds, crossings and RTL; this package binds it to Svelte components. It is not affiliated with or endorsed by the upstream project.

## Demo and docs

Live site: <https://motion-panels.mastermakrela.com>, a Svelte port of every demo and doc section from the upstream [motion-panels docs](https://motion-panels.letstri.dev). Each section shows its demo's own source.

## Install

```sh
bun add svelte-motion-panels motion
# or
npm install svelte-motion-panels motion
pnpm add svelte-motion-panels motion
```

Peer dependencies: `svelte ^5.40` and `motion >=12`. The `motion-panels` core is a regular dependency and comes along automatically.

## Quick start

A group is a flex container. A panel with a `size` holds it; the one panel without a `size` fills what is left.

```svelte
<script lang="ts">
	import { Group, Panel, Separator } from 'svelte-motion-panels';

	let width = $state(280);
</script>

<Group orientation="horizontal" style="height: 100vh">
	<Panel bind:size={width} minSize={200} maxSize={480}>
		<Sidebar />
	</Panel>
	<Separator aria-label="Resize sidebar" />
	<Panel>
		<Content />
	</Panel>
</Group>
```

`bind:size` writes the new size back as a drag or key press lands; `onSizeChange` fires too, if you would rather react than bind. The `Separator` is optional: without one, a sized panel is still draggable by the edge facing the filling panel. With one you also get a visible grip, keyboard control and double-click reset.

### Percent sizes

Every size, bound or min/max, is pixels or a percentage of the group. A percentage follows the group as it resizes, and `bind:size` reports back in the form it was given.

```svelte
<script lang="ts">
	let left = $state<`${number}%`>('25%');
</script>

<Panel bind:size={left} minSize="14%" maxSize="35%">…</Panel>
```

### Collapsing

`collapsed` folds a panel to zero. Binding it (or passing `onCollapsedChange`) also turns on drag-to-collapse (drag below half of `minSize`) and Enter on the focused separator, both of which write the new value back.

```svelte
<script lang="ts">
	import { fly } from 'svelte/transition';

	let width = $state(260);
	let collapsed = $state(false);
</script>

<button onclick={() => (collapsed = !collapsed)}>Toggle</button>

<Group orientation="horizontal">
	<Panel
		bind:size={width}
		bind:collapsed
		onCollapsedChange={(next) => console.log('collapsed', next)}
		onFoldEnd={() => console.log('fold settled')}
		keepMounted={false}
		minSize="22%"
		maxSize="52%"
		transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
	>
		<div in:fly|global={{ x: -24 }}>…</div>
	</Panel>
	<Separator />
	<Panel>…</Panel>
</Group>
```

`transition` times the panel edge; the content brings its own Svelte transition. With `keepMounted={false}` the content unmounts once the fold closes and mounts again as it opens, which is when its `in:` plays. With the default `keepMounted` the content stays mounted, clipped at zero, and nothing enters.

### Pinning

While a neighbour folds, the filling panel's content reflows on every frame. `pin` lays it out once per fold instead, which matters for long text, editors and virtualised tables.

```svelte
<Panel pin>
	<LongText />
</Panel>
```

### Nesting

Groups nest: put a `Group` inside a `Panel`. Where a horizontal and a vertical separator meet, grabbing the crossing drags both.

```svelte
<Group orientation="horizontal">
	<Panel bind:size={sidebar} minSize="18%" maxSize="45%">…</Panel>
	<Separator />
	<Panel>
		<Group orientation="vertical">
			<Panel>…</Panel>
			<Separator />
			<Panel bind:size={terminal} minSize={60} maxSize={180}>…</Panel>
		</Group>
	</Panel>
</Group>
```

### Both edges

A group holds at most one sized panel on each side of the filling panel, so a sidebar on each edge is two sized panels around the fill.

```svelte
<Group orientation="horizontal">
	<Panel bind:size={left} minSize="14%" maxSize="35%">…</Panel>
	<Panel>…</Panel>
	<Panel bind:size={right} minSize="14%" maxSize="35%">…</Panel>
</Group>
```

### Reordering

Give the group the `order` it reads in and an `onOrderChange` callback, give each movable panel a `value`, and put a `Handle` inside it. Render the whole row, separators included, with one keyed `{#each}`: a reorder then swaps two keys, and Svelte moves the existing elements instead of remounting them, which is what the trip animates.

```svelte
<script lang="ts">
	import { Group, Handle, Panel, Separator } from 'svelte-motion-panels';

	let order = $state(['files', 'outline']);
	let files = $state(180);
	let outline = $state(130);

	const row = $derived([order[0], 'seam-a', 'workspace', 'seam-b', order[1]]);
</script>

<Group {order} onOrderChange={(next) => (order = next)}>
	{#each row as item (item)}
		{#if item === 'workspace'}
			<Panel>Workspace</Panel>
		{:else if item.startsWith('seam')}
			<Separator />
		{:else if item === 'files'}
			<Panel value="files" bind:size={files} minSize={96} maxSize="40%">
				<Handle>⋮</Handle> Files
			</Panel>
		{:else}
			<Panel value="outline" bind:size={outline} minSize={96} maxSize="40%">
				<Handle>⋮</Handle> Outline
			</Panel>
		{/if}
	{/each}
</Group>
```

The filling panel carries no `value`, so it never moves, and a `Handle` inside it renders nothing. Handles are buttons: focus one and the arrow keys along the group axis move the panel a place at a time. Pass `reorder={false}` to make panels jump instead of travel.

### Styling the separator

Nothing ships styled. A separator is a `[role='separator']` div with `aria-orientation`, centred on the seam and taking no space in the flow. It carries `data-crossing` while the pointer hovers a crossing, and `data-resizing` from press to release. Its slot is zero wide, so give the grip `position: relative` and a `z-index` to paint it over both panels. Classes land on the grip inside the adapter's markup, so style them from a global stylesheet or `:global`.

```css
[role='separator'] {
	position: relative; /* its slot is zero wide: lift the grip over both panels */
	z-index: 1;
}

[role='separator'][aria-orientation='vertical'] {
	width: 14px;
}

[role='separator']::after {
	background: var(--border);
	content: '';
}

[role='separator']:hover::after,
[role='separator'][data-crossing]::after {
	background: var(--muted-foreground);
}

[role='separator'][data-resizing]::after {
	background: var(--primary);
}

/* A sized panel with no Separator renders an invisible edge grip; it is still a tab stop. */
[role='separator'][data-motion-panels-edge]::after {
	display: none;
}

[role='separator'][data-motion-panels-edge]:focus-visible {
	outline: 2px solid var(--ring);
	outline-offset: -2px;
}
```

The demo site's Install section has a copyable styled separator (a hairline plus a grip box, all pseudo-elements).

### The core, without components

`motion-panels` is framework-free, and everything the components do is available from it directly. A whole split, wired in one attachment:

```svelte
<script lang="ts">
	import { attachSeparator, createPanel, createPanelGroup, FILL_ATTRIBUTE } from 'motion-panels';
	import type { Attachment } from 'svelte/attachments';

	const split: Attachment<HTMLElement> = (root) => {
		const group = createPanelGroup('horizontal');
		const panel = document.createElement('div');
		const content = document.createElement('div');
		const grip = document.createElement('div');
		const fill = document.createElement('div');

		fill.setAttribute(FILL_ATTRIBUTE, '');
		Object.assign(root.style, { display: 'flex', flexDirection: group.axes.direction });
		Object.assign(panel.style, { display: 'flex', flexShrink: '0', position: 'relative' });
		Object.assign(fill.style, { flex: '1', minWidth: '0' });
		Object.assign(grip.style, {
			position: 'absolute',
			insetBlock: '0',
			insetInlineEnd: '-7px',
			width: '14px',
			touchAction: 'none'
		});
		grip.role = 'separator';
		grip.tabIndex = 0;
		grip.ariaOrientation = group.axes.separator;
		panel.append(content, grip);
		root.append(panel, fill);

		const base = {
			minSize: '20%' as const,
			maxSize: '55%' as const,
			onSizeChange: (size: number) => controller.sync({ ...base, size })
		};
		const controller = createPanel(group, { ...base, size: 240 });
		const detach = controller.attach(panel);
		const detachGrip = attachSeparator(grip, group, controller);
		const stopSize = controller.motion.size.on('change', (value) => {
			panel.style.width = `${Math.max(0, value)}px`;
		});
		const stopContent = controller.motion.content.on('change', (value) => {
			content.style.width = `${value}px`;
		});
		panel.style.width = content.style.width = '240px';

		return () => {
			detachGrip();
			stopContent();
			stopSize();
			detach();
			controller.destroy();
			root.replaceChildren();
		};
	};
</script>

<div style="height: 300px" {@attach split}></div>
```

## Differences from the React adapter

- **`size` and `collapsed` are bindable.** `bind:size` replaces React's `size` + `onSizeChange` pair; the callbacks still fire if you pass them. Because they are bindable, a plain `size={240}` acts uncontrolled: the panel keeps the size a drag gave it, where React would snap back to `240`. To control or veto changes, use a function binding, `bind:size={() => size, (next) => { if (ok(next)) size = next }}` (or a getter binding next to `onSizeChange`); the same goes for `collapsed`. A plain `collapsed={false}` also counts as given, so it makes the panel collapsible by drag and Enter.
- **No framer `initial` / `animate` / `exit` poses.** Put Svelte `in:` / `out:` transitions on your own content, with `keepMounted={false}` so it remounts on unfold.
- **Sized vs. filling is decided at mount.** React remounts a panel that gains or loses `size`; here, wrap the `Panel` in `{#key}` if it has to flip.
- **Content is a `children` snippet**, and `class`, `style` and every other attribute pass through to the rendered element.
- **The reorder drag lives in the adapter.** Upstream uses `motion/react`'s `Reorder` and drag controls; vanilla `motion` has no drag gesture, so `Handle` does the pointer capture and swap itself, and the core's `reorder.measure` / `reorder.play` animates the siblings.

## API

### `Group`

Renders a div; `class`, `style` and every other attribute reach it. `children` is a snippet.

| Prop            | Type                         | Description                                                                                                                                                                                               |
| --------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation`   | `'horizontal' \| 'vertical'` | Axis the panels split on, read once when the group mounts. Groups nest.                                                                                                                                   |
| `transition`    | `Transition`                 | Timing of the reorder trip: panels rendered in a new order travel there. Defaults to the house curve.                                                                                                     |
| `reorder`       | `boolean` (default `true`)   | Pass `false` and reordered panels jump to their new place instead of travelling, with nothing measured on the way.                                                                                        |
| `order`         | `V[]`                        | The order the movable panels read in, one entry per panel that may move. A panel left out of it stays where it is, which is how the filling panel keeps its place.                                        |
| `onOrderChange` | `(order: V[]) => void`       | The new order, after a drag or an arrow key carried a panel past its neighbour. Assign it to your `$state` and render the panels in that order with a keyed `{#each}`, so the elements move, not remount. |

### `Panel`

Generic in its size: a number reports numbers, a percent string reports percent strings. On a sized panel `class` and `style` reach the content box; on the filling panel they reach the panel itself.

| Prop                   | Type                               | Description                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `size` (bindable)      | `number` or `` `${number}%` ``     | Current size, in pixels or as a percentage of the group extent. With `bind:size` a drag writes the new size back. A plain `size={240}` is uncontrolled: a drag moves the panel and it keeps that size. To control or veto a change, bind a getter and setter: `bind:size={() => size, (next) => { if (ok(next)) size = next }}`. Omit it and the panel fills what is left. |
| `onSizeChange`         | `(size: S) => void`                | Called with the new size as a drag or key press lands, in the form `size` was given.                                                                                                                                                                                                                                                                                       |
| `collapsed` (bindable) | `boolean`                          | Folds the panel to zero. Bound or passed, even a plain `collapsed={false}`, it also turns on drag below half of `minSize` and Enter on the separator, which write the new value back. Like `size`, a plain value is uncontrolled; to veto, use a function binding `bind:collapsed={() => collapsed, (next) => { ... }}`.                                                   |
| `onCollapsedChange`    | `(collapsed: boolean) => void`     | Called when a drag or Enter folds or unfolds the panel. Given on its own, it turns on drag-to-collapse and Enter too.                                                                                                                                                                                                                                                      |
| `onFoldEnd`            | `() => void`                       | The panel finished travelling to its size: a fold, an unfold, or the settle after a drag.                                                                                                                                                                                                                                                                                  |
| `defaultSize`          | `S`                                | Size a double-click on the separator resets to. Defaults to the size the panel mounted with.                                                                                                                                                                                                                                                                               |
| `minSize` / `maxSize`  | `number \| string`                 | Drag and keyboard bounds, in pixels or as a percentage of the group extent. Both clamp to the room the other panels leave; max defaults to all of it.                                                                                                                                                                                                                      |
| `overshoot`            | `boolean \| number` (default `22`) | A drag that reaches a bound stretches a little past it, then springs back on release. A number sets how far, in pixels; `false` or `0` stops the drag dead at the bound.                                                                                                                                                                                                   |
| `keepMounted`          | `boolean` (default `true`)         | Keeps the content mounted once the panel has been open, clipped at zero while collapsed. Pass `false` to unmount it on every close: its `in:` transitions then play as it unfolds.                                                                                                                                                                                         |
| `transition`           | `Transition`                       | Timing of the fold, a Motion `Transition`. Defaults to the house curve.                                                                                                                                                                                                                                                                                                    |
| `value`                | `unknown`                          | This panel's entry in the group `order`. Given one, a `Handle` inside the panel can carry it. Without one it never moves.                                                                                                                                                                                                                                                  |
| `pin`                  | `boolean`                          | Filling panel only. Lays the content out once per fold instead of once per frame.                                                                                                                                                                                                                                                                                          |
| `children`             | `Snippet`                          | The panel content.                                                                                                                                                                                                                                                                                                                                                         |

### `Separator`

No props of its own; everything else reaches the grip div, and `aria-label` defaults to `'Resize panel'`. Rendered between two panels, it resizes the sized one and sits over its edge without taking flow space. It keeps `aria-valuenow`, `aria-valuetext` and `aria-valuemin` current, adds `aria-valuemax` once the panel has a `maxSize`, and marks itself with `data-resizing` and `data-crossing`.

### `Handle`

The grip that moves a panel. Renders a `<button>` (button attributes pass through), so anything inside it is yours. `aria-label` defaults to the panel value: `'Move files'` for a panel valued `files`, or `'Move panel'` where the value is not a string or a number. Put one anywhere inside a panel that carries a `value`: pressing it starts the reorder drag, and the arrow keys along the group axis move the panel a place at a time. Inside a panel with no value, or a group with no `order`, it renders nothing. While a panel is carried, its group takes no pointer events.

### Types

`GroupProps`, `PanelProps`, `SizedPanelProps`, `FillPanelProps`, `SeparatorProps` and `HandleProps`, plus `Orientation` and `Size` re-exported from the core.

### `motion-panels` core

`createPanelGroup`, `createPanel` (a controller with `attach`, `sync`, `motion`, `bounds`, `target`, `reset`, `state`, `subscribe`, `destroy`, `drag` and `resizeByKey`), `attachSeparator`, `reorder`, `timing` / `TRANSITION`, `FILL_ATTRIBUTE` / `SEPARATOR_ATTRIBUTE`, `edgeSize`, `coarsePointer` / `reducedMotion` and `grips`. None of it imports Svelte; this adapter is built on exactly those calls. Signatures are in the demo site's API section and the [upstream docs](https://motion-panels.letstri.dev).

## Keyboard

| Key                     | Does                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| Arrows (on a separator) | Grow or shrink by 10px, along the group axis                      |
| Shift + arrows          | The same, by 50px                                                 |
| Page Up / Page Down     | The same, by 50px, without a modifier                             |
| Home / End              | Jump to `minSize` or `maxSize`                                    |
| Enter                   | Toggle collapsed (needs `bind:collapsed` or `onCollapsedChange`)  |
| Escape (while dragging) | Cancel a separator or edge drag; a reorder carry settles in place |
| Double-click            | Reset to `defaultSize`, or to the size the panel mounted with     |
| Arrows (on a `Handle`)  | Move the panel one place along the group axis                     |

## Why a wrapper, and what it costs

- [DECISION.md](./DECISION.md): why wrap the core instead of rewriting it in runes.
- [BENCHMARK.md](./BENCHMARK.md): the wrapper against a minimal runes engine. Per pointer event the wrapper is 2–4× cheaper; frame-paced drags and folds tie; a rewrite would save about 26 kB gzip, mostly Motion's `animate`.

## Development

```sh
bun install
bun run dev        # demo site with HMR
bun run check      # svelte-check
bun run test       # vitest, single run
bun run lint       # prettier --check + eslint
bun run build      # demo site into build/, then the package
bun run package    # svelte-package + publint into dist/
bun run bench:size # bundle sizes from BENCHMARK.md
```

The library is `src/lib/`; the demo site is `src/routes/` plus `src/demos/`. The deployed site lives at the custom domain <https://motion-panels.mastermakrela.com>, served from `/`, so a local production build needs no extra setup:

```sh
bun run build && bun run preview
```

`.github/workflows/pages.yml` runs check, test and build on every push to `main` and deploys the site to GitHub Pages. A fork hosting the site under a sub-path (say `https://<user>.github.io/<repo>/`) can set `BASE_PATH=/<repo>` for both build and preview; `vite.config.ts` reads it as `paths.base`.

### Releasing

1. Bump `version` in `package.json` and commit.
2. Tag and push: `git tag vX.Y.Z && git push --tags`.

`.github/workflows/publish.yml` checks that the tag matches the `package.json` version, runs lint, check and test, and publishes to npm with provenance through npm trusted publishing (OIDC, no token).

## Credits

- **The engine.** Everything that resizes, folds, snaps and reorders comes from the [`motion-panels`](https://github.com/letstri/motion-panels) core by [Valerii Strilets](https://github.com/letstri), MIT licensed. This package depends on the published core rather than a vendored copy. Docs and demos of the original: <https://motion-panels.letstri.dev>.
- **The API.** Props, names and the file layout of `src/lib/` (`Group`, `Panel`, `Separator`, `Slot`, `Handle`, `internal`) intentionally mirror upstream's React adapter in `src/react/`, so the upstream docs, options and fixes carry over to this package.
- **The demo site.** Its sections, demos and prose follow the original motion-panels site, ported to Svelte.

## License

MIT © Krzysztof Kostrzewa. The `motion-panels` core is MIT © Valerii Strilets, and the documentation site content adapted from the motion-panels docs keeps the upstream MIT notice; both notices are in [LICENSE](./LICENSE).
