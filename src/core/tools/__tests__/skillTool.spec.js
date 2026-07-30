"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const SkillTool_1 = require("../SkillTool")
const responses_1 = require("../../prompts/responses")
;(0, vitest_1.describe)("skillTool", () => {
	let mockTask
	let mockCallbacks
	let mockSkillsManager
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		mockSkillsManager = {
			getSkillContent: vitest_1.vi.fn(),
			getSkillsForMode: vitest_1.vi.fn().mockReturnValue([]),
		}
		mockTask = {
			consecutiveMistakeCount: 0,
			recordToolError: vitest_1.vi.fn(),
			didToolFailInCurrentTurn: false,
			sayAndCreateMissingParamError: vitest_1.vi.fn().mockResolvedValue("Missing parameter error"),
			ask: vitest_1.vi.fn().mockResolvedValue({}),
			providerRef: {
				deref: vitest_1.vi.fn().mockReturnValue({
					getState: vitest_1.vi.fn().mockResolvedValue({ mode: "code" }),
					getSkillsManager: vitest_1.vi.fn().mockReturnValue(mockSkillsManager),
				}),
			},
		}
		mockCallbacks = {
			askApproval: vitest_1.vi.fn().mockResolvedValue(true),
			handleError: vitest_1.vi.fn(),
			pushToolResult: vitest_1.vi.fn(),
		}
	})
	;(0, vitest_1.it)("should handle missing skill parameter", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "",
			},
		}
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(1)
		;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith("skill")
		;(0, vitest_1.expect)(mockTask.sayAndCreateMissingParamError).toHaveBeenCalledWith("skill", "skill")
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith("Missing parameter error")
	})
	;(0, vitest_1.it)("should handle skill not found", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "non-existent",
			},
		}
		mockSkillsManager.getSkillContent.mockResolvedValue(null)
		mockSkillsManager.getSkillsForMode.mockReturnValue([{ name: "create-mcp-server" }])
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
			responses_1.formatResponse.toolError("Skill 'non-existent' not found. Available skills: create-mcp-server"),
		)
	})
	;(0, vitest_1.it)("should handle empty available skills list", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "non-existent",
			},
		}
		mockSkillsManager.getSkillContent.mockResolvedValue(null)
		mockSkillsManager.getSkillsForMode.mockReturnValue([])
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
			responses_1.formatResponse.toolError("Skill 'non-existent' not found. Available skills: (none)"),
		)
	})
	;(0, vitest_1.it)("should successfully load a global skill", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "create-mcp-server",
			},
		}
		const mockSkillContent = {
			name: "create-mcp-server",
			description: "Instructions for creating MCP servers",
			source: "global",
			instructions: "Step 1: Create the server...",
		}
		mockSkillsManager.getSkillContent.mockResolvedValue(mockSkillContent)
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.askApproval).toHaveBeenCalledWith(
			"tool",
			JSON.stringify({
				tool: "skill",
				skill: "create-mcp-server",
				args: undefined,
				source: "global",
				description: "Instructions for creating MCP servers",
			}),
		)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Skill: create-mcp-server
Description: Instructions for creating MCP servers
Source: global

--- Skill Instructions ---

Step 1: Create the server...`)
	})
	;(0, vitest_1.it)("should successfully load skill with arguments", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "create-mcp-server",
				args: "weather API server",
			},
		}
		const mockSkillContent = {
			name: "create-mcp-server",
			description: "Instructions for creating MCP servers",
			source: "global",
			instructions: "Step 1: Create the server...",
		}
		mockSkillsManager.getSkillContent.mockResolvedValue(mockSkillContent)
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Skill: create-mcp-server
Description: Instructions for creating MCP servers
Provided arguments: weather API server
Source: global

--- Skill Instructions ---

Step 1: Create the server...`)
	})
	;(0, vitest_1.it)("should handle user rejection", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "create-mcp-server",
			},
		}
		mockSkillsManager.getSkillContent.mockResolvedValue({
			name: "create-mcp-server",
			description: "Test",
			source: "global",
			instructions: "Test instructions",
		})
		mockCallbacks.askApproval.mockResolvedValue(false)
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should handle partial block", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {
				skill: "create-mcp-server",
				args: "",
			},
			partial: true,
		}
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.ask).toHaveBeenCalledWith(
			"tool",
			JSON.stringify({
				tool: "skill",
				skill: "create-mcp-server",
				args: "",
			}),
			true,
		)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should handle errors during execution", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "create-mcp-server",
			},
		}
		const error = new Error("Test error")
		mockSkillsManager.getSkillContent.mockRejectedValue(error)
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.handleError).toHaveBeenCalledWith("executing skill", error)
	})
	;(0, vitest_1.it)("should reset consecutive mistake count on valid skill", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "create-mcp-server",
			},
		}
		mockTask.consecutiveMistakeCount = 5
		const mockSkillContent = {
			name: "create-mcp-server",
			description: "Test",
			source: "global",
			instructions: "Test instructions",
		}
		mockSkillsManager.getSkillContent.mockResolvedValue(mockSkillContent)
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.consecutiveMistakeCount).toBe(0)
	})
	;(0, vitest_1.it)("should handle Skills Manager not available", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "create-mcp-server",
			},
		}
		mockTask.providerRef.deref = vitest_1.vi.fn().mockReturnValue({
			getState: vitest_1.vi.fn().mockResolvedValue({ mode: "code" }),
			getSkillsManager: vitest_1.vi.fn().mockReturnValue(undefined),
		})
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockTask.recordToolError).toHaveBeenCalledWith("skill")
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(
			responses_1.formatResponse.toolError("Skills Manager not available"),
		)
	})
	;(0, vitest_1.it)("should load project skill", async () => {
		const block = {
			type: "tool_use",
			name: "skill",
			params: {},
			partial: false,
			nativeArgs: {
				skill: "my-project-skill",
			},
		}
		const mockSkillContent = {
			name: "my-project-skill",
			description: "A custom project skill",
			source: "project",
			instructions: "Follow these project-specific instructions...",
		}
		mockSkillsManager.getSkillContent.mockResolvedValue(mockSkillContent)
		await SkillTool_1.skillTool.handle(mockTask, block, mockCallbacks)
		;(0, vitest_1.expect)(mockCallbacks.askApproval).toHaveBeenCalledWith(
			"tool",
			JSON.stringify({
				tool: "skill",
				skill: "my-project-skill",
				args: undefined,
				source: "project",
				description: "A custom project skill",
			}),
		)
		;(0, vitest_1.expect)(mockCallbacks.pushToolResult).toHaveBeenCalledWith(`Skill: my-project-skill
Description: A custom project skill
Source: project

--- Skill Instructions ---

Follow these project-specific instructions...`)
	})
})
