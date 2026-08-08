import { defineConfig } from "tsup"

export default defineConfig({
	entry: ["src/index.ts"],
	format: ["cjs", "esm"],
	dts: {
		// Disable worker to avoid ERR_WORKER_OUT_OF_MEMORY
		// The main Node process has more memory available via NODE_OPTIONS
		worker: false,
	},
	splitting: false,
	sourcemap: true,
	clean: true,
	outDir: "dist",
})
