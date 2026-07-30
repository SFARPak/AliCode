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
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const vscode = __importStar(require("vscode"))
const WorkspaceTracker_1 = __importDefault(require("../WorkspaceTracker"))
const list_files_1 = require("../../../services/glob/list-files")
const path_1 = require("../../../utils/path")
// Mock functions - must be defined before vitest.mock calls
const mockOnDidCreate = vitest.fn()
const mockOnDidDelete = vitest.fn()
const mockDispose = vitest.fn()
// Store registered tab change callback
let registeredTabChangeCallback = null
// Mock workspace path
vitest.mock("../../../utils/path", () => ({
	getWorkspacePath: vitest.fn().mockReturnValue("/test/workspace"),
	toRelativePath: vitest.fn((path, cwd) => {
		// Handle both Windows and POSIX paths by using path.relative
		const relativePath = require("path").relative(cwd, path)
		// Convert to forward slashes for consistency
		let normalizedPath = relativePath.replace(/\\/g, "/")
		// Add trailing slash if original path had one
		return path.endsWith("/") ? normalizedPath + "/" : normalizedPath
	}),
}))
// Mock watcher - must be defined after mockDispose but before vitest.mock("vscode")
const mockWatcher = {
	onDidCreate: mockOnDidCreate.mockReturnValue({ dispose: mockDispose }),
	onDidDelete: mockOnDidDelete.mockReturnValue({ dispose: mockDispose }),
	dispose: mockDispose,
}
// Mock vscode
vitest.mock("vscode", () => ({
	window: {
		tabGroups: {
			onDidChangeTabs: vitest.fn((callback) => {
				registeredTabChangeCallback = callback
				return { dispose: mockDispose }
			}),
			all: [],
		},
		onDidChangeActiveTextEditor: vitest.fn(() => ({ dispose: vitest.fn() })),
	},
	workspace: {
		workspaceFolders: [
			{
				uri: { fsPath: "/test/workspace" },
				name: "test",
				index: 0,
			},
		],
		createFileSystemWatcher: vitest.fn(() => mockWatcher),
		fs: {
			stat: vitest.fn().mockResolvedValue({ type: 1 }), // FileType.File = 1
		},
	},
	FileType: { File: 1, Directory: 2 },
}))
vitest.mock("../../../services/glob/list-files", () => ({
	listFiles: vitest.fn(),
}))
describe("WorkspaceTracker", () => {
	let workspaceTracker
	let mockProvider
	beforeEach(() => {
		vitest.clearAllMocks()
		vitest.useFakeTimers()
		// Reset all mock implementations
		registeredTabChangeCallback = null
		path_1.getWorkspacePath.mockReturnValue("/test/workspace")
		// Create provider mock
		mockProvider = {
			postMessageToWebview: vitest.fn().mockResolvedValue(undefined),
		}
		// Create tracker instance
		workspaceTracker = new WorkspaceTracker_1.default(mockProvider)
		// Ensure the tab change callback was registered
		expect(registeredTabChangeCallback).not.toBeNull()
	})
	it("should initialize with workspace files", async () => {
		const mockFiles = [["/test/workspace/file1.ts", "/test/workspace/file2.ts"], false]
		list_files_1.listFiles.mockResolvedValue(mockFiles)
		await workspaceTracker.initializeFilePaths()
		vitest.runAllTimers()
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "workspaceUpdated",
			filePaths: expect.arrayContaining(["file1.ts", "file2.ts"]),
			openedTabs: [],
		})
		expect(mockProvider.postMessageToWebview.mock.calls[0][0].filePaths).toHaveLength(2)
	})
	it("should handle file creation events", async () => {
		// Get the creation callback and call it
		const [[callback]] = mockOnDidCreate.mock.calls
		await callback({ fsPath: "/test/workspace/newfile.ts" })
		vitest.runAllTimers()
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "workspaceUpdated",
			filePaths: ["newfile.ts"],
			openedTabs: [],
		})
	})
	it("should handle file deletion events", async () => {
		// First add a file
		const [[createCallback]] = mockOnDidCreate.mock.calls
		await createCallback({ fsPath: "/test/workspace/file.ts" })
		vitest.runAllTimers()
		// Then delete it
		const [[deleteCallback]] = mockOnDidDelete.mock.calls
		await deleteCallback({ fsPath: "/test/workspace/file.ts" })
		vitest.runAllTimers()
		// The last call should have empty filePaths
		expect(mockProvider.postMessageToWebview).toHaveBeenLastCalledWith({
			type: "workspaceUpdated",
			filePaths: [],
			openedTabs: [],
		})
	})
	it("should handle directory paths correctly", async () => {
		// Mock stat to return directory type
		vscode.workspace.fs.stat.mockResolvedValueOnce({ type: 2 }) // FileType.Directory = 2
		const [[callback]] = mockOnDidCreate.mock.calls
		await callback({ fsPath: "/test/workspace/newdir" })
		vitest.runAllTimers()
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "workspaceUpdated",
			filePaths: expect.arrayContaining(["newdir"]),
			openedTabs: [],
		})
		const lastCall = mockProvider.postMessageToWebview.mock.calls.slice(-1)[0]
		expect(lastCall[0].filePaths).toHaveLength(1)
	})
	it("should respect file limits", async () => {
		// Create array of unique file paths for initial load
		const files = Array.from({ length: 1001 }, (_, i) => `/test/workspace/file${i}.ts`)
		list_files_1.listFiles.mockResolvedValue([files, false])
		await workspaceTracker.initializeFilePaths()
		vitest.runAllTimers()
		// Should only have 1000 files initially
		const expectedFiles = Array.from({ length: 1000 }, (_, i) => `file${i}.ts`).sort()
		const calls = mockProvider.postMessageToWebview.mock.calls
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "workspaceUpdated",
			filePaths: expect.arrayContaining(expectedFiles),
			openedTabs: [],
		})
		expect(calls[0][0].filePaths).toHaveLength(1000)
		// Should allow adding up to 2000 total files
		const [[callback]] = mockOnDidCreate.mock.calls
		for (let i = 0; i < 1000; i++) {
			await callback({ fsPath: `/test/workspace/extra${i}.ts` })
		}
		vitest.runAllTimers()
		const lastCall = mockProvider.postMessageToWebview.mock.calls.slice(-1)[0]
		expect(lastCall[0].filePaths).toHaveLength(2000)
		// Adding one more file beyond 2000 should not increase the count
		await callback({ fsPath: "/test/workspace/toomany.ts" })
		vitest.runAllTimers()
		const finalCall = mockProvider.postMessageToWebview.mock.calls.slice(-1)[0]
		expect(finalCall[0].filePaths).toHaveLength(2000)
	})
	it("should clean up watchers and timers on dispose", () => {
		// Set up updateTimer
		const [[callback]] = mockOnDidCreate.mock.calls
		callback({ fsPath: "/test/workspace/file.ts" })
		workspaceTracker.dispose()
		expect(mockDispose).toHaveBeenCalled()
		vitest.runAllTimers() // Ensure any pending timers are cleared
		// No more updates should happen after dispose
		expect(mockProvider.postMessageToWebview).not.toHaveBeenCalled()
	})
	it("should handle workspace path changes when tabs change", async () => {
		expect(registeredTabChangeCallback).not.toBeNull()
		path_1.getWorkspacePath.mockReturnValue("/test/workspace")
		workspaceTracker = new WorkspaceTracker_1.default(mockProvider)
		// Clear any initialization calls
		vitest.clearAllMocks()
		// Mock listFiles to return some files
		const mockFiles = [["/test/new-workspace/file1.ts"], false]
		list_files_1.listFiles.mockResolvedValue(mockFiles)
		path_1.getWorkspacePath.mockReturnValue("/test/new-workspace")
		// Simulate tab change event
		await registeredTabChangeCallback()
		// Run the debounce timer for workspaceDidReset
		vitest.advanceTimersByTime(300)
		// Should clear file paths and reset workspace
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "workspaceUpdated",
			filePaths: [],
			openedTabs: [],
		})
		// Run all remaining timers to complete initialization
		await Promise.resolve() // Wait for initializeFilePaths to complete
		vitest.runAllTimers()
		// Should initialize file paths for new workspace
		expect(list_files_1.listFiles).toHaveBeenCalledWith("/test/new-workspace", true, 1000)
		vitest.runAllTimers()
	})
	it("should not update file paths if workspace changes during initialization", async () => {
		// Setup initial workspace path
		path_1.getWorkspacePath.mockReturnValue("/test/workspace")
		workspaceTracker = new WorkspaceTracker_1.default(mockProvider)
		// Clear any initialization calls
		vitest.clearAllMocks()
		mockProvider.postMessageToWebview.mockClear()
		// Create a promise to control listFiles timing
		let resolveListFiles
		const listFilesPromise = new Promise((resolve) => {
			resolveListFiles = resolve
		})
		list_files_1.listFiles.mockImplementation(() => {
			// Change workspace path before listFiles resolves
			path_1.getWorkspacePath.mockReturnValue("/test/changed-workspace")
			return listFilesPromise
		})
		// Start initialization
		const initPromise = workspaceTracker.initializeFilePaths()
		// Resolve listFiles after workspace path change
		resolveListFiles([["/test/workspace/file1.ts", "/test/workspace/file2.ts"], false])
		// Wait for initialization to complete
		await initPromise
		vitest.runAllTimers()
		// Should not update file paths because workspace changed during initialization
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith(
			expect.objectContaining({
				type: "workspaceUpdated",
				openedTabs: [],
			}),
		)
		// Extract the actual file paths to verify format
		const actualFilePaths = mockProvider.postMessageToWebview.mock.calls[0][0].filePaths
		// Verify file path array length
		expect(actualFilePaths).toHaveLength(2)
		// Verify file paths contain the expected file names regardless of platform specifics
		expect(actualFilePaths.every((path) => path.includes("file1.ts") || path.includes("file2.ts"))).toBe(true)
	})
	it("should clear resetTimer when calling workspaceDidReset multiple times", async () => {
		expect(registeredTabChangeCallback).not.toBeNull()
		path_1.getWorkspacePath.mockReturnValue("/test/workspace")
		// Create tracker instance to set initial prevWorkSpacePath
		workspaceTracker = new WorkspaceTracker_1.default(mockProvider)
		path_1.getWorkspacePath.mockReturnValue("/test/new-workspace")
		// Call workspaceDidReset through tab change event
		await registeredTabChangeCallback()
		// Call again before timer completes
		await registeredTabChangeCallback()
		// Advance timer
		vitest.advanceTimersByTime(300)
		// Should only have one call to postMessageToWebview
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledWith({
			type: "workspaceUpdated",
			filePaths: [],
			openedTabs: [],
		})
		expect(mockProvider.postMessageToWebview).toHaveBeenCalledTimes(1)
	})
	it("should handle dispose with active resetTimer", async () => {
		expect(registeredTabChangeCallback).not.toBeNull()
		path_1.getWorkspacePath.mockReturnValueOnce("/test/workspace").mockReturnValueOnce("/test/new-workspace")
		// Trigger resetTimer
		await registeredTabChangeCallback()
		// Dispose before timer completes
		workspaceTracker.dispose()
		// Advance timer
		vitest.advanceTimersByTime(300)
		// Should have called dispose on all disposables
		expect(mockDispose).toHaveBeenCalled()
		// No postMessage should be called after dispose
		expect(mockProvider.postMessageToWebview).not.toHaveBeenCalled()
	})
})
