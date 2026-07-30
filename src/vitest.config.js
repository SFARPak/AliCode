"use strict"
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const config_1 = require("vitest/config")
const path_1 = __importDefault(require("path"))
const vitest_verbosity_1 = require("./utils/vitest-verbosity")
const { silent, reporters, onConsoleLog } = (0, vitest_verbosity_1.resolveVerbosity)()
exports.default = (0, config_1.defineConfig)({
	test: {
		globals: true,
		setupFiles: ["./src/vitest.setup.ts"],
		watch: false,
		reporters,
		silent,
		testTimeout: 20_000,
		hookTimeout: 20_000,
		onConsoleLog,
	},
	resolve: {
		alias: {
			vscode: path_1.default.resolve(__dirname, "./__mocks__/vscode.js"),
			"@ali-code": path_1.default.resolve(__dirname, "./@ali-code"),
		},
	},
	// plugins removed to avoid missing module errors
})
