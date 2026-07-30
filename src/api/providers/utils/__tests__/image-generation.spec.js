"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const image_generation_1 = require("../image-generation")
// Mock the i18n module
vitest_1.vi.mock("../../../i18n", () => ({
	t: (key, options) => {
		// Return a sensible mock for i18n
		if (key === "tools:generateImage.failedWithMessage" && options?.message) {
			return options.message
		}
		return key
	},
}))
// Mock fetch globally
global.fetch = vitest_1.vi.fn()
global.FormData = vitest_1.vi.fn(() => ({
	append: vitest_1.vi.fn(),
}))
global.Blob = vitest_1.vi.fn()
global.atob = vitest_1.vi.fn((str) => {
	return Buffer.from(str, "base64").toString("binary")
})
;(0, vitest_1.describe)("generateImageWithImagesApi", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.afterEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.describe)("image generation (text-to-image)", () => {
		;(0, vitest_1.it)("should successfully generate an image", async () => {
			const mockBase64 = Buffer.from("fake image data").toString("base64")
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ b64_json: mockBase64 }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
				outputFormat: "png",
			})
			;(0, vitest_1.expect)(result.success).toBe(true)
			;(0, vitest_1.expect)(result.imageData).toContain("data:image/png;base64,")
			;(0, vitest_1.expect)(result.imageFormat).toBe("png")
			// Verify fetch was called with correct parameters
			;(0, vitest_1.expect)(global.fetch).toHaveBeenCalledWith(
				"https://api.example.com/v1/images/generations",
				vitest_1.expect.objectContaining({
					method: "POST",
					headers: vitest_1.expect.objectContaining({
						Authorization: "Bearer test-token",
						"Content-Type": "application/json",
					}),
				}),
			)
		})
		;(0, vitest_1.it)("should handle API errors gracefully", async () => {
			const mockResponse = {
				ok: false,
				status: 400,
				statusText: "Bad Request",
				text: vitest_1.vi.fn().mockResolvedValue("{}"),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.success).toBe(false)
			;(0, vitest_1.expect)(result.error).toBeDefined()
		})
		;(0, vitest_1.it)("should handle missing image data in response", async () => {
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{}], // Missing b64_json and url
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.success).toBe(false)
			;(0, vitest_1.expect)(result.error).toBeDefined()
		})
		;(0, vitest_1.it)("should handle URL response instead of b64_json", async () => {
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ url: "data:image/png;base64,iVBORw0KGgo=" }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.success).toBe(true)
			;(0, vitest_1.expect)(result.imageData).toBe("data:image/png;base64,iVBORw0KGgo=")
			;(0, vitest_1.expect)(result.imageFormat).toBe("png")
		})
		;(0, vitest_1.it)("should handle external URL response", async () => {
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ url: "https://example.com/generated-image.png" }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
				outputFormat: "png",
			})
			;(0, vitest_1.expect)(result.success).toBe(true)
			;(0, vitest_1.expect)(result.imageData).toBe("https://example.com/generated-image.png")
			;(0, vitest_1.expect)(result.imageFormat).toBe("png")
		})
		;(0, vitest_1.it)("should handle empty data array in response", async () => {
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.success).toBe(false)
			;(0, vitest_1.expect)(result.error).toBeDefined()
		})
		;(0, vitest_1.it)("should handle API error response", async () => {
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					error: {
						message: "Rate limit exceeded",
						type: "rate_limit_error",
					},
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.success).toBe(false)
			;(0, vitest_1.expect)(result.error).toBeDefined()
		})
		;(0, vitest_1.it)("should include optional parameters when provided", async () => {
			const mockBase64 = Buffer.from("fake image data").toString("base64")
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ b64_json: mockBase64 }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
				size: "1024x1024",
				quality: "hd",
				outputFormat: "png",
			})
			;(0, vitest_1.expect)(result.success).toBe(true)
			// Verify fetch was called with optional parameters
			const callArgs = vitest_1.vi.mocked(global.fetch).mock.calls[0]
			const body = JSON.parse(callArgs[1]?.body)
			;(0, vitest_1.expect)(body.size).toBe("1024x1024")
			;(0, vitest_1.expect)(body.quality).toBe("hd")
		})
		;(0, vitest_1.it)("should handle network errors", async () => {
			vitest_1.vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"))
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.success).toBe(false)
			;(0, vitest_1.expect)(result.error).toContain("Network error")
		})
	})
	;(0, vitest_1.describe)("image editing", () => {
		;(0, vitest_1.it)("should use /images/generations endpoint with inputImage in request body", async () => {
			const mockBase64 = Buffer.from("fake image data").toString("base64")
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ b64_json: mockBase64 }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const inputImageDataUrl = `data:image/png;base64,${mockBase64}`
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "Make it blue",
				inputImage: inputImageDataUrl,
				outputFormat: "png",
			})
			;(0, vitest_1.expect)(result.success).toBe(true)
			// Verify /images/generations endpoint was used (not /images/edits)
			const callUrl = vitest_1.vi.mocked(global.fetch).mock.calls[0][0]
			;(0, vitest_1.expect)(callUrl).toContain("/images/generations")
		})
		;(0, vitest_1.it)("should handle edit operation errors", async () => {
			const mockResponse = {
				ok: false,
				status: 400,
				statusText: "Bad Request",
				text: vitest_1.vi.fn().mockResolvedValue("{}"),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const inputImageDataUrl =
				"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "Make it blue",
				inputImage: inputImageDataUrl,
			})
			;(0, vitest_1.expect)(result.success).toBe(false)
			;(0, vitest_1.expect)(result.error).toBeDefined()
		})
	})
	;(0, vitest_1.describe)("output format handling", () => {
		;(0, vitest_1.it)("should use png format by default", async () => {
			const mockBase64 = Buffer.from("fake image data").toString("base64")
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ b64_json: mockBase64 }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
			})
			;(0, vitest_1.expect)(result.imageFormat).toBe("png")
			;(0, vitest_1.expect)(result.imageData).toContain("data:image/png;base64,")
		})
		;(0, vitest_1.it)("should use specified output format", async () => {
			const mockBase64 = Buffer.from("fake image data").toString("base64")
			const mockResponse = {
				ok: true,
				json: vitest_1.vi.fn().mockResolvedValue({
					data: [{ b64_json: mockBase64 }],
				}),
			}
			vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
			const result = await (0, image_generation_1.generateImageWithImagesApi)({
				baseURL: "https://api.example.com/v1",
				authToken: "test-token",
				model: "gpt-image-1",
				prompt: "A cute cat",
				outputFormat: "jpeg",
			})
			;(0, vitest_1.expect)(result.imageFormat).toBe("jpeg")
			;(0, vitest_1.expect)(result.imageData).toContain("data:image/jpeg;base64,")
		})
	})
})
;(0, vitest_1.describe)("generateImageWithProvider (chat completions)", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.afterEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.it)("should use /chat/completions endpoint", async () => {
		const mockResponse = {
			ok: true,
			json: vitest_1.vi.fn().mockResolvedValue({
				choices: [
					{
						message: {
							images: [
								{
									image_url: {
										url: "data:image/png;base64,iVBORw0KGgo=",
									},
								},
							],
						},
					},
				],
			}),
		}
		vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
		const result = await (0, image_generation_1.generateImageWithProvider)({
			baseURL: "https://api.example.com/v1",
			authToken: "test-token",
			model: "gpt-4-vision",
			prompt: "A cute cat",
		})
		;(0, vitest_1.expect)(result.success).toBe(true)
		// Verify /chat/completions endpoint was used
		const callUrl = vitest_1.vi.mocked(global.fetch).mock.calls[0][0]
		;(0, vitest_1.expect)(callUrl).toContain("/chat/completions")
	})
	;(0, vitest_1.it)("should handle missing images in response", async () => {
		const mockResponse = {
			ok: true,
			json: vitest_1.vi.fn().mockResolvedValue({
				choices: [{ message: { content: "No images" } }],
			}),
		}
		vitest_1.vi.mocked(global.fetch).mockResolvedValue(mockResponse)
		const result = await (0, image_generation_1.generateImageWithProvider)({
			baseURL: "https://api.example.com/v1",
			authToken: "test-token",
			model: "gpt-4-vision",
			prompt: "A cute cat",
		})
		;(0, vitest_1.expect)(result.success).toBe(false)
		;(0, vitest_1.expect)(result.error).toBeDefined()
	})
})
