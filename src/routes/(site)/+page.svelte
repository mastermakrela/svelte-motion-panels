<script lang="ts">
	import Hero from './Hero.svelte';
	import Api from './sections/Api.svelte';
	import BothEdges from './sections/BothEdges.svelte';
	import Collapsing from './sections/Collapsing.svelte';
	import Core from './sections/Core.svelte';
	import Install from './sections/Install.svelte';
	import Nesting from './sections/Nesting.svelte';
	import Orientation from './sections/Orientation.svelte';
	import Pinning from './sections/Pinning.svelte';
	import QuickStart from './sections/QuickStart.svelte';
	import Reordering from './sections/Reordering.svelte';
	import SeparatorSection from './sections/SeparatorSection.svelte';
	import Styling from './sections/Styling.svelte';
	import SideNav from './SideNav.svelte';

	const TITLE = 'svelte-motion-panels: resizable panels for Svelte, animated with Motion';
	const DESCRIPTION =
		'A Svelte 5 adapter built on motion-panels by Valerii Strilets. Resizable panels animated with Motion: drag by the edge or add a separator, fold, pin, nest and reorder. Unstyled, with no layout library underneath.';
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://motion-panels.mastermakrela.com/" />
	<link rel="canonical" href="https://motion-panels.mastermakrela.com/" />
</svelte:head>

<Hero />
<div
	class="mx-auto grid w-full max-w-[1220px] grid-cols-[minmax(0,1fr)] gap-10 px-5 pt-12 pb-24 min-[900px]:grid-cols-[190px_minmax(0,1fr)] min-[900px]:gap-16 min-[900px]:px-8 min-[900px]:pt-16 min-[900px]:pb-32"
>
	<div class="self-start min-[900px]:sticky min-[900px]:top-24">
		<SideNav />
	</div>
	<main id="content" class="flex max-w-[900px] min-w-0 flex-col gap-14 [counter-reset:section]">
		<Install />
		<QuickStart />
		<SeparatorSection />
		<Orientation />
		<Collapsing />
		<Pinning />
		<Nesting />
		<Reordering />
		<BothEdges />
		<Core />
		<Styling />
		<Api />
	</main>
</div>
