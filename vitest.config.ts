import { defineConfig } from "vitest/config"
import path from "path"
import { resolveVerbosity } from "./src/utils/vitest-verbosity"

const { silent, reporters, onConsoleLog } = resolveVerbosity()

export default defineConfig({
	test: {
		globals: true,
		setupFiles: ["./src/vitest.setup.ts"],
		watch: false,
		reporters,
		silent,
		testTimeout: 20_000,
		hookTimeout: 20_000,
		onConsoleLog,
		include: ["src/**/*.spec.ts"],
	},
	resolve: {
		alias: {
			vscode: path.resolve(__dirname, "./src/__mocks__/vscode.js"),
			"@ali-code": path.resolve(__dirname, "src/@ali-code"),
			"@ali-code/types": path.resolve(__dirname, "src/@ali-code/types"),
		},
	},
})
