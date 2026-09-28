import tailwindcss from '@tailwindcss/vite';
import { svelteTesting } from '@testing-library/svelte/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command }) => ({
	plugins: [tailwindcss(), sveltekit(), svelteTesting()],
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
