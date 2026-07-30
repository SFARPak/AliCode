"use strict"
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
//
// Tests the ExecuteCommand tool itself vs calling the tool where the tool is mocked.
//
const path = __importStar(require("path"))
const fs = __importStar(require("fs/promises"))
const TerminalRegistry_1 = require("../../../integrations/terminal/TerminalRegistry")
const Terminal_1 = require("../../../integrations/terminal/Terminal")
const ExecaTerminal_1 = require("../../../integrations/terminal/ExecaTerminal")
// Mock fs to control directory existence checks
vitest.mock("fs/promises")
// Mock TerminalRegistry to control terminal creation
vitest.mock("../../../integrations/terminal/TerminalRegistry")
// Mock Terminal and ExecaTerminal classes
vitest.mock("../../../integrations/terminal/Terminal")
vitest.mock("../../../integrations/terminal/ExecaTerminal")
// Import the actual executeCommand function (not mocked)
const ExecuteCommandTool_1 = require("../ExecuteCommandTool")
// Tests for the executeCommand function
describe("executeCommand", () => {
	let mockTask
	let mockTerminal
	let mockProcess
	let mockProvider
	beforeEach(() => {
		vitest.clearAllMocks()
		fs.access.mockResolvedValue(undefined)
		// Create mock provider
		mockProvider = {
			postMessageToWebview: vitest.fn(),
			getState: vitest.fn().mockResolvedValue({
				terminalShellIntegrationDisabled: false,
			}),
		}
		// Create mock task
		mockTask = {
			cwd: "/test/project",
			taskId: "test-task-123",
			providerRef: {
				deref: vitest.fn().mockResolvedValue(mockProvider),
			},
			say: vitest.fn().mockResolvedValue(undefined),
			terminalProcess: undefined,
		}
		// Create mock process that resolves immediately
		mockProcess = Promise.resolve()
		mockProcess.continue = vitest.fn()
		// Create mock terminal with getCurrentWorkingDirectory method
		mockTerminal = {
			provider: "vscode",
			id: 1,
			initialCwd: "/test/project",
			getCurrentWorkingDirectory: vitest.fn().mockReturnValue("/test/project"),
			runCommand: vitest.fn().mockReturnValue(mockProcess),
			terminal: {
				show: vitest.fn(),
			},
		}
		TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal.mockResolvedValue(mockTerminal)
	})
	describe("Working Directory Behavior", () => {
		it("should use terminal.getCurrentWorkingDirectory() in the output message for completed commands", async () => {
			// Setup: Mock terminal to return a different current working directory
			const initialCwd = "/test/project"
			const currentCwd = "/test/project/subdirectory"
			mockTask.cwd = initialCwd
			mockTerminal.initialCwd = initialCwd
			mockTerminal.getCurrentWorkingDirectory.mockReturnValue(currentCwd)
			// Mock the terminal process to complete successfully
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				// Simulate command completion
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "echo test",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(mockTerminal.getCurrentWorkingDirectory).toHaveBeenCalled()
			expect(result).toContain(`within working directory '${currentCwd}'`)
			expect(result).not.toContain(`within working directory '${initialCwd}'`)
		})
		it("should use terminal.getCurrentWorkingDirectory() for VSCode Terminal with shell integration", async () => {
			// Setup: Mock VSCode Terminal instance
			const vscodeTerminal = new Terminal_1.Terminal(1, undefined, "/test/project")
			const mockVSCodeTerminal = vscodeTerminal
			// Mock shell integration providing different cwd
			mockVSCodeTerminal.terminal = {
				show: vitest.fn(),
				shellIntegration: {
					cwd: { fsPath: "/test/project/changed-dir" },
				},
			}
			mockVSCodeTerminal.getCurrentWorkingDirectory = vitest.fn().mockReturnValue("/test/project/changed-dir")
			mockVSCodeTerminal.runCommand = vitest.fn().mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal.mockResolvedValue(mockVSCodeTerminal)
			const options = {
				executionId: "test-123",
				command: "echo test",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(result).toContain("within working directory '/test/project/changed-dir'")
		})
		it("should use terminal.getCurrentWorkingDirectory() for ExecaTerminal (always returns initialCwd)", async () => {
			// Setup: Mock ExecaTerminal instance
			const execaTerminal = new ExecaTerminal_1.ExecaTerminal(1, "/test/project")
			const mockExecaTerminal = execaTerminal
			// ExecaTerminal always returns initialCwd
			mockExecaTerminal.getCurrentWorkingDirectory = vitest.fn().mockReturnValue("/test/project")
			mockExecaTerminal.runCommand = vitest.fn().mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal.mockResolvedValue(mockExecaTerminal)
			const options = {
				executionId: "test-123",
				command: "echo test",
				terminalShellIntegrationDisabled: true, // Forces ExecaTerminal
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(mockExecaTerminal.getCurrentWorkingDirectory).toHaveBeenCalled()
			expect(result).toContain("within working directory '/test/project'")
		})
	})
	describe("Custom Working Directory", () => {
		it("should handle absolute custom cwd and use terminal.getCurrentWorkingDirectory() in output", async () => {
			const customCwd = "/custom/absolute/path"
			mockTerminal.getCurrentWorkingDirectory.mockReturnValue(customCwd)
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "echo test",
				customCwd,
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal).toHaveBeenCalledWith(
				customCwd,
				mockTask.taskId,
				"vscode",
			)
			expect(result).toContain(`within working directory '${customCwd}'`)
		})
		it("should handle relative custom cwd and use terminal.getCurrentWorkingDirectory() in output", async () => {
			const relativeCwd = "subdirectory"
			const resolvedCwd = path.resolve(mockTask.cwd, relativeCwd)
			mockTerminal.getCurrentWorkingDirectory.mockReturnValue(resolvedCwd)
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "echo test",
				customCwd: relativeCwd,
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal).toHaveBeenCalledWith(
				resolvedCwd,
				mockTask.taskId,
				"vscode",
			)
			expect(result).toContain(`within working directory '${resolvedCwd.toPosix()}'`)
		})
		it("should return error when custom working directory does not exist", async () => {
			const nonExistentCwd = "/non/existent/path"
			fs.access.mockRejectedValue(new Error("Directory does not exist"))
			const options = {
				executionId: "test-123",
				command: "echo test",
				customCwd: nonExistentCwd,
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(result).toBe(`Working directory '${nonExistentCwd}' does not exist.`)
			expect(TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal).not.toHaveBeenCalled()
		})
	})
	describe("Terminal Provider Selection", () => {
		it("should use vscode provider when shell integration is enabled", async () => {
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "echo test",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal).toHaveBeenCalledWith(
				mockTask.cwd,
				mockTask.taskId,
				"vscode",
			)
		})
		it("should use execa provider when shell integration is disabled", async () => {
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command output", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "echo test",
				terminalShellIntegrationDisabled: true,
			}
			// Execute
			await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal).toHaveBeenCalledWith(
				mockTask.cwd,
				mockTask.taskId,
				"execa",
			)
		})
	})
	describe("Command Execution States", () => {
		it("should handle completed command with exit code 0", async () => {
			mockTerminal.getCurrentWorkingDirectory.mockReturnValue("/test/project")
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command completed successfully", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "echo success",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(result).toContain("Exit code: 0")
			expect(result).toContain("within working directory '/test/project'")
		})
		it("should handle completed command with non-zero exit code", async () => {
			mockTerminal.getCurrentWorkingDirectory.mockReturnValue("/test/project")
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command failed", mockProcess)
					callbacks.onShellExecutionComplete({ exitCode: 1 }, mockProcess)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "exit 1",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(result).toContain("Command execution was not successful")
			expect(result).toContain("Exit code: 1")
			expect(result).toContain("within working directory '/test/project'")
		})
		it("should handle command terminated by signal", async () => {
			mockTerminal.getCurrentWorkingDirectory.mockReturnValue("/test/project")
			mockTerminal.runCommand.mockImplementation((command, callbacks) => {
				setTimeout(() => {
					callbacks.onCompleted("Command interrupted", mockProcess)
					callbacks.onShellExecutionComplete(
						{
							exitCode: undefined,
							signalName: "SIGINT",
							coreDumpPossible: false,
						},
						mockProcess,
					)
				}, 0)
				return mockProcess
			})
			const options = {
				executionId: "test-123",
				command: "long-running-command",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify
			expect(rejected).toBe(false)
			expect(result).toContain("Process terminated by signal SIGINT")
			expect(result).toContain("within working directory '/test/project'")
		})
	})
	describe("Terminal Working Directory Updates", () => {
		it("should update working directory when terminal returns different cwd", async () => {
			// Setup: Terminal initially at project root, but getCurrentWorkingDirectory returns different path
			const initialCwd = "/test/project"
			const updatedCwd = "/test/project/src"
			mockTask.cwd = initialCwd
			mockTerminal.initialCwd = initialCwd
			// Mock Terminal instance behavior
			const mockTerminalInstance = {
				...mockTerminal,
				terminal: { show: vitest.fn() },
				getCurrentWorkingDirectory: vitest.fn().mockReturnValue(updatedCwd),
				runCommand: vitest.fn().mockImplementation((command, callbacks) => {
					setTimeout(() => {
						callbacks.onCompleted("Directory changed", mockProcess)
						callbacks.onShellExecutionComplete({ exitCode: 0 }, mockProcess)
					}, 0)
					return mockProcess
				}),
			}
			TerminalRegistry_1.TerminalRegistry.getOrCreateTerminal.mockResolvedValue(mockTerminalInstance)
			const options = {
				executionId: "test-123",
				command: "cd src && pwd",
				terminalShellIntegrationDisabled: false,
			}
			// Execute
			const [rejected, result] = await (0, ExecuteCommandTool_1.executeCommandInTerminal)(mockTask, options)
			// Verify the result uses the updated working directory
			expect(rejected).toBe(false)
			expect(result).toContain(`within working directory '${updatedCwd}'`)
			expect(result).not.toContain(`within working directory '${initialCwd}'`)
			// Verify the terminal's getCurrentWorkingDirectory was called
			expect(mockTerminalInstance.getCurrentWorkingDirectory).toHaveBeenCalled()
		})
	})
})
