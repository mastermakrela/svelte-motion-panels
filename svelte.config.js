import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Every route is prerendered (see src/routes/+layout.ts), so no SPA fallback.
		adapter: adapter(),
		paths: {
			// The site lives at motion-panels.mastermakrela.com, served from /. Forks hosting under a sub-path: BASE_PATH=/<repo> bun run build
			base: /** @type {'' | `/${string}`} */ (process.env.BASE_PATH ?? '')
		}
	}
};

export default config;
