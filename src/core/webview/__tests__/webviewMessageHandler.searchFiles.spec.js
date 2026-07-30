"use strict"
// npx vitest core/webview/__tests__/webviewMessageHandler.searchFiles.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
// Mock dependencies - must come before imports
vi.mock("../../../services/search/file-search")
vi.mock("../../ignore/AliIgnoreController")
const webviewMessageHandler_1 = require("../webviewMessageHandler")
const file_search_1 = require("../../../services/search/file-search")
const AliIgnoreController_1 = require("../../ignore/AliIgnoreController")
const mockSearchWorkspaceFiles = file_search_1.searchWorkspaceFiles
vi.mock("vscode", () => ({
	window: {
		showInformationMessage: vi.fn(),
		showErrorMessage: vi.fn(),
	},
	workspace: {
		workspaceFolders: [{ uri: { fsPath: "/mock/workspace" } }],
	},
}))
describe("webviewMessageHandler - searchFiles with RooIgnore filtering", () => {
	let mockClineProvider
	let mockFilterPaths
	let mockDispose
	beforeEach(() => {
		vi.clearAllMocks()
		// Spy on the mock AliIgnoreController prototype methods
		mockFilterPaths = vi.fn()
		mockDispose = vi.fn()
		AliIgnoreController_1.AliIgnoreController.prototype.filterPaths = mockFilterPaths
		AliIgnoreController_1.AliIgnoreController.prototype.initialize = vi.fn().mockResolvedValue(undefined)
		AliIgnoreController_1.AliIgnoreController.prototype.dispose = mockDispose
		// Create mock ClineProvider
		mockClineProvider = {
			getState: vi.fn(),
			postMessageToWebview: vi.fn(),
			getCurrentTask: vi.fn(),
			cwd: "/mock/workspace",
		}
	})
	it("should filter results using AliIgnoreController when showAliIgnoredFiles is false", async () => {
		// Setup mock results from file search
		const mockResults = [
			{ path: "src/index.ts", type: "file", label: "index.ts" },
			{ path: "secrets/config.json", type: "file", label: "config.json" },
			{ path: "src/utils.ts", type: "file", label: "utils.ts" },
		]
		mockSearchWorkspaceFiles.mockResolvedValue(mockResults)
		mockClineProvider.getState.mockResolvedValue({
			showAliIgnoredFiles: false,
		})
		// Setup filter to exclude secrets folder
		mockFilterPaths.mockReturnValue(["src/index.ts", "src/utils.ts"])
		mockClineProvider.getCurrentTask.mockReturnValue(null)
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "index",
			requestId: "test-request-123",
		})
		// Verify filterPaths was called with all result paths
		expect(mockFilterPaths).toHaveBeenCalledWith(["src/index.ts", "secrets/config.json", "src/utils.ts"])
		// Verify filtered results were sent to webview
		expect(mockClineProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "fileSearchResults",
			results: [
				{ path: "src/index.ts", type: "file", label: "index.ts" },
				{ path: "src/utils.ts", type: "file", label: "utils.ts" },
			],
			requestId: "test-request-123",
		})
	})
	it("should not filter results when showAliIgnoredFiles is true", async () => {
		// Setup mock results from file search
		const mockResults = [
			{ path: "src/index.ts", type: "file", label: "index.ts" },
			{ path: "secrets/config.json", type: "file", label: "config.json" },
		]
		mockSearchWorkspaceFiles.mockResolvedValue(mockResults)
		mockClineProvider.getState.mockResolvedValue({
			showAliIgnoredFiles: true,
		})
		mockClineProvider.getCurrentTask.mockReturnValue(null)
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "index",
			requestId: "test-request-456",
		})
		// Verify filterPaths was NOT called
		expect(mockFilterPaths).not.toHaveBeenCalled()
		// Verify all results were sent to webview (unfiltered)
		expect(mockClineProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "fileSearchResults",
			results: mockResults,
			requestId: "test-request-456",
		})
	})
	it("should use existing AliIgnoreController from current task", async () => {
		// Setup mock results from file search
		const mockResults = [
			{ path: "src/index.ts", type: "file", label: "index.ts" },
			{ path: "private/secret.ts", type: "file", label: "secret.ts" },
		]
		mockSearchWorkspaceFiles.mockResolvedValue(mockResults)
		mockClineProvider.getState.mockResolvedValue({
			showAliIgnoredFiles: false,
		})
		// Create a mock task with its own AliIgnoreController
		const taskFilterPaths = vi.fn().mockReturnValue(["src/index.ts"])
		const taskRooIgnoreController = {
			filterPaths: taskFilterPaths,
			initialize: vi.fn(),
		}
		mockClineProvider.getCurrentTask.mockReturnValue({
			taskId: "test-task-id",
			aliIgnoreController: taskRooIgnoreController,
		})
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "index",
			requestId: "test-request-789",
		})
		// Verify the task's controller was used (not the prototype)
		expect(taskFilterPaths).toHaveBeenCalledWith(["src/index.ts", "private/secret.ts"])
		// Verify filtered results were sent to webview
		expect(mockClineProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "fileSearchResults",
			results: [{ path: "src/index.ts", type: "file", label: "index.ts" }],
			requestId: "test-request-789",
		})
	})
	it("should handle error when no workspace path is available", async () => {
		// Create provider without cwd
		mockClineProvider = {
			...mockClineProvider,
			cwd: undefined,
			getCurrentTask: vi.fn().mockReturnValue(null),
		}
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "test",
			requestId: "test-request-error",
		})
		// Verify error response was sent
		expect(mockClineProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "fileSearchResults",
			results: [],
			requestId: "test-request-error",
			error: "No workspace path available",
		})
	})
	it("should handle errors from searchWorkspaceFiles", async () => {
		mockSearchWorkspaceFiles.mockRejectedValue(new Error("File search failed"))
		mockClineProvider.getState.mockResolvedValue({
			showAliIgnoredFiles: false,
		})
		mockClineProvider.getCurrentTask.mockReturnValue(null)
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "test",
			requestId: "test-request-fail",
		})
		// Verify error response was sent
		expect(mockClineProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "fileSearchResults",
			results: [],
			error: "File search failed",
			requestId: "test-request-fail",
		})
	})
	it("should default showAliIgnoredFiles to false when state is null", async () => {
		// Setup mock results from file search
		const mockResults = [{ path: "src/index.ts", type: "file", label: "index.ts" }]
		mockSearchWorkspaceFiles.mockResolvedValue(mockResults)
		mockClineProvider.getState.mockResolvedValue(null)
		// Setup filter to return all paths (no filtering)
		mockFilterPaths.mockReturnValue(["src/index.ts"])
		mockClineProvider.getCurrentTask.mockReturnValue(null)
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "index",
			requestId: "test-request-default",
		})
		// Verify filterPaths was called (showAliIgnoredFiles defaults to false)
		expect(mockFilterPaths).toHaveBeenCalled()
	})
	it("should dispose temporary AliIgnoreController after use", async () => {
		// Setup mock results from file search
		const mockResults = [{ path: "src/index.ts", type: "file", label: "index.ts" }]
		mockSearchWorkspaceFiles.mockResolvedValue(mockResults)
		mockClineProvider.getState.mockResolvedValue({
			showAliIgnoredFiles: false,
		})
		// Setup filter
		mockFilterPaths.mockReturnValue(["src/index.ts"])
		mockClineProvider.getCurrentTask.mockReturnValue(null)
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "index",
			requestId: "test-request-dispose",
		})
		// Verify dispose was called on the temporary controller
		expect(mockDispose).toHaveBeenCalled()
	})
	it("should not dispose controller from current task", async () => {
		// Setup mock results from file search
		const mockResults = [{ path: "src/index.ts", type: "file", label: "index.ts" }]
		mockSearchWorkspaceFiles.mockResolvedValue(mockResults)
		mockClineProvider.getState.mockResolvedValue({
			showAliIgnoredFiles: false,
		})
		// Create a mock task with its own AliIgnoreController
		const taskFilterPaths = vi.fn().mockReturnValue(["src/index.ts"])
		const taskDispose = vi.fn()
		const taskRooIgnoreController = {
			filterPaths: taskFilterPaths,
			initialize: vi.fn(),
			dispose: taskDispose,
		}
		mockClineProvider.getCurrentTask.mockReturnValue({
			taskId: "test-task-id",
			aliIgnoreController: taskRooIgnoreController,
		})
		await (0, webviewMessageHandler_1.webviewMessageHandler)(mockClineProvider, {
			type: "searchFiles",
			query: "index",
			requestId: "test-request-no-dispose",
		})
		// Verify dispose was NOT called on the task's controller
		expect(taskDispose).not.toHaveBeenCalled()
		// Verify the prototype dispose was also not called
		expect(mockDispose).not.toHaveBeenCalled()
	})
})
