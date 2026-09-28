/**
 * The upstream API reference, with the Svelte adapter's differences applied:
 * `size` and `collapsed` are bindable, content is a `children` snippet, there
 * are no motion poses, and the rest of the props reach a plain element.
 */
export const API: {
	name: string;
	note?: string;
	props: [string, string, string][];
}[] = [
	{
		name: 'Group',
		note: 'Renders a div; `class`, `style` and every other attribute reach it. `children` is a snippet.',
		props: [
			[
				'orientation',
				`'horizontal' | 'vertical'`,
				'Axis the panels split on, read once when the group mounts. Groups nest.'
			],
			[
				'transition',
				'Transition',
				'Timing of the reorder trip: panels rendered in a new order travel there. Defaults to the house curve.'
			],
			[
				'reorder',
				'boolean (default true)',
				'Pass false and reordered panels jump to their new place instead of travelling, with nothing measured on the way.'
			],
			[
				'order',
				'V[]',
				'The order the movable panels read in, one entry per panel that may move. A panel left out of it stays where it is, which is how the filling panel keeps its place.'
			],
			[
				'onOrderChange',
				'(order: V[]) => void',
				'The new order, after a drag or an arrow key carried a panel past its neighbour. Assign it to your $state and render the panels in that order, with a keyed each so the elements move instead of remounting, and they travel there.'
			]
		]
	},
	{
		name: 'Panel',
		note: 'Generic in its size: a number reports numbers, a percent string reports percent strings. On a sized panel `class` and `style` reach the content box; on the filling panel they reach the panel itself.',
		props: [
			[
				'size (bindable)',
				'number | `${number}%`',
				'Current size, in pixels or as a percentage of the group extent. A percentage follows the group as it resizes. With bind:size a drag writes the new size back. A plain size={240} is uncontrolled: a drag moves the panel and it keeps that size (React would snap back). To control or veto a change, bind a getter and setter, bind:size={() => size, (next) => { if (ok(next)) size = next }}, or pair a getter binding with onSizeChange. Omit it and the panel fills what is left.'
			],
			[
				'onSizeChange',
				'(size: S) => void',
				'Called with the new size as a drag or key press lands, in the form size was given. Optional next to bind:size; use it to react to a resize.'
			],
			[
				'collapsed (bindable)',
				'boolean',
				'Folds the panel to zero. Bound or passed, even a plain collapsed={false}, it also turns on drag below half of minSize and Enter on the separator, which write the new value back. Like size, a plain value is uncontrolled; to veto a change, use a function binding, bind:collapsed={() => collapsed, (next) => { ... }}.'
			],
			[
				'onCollapsedChange',
				'(collapsed: boolean) => void',
				'Called when a drag or Enter folds or unfolds the panel. Given on its own, it turns on drag-to-collapse and Enter too.'
			],
			[
				'onFoldEnd',
				'() => void',
				'The panel finished travelling to its size: a fold, an unfold, or the settle after a drag. Sequence work on it instead of guessing at a duration.'
			],
			[
				'defaultSize',
				'S',
				'Size a double-click on the separator resets to. Defaults to the size the panel mounted with.'
			],
			[
				'minSize / maxSize',
				'number | string',
				'Drag and keyboard bounds, in pixels or as a percentage of the group extent. Both clamp to the room the other panels leave, and max defaults to all of it.'
			],
			[
				'overshoot',
				'boolean | number (default 22)',
				'A drag that reaches minSize or maxSize keeps stretching a little past it, then springs back on release. A number sets how far, in pixels; false or 0 stops the drag dead at the bound.'
			],
			[
				'keepMounted',
				'boolean (default true)',
				'Keeps the content mounted once the panel has been open, clipped at zero while collapsed. Pass false to unmount it on every close: its in: transitions then play as the panel unfolds.'
			],
			[
				'transition',
				'Transition',
				'Timing of the fold, a motion Transition. Defaults to the house curve.'
			],
			[
				'value',
				'unknown',
				'This panel entry in the group order. Given one, a Handle inside the panel can carry it. Without one it never moves.'
			],
			[
				'pin',
				'boolean',
				'Filling panels only. Lays the content out once per fold instead of once per frame.'
			],
			['children', 'Snippet', 'The panel content.']
		]
	},
	{
		name: 'Handle',
		note: "The grip that moves a panel. Renders a button, so anything inside it is yours, and aria-label defaults to the panel value: 'Move files' for a panel valued files, or 'Move panel' where the value is not a string or a number. Put one anywhere inside a panel that carries a value: pressing it starts the reorder drag, and the arrow keys along the group axis move the panel a place at a time. Inside a panel with no value, or a group with no order, it renders nothing at all. While a panel is carried, its group takes no pointer events.",
		props: []
	},
	{
		name: 'Separator',
		note: "No props of its own; the rest reach the grip div, and aria-label defaults to 'Resize panel'. Optional: rendered between two panels it resizes the sized one and sits over its edge without taking flow space. It keeps aria-valuenow, aria-valuetext and aria-valuemin current, adds aria-valuemax once the panel has a maxSize, and marks itself with data-resizing and data-crossing.",
		props: []
	},
	{
		name: 'motion-panels',
		note: 'The core, for an adapter or for plain DOM. Nothing here imports Svelte; this adapter is built on exactly these calls.',
		props: [
			[
				'createPanelGroup',
				'(orientation?) => PanelGroup',
				'The shared registry: axes, the filling panel motion values, the sized panels by side.'
			],
			[
				'createPanel',
				'(group, options) => PanelController',
				'One panel state machine: bounds, drag, keyboard, folds, collapse.'
			],
			[
				'controller.attach',
				'(element) => () => void',
				'Reads the panel place in the group and registers it. Returns the detach.'
			],
			[
				'controller.sync',
				'(options) => void',
				'Feeds new options in. Changing the target starts a fold.'
			],
			[
				'controller.motion',
				'{ content, size }',
				'MotionValues for the panel and its content. Bind size to width or height.'
			],
			[
				'controller.bounds',
				'() => { min, max }',
				'The bounds in pixels, percentages resolved and clamped to the room the other panels leave.'
			],
			[
				'controller.target',
				'number',
				'The size the panel is settling on, 0 while collapsed. What a separator reports as aria-valuenow.'
			],
			[
				'controller.reset',
				'() => void',
				'Calls onSizeChange with defaultSize, or the size the panel mounted with. The double-click.'
			],
			[
				'controller.state',
				'{ bare, dragging, end, folding }',
				'Read it through subscribe. A frozen object, replaced only when it changes.'
			],
			[
				'controller.subscribe',
				'(listener) => () => void',
				'Fires when the state or the target changes. The Svelte adapter reads it with createSubscriber.'
			],
			[
				'controller.destroy',
				'() => void',
				'Drops the listeners and any body lock the panel still holds. Call it after the detach.'
			],
			[
				'controller.drag',
				'{ start, move, end, cancel }',
				'Pointer drag, in the units your gesture layer reports.'
			],
			[
				'controller.resizeByKey',
				'(event) => void',
				'Arrows, Shift, PageUp / PageDown, Home / End, Enter. Takes any KeyboardEvent.'
			],
			[
				'attachSeparator',
				'(element, group, own?) => () => void',
				'Wires a separator element: pointer drags and crossings, keyboard, double-click reset, live aria-value and data attributes. Without own it resizes the panel its slot sits beside. Returns the detach.'
			],
			[
				'reorder',
				'{ measure, play }',
				'The reorder trip for plain DOM: measure the group children before the order changes, play the slide after.'
			],
			[
				'timing / TRANSITION',
				'(transition?) => Transition',
				'The house curve, 250ms on a custom ease, or instant under prefers-reduced-motion.'
			],
			[
				'FILL_ATTRIBUTE / SEPARATOR_ATTRIBUTE',
				'string',
				'Mark the filling panel and a separator slot. Sized panels read the first one to find the edge they drag.'
			],
			[
				'edgeSize',
				'() => number',
				'Thickness of the drag area a bare panel puts on its edge: 8px for a mouse, 20px for a finger.'
			],
			[
				'coarsePointer / reducedMotion',
				'{ get, subscribe }',
				'The two media queries the panels watch, as stores you can read from a component.'
			],
			[
				'grips',
				'registry',
				'Rect-cached hit testing behind crossings, used by attachSeparator: register, at, mark, partners, state, invalidate, subscribe.'
			]
		]
	}
];
