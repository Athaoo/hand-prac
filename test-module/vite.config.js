import { defineConfig, loadEnv } from 'vite'
import path from 'path'

const { resolve } = path

export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), '')

	return {
		define: {},
		resolve: {},
		build: {
			rollupOptions: {
				input: {
					// index: resolve(__dirname, './index.html'),
					index: resolve(__dirname, './index.html'),
				},
			},
			outDir: resolve(__dirname, './dist'),
		},
		publicDir: resolve(__dirname, './public'),
		base: './',
	}
})
