<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export type ButtonProps = HTMLButtonAttributes & {
		size?: 'default' | 'sm' | 'icon-sm' | 'icon-xs';
		variant?: 'default' | 'outline' | 'ghost';
	};

	const BASE =
		'inline-flex shrink-0 items-center justify-center gap-1.5 border border-transparent text-xs font-semibold tracking-widest whitespace-nowrap uppercase transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-ring/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-pressed:bg-muted aria-pressed:text-foreground';

	const VARIANTS = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/85',
		ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
		outline: 'border-input bg-transparent hover:bg-muted hover:text-foreground'
	};

	const SIZES = {
		default: 'h-10 px-6',
		'icon-sm': 'size-9',
		'icon-xs': 'size-7',
		sm: 'h-9 px-4'
	};
</script>

<script lang="ts">
	let {
		children,
		class: className,
		size = 'default',
		type = 'button',
		variant = 'default',
		...rest
	}: ButtonProps = $props();
</script>

<button {...rest} {type} class={[BASE, VARIANTS[variant], SIZES[size], className]}>
	{@render children?.()}
</button>
