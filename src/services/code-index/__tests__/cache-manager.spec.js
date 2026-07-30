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
const crypto_1 = require("crypto")
const lodash_debounce_1 = __importDefault(require("lodash.debounce"))
const cache_manager_1 = require("../cache-manager")
// Mock safeWriteJson utility
vitest.mock("../../../utils/safeWriteJson", () => ({
	safeWriteJson: vitest.fn().mockResolvedValue(undefined),
}))
// Import the mocked version
const safeWriteJson_1 = require("../../../utils/safeWriteJson")
// Mock vscode
vitest.mock("vscode", () => ({
	Uri: {
		joinPath: vitest.fn(),
	},
	workspace: {
		fs: {
			readFile: vitest.fn(),
			writeFile: vitest.fn(),
			delete: vitest.fn(),
		},
	},
}))
// Mock debounce to execute immediately
vitest.mock("lodash.debounce", () => ({ default: vitest.fn((fn) => fn) }))
describe("CacheManager", () => {
	let mockContext
	let mockWorkspacePath
	let mockCachePath
	let cacheManager
	beforeEach(() => {
		// Reset all mocks
		vitest.clearAllMocks()
		// Mock context
		mockWorkspacePath = "/mock/workspace"
		mockCachePath = { fsPath: "/mock/storage/cache.json" }
		mockContext = {
			globalStorageUri: { fsPath: "/mock/storage" },
		}
		vscode.Uri.joinPath.mockReturnValue(mockCachePath)
		// Create cache manager instance
		cacheManager = new cache_manager_1.CacheManager(mockContext, mockWorkspacePath)
	})
	describe("constructor", () => {
		it("should correctly set up cachePath using Uri.joinPath and crypto.createHash", () => {
			const expectedHash = (0, crypto_1.createHash)("sha256").update(mockWorkspacePath).digest("hex")
			expect(vscode.Uri.joinPath).toHaveBeenCalledWith(
				mockContext.globalStorageUri,
				`roo-index-cache-${expectedHash}.json`,
			)
		})
		it("should set up debounced save function", () => {
			expect(lodash_debounce_1.default).toHaveBeenCalledWith(expect.any(Function), 1500)
		})
	})
	describe("initialize", () => {
		it("should load existing cache file successfully", async () => {
			const mockCache = { "file1.ts": "hash1", "file2.ts": "hash2" }
			const mockBuffer = Buffer.from(JSON.stringify(mockCache))
			vscode.workspace.fs.readFile.mockResolvedValue(mockBuffer)
			await cacheManager.initialize()
			expect(vscode.workspace.fs.readFile).toHaveBeenCalledWith(mockCachePath)
			expect(cacheManager.getAllHashes()).toEqual(mockCache)
		})
		it("should handle missing cache file by creating empty cache", async () => {
			vscode.workspace.fs.readFile.mockRejectedValue(new Error("File not found"))
			await cacheManager.initialize()
			expect(cacheManager.getAllHashes()).toEqual({})
		})
	})
	describe("hash management", () => {
		it("should update hash and trigger save", () => {
			const filePath = "test.ts"
			const hash = "testhash"
			cacheManager.updateHash(filePath, hash)
			expect(cacheManager.getHash(filePath)).toBe(hash)
			expect(safeWriteJson_1.safeWriteJson).toHaveBeenCalled()
		})
		it("should delete hash and trigger save", () => {
			const filePath = "test.ts"
			const hash = "testhash"
			cacheManager.updateHash(filePath, hash)
			cacheManager.deleteHash(filePath)
			expect(cacheManager.getHash(filePath)).toBeUndefined()
			expect(safeWriteJson_1.safeWriteJson).toHaveBeenCalled()
		})
		it("should return shallow copy of hashes", () => {
			const filePath = "test.ts"
			const hash = "testhash"
			cacheManager.updateHash(filePath, hash)
			const hashes = cacheManager.getAllHashes()
			// Modify the returned object
			hashes[filePath] = "modified"
			// Original should remain unchanged
			expect(cacheManager.getHash(filePath)).toBe(hash)
		})
	})
	describe("saving", () => {
		it("should save cache to disk with correct data", async () => {
			const filePath = "test.ts"
			const hash = "testhash"
			cacheManager.updateHash(filePath, hash)
			expect(safeWriteJson_1.safeWriteJson).toHaveBeenCalledWith(mockCachePath.fsPath, expect.any(Object))
			// Verify the saved data
			const savedData = safeWriteJson_1.safeWriteJson.mock.calls[0][1]
			expect(savedData).toEqual({ [filePath]: hash })
		})
		it("should handle save errors gracefully", async () => {
			const consoleErrorSpy = vitest.spyOn(console, "error").mockImplementation(() => {})
			safeWriteJson_1.safeWriteJson.mockRejectedValue(new Error("Save failed"))
			cacheManager.updateHash("test.ts", "hash")
			// Wait for any pending promises
			await new Promise((resolve) => setTimeout(resolve, 0))
			expect(consoleErrorSpy).toHaveBeenCalledWith("Failed to save cache:", expect.any(Error))
			consoleErrorSpy.mockRestore()
		})
	})
	describe("clearCacheFile", () => {
		it("should clear cache file and reset state", async () => {
			cacheManager.updateHash("test.ts", "hash")
			safeWriteJson_1.safeWriteJson.mockClear()
			safeWriteJson_1.safeWriteJson.mockResolvedValue(undefined)
			await cacheManager.clearCacheFile()
			expect(safeWriteJson_1.safeWriteJson).toHaveBeenCalledWith(mockCachePath.fsPath, {})
			expect(cacheManager.getAllHashes()).toEqual({})
		})
		it("should handle clear errors gracefully", async () => {
			const consoleErrorSpy = vitest.spyOn(console, "error").mockImplementation(() => {})
			safeWriteJson_1.safeWriteJson.mockRejectedValue(new Error("Save failed"))
			await cacheManager.clearCacheFile()
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to clear cache file:",
				expect.any(Error),
				mockCachePath,
			)
			consoleErrorSpy.mockRestore()
		})
	})
})
