"use strict"
// npx vitest run src/integrations/terminal/__tests__/TerminalRegistry.spec.ts
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				var desc = Object.getOwnPropertyDescriptor(m, k)
				if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
					desc = {
						enumerable: true,
						get: function () {
							return m[k]
						},
					}
				}
				Object.defineProperty(o, k2, desc)
			}
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k
				o[k2] = m[k]
			})
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v })
			}
		: function (o, v) {
				o["default"] = v
			})
var __importStar =
	(this && this.__importStar) ||
	(function () {
		var ownKeys = function (o) {
			ownKeys =
				Object.getOwnPropertyNames ||
				function (o) {
					var ar = []
					for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k
					return ar
				}
			return ownKeys(o)
		}
		return function (mod) {
			if (mod && mod.__esModule) return mod
			var result = {}
			if (mod != null)
				for (var k = ownKeys(mod), i = 0; i < k.length; i++)
					if (k[i] !== "default") __createBinding(result, mod, k[i])
			__setModuleDefault(result, mod)
			return result
		}
	})()
Object.defineProperty(exports, "__esModule", { value: true })
const vscode = __importStar(require("vscode"))
const Terminal_1 = require("../Terminal")
const TerminalRegistry_1 = require("../TerminalRegistry")
const PAGER = process.platform === "win32" ? "" : "cat"
vi.mock("execa", () => ({
	execa: vi.fn(),
}))
describe("TerminalRegistry", () => {
	let mockCreateTerminal
	beforeEach(() => {
		mockCreateTerminal = vi.spyOn(vscode.window, "createTerminal").mockImplementation((...args) => ({
			exitStatus: undefined,
			name: "AliCode",
			processId: Promise.resolve(123),
			creationOptions: {},
			state: {
				isInteractedWith: true,
				shell: { id: "test-shell", executable: "/bin/bash", args: [] },
			},
			dispose: vi.fn(),
			hide: vi.fn(),
			show: vi.fn(),
			sendText: vi.fn(),
			shellIntegration: {
				executeCommand: vi.fn(),
			},
		}))
	})
	describe("createTerminal", () => {
		it("creates terminal with PAGER set appropriately for platform", () => {
			TerminalRegistry_1.TerminalRegistry.createTerminal("/test/path", "vscode")
			expect(mockCreateTerminal).toHaveBeenCalledWith({
				cwd: "/test/path",
				name: "AliCode",
				iconPath: expect.any(Object),
				env: {
					PAGER,
					ROO_ACTIVE: "true",
					VTE_VERSION: "0",
					PROMPT_EOL_MARK: "",
				},
			})
		})
		it("adds PROMPT_COMMAND when Terminal.getCommandDelay() > 0", () => {
			// Set command delay to 50ms for this test
			const originalDelay = Terminal_1.Terminal.getCommandDelay()
			Terminal_1.Terminal.setCommandDelay(50)
			try {
				TerminalRegistry_1.TerminalRegistry.createTerminal("/test/path", "vscode")
				expect(mockCreateTerminal).toHaveBeenCalledWith({
					cwd: "/test/path",
					name: "AliCode",
					iconPath: expect.any(Object),
					env: {
						PAGER,
						ROO_ACTIVE: "true",
						PROMPT_COMMAND: "sleep 0.05",
						VTE_VERSION: "0",
						PROMPT_EOL_MARK: "",
					},
				})
			} finally {
				// Restore original delay
				Terminal_1.Terminal.setCommandDelay(originalDelay)
			}
		})
		it("adds Oh My Zsh integration env var when enabled", () => {
			Terminal_1.Terminal.setTerminalZshOhMy(true)
			try {
				TerminalRegistry_1.TerminalRegistry.createTerminal("/test/path", "vscode")
				expect(mockCreateTerminal).toHaveBeenCalledWith({
					cwd: "/test/path",
					name: "AliCode",
					iconPath: expect.any(Object),
					env: {
						PAGER,
						ROO_ACTIVE: "true",
						VTE_VERSION: "0",
						PROMPT_EOL_MARK: "",
						ITERM_SHELL_INTEGRATION_INSTALLED: "Yes",
					},
				})
			} finally {
				Terminal_1.Terminal.setTerminalZshOhMy(false)
			}
		})
		it("adds Powerlevel10k integration env var when enabled", () => {
			Terminal_1.Terminal.setTerminalZshP10k(true)
			try {
				TerminalRegistry_1.TerminalRegistry.createTerminal("/test/path", "vscode")
				expect(mockCreateTerminal).toHaveBeenCalledWith({
					cwd: "/test/path",
					name: "AliCode",
					iconPath: expect.any(Object),
					env: {
						PAGER,
						ROO_ACTIVE: "true",
						VTE_VERSION: "0",
						PROMPT_EOL_MARK: "",
						POWERLEVEL9K_TERM_SHELL_INTEGRATION: "true",
					},
				})
			} finally {
				Terminal_1.Terminal.setTerminalZshP10k(false)
			}
		})
	})
})
