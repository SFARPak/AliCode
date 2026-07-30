"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const RunSlashCommandTool_1 = require("../RunSlashCommandTool")
const responses_1 = require("../../prompts/responses")
const commands_1 = require("../../../services/command/commands")
// Mock dependencies
vitest_1.vi.mock("../../../services/command/commands", () => ({
	getCommand: vitest_1.vi.fn(),
	getCommandNames: vitest_1.vi.fn(),
}))
;(0, vitest_1.describe)("runSlashCommandTool", () => {
	let mockTask
	let mockCallbacks
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		mockTask = {
			consecutiveMistakeCount: 0,
			recordToolError: vitest_1.vi.fn(),
			sayAndCreateMissingParamError: vitest_1.vi.fn().mockResolvedValue("Missing parameter error"),
			ask: vitest_1.vi.fn().mockResolvedValue({}),
			cwd: "/test/project",
			providerRef: {
				deref: vitest_1.vi.fn().mockReturnValue({
					getState: vitest_1.vi.fn().mockResolvedValue({
						experiments: {
							runSlashCommand: true,
						},
					}),
					getSkillsManager: vitest_1.vi.fn().mockReturnValue(undefined),
				}),
			},
		}
		mockCallbacks = {
			askApproval: vitest_1.vi.fn().mockResolvedValue(true),
			handleError: vitest_1.vi.fn(),
			pushToolResult: vitest_1.vi.fn(),
		}
	})
	;(0, vitest_1.it)("should handle missing command parameter", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "",
			},
		}
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
		;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith("run_slash_command")
		;(0, vitest_1.expect)(mockTask.sayAndCreateMissingParamError).toHaveBeenCalledWith(
			"run_slash_command",
			"command",
		)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith("Missing parameter error")
	})
	;(0, vitest_1.it)("should handle command not found", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "nonexistent",
			},
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(undefined)
		vitest_1.vi.mocked(commands_1.getCommandNames).mockResolvedValue(["init", "test", "deploy"])
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith("run_slash_command")
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
			responses_1.formatResponse.toolError(
				"Command 'nonexistent' not found. Available commands: init, test, deploy",
			),
		)
	})
	;(0, vitest_1.it)(
		"should fallback to skill content when command is missing and matching skill exists",
		async () => {
			const block = {
				type: "tool_use",
				name: "run_slash_command",
				params: {},
				partial: false,
				nativeArgs: {
					command: "skill-only",
					args: "target flow",
				},
			}
			const getSkillContent = vitest_1.vi.fn().mockResolvedValue({
				name: "skill-only",
				description: "Skill-generated command",
				path: "/mock/.ali/skills/skill-only/SKILL.md",
				source: "project",
				instructions: "Use skill workflow",
			})
			mockTask.providerRef.deref = vitest_1.vi.fn().mockReturnValue({
				getState: vitest_1.vi.fn().mockResolvedValue({
					experiments: {
						runSlashCommand: true,
					},
					mode: "code",
				}),
				getSkillsManager: vitest_1.vi.fn().mockReturnValue({
					getSkillContent,
				}),
			})
			vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(undefined)
			await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
			;(0, vitest_1.expect)(getSkillContent).toHaveBeenCalledWith("skill-only", "code")
			;(0, vitest_1.expect)(mockCallbacks.askApproval).toHaveBeenCalledWith(
				"tool",
				JSON.stringify({
					tool: "skill",
					skill: "skill-only",
					args: "target flow",
					source: "project",
					description: "Skill-generated command",
				}),
			)
			;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Skill: skill-only
Description: Skill-generated command
Provided arguments: target flow
Source: project

--- Skill Instructions ---

Use skill workflow`)
			;(0, vitest_1.expect)(mockTask.recordToolError).not.toHaveBeenCalledWith("run_slash_command")
			;(0, vitest_1.expect)(commands_1.getCommandNames).not.toHaveBeenCalled()
		},
	)
	;(0, vitest_1.it)("should preserve command precedence over skill fallback", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "setup",
			},
		}
		const mockCommand = {
			name: "setup",
			content: "Command content",
			source: "project",
			filePath: ".ali/commands/setup.md",
			description: "Real command",
		}
		const getSkillContent = vitest_1.vi.fn().mockResolvedValue({
			name: "setup",
			description: "Setup skill",
			path: "/mock/.ali/skills/setup/SKILL.md",
			source: "project",
			instructions: "Skill should not run",
		})
		mockTask.providerRef.deref = vitest_1.vi.fn().mockReturnValue({
			getState: vitest_1.vi.fn().mockResolvedValue({
				experiments: {
					runSlashCommand: true,
				},
				mode: "code",
			}),
			getSkillsManager: vitest_1.vi.fn().mockReturnValue({
				getSkillContent,
			}),
		})
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(getSkillContent).not.toHaveBeenCalled()
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Command: /setup
Description: Real command
Source: project

--- Command Content ---

Command content`)
	})
	;(0, vitest_1.it)("should handle user rejection", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "init",
			},
		}
		const mockCommand = {
			name: "init",
			content: "Initialize project",
			source: "built-in",
			filePath: "<built-in:init>",
			description: "Initialize the project",
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		mockCallbacks.askApproval.mockResolvedValue(false)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.askApproval).toHaveBeenCalled()
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should successfully execute built-in command", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "init",
			},
		}
		const mockCommand = {
			name: "init",
			content: "Initialize project content here",
			source: "built-in",
			filePath: "<built-in:init>",
			description: "Analyze codebase and create AGENTS.md",
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.askApproval).toHaveBeenCalledWith(
			"tool",
			JSON.stringify({
				tool: "runSlashCommand",
				command: "init",
				args: undefined,
				source: "built-in",
				description: "Analyze codebase and create AGENTS.md",
			}),
		)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Command: /init
