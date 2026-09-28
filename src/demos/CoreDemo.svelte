<!--
No components here: the group, the panel and the grip are plain DOM nodes wired
to the motion-panels core inside one attachment. This is the whole surface a
framework adapter has to cover.
-->
<script lang="ts">
	import { attachSeparator, createPanel, createPanelGroup, FILL_ATTRIBUTE } from 'motion-panels';
	import type { Attachment } from 'svelte/attachments';

	import { CARD, CARD_HEAD, COMPACT, SEPARATOR, SIZE_BADGE } from './shared/index.js';

	const mountSplit: Attachment<HTMLElement> = (root) => {
		const group = createPanelGroup('horizontal');

		const panel = document.createElement('div');
		const content = document.createElement('div');
		const grip = document.createElement('div');
		const fill = document.createElement('div');

		const start = matchMedia(`(${COMPACT})`).matches ? 130 : 240;

		content.innerHTML = `<div class="${CARD}"><div class="${CARD_HEAD}"><span>Files</span><span class="${SIZE_BADGE}">${start}px</span></div></div>`;
		fill.innerHTML = `<div class="${CARD}"><div class="${CARD_HEAD}"><span>Editor</span></div></div>`;
		fill.setAttribute(FILL_ATTRIBUTE, '');

		Object.assign(root.style, {
			display: 'flex',
			flexDirection: group.axes.direction,
			height: '100%',
			overflow: 'clip',
			width: '100%'
		});
		Object.assign(panel.style, {
			display: 'flex',
			flexShrink: '0',
			position: 'relative',
			width: `${start}px`
		});
		Object.assign(content.style, { flexShrink: '0', height: '100%', padding: '3px' });
		Object.assign(fill.style, { flex: '1', minWidth: '0', padding: '3px' });
		Object.assign(grip.style, {
			insetBlock: '0',
			insetInlineEnd: '-7px',
			position: 'absolute',
			touchAction: 'none'
		});

		grip.className = SEPARATOR;
		grip.role = 'separator';
		grip.tabIndex = 0;
		grip.ariaLabel = 'Resize files';
		grip.ariaOrientation = group.axes.separator;

		panel.append(content, grip);
		root.append(panel, fill);

		let size = start;
		const base = {
			maxSize: '55%' as const,
			minSize: '20%' as const,
			onSizeChange: (next: number) => {
				size = next;
				controller.sync({ ...base, size });
			}
		};
		const controller = createPanel(group, { ...base, size });
		const detach = controller.attach(panel);
		const detachGrip = attachSeparator(grip, group, controller);

		const label = content.querySelector('span:last-child');
		const stopSize = controller.motion.size.on('change', (value) => {
			const width = Math.max(0, value);
			panel.style.width = `${width}px`;
			if (label) {
				label.textContent = `${Math.round(width)}px`;
			}
		});
		const stopContent = controller.motion.content.on('change', (value) => {
			content.style.width = `${value}px`;
		});

		content.style.width = `${size}px`;

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

<figure class="mt-6 h-[300px] border bg-well p-2.5">
	<div class="h-full" {@attach mountSplit}></div>
</figure>
