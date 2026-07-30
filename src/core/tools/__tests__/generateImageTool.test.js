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
const vitest_1 = require("vitest")
const GenerateImageTool_1 = require("../GenerateImageTool")
const fs = __importStar(require("fs/promises"))
const pathUtils = __importStar(require("../../../utils/pathUtils"))
const fileUtils = __importStar(require("../../../utils/fs"))
const responses_1 = require("../../prompts/responses")
const experiments_1 = require("../../../shared/experiments")
const openrouter_1 = require("../../../api/providers/openrouter")
// Mock dependencies
vitest_1.vi.mock("fs/promises")
vitest_1.vi.mock("../../../utils/pathUtils")
vitest_1.vi.mock("../../../utils/fs")
vitest_1.vi.mock("../../../utils/safeWriteJson")
vitest_1.vi.mock("../../../api/providers/openrouter")
;(0, vitest_1.describe)("generateImageTool", () => {
	let mockCline
	let mockAskApproval
	let mockHandleError
	let mockPushToolResult
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
		// Setup mock Cline instance
		mockCline = {
			cwd: "/test/workspace",
			consecutiveMistakeCount: 0,
			recordToolError: vitest_1.vi.fn(),
			recordToolUsage: vitest_1.vi.fn(),
			sayAndCreateMissingParamError: vitest_1.vi.fn().mockResolvedValue("Missing parameter error"),
			say: vitest_1.vi.fn(),
			aliIgnoreController: {
				validateAccess: vitest_1.vi.fn().mockReturnValue(true),
			},
			aliProtectedController: {
				isWriteProtected: vitest_1.vi.fn().mockReturnValue(false),
			},
			providerRef: {
				deref: vitest_1.vi.fn().mockReturnValue({
					getState: vitest_1.vi.fn().mockResolvedValue({
						experiments: {
							[experiments_1.EXPERIMENT_IDS.IMAGE_GENERATION]: true,
						},
						openRouterImageApiKey: "test-api-key",
						openRouterImageGenerationSelectedModel: "google/gemini-2.5-flash-image",
					}),
				}),
			},
			fileContextTracker: {
				trackFileContext: vitest_1.vi.fn(),
			},
			didEditFile: false,
		}
		mockAskApproval = vitest_1.vi.fn().mockResolvedValue(true)
		mockHandleError = vitest_1.vi.fn()
		mockPushToolResult = vitest_1.vi.fn()
		// Mock file system operations
		vitest_1.vi.mocked(fileUtils.fileExistsAtPath).mockResolvedValue(true)
		vitest_1.vi.mocked(fs.readFile).mockResolvedValue(Buffer.from("fake-image-data"))
		vitest_1.vi.mocked(fs.mkdir).mockResolvedValue(undefined)
		vitest_1.vi.mocked(fs.writeFile).mockResolvedValue(undefined)
		vitest_1.vi.mocked(pathUtils.isPathOutsideWorkspace).mockReturnValue(false)
	})
	;(0, vitest_1.describe)("partial block handling", () => {
		;(0, vitest_1.it)("should return early when block is partial", async () => {
			const partialBlock = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				nativeArgs: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				partial: true,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, partialBlock, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			// Should not process anything when partial
			;(0, vitest_1.expect)(mockAskApproval).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(mockPushToolResult).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(mockCline.say).not.toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should return early when block is partial even with image parameter", async () => {
			const partialBlock = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Upscale this image",
					path: "upscaled-image.png",
					image: "source-image.png",
				},
				nativeArgs: {
					prompt: "Upscale this image",
					path: "upscaled-image.png",
					image: "source-image.png",
				},
				partial: true,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, partialBlock, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			// Should not process anything when partial
			;(0, vitest_1.expect)(mockAskApproval).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(mockPushToolResult).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(mockCline.say).not.toHaveBeenCalled()
			;(0, vitest_1.expect)(fs.readFile).not.toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should process when block is not partial", async () => {
			const completeBlock = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				nativeArgs: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				partial: false,
			}
			// Mock the OpenRouterHandler generateImage method
			const mockGenerateImage = vitest_1.vi.fn().mockResolvedValue({
				success: true,
				imageData: "data:image/png;base64,fakebase64data",
			})
			vitest_1.vi.mocked(openrouter_1.OpenRouterHandler).mockImplementation(() => ({
				generateImage: mockGenerateImage,
			}))
			await GenerateImageTool_1.generateImageTool.handle(mockCline, completeBlock, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			// Should process the complete block
			;(0, vitest_1.expect)(mockAskApproval).toHaveBeenCalled()
			;(0, vitest_1.expect)(mockGenerateImage).toHaveBeenCalled()
			;(0, vitest_1.expect)(mockPushToolResult).toHaveBeenCalled()
		})
		;(0, vitest_1.it)("should add cache-busting parameter to image URI", async () => {
			const completeBlock = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				nativeArgs: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				partial: false,
			}
			// Mock convertToWebviewUri to return a test URI
			const mockWebviewUri = "https://file+.vscode-resource.vscode-cdn.net/test/workspace/test-image.png"
			mockCline.providerRef.deref().convertToWebviewUri = vitest_1.vi.fn().mockReturnValue(mockWebviewUri)
			// Mock the OpenRouterHandler generateImage method
			const mockGenerateImage = vitest_1.vi.fn().mockResolvedValue({
				success: true,
				imageData: "data:image/png;base64,fakebase64data",
			})
			vitest_1.vi.mocked(openrouter_1.OpenRouterHandler).mockImplementation(() => ({
				generateImage: mockGenerateImage,
			}))
			await GenerateImageTool_1.generateImageTool.handle(mockCline, completeBlock, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			// Check that cline.say was called with image data containing cache-busting parameter
			;(0, vitest_1.expect)(mockCline.say).toHaveBeenCalledWith(
				"image",
				vitest_1.expect.stringMatching(/"imageUri":"[^"]+\?t=\d+"/),
			)
			// Verify the imageUri contains the cache-busting parameter
			const sayCall = mockCline.say.mock.calls.find((call) => call[0] === "image")
			if (sayCall) {
				const imageData = JSON.parse(sayCall[1])
				;(0, vitest_1.expect)(imageData.imageUri).toMatch(/\?t=\d+$/)
				// Handle both Unix and Windows path separators
				const expectedPath =
					process.platform === "win32"
						? "\\test\\workspace\\test-image.png"
						: "/test/workspace/test-image.png"
				;(0, vitest_1.expect)(imageData.imagePath).toBe(expectedPath)
			}
		})
	})
	;(0, vitest_1.describe)("missing parameters", () => {
		;(0, vitest_1.it)("should handle missing prompt parameter", async () => {
			const block = {
				type: "tool_use",
				name: "generate_image",
				params: {
					path: "test-image.png",
				},
				nativeArgs: {
					path: "test-image.png",
				},
				partial: false,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, block, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			;(0, vitest_1.expect)(mockCline.consecutiveMistakeCount).toBe(1)
			;(0, vitest_1.expect)(mockCline.recordToolError).toHaveBeenCalledWith("generate_image")
			;(0, vitest_1.expect)(mockCline.sayAndCreateMissingParamError).toHaveBeenCalledWith(
				"generate_image",
				"prompt",
			)
			;(0, vitest_1.expect)(mockPushToolResult).toHaveBeenCalledWith("Missing parameter error")
		})
		;(0, vitest_1.it)("should handle missing path parameter", async () => {
			const block = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Generate a test image",
				},
				nativeArgs: {
					prompt: "Generate a test image",
				},
				partial: false,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, block, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			;(0, vitest_1.expect)(mockCline.consecutiveMistakeCount).toBe(1)
			;(0, vitest_1.expect)(mockCline.recordToolError).toHaveBeenCalledWith("generate_image")
			;(0, vitest_1.expect)(mockCline.sayAndCreateMissingParamError).toHaveBeenCalledWith(
				"generate_image",
				"path",
			)
			;(0, vitest_1.expect)(mockPushToolResult).toHaveBeenCalledWith("Missing parameter error")
		})
	})
	;(0, vitest_1.describe)("experiment validation", () => {
		;(0, vitest_1.it)("should error when image generation experiment is disabled", async () => {
			// Disable the experiment
			mockCline.providerRef.deref().getState.mockResolvedValue({
				experiments: {
					[experiments_1.EXPERIMENT_IDS.IMAGE_GENERATION]: false,
				},
			})
			const block = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				nativeArgs: {
					prompt: "Generate a test image",
					path: "test-image.png",
				},
				partial: false,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, block, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			;(0, vitest_1.expect)(mockPushToolResult).toHaveBeenCalledWith(
				responses_1.formatResponse.toolError(
					"Image generation is an experimental feature that must be enabled in settings. Please enable 'Image Generation' in the Experimental Settings section.",
				),
			)
		})
	})
	;(0, vitest_1.describe)("input image validation", () => {
		;(0, vitest_1.it)("should handle non-existent input image", async () => {
			vitest_1.vi.mocked(fileUtils.fileExistsAtPath).mockResolvedValue(false)
			const block = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Upscale this image",
					path: "upscaled.png",
					image: "non-existent.png",
				},
				nativeArgs: {
					prompt: "Upscale this image",
					path: "upscaled.png",
					image: "non-existent.png",
				},
				partial: false,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, block, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			;(0, vitest_1.expect)(mockCline.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("Input image not found"),
			)
			;(0, vitest_1.expect)(mockPushToolResult).toHaveBeenCalledWith(
				vitest_1.expect.stringContaining("Input image not found"),
			)
		})
		;(0, vitest_1.it)("should handle unsupported image format", async () => {
			const block = {
				type: "tool_use",
				name: "generate_image",
				params: {
					prompt: "Upscale this image",
					path: "upscaled.png",
					image: "test.bmp", // Unsupported format
				},
				nativeArgs: {
					prompt: "Upscale this image",
					path: "upscaled.png",
					image: "test.bmp",
				},
				partial: false,
			}
			await GenerateImageTool_1.generateImageTool.handle(mockCline, block, {
				askApproval: mockAskApproval,
				handleError: mockHandleError,
				pushToolResult: mockPushToolResult,
			})
			;(0, vitest_1.expect)(mockCline.say).toHaveBeenCalledWith(
				"error",
				vitest_1.expect.stringContaining("Unsupported image format"),
			)
			;(0, vitest_1.expect)(mockPushToolResult).toHaveBeenCalledWith(
				vitest_1.expect.stringContaining("Unsupported image format"),
			)
		})
	})
})