Description: Analyze codebase and create AGENTS.md
Source: built-in

--- Command Content ---

Initialize project content here`)
	})
	;(0, vitest_1.it)("should successfully execute command with arguments", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "test",
				args: "focus on unit tests",
			},
		}
		const mockCommand = {
			name: "test",
			content: "Run tests with specific focus",
			source: "project",
			filePath: ".ali/commands/test.md",
			description: "Run project tests",
			argumentHint: "test type or focus area",
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Command: /test
Description: Run project tests
Argument hint: test type or focus area
Provided arguments: focus on unit tests
Source: project

--- Command Content ---

Run tests with specific focus`)
	})
	;(0, vitest_1.it)("should handle global command", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "deploy",
			},
		}
		const mockCommand = {
			name: "deploy",
			content: "Deploy application to production",
			source: "global",
			filePath: "~/.ali/commands/deploy.md",
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Command: /deploy
Source: global

--- Command Content ---

Deploy application to production`)
	})
	;(0, vitest_1.it)("should handle partial block", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {
				command: "init",
				args: "",
			},
			partial: true,
		}
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.ask).toHaveBeenCalledWith(
			"tool",
			JSON.stringify({
				tool: "runSlashCommand",
				command: "init",
				args: "",
			}),
			true,
		)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should handle errors during execution", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "init",
			},
		}
		const error = new Error("Test error")
		vitest_1.vi.mocked(commands_1.getCommand).mockRejectedValue(error)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.handleError).toHaveBeenCalledWith("running slash command", error)
	})
	;(0, vitest_1.it)("should handle empty available commands list", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "nonexistent",
			},
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(undefined)
		vitest_1.vi.mocked(commands_1.getCommandNames).mockResolvedValue([])
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
			responses_1.formatResponse.toolError("Command 'nonexistent' not found. Available commands: (none)"),
		)
	})
	;(0, vitest_1.it)("should reset consecutive mistake count on valid command", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "init",
			},
		}
		mockTask.consecutiveMistakeCount = 5
		const mockCommand = {
			name: "init",
			content: "Initialize project",
			source: "built-in",
			filePath: "<built-in:init>",
		}
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(0)
	})
	;(0, vitest_1.it)("should switch mode when mode is specified in command", async () => {
		const mockHandleModeSwitch = vitest_1.vi.fn()
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "debug-app",
			},
		}
		const mockCommand = {
			name: "debug-app",
			content: "Start debugging the application",
			source: "project",
			filePath: ".ali/commands/debug-app.md",
			description: "Debug the application",
			mode: "debug",
		}
		mockTask.providerRef.deref = vitest_1.vi.fn().mockReturnValue({
			getState: vitest_1.vi.fn().mockResolvedValue({
				experiments: {
					runSlashCommand: true,
				},
				customModes: undefined,
			}),
			handleModeSwitch: mockHandleModeSwitch,
		})
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockHandleModeSwitch).toHaveBeenCalledWith("debug")
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Command: /debug-app
Description: Debug the application
Mode: debug
Source: project

--- Command Content ---

Start debugging the application`)
	})
	;(0, vitest_1.it)("should not switch mode when mode is not specified in command", async () => {
		const mockHandleModeSwitch = vitest_1.vi.fn()
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "test",
			},
		}
		const mockCommand = {
			name: "test",
			content: "Run tests",
			source: "project",
			filePath: ".ali/commands/test.md",
			description: "Run project tests",
		}
		mockTask.providerRef.deref = vitest_1.vi.fn().mockReturnValue({
			getState: vitest_1.vi.fn().mockResolvedValue({
				experiments: {
					runSlashCommand: true,
				},
				customModes: undefined,
			}),
			handleModeSwitch: mockHandleModeSwitch,
		})
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockHandleModeSwitch).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should include mode in askApproval message when mode is specified", async () => {
		const block = {
			type: "tool_use",
			name: "run_slash_command",
			params: {},
			partial: false,
			nativeArgs: {
				command: "debug-app",
			},
		}
		const mockCommand = {
			name: "debug-app",
			content: "Start debugging",
			source: "project",
			filePath: ".ali/commands/debug-app.md",
			description: "Debug the application",
			mode: "debug",
		}
		mockTask.providerRef.deref = vitest_1.vi.fn().mockReturnValue({
			getState: vitest_1.vi.fn().mockResolvedValue({
				experiments: {
					runSlashCommand: true,
				},
				customModes: undefined,
			}),
			handleModeSwitch: vitest_1.vi.fn(),
		})
		vitest_1.vi.mocked(commands_1.getCommand).mockResolvedValue(mockCommand)
		await RunSlashCommandTool_1.runSlashCommandTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.askApproval).toHaveBeenCalledWith(
			"tool",
			JSON.stringify({
				tool: "runSlashCommand",
				command: "debug-app",
				args: undefined,
				source: "project",
				description: "Debug the application",
				mode: "debug",
			}),
		)
	})
})
