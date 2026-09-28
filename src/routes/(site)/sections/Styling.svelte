<script lang="ts">
	import CodeBlock from '../CodeBlock.svelte';
	import Section from '../Section.svelte';

	const CSS = `[role='separator'] {
  position: relative; /* its slot is zero wide: lift the grip over both panels */
  z-index: 1;
}

[role='separator'][aria-orientation='vertical'] {
  width: 14px;
}

[role='separator']::after {
  border-radius: 999px;
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

[role='separator'][data-motion-panels-edge]::after {
  display: none;
}

[role='separator'][data-motion-panels-edge]:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: -2px;
}`;
</script>

<Section
	id="styling"
	title="Styling"
	lead="Nothing ships styled. A separator is `[role='separator']` with `aria-orientation`, centred on the seam it drags and taking no space in the flow, so give it a width and it straddles the boundary on its own. Its slot is zero wide, so give the grip `position: relative` and a `z-index` to paint it over both panels. It carries `data-crossing` while the pointer hovers a crossing it would drag from, and `data-resizing` from press to release. A sized panel with no Separator of its own renders one anyway as the drag area on its edge: that one carries `data-motion-panels-edge` and should stay invisible until it is focused. It is still a tab stop, so give it a focus-visible outline. Separator classes are global to the grip, so style them with a global stylesheet or `:global`."
>
	<CodeBlock lang="css" code={CSS} />
</Section>
