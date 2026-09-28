import type { Size } from 'motion-panels';

/** Breakpoint where a demo stage is about a third of the desktop one. */
export const COMPACT = 'max-width: 640px';

/** What every demo panel puts around its card. */
export const PANE = 'p-[3px]';

export const CARD = 'flex h-full w-full flex-col overflow-hidden border bg-card';

export const CARD_HEAD =
	'kicker flex h-8 flex-none items-center justify-between gap-2.5 whitespace-nowrap border-b px-2.5 text-muted-foreground';

export const SIZE_BADGE =
	'font-mono text-[10px] font-semibold normal-case tracking-normal tabular-nums text-muted-foreground';

/**
 * A 14px grip centred on the seam, with a line that shows on hover, focus,
 * a crossing and a drag. `relative z-10` lifts it over both panels: its slot
 * is zero wide, so the grip overhangs them.
 */
export const SEPARATOR =
	"relative z-10 flex items-center justify-center rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 after:bg-muted-foreground/45 after:opacity-0 after:transition after:duration-150 after:content-[''] hover:after:bg-muted-foreground hover:after:opacity-100 focus-visible:after:bg-foreground focus-visible:after:opacity-100 active:after:bg-foreground aria-[orientation=horizontal]:h-3.5 aria-[orientation=vertical]:w-3.5 aria-[orientation=horizontal]:after:h-0.5 aria-[orientation=horizontal]:after:w-[calc(100%-20px)] aria-[orientation=vertical]:after:h-[calc(100%-20px)] aria-[orientation=vertical]:after:w-0.5 data-crossing:after:bg-muted-foreground data-crossing:after:opacity-100 data-resizing:after:bg-foreground data-resizing:after:opacity-100";

export const FILES = ['+page.svelte', 'Group.svelte', 'Panel.svelte', 'Separator.svelte'];
export const SYMBOLS = ['Group', 'Panel', 'Separator', 'createPanel'];

export const SOURCE = [
	'<script lang="ts">',
	'  let width = $state(240)',
	'</script>',
	'',
	'<Group orientation="horizontal">',
	'  <Panel bind:size={width}>',
	'    <Files />',
	'  </Panel>',
	'  <Separator />',
	'  <Panel pin>',
	'    <Editor />',
	'  </Panel>',
	'</Group>'
];

export const OUTPUT = [
	'$ bun add svelte-motion-panels',
	'installed svelte-motion-panels',
	'done in 0.4s'
];

/** The size badge: pixels, a percentage as given, or the fold. */
export const px = (size: Size, collapsed?: boolean) =>
	collapsed ? 'collapsed' : typeof size === 'string' ? size : `${Math.round(size)}px`;
