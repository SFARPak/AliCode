"use strict"
// npx vitest core/prompts/__tests__/system-prompt.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
vi.mock("os", () => ({
	default: {
		homedir: () => "/home/user",
		platform: () => "linux",
		arch: () => "x64",
		type: () => "Linux",
		release: () => "5.4.0",
		hostname: () => "test-host",
		tmpdir: () => "/tmp",
		endianness: () => "LE",
		loadavg: () => [0, 0, 0],
		totalmem: () => 8589934592,
		freemem: () => 4294967296,
		cpus: () => [],
		networkInterfaces: () => ({}),
		userInfo: () => ({ username: "test", uid: 1000, gid: 1000, shell: "/bin/bash", homedir: "/home/user" }),
	},
	homedir: () => "/home/user",
	platform: () => "linux",
	arch: () => "x64",
	type: () => "Linux",
	release: () => "5.4.0",
	hostname: () => "test-host",
	tmpdir: () => "/tmp",
	endianness: () => "LE",
	loadavg: () => [0, 0, 0],
	totalmem: () => 8589934592,
	freemem: () => 4294967296,
	cpus: () => [],
	networkInterfaces: () => ({}),
	userInfo: () => ({ username: "test", uid: 1000, gid: 1000, shell: "/bin/bash", homedir: "/home/user" }),
}))
vi.mock("default-shell", () => ({
	default: "/bin/zsh",
}))
vi.mock("os-name", () => ({
	default: () => "Linux",
}))
vi.mock("fs/promises")
const system_1 = require("../system")
const modes_1 = require("../../../shared/modes")
require("../../../utils/path")
// Mock the sections
vi.mock("../sections/modes", () => ({
	getModesSection: vi.fn().mockImplementation(async () => `====\n\nMODES\n\n- Test modes section`),
}))
// Mock the custom instructions
vi.mock("../sections/custom-instructions", () => {
	const addCustomInstructions = vi.fn()
	return {
		addCustomInstructions,
		__setMockImplementation: (impl) => {
			addCustomInstructions.mockImplementation(impl)
		},
	}
})
// Set up default mock implementation
const customInstructionsMock = vi.mocked(await import("../sections/custom-instructions"))
const { __setMockImplementation } = customInstructionsMock
__setMockImplementation(async (modeCustomInstructions, globalCustomInstructions, cwd, mode, options) => {
	const sections = []
	// Add language preference if provided
	if (options?.language) {
		sections.push(`Language Preference:\nYou should always speak and think in the "${options.language}" language.`)
	}
	// Add global instructions first
	if (globalCustomInstructions?.trim()) {
		sections.push(`Global Instructions:\n${globalCustomInstructions.trim()}`)
	}
	// Add mode-specific instructions after
	if (modeCustomInstructions?.trim()) {
		sections.push(`Mode-specific Instructions:\n${modeCustomInstructions}`)
	}
	// Add rules
	const rules = []
	if (mode) {
		rules.push(`# Rules from .clinerules-${mode}:\nMock mode-specific rules`)
	}
	rules.push(`# Rules from .clinerules:\nMock generic rules`)
	if (rules.length > 0) {
		sections.push(`Rules:\n${rules.join("\n")}`)
	}
	const joinedSections = sections.join("\n\n")
	const toolUseRef = "."
	return joinedSections
		? `\n====\n\nUSER'S CUSTOM INSTRUCTIONS\n\nThe following additional instructions are provided by the user, and should be followed to the best of your ability${toolUseRef}\n\n${joinedSections}`
		: ""
})
// Mock vscode language
vi.mock("vscode", () => ({
	env: {
		language: "en",
	},
	workspace: {
		workspaceFolders: [{ uri: { fsPath: "/test/path" } }],
		getWorkspaceFolder: vi.fn().mockReturnValue({ uri: { fsPath: "/test/path" } }),
	},
	window: {
		activeTextEditor: undefined,
	},
	EventEmitter: vi.fn().mockImplementation(() => ({
		event: vi.fn(),
		fire: vi.fn(),
		dispose: vi.fn(),
	})),
}))
vi.mock("../../../utils/shell", () => ({
	getShell: () => "/bin/zsh",
}))
// Create a mock ExtensionContext
const mockContext = {
	extensionPath: "/mock/extension/path",
	globalStoragePath: "/mock/storage/path",
	storagePath: "/mock/storage/path",
	logPath: "/mock/log/path",
	subscriptions: [],
	workspaceState: {
		get: () => undefined,
		update: () => Promise.resolve(),
	},
	globalState: {
		get: () => undefined,
		update: () => Promise.resolve(),
		setKeysForSync: () => {},
	},
	extensionUri: { fsPath: "/mock/extension/path" },
	globalStorageUri: { fsPath: "/mock/settings/path" },
	asAbsolutePath: (relativePath) => `/mock/extension/path/${relativePath}`,
	extension: {
		packageJSON: {
			version: "1.0.0",
		},
	},
}
// Instead of extending McpHub, create a mock that implements just what we need
const createMockMcpHub = (withServers = false) => ({
	getServers: () =>
		withServers
			? [
					{
						name: "test-server",
						disabled: false,
						resources: [{ uri: "test://resource", name: "Test Resource" }],
					},
				]
			: [],
	getMcpServersPath: async () => "/mock/mcp/path",
	getMcpSettingsFilePath: async () => "/mock/settings/path",
	dispose: async () => {},
	// Add other required public methods with no-op implementations
	restartConnection: async () => {},
	readResource: async () => ({ contents: [] }),
	callTool: async () => ({ content: [] }),
	toggleServerDisabled: async () => {},
	toggleToolAlwaysAllow: async () => {},
	isConnecting: false,
	connections: [],
})
describe("SYSTEM_PROMPT", () => {
	let mockMcpHub
	let experiments
	beforeEach(() => {
		// Reset experiments before each test to ensure they're disabled by default.
		experiments = {}
	})
	beforeEach(() => {
		vi.clearAllMocks()
	})
	afterEach(async () => {
		if (mockMcpHub) {
			await mockMcpHub.dispose()
		}
	})
	it("should maintain consistent system prompt", async () => {
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false, // supportsImages
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined,
		)
		expect(prompt).toMatchFileSnapshot("./__snapshots__/system-prompt/consistent-system-prompt.snap")
	})
	it("should include MCP server info when mcpHub is provided", async () => {
		mockMcpHub = createMockMcpHub(true)
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			mockMcpHub, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes,
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined,
		)
		expect(prompt).toMatchFileSnapshot("./__snapshots__/system-prompt/with-mcp-hub-provided.snap")
	})
	it("should explicitly handle undefined mcpHub", async () => {
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // explicitly undefined mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes,
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined,
		)
		expect(prompt).toMatchFileSnapshot("./__snapshots__/system-prompt/with-undefined-mcp-hub.snap")
	})
	it("should include vscode language in custom instructions", async () => {
		// Mock vscode.env.language
		const vscode = vi.mocked(await import("vscode"))
		vscode.env = { language: "es" }
		// Ensure workspace mock is maintained
		vscode.workspace = {
			workspaceFolders: [
				{
					uri: {
						fsPath: "/test/path",
					},
				},
			],
			getWorkspaceFolder: vi.fn().mockReturnValue({
				uri: {
					fsPath: "/test/path",
				},
			}),
		}
		vscode.window = {
			activeTextEditor: undefined,
		}
		vscode.EventEmitter = vi.fn().mockImplementation(() => ({
			event: vi.fn(),
			fire: vi.fn(),
			dispose: vi.fn(),
		}))
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			undefined, // experiments
			undefined, // language
			undefined,
		)
		expect(prompt).toContain("Language Preference:")
		expect(prompt).toContain('You should always speak and think in the "es" language')
		// Reset mock
		vscode.env = { language: "en" }
		vscode.workspace = {
			workspaceFolders: [
				{
					uri: {
						fsPath: "/test/path",
					},
				},
			],
			getWorkspaceFolder: vi.fn().mockReturnValue({
				uri: {
					fsPath: "/test/path",
				},
			}),
		}
		vscode.window = {
			activeTextEditor: undefined,
		}
		vscode.EventEmitter = vi.fn().mockImplementation(() => ({
			event: vi.fn(),
			fire: vi.fn(),
			dispose: vi.fn(),
		}))
	})
	it("should include custom mode role definition at top and instructions at bottom", async () => {
		const modeCustomInstructions = "Custom mode instructions"
		const customModes = [
			{
				slug: "custom-mode",
				name: "Custom Mode",
				roleDefinition: "Custom role definition",
				customInstructions: modeCustomInstructions,
				groups: ["read"],
			},
		]
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			"custom-mode", // mode
			undefined, // customModePrompts
			customModes, // customModes
			"Global instructions", // globalCustomInstructions
			experiments,
			undefined, // language
			undefined,
		)
		// Role definition should be at the top
		expect(prompt.indexOf("Custom role definition")).toBeLessThan(prompt.indexOf("TOOL USE"))
		// Custom instructions should be at the bottom
		const customInstructionsIndex = prompt.indexOf("Custom mode instructions")
		const userInstructionsHeader = prompt.indexOf("USER'S CUSTOM INSTRUCTIONS")
		expect(customInstructionsIndex).toBeGreaterThan(-1)
		expect(userInstructionsHeader).toBeGreaterThan(-1)
		expect(customInstructionsIndex).toBeGreaterThan(userInstructionsHeader)
	})
	it("should use promptComponent roleDefinition when available", async () => {
		const customModePrompts = {
			[modes_1.defaultModeSlug]: {
				roleDefinition: "Custom prompt role definition",
				customInstructions: "Custom prompt instructions",
			},
		}
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			customModePrompts, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			undefined, // experiments
			undefined, // language
			undefined,
		)
		// Role definition from promptComponent should be at the top
		expect(prompt.indexOf("Custom prompt role definition")).toBeLessThan(prompt.indexOf("TOOL USE"))
		// Should not contain the default mode's role definition
		expect(prompt).not.toContain(modes_1.modes[0].roleDefinition)
	})
	it("should fallback to modeConfig roleDefinition when promptComponent has no roleDefinition", async () => {
		const customModePrompts = {
			[modes_1.defaultModeSlug]: {
				customInstructions: "Custom prompt instructions",
				// No roleDefinition provided
			},
		}
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			customModePrompts, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			undefined, // experiments
			undefined, // language
			undefined,
		)
		// Should use the default mode's role definition
		expect(prompt.indexOf(modes_1.modes[0].roleDefinition)).toBeLessThan(prompt.indexOf("TOOL USE"))
	})
	it("should exclude update_todo_list tool when todoListEnabled is false", async () => {
		const settings = {
			todoListEnabled: false,
			useAgentRules: true,
			newTaskRequireTodos: false,
		}
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined, // rooIgnoreInstructions
			settings,
		)
		// Should not contain the tool description
		expect(prompt).not.toContain("## update_todo_list")
		// Mode instructions will still reference the tool with a fallback to markdown
	})
	it("should include update_todo_list tool when todoListEnabled is true", async () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
		}
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined, // rooIgnoreInstructions
			settings,
		)
		// update_todo_list is still referenced by mode instructions, but tool catalogs are not embedded.
		expect(prompt).toContain("update_todo_list")
		expect(prompt).not.toContain("## update_todo_list")
	})
	it("should include update_todo_list tool when todoListEnabled is undefined", async () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
		}
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined, // rooIgnoreInstructions
			settings,
		)
		// update_todo_list is still referenced by mode instructions, but tool catalogs are not embedded.
		expect(prompt).toContain("update_todo_list")
		expect(prompt).not.toContain("## update_todo_list")
	})
	it("should include native tool instructions", async () => {
		const settings = {
			todoListEnabled: true,
			useAgentRules: true,
			newTaskRequireTodos: false,
		}
		const prompt = await (0, system_1.SYSTEM_PROMPT)(
			mockContext,
			"/test/path",
			false,
			undefined, // mcpHub
			undefined, // diffStrategy
			modes_1.defaultModeSlug, // mode
			undefined, // customModePrompts
			undefined, // customModes
			undefined, // globalCustomInstructions
			experiments,
			undefined, // language
			undefined, // rooIgnoreInstructions
			settings,
		)
		// Should contain TOOL USE section with native note
		expect(prompt).toContain("TOOL USE")
		expect(prompt).toContain("provider-native tool-calling mechanism")
		expect(prompt).toContain("Do not include XML markup or examples")
		// Should NOT contain XML-style tags or examples
		expect(prompt).not.toContain("<actual_tool_name>")
		expect(prompt).not.toContain("</actual_tool_name>")
		// Should contain Tool Use Guidelines section
		expect(prompt).toContain("Tool Use Guidelines")
		// Should NOT contain a tool catalog / XML examples
		expect(prompt).not.toContain("# Tools")
		expect(prompt).not.toContain("## read_file")
		expect(prompt).not.toContain("## execute_command")
		expect(prompt).not.toContain("<read_file>")
		expect(prompt).not.toContain("<path>")
		expect(prompt).not.toContain("Usage:")
		expect(prompt).not.toContain("Examples:")
		// Should still contain role definition and other non-XML sections
		expect(prompt).toContain(modes_1.modes[0].roleDefinition)
		expect(prompt).toContain("CAPABILITIES")
		expect(prompt).toContain("RULES")
		expect(prompt).toContain("SYSTEM INFORMATION")
		expect(prompt).toContain("OBJECTIVE")
	})
	afterAll(() => {
		vi.restoreAllMocks()
	})
})
