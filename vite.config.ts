import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command }) => ({
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			// Every route is prerendered (see src/routes/+layout.ts), so no SPA fallback.
			adapter: adapter(),

			paths: {
				// The site lives at motion-panels.mastermakrela.com, served from /. Forks hosting under a sub-path: BASE_PATH=/<repo> bun run build
				base: (process.env.BASE_PATH ?? '') as '' | `/${string}`
			}
		}),
		svelteTesting()
	],

	environments:
		command === 'build'
			? {
					client: {
						define: {
							// motion-panels gates its dev warnings on
							// `typeof process === 'undefined' || process.env.NODE_ENV !== 'production'`,
							// which is true in every browser. Give the production client bundle
							// a `process` so the check folds to false and the warnings drop out.
							process: JSON.stringify({ env: { NODE_ENV: 'production' } })
						}
					}
				}
			: undefined,
	test: {
		expect: { requireAssertions: true },
		environment: 'happy-dom',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['./vitest-setup.ts']
	}
}));
