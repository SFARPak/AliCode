"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const orchestrator_1 = require("../orchestrator")
// Mock vscode workspace so startIndexing passes workspace check
vitest_1.vi.mock("vscode", () => {
	const path = require("path")
	const testWorkspacePath = path.join(path.sep, "test", "workspace")
	return {
		window: {
			activeTextEditor: null,
		},
		workspace: {
			workspaceFolders: [
				{
					uri: { fsPath: testWorkspacePath },
					name: "test",
					index: 0,
				},
			],
			createFileSystemWatcher: vitest_1.vi.fn().mockReturnValue({
				onDidCreate: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
				onDidChange: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
				onDidDelete: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
				dispose: vitest_1.vi.fn(),
			}),
		},
		RelativePattern: vitest_1.vi.fn().mockImplementation((base, pattern) => ({ base, pattern })),
	}
})
// Mock i18n translator used in orchestrator messages
vitest_1.vi.mock("../../i18n", () => ({
	t: (key, params) => {
		if (key === "embeddings:orchestrator.failedDuringInitialScan" && params?.errorMessage) {
			return `Failed during initial scan: ${params.errorMessage}`
		}
		return key
	},
}))
;(0, vitest_1.describe)("CodeIndexOrchestrator - error path cleanup gating", () => {
	const workspacePath = "/test/workspace"
	let configManager
	let stateManager
	let cacheManager
	let vectorStore
	let scanner
	let fileWatcher
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		configManager = {
			isFeatureConfigured: true,
		}
		// Minimal state manager that tracks state transitions
		let currentState = "Standby"
		stateManager = {
			get state() {
				return currentState
			},
			setSystemState: vitest_1.vi.fn().mockImplementation((state, _msg) => {
				currentState = state
			}),
			reportFileQueueProgress: vitest_1.vi.fn(),
			reportBlockIndexingProgress: vitest_1.vi.fn(),
		}
		cacheManager = {
			clearCacheFile: vitest_1.vi.fn().mockResolvedValue(undefined),
			flush: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		vectorStore = {
			initialize: vitest_1.vi.fn(),
			hasIndexedData: vitest_1.vi.fn(),
			markIndexingIncomplete: vitest_1.vi.fn(),
			markIndexingComplete: vitest_1.vi.fn(),
			clearCollection: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		scanner = {
			scanDirectory: vitest_1.vi.fn(),
		}
		fileWatcher = {
			initialize: vitest_1.vi.fn().mockResolvedValue(undefined),
			onDidStartBatchProcessing: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
			onBatchProgressUpdate: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
			onDidFinishBatchProcessing: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
			dispose: vitest_1.vi.fn(),
		}
	})
	;(0, vitest_1.it)(
		"should not call clearCollection() or clear cache when initialize() fails (indexing not started)",
		async () => {
			// Arrange: fail at initialize()
			vectorStore.initialize.mockRejectedValue(new Error("Qdrant unreachable"))
			const orchestrator = new orchestrator_1.CodeIndexOrchestrator(
				configManager,
				stateManager,
				workspacePath,
				cacheManager,
				vectorStore,
				scanner,
				fileWatcher,
			)
			// Act
			await orchestrator.startIndexing()
			// Assert
			;(0, vitest_1.expect)(vectorStore.clearCollection).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(cacheManager.clearCacheFile).not.toHaveBeenCalled()
			// Error state should be set
			;(0, vitest_1.expect)(stateManager.setSystemState).toHaveBeenCalled()
			const lastCall = stateManager.setSystemState.mock.calls[stateManager.setSystemState.mock.calls.length - 1]
			;(0, vitest_1.expect)(lastCall[0]).toBe("Error")
		},
	)
	;(0, vitest_1.it)(
		"should call clearCollection() and clear cache when an error occurs after initialize() succeeds (indexing started)",
		async () => {
			// Arrange: initialize succeeds; fail soon after to enter error path with indexingStarted=true
			vectorStore.initialize.mockResolvedValue(false) // existing collection
			vectorStore.hasIndexedData.mockResolvedValue(false) // force full scan path
			vectorStore.markIndexingIncomplete.mockRejectedValue(new Error("mark incomplete failure"))
			const orchestrator = new orchestrator_1.CodeIndexOrchestrator(
				configManager,
				stateManager,
				workspacePath,
				cacheManager,
				vectorStore,
				scanner,
				fileWatcher,
			)
			// Act
			await orchestrator.startIndexing()
			// Assert: cleanup gated behind indexingStarted should have happened
			;(0, vitest_1.expect)(vectorStore.clearCollection).toHaveBeenCalledTimes(1)
			;(0, vitest_1.expect)(cacheManager.clearCacheFile).toHaveBeenCalledTimes(1)
			// Error state should be set
			;(0, vitest_1.expect)(stateManager.setSystemState).toHaveBeenCalled()
			const lastCall = stateManager.setSystemState.mock.calls[stateManager.setSystemState.mock.calls.length - 1]
			;(0, vitest_1.expect)(lastCall[0]).toBe("Error")
		},
	)
})
;(0, vitest_1.describe)("CodeIndexOrchestrator - stopIndexing", () => {
	const workspacePath = "/test/workspace"
	let configManager
	let stateManager
	let cacheManager
	let vectorStore
	let scanner
	let fileWatcher
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		configManager = {
			isFeatureConfigured: true,
		}
		let currentState = "Standby"
		stateManager = {
			get state() {
				return currentState
			},
			setSystemState: vitest_1.vi.fn().mockImplementation((state, _msg) => {
				currentState = state
			}),
			reportFileQueueProgress: vitest_1.vi.fn(),
			reportBlockIndexingProgress: vitest_1.vi.fn(),
		}
		cacheManager = {
			clearCacheFile: vitest_1.vi.fn().mockResolvedValue(undefined),
			flush: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		vectorStore = {
			initialize: vitest_1.vi.fn().mockResolvedValue(false),
			hasIndexedData: vitest_1.vi.fn().mockResolvedValue(false),
			markIndexingIncomplete: vitest_1.vi.fn().mockResolvedValue(undefined),
			markIndexingComplete: vitest_1.vi.fn().mockResolvedValue(undefined),
			clearCollection: vitest_1.vi.fn().mockResolvedValue(undefined),
		}
		scanner = {
			scanDirectory: vitest_1.vi.fn(),
		}
		fileWatcher = {
			initialize: vitest_1.vi.fn().mockResolvedValue(undefined),
			onDidStartBatchProcessing: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
			onBatchProgressUpdate: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
			onDidFinishBatchProcessing: vitest_1.vi.fn().mockReturnValue({ dispose: vitest_1.vi.fn() }),
			dispose: vitest_1.vi.fn(),
		}
	})
	;(0, vitest_1.it)("should abort indexing when stopIndexing() is called", async () => {
		// Make scanner hang until aborted
		scanner.scanDirectory.mockImplementation(async (_dir, _onError, _onBlocksIndexed, _onFileParsed, signal) => {
			// Wait for abort signal
			await new Promise((resolve) => {
				if (signal?.aborted) {
					resolve()
					return
				}
				signal?.addEventListener("abort", () => resolve())
			})
			return { stats: { processed: 0, skipped: 0 }, totalBlockCount: 0 }
		})
		const orchestrator = new orchestrator_1.CodeIndexOrchestrator(
			configManager,
			stateManager,
			workspacePath,
			cacheManager,
			vectorStore,
			scanner,
			fileWatcher,
		)
		// Start indexing (async, don't await)
		const indexingPromise = orchestrator.startIndexing()
		// Give it a tick to begin
		await new Promise((resolve) => setTimeout(resolve, 10))
		// Stop indexing
		orchestrator.stopIndexing()
		// Wait for indexing to complete
		await indexingPromise
		// State should be Standby (not Error)
		const setStateCalls = stateManager.setSystemState.mock.calls
		const lastCall = setStateCalls[setStateCalls.length - 1]
		;(0, vitest_1.expect)(lastCall[0]).toBe("Standby")
	})
	;(0, vitest_1.it)("should set state to Standby after abort, not Error", async () => {
		// Make scanner throw AbortError when signal is aborted
		scanner.scanDirectory.mockImplementation(async (_dir, _onError, _onBlocksIndexed, _onFileParsed, signal) => {
			await new Promise((resolve) => {
				if (signal?.aborted) {
					resolve()
					return
				}
				signal?.addEventListener("abort", () => resolve())
			})
			throw new DOMException("Indexing aborted", "AbortError")
		})
		const orchestrator = new orchestrator_1.CodeIndexOrchestrator(
			configManager,
			stateManager,
			workspacePath,
			cacheManager,
			vectorStore,
			scanner,
			fileWatcher,
		)
		const indexingPromise = orchestrator.startIndexing()
		await new Promise((resolve) => setTimeout(resolve, 10))
		orchestrator.stopIndexing()
		await indexingPromise
		// Should NOT have set Error state — abort is handled gracefully
		const errorCalls = stateManager.setSystemState.mock.calls.filter((call) => call[0] === "Error")
		;(0, vitest_1.expect)(errorCalls).toHaveLength(0)
		// Should NOT have cleared collection on abort
		;(0, vitest_1.expect)(vectorStore.clearCollection).not.toHaveBeenCalled()
	})
	;(0, vitest_1.it)("should preserve partial index data after stop", async () => {
		scanner.scanDirectory.mockImplementation(async (_dir, _onError, _onBlocksIndexed, _onFileParsed, signal) => {
			await new Promise((resolve) => {
				if (signal?.aborted) {
					resolve()
					return
				}
				signal?.addEventListener("abort", () => resolve())
			})
			return { stats: { processed: 5, skipped: 0 }, totalBlockCount: 5 }
		})
		const orchestrator = new orchestrator_1.CodeIndexOrchestrator(
			configManager,
			stateManager,
			workspacePath,
			cacheManager,
			vectorStore,
			scanner,
			fileWatcher,
		)
		const indexingPromise = orchestrator.startIndexing()
		await new Promise((resolve) => setTimeout(resolve, 10))
		orchestrator.stopIndexing()
		await indexingPromise
		// Cache should NOT be cleared on user-initiated stop
		;(0, vitest_1.expect)(cacheManager.clearCacheFile).not.toHaveBeenCalled()
		// Collection should NOT be cleared on user-initiated stop
		;(0, vitest_1.expect)(vectorStore.clearCollection).not.toHaveBeenCalled()
	})
})
