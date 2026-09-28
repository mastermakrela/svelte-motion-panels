/**
 * Bundle size of the wrapper ($lib over motion-panels + motion) against the
 * experimental native runes engine ($lib/native + svelte/motion). See BENCHMARK.md.
 *
 * Each entry is a full, minified browser bundle (Svelte runtime included), so
 * the numbers compare as deltas from the `baseline` entry. Run: bun run bench:size
 */
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { build } from 'vite';

const root = resolve(import.meta.dirname, '..');
// Inside node_modules so the entries resolve `svelte` and `motion` like app code does.
const work = join(root, 'node_modules/.cache/bench-size');
rmSync(work, { force: true, recursive: true });
mkdirSync(work, { recursive: true });

const mountEntry = (component: string) =>
	`import { mount } from 'svelte';\nimport App from './${component}.svelte';\nmount(App, { target: document.body });\n`;

const components: Record<string, string> = {
	baseline: `<script>let count = $state(0);</script>\n<button onclick={() => (count += 1)}>{count}</button>\n`,
	wrapper: `<script>
	import { Group, Panel, Separator } from '$lib/index.js';
	let size = $state(280);
	let collapsed = $state(false);
</script>
<Group><Panel bind:size bind:collapsed minSize={160} maxSize="45%">a</Panel><Separator /><Panel>b</Panel></Group>
`,
	native: `<script>
	import NativeGroup from '$lib/native/NativeGroup.svelte';
	import NativePanel from '$lib/native/NativePanel.svelte';
	import NativeSeparator from '$lib/native/NativeSeparator.svelte';
	let size = $state(280);
	let collapsed = $state(false);
</script>
<NativeGroup><NativePanel bind:size bind:collapsed minSize={160} maxSize="45%">a</NativePanel><NativeSeparator /><NativePanel>b</NativePanel></NativeGroup>
`
};

const entries: Record<string, string> = {
	...Object.fromEntries(Object.keys(components).map((name) => [name, mountEntry(name)])),
	// Everything the core uses from motion, without Svelte.
	motion: `export { animate, motionValue } from 'motion';\n`,
	core: `export { attachSeparator, createPanel, createPanelGroup } from 'motion-panels';\n`
};

for (const [name, source] of Object.entries(components)) {
	writeFileSync(join(work, `${name}.svelte`), source);
}
for (const [name, source] of Object.entries(entries)) {
	writeFileSync(join(work, `${name}.ts`), source);
}

const rows: { entry: string; min: number; gzip: number; brotli: number }[] = [];
for (const name of Object.keys(entries)) {
	const outDir = join(work, `out-${name}`);
	await build({
		configFile: false,
		logLevel: 'silent',
		root: work,
		plugins: [svelte({ compilerOptions: { runes: true }, preprocess: vitePreprocess() })],
		resolve: { alias: { $lib: join(root, 'src/lib') } },
		// Same as vite.config.ts: fold motion-panels' dev-warning gate to false.
		define: { process: JSON.stringify({ env: { NODE_ENV: 'production' } }) },
		build: {
			outDir,
			emptyOutDir: true,
			minify: true,
			lib: { entry: join(work, `${name}.ts`), formats: ['es'], fileName: name }
		}
	});
	const file = readdirSync(outDir).find((entry) => entry.endsWith('.js'));
	if (!file) throw new Error(`no output for ${name}`);
	const code = readFileSync(join(outDir, file));
	rows.push({
		entry: name,
		min: code.length,
		gzip: gzipSync(code, { level: 9 }).length,
		brotli: brotliCompressSync(code).length
	});
}

const baseline = rows.find((row) => row.entry === 'baseline');
const kb = (bytes: number) => `${(bytes / 1024).toFixed(2)} kB`;
console.log('| entry | minified | gzip | brotli | gzip Δ vs baseline |');
console.log('| --- | ---: | ---: | ---: | ---: |');
for (const row of rows) {
	const svelteEntry = row.entry in components && row.entry !== 'baseline';
	const delta = svelteEntry && baseline ? `+${kb(row.gzip - baseline.gzip)}` : '—';
	console.log(`| ${row.entry} | ${kb(row.min)} | ${kb(row.gzip)} | ${kb(row.brotli)} | ${delta} |`);
}
