"use strict"
// npx vitest core/environment/__tests__/getEnvironmentDetails.spec.ts
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const p_wait_for_1 = __importDefault(require("p-wait-for"))
const delay_1 = __importDefault(require("delay"))
const getEnvironmentDetails_1 = require("../getEnvironmentDetails")
const modes_1 = require("../../../shared/modes")
const validateToolUse_1 = require("../../tools/validateToolUse")
const getApiMetrics_1 = require("../../../shared/getApiMetrics")
const list_files_1 = require("../../../services/glob/list-files")
const TerminalRegistry_1 = require("../../../integrations/terminal/TerminalRegistry")
const Terminal_1 = require("../../../integrations/terminal/Terminal")
const path_1 = require("../../../utils/path")
const responses_1 = require("../../prompts/responses")
const git_1 = require("../../../utils/git")
vi.mock("vscode", () => ({
	window: {
		tabGroups: { all: [], onDidChangeTabs: vi.fn() },
		visibleTextEditors: [],
	},
	env: {
		language: "en-US",
	},
}))
vi.mock("p-wait-for", () => ({
	default: vi.fn(),
}))
vi.mock("delay", () => ({
	default: vi.fn(),
}))
vi.mock("execa", () => ({
	execa: vi.fn(),
}))
vi.mock("../../../shared/modes")
vi.mock("../../../shared/getApiMetrics")
vi.mock("../../../services/glob/list-files")
vi.mock("../../../integrations/terminal/TerminalRegistry")
vi.mock("../../../integrations/terminal/Terminal")
vi.mock("../../../utils/path")
vi.mock("../../../utils/git")
vi.mock("../../prompts/responses")
vi.mock("../../tools/validateToolUse")
describe("getEnvironmentDetails", () => {
	const mockCwd = "/test/path"
	const mockTaskId = "test-task-id"
	let mockCline
	let mockProvider
	let mockState
	beforeEach(() => {
		vi.clearAllMocks()
		mockState = {
			terminalOutputLineLimit: 100,
			maxWorkspaceFiles: 50,
			maxOpenTabsContext: 10,
			mode: "code",
			customModes: [],
			experiments: {},
			customInstructions: "test instructions",
			language: "en",
			showAliIgnoredFiles: false,
		}
		mockProvider = {
			getState: vi.fn().mockResolvedValue(mockState),
		}
		mockCline = {
			cwd: mockCwd,
			taskId: mockTaskId,
			didEditFile: false,
			fileContextTracker: {
				getAndClearRecentlyModifiedFiles: vi.fn().mockReturnValue([]),
			},
			aliIgnoreController: {
				filterPaths: vi.fn((paths) => paths.join("\n")),
				cwd: mockCwd,
				ignoreInstance: {},
				disposables: [],
				rooIgnoreContent: "",
				isPathIgnored: vi.fn(),
				getIgnoreContent: vi.fn(),
				updateIgnoreContent: vi.fn(),
				addToIgnore: vi.fn(),
				removeFromIgnore: vi.fn(),
				dispose: vi.fn(),
			},
			clineMessages: [],
			api: {
				getModel: vi.fn().mockReturnValue({ id: "test-model", info: { contextWindow: 100000 } }),
				createMessage: vi.fn(),
				countTokens: vi.fn(),
			},
			providerRef: {
				deref: vi.fn().mockReturnValue(mockProvider),
				[Symbol.toStringTag]: "WeakRef",
			},
		}
		getApiMetrics_1.getApiMetrics.mockReturnValue({ contextTokens: 50000, totalCost: 0.25 })
		modes_1.getFullModeDetails.mockResolvedValue({
			name: "💻 Code",
			roleDefinition: "You are a code assistant",
			customInstructions: "Custom instructions",
		})
		validateToolUse_1.isToolAllowedForMode.mockReturnValue(true)
		list_files_1.listFiles.mockResolvedValue([["file1.ts", "file2.ts"], false])
		responses_1.formatResponse.formatFilesList.mockReturnValue("file1.ts\nfile2.ts")
		path_1.arePathsEqual.mockReturnValue(false)
		Terminal_1.Terminal.compressTerminalOutput.mockImplementation((output) => output)
		TerminalRegistry_1.TerminalRegistry.getTerminals.mockReturnValue([])
		TerminalRegistry_1.TerminalRegistry.getBackgroundTerminals.mockReturnValue([])
		TerminalRegistry_1.TerminalRegistry.isProcessHot.mockReturnValue(false)
		TerminalRegistry_1.TerminalRegistry.getUnretrievedOutput.mockReturnValue("")
		git_1.getGitStatus.mockResolvedValue("## main")
		vi.mocked(p_wait_for_1.default).mockResolvedValue(undefined)
		vi.mocked(delay_1.default).mockResolvedValue(undefined)
	})
	it("should return basic environment details", async () => {
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).toContain("<environment_details>")
		expect(result).toContain("</environment_details>")
		// Visible Files and Open Tabs headers only appear when there's content
		expect(result).toContain("# Current Time")
		expect(result).not.toContain("# Git Status") // Git status is disabled by default (maxGitStatusFiles = 0)
		expect(result).toContain("# Current Cost")
		expect(result).toContain("# Current Mode")
		expect(result).toContain("<model>test-model</model>")
		expect(mockProvider.getState).toHaveBeenCalled()
		expect(modes_1.getFullModeDetails).toHaveBeenCalledWith("code", [], undefined, {
			cwd: mockCwd,
			globalCustomInstructions: "test instructions",
			language: "en",
		})
		expect(getApiMetrics_1.getApiMetrics).toHaveBeenCalledWith(mockCline.clineMessages)
	})
	it("should include file details when includeFileDetails is true", async () => {
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline, true)
		expect(result).toContain("# Current Workspace Directory")
		expect(result).toContain("Files")
		expect(list_files_1.listFiles).toHaveBeenCalledWith(mockCwd, true, 50)
		expect(responses_1.formatResponse.formatFilesList).toHaveBeenCalledWith(
			mockCwd,
			["file1.ts", "file2.ts"],
			false,
			mockCline.aliIgnoreController,
			false,
		)
	})
	it("should not include file details when includeFileDetails is false", async () => {
		await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline, false)
		expect(list_files_1.listFiles).not.toHaveBeenCalled()
		expect(responses_1.formatResponse.formatFilesList).not.toHaveBeenCalled()
	})
	it("should handle desktop directory specially", async () => {
		path_1.arePathsEqual.mockReturnValue(true)
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline, true)
		expect(result).toContain("Desktop files not shown automatically")
		expect(list_files_1.listFiles).not.toHaveBeenCalled()
	})
	it("should skip file listing when maxWorkspaceFiles is 0", async () => {
		mockProvider.getState.mockResolvedValue({
			...mockState,
			maxWorkspaceFiles: 0,
		})
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline, true)
		expect(list_files_1.listFiles).not.toHaveBeenCalled()
		expect(result).toContain("Workspace files context disabled")
		expect(responses_1.formatResponse.formatFilesList).not.toHaveBeenCalled()
	})
	it("should include recently modified files if any", async () => {
		mockCline.fileContextTracker.getAndClearRecentlyModifiedFiles.mockReturnValue(["modified1.ts", "modified2.ts"])
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).toContain("# Recently Modified Files")
		expect(result).toContain("modified1.ts")
		expect(result).toContain("modified2.ts")
	})
	it("should include active terminal information", async () => {
		const mockActiveTerminal = {
			id: "terminal-1",
			getLastCommand: vi.fn().mockReturnValue("npm test"),
			getProcessesWithOutput: vi.fn().mockReturnValue([]),
			getCurrentWorkingDirectory: vi.fn().mockReturnValue("/test/path/src"),
		}
		TerminalRegistry_1.TerminalRegistry.getTerminals.mockReturnValue([mockActiveTerminal])
		TerminalRegistry_1.TerminalRegistry.getUnretrievedOutput.mockReturnValue("Test output")
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).toContain("# Actively Running Terminals")
		expect(result).toContain("## Terminal terminal-1 (Active)")
		expect(result).toContain("### Working Directory: `/test/path/src`")
		expect(result).toContain("### Original command: `npm test`")
		expect(result).toContain("Test output")
		mockCline.didEditFile = true
		await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(vi.mocked(delay_1.default)).toHaveBeenCalledWith(300)
		expect(vi.mocked(p_wait_for_1.default)).toHaveBeenCalled()
	})
	it("should include inactive terminals with output", async () => {
		const mockProcess = {
			command: "npm build",
			getUnretrievedOutput: vi.fn().mockReturnValue("Build output"),
		}
		const mockInactiveTerminal = {
			id: "terminal-2",
			getLastCommand: vi.fn().mockReturnValue("npm build"),
			getProcessesWithOutput: vi.fn().mockReturnValue([mockProcess]),
			cleanCompletedProcessQueue: vi.fn(),
			getCurrentWorkingDirectory: vi.fn().mockReturnValue("/test/path/build"),
		}
		TerminalRegistry_1.TerminalRegistry.getTerminals.mockImplementation((active) =>
			active ? [] : [mockInactiveTerminal],
		)
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).toContain("# Inactive Terminals with Completed Process Output")
		expect(result).toContain("## Terminal terminal-2 (Inactive)")
		expect(result).toContain("### Working Directory: `/test/path/build`")
		expect(result).toContain("Command: `npm build`")
		expect(result).toContain("Build output")
		expect(mockInactiveTerminal.cleanCompletedProcessQueue).toHaveBeenCalled()
	})
	it("should include working directory for terminals", async () => {
		const mockActiveTerminal = {
			id: "terminal-1",
			getLastCommand: vi.fn().mockReturnValue("cd /some/path && npm start"),
			getProcessesWithOutput: vi.fn().mockReturnValue([]),
			getCurrentWorkingDirectory: vi.fn().mockReturnValue("/some/path"),
		}
		const mockProcess = {
			command: "npm test",
			getUnretrievedOutput: vi.fn().mockReturnValue("Test completed"),
		}
		const mockInactiveTerminal = {
			id: "terminal-2",
			getLastCommand: vi.fn().mockReturnValue("npm test"),
			getProcessesWithOutput: vi.fn().mockReturnValue([mockProcess]),
			cleanCompletedProcessQueue: vi.fn(),
			getCurrentWorkingDirectory: vi.fn().mockReturnValue("/another/path"),
		}
		TerminalRegistry_1.TerminalRegistry.getTerminals.mockImplementation((active) =>
			active ? [mockActiveTerminal] : [mockInactiveTerminal],
		)
		TerminalRegistry_1.TerminalRegistry.getUnretrievedOutput.mockReturnValue("Server started")
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		// Check active terminal working directory
		expect(result).toContain("## Terminal terminal-1 (Active)")
		expect(result).toContain("### Working Directory: `/some/path`")
		expect(result).toContain("### Original command: `cd /some/path && npm start`")
		// Check inactive terminal working directory
		expect(result).toContain("## Terminal terminal-2 (Inactive)")
		expect(result).toContain("### Working Directory: `/another/path`")
		// Verify the methods were called
		expect(mockActiveTerminal.getCurrentWorkingDirectory).toHaveBeenCalled()
		expect(mockInactiveTerminal.getCurrentWorkingDirectory).toHaveBeenCalled()
	})
	it("should handle missing provider or state", async () => {
		// Mock provider to return null.
		mockCline.providerRef.deref = vi.fn().mockReturnValue(null)
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		// Verify the function still returns a result.
		expect(result).toContain("<environment_details>")
		expect(result).toContain("</environment_details>")
		// Mock provider to return null state.
		mockCline.providerRef.deref = vi.fn().mockReturnValue({
			getState: vi.fn().mockResolvedValue(null),
		})
		const result2 = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		// Verify the function still returns a result.
		expect(result2).toContain("<environment_details>")
		expect(result2).toContain("</environment_details>")
	})
	it("should handle errors gracefully", async () => {
		vi.mocked(p_wait_for_1.default).mockRejectedValue(new Error("Test error"))
		const mockErrorTerminal = {
			id: "terminal-1",
			getLastCommand: vi.fn().mockReturnValue("npm test"),
			getProcessesWithOutput: vi.fn().mockReturnValue([]),
			getCurrentWorkingDirectory: vi.fn().mockReturnValue("/test/path"),
		}
		TerminalRegistry_1.TerminalRegistry.getTerminals.mockReturnValue([mockErrorTerminal])
		TerminalRegistry_1.TerminalRegistry.getBackgroundTerminals.mockReturnValue([])
		mockCline.fileContextTracker.getAndClearRecentlyModifiedFiles.mockReturnValue([])
		await expect((0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)).resolves.not.toThrow()
	})
	it("should include REMINDERS section when todoListEnabled is true", async () => {
		mockProvider.getState.mockResolvedValue({
			...mockState,
			apiConfiguration: { todoListEnabled: true },
		})
		const cline = { ...mockCline, todoList: [{ content: "test", status: "pending" }] }
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(cline)
		expect(result).toContain("REMINDERS")
	})
	it("should NOT include REMINDERS section when todoListEnabled is false", async () => {
		mockProvider.getState.mockResolvedValue({
			...mockState,
			apiConfiguration: { todoListEnabled: false },
		})
		const cline = { ...mockCline, todoList: [{ content: "test", status: "pending" }] }
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(cline)
		expect(result).not.toContain("REMINDERS")
	})
	it("should include REMINDERS section when todoListEnabled is undefined", async () => {
		mockProvider.getState.mockResolvedValue({
			...mockState,
			apiConfiguration: {},
		})
		const cline = { ...mockCline, todoList: [{ content: "test", status: "pending" }] }
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(cline)
		expect(result).toContain("REMINDERS")
	})
	it("should include git status when maxGitStatusFiles > 0", async () => {
		git_1.getGitStatus.mockResolvedValue("## main\nM  file1.ts")
		mockProvider.getState.mockResolvedValue({
			...mockState,
			maxGitStatusFiles: 10,
		})
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).toContain("# Git Status")
		expect(result).toContain("## main")
		expect(git_1.getGitStatus).toHaveBeenCalledWith(mockCwd, 10)
	})
	it("should NOT include git status when maxGitStatusFiles is 0", async () => {
		mockProvider.getState.mockResolvedValue({
			...mockState,
			maxGitStatusFiles: 0,
		})
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).not.toContain("# Git Status")
		expect(git_1.getGitStatus).not.toHaveBeenCalled()
	})
	it("should NOT include git status when maxGitStatusFiles is undefined (defaults to 0)", async () => {
		mockProvider.getState.mockResolvedValue({
			...mockState,
			maxGitStatusFiles: undefined,
		})
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).not.toContain("# Git Status")
		expect(git_1.getGitStatus).not.toHaveBeenCalled()
	})
	it("should handle git status returning null gracefully when enabled", async () => {
		git_1.getGitStatus.mockResolvedValue(null)
		mockProvider.getState.mockResolvedValue({
			...mockState,
			maxGitStatusFiles: 10,
		})
		const result = await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(result).not.toContain("# Git Status")
		expect(git_1.getGitStatus).toHaveBeenCalledWith(mockCwd, 10)
	})
	it("should pass maxFiles parameter to getGitStatus", async () => {
		git_1.getGitStatus.mockResolvedValue("## main")
		mockProvider.getState.mockResolvedValue({
			...mockState,
			maxGitStatusFiles: 5,
		})
		await (0, getEnvironmentDetails_1.getEnvironmentDetails)(mockCline)
		expect(git_1.getGitStatus).toHaveBeenCalledWith(mockCwd, 5)
	})
})
