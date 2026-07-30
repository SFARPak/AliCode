"use strict"
// npx vitest run src/api/providers/__tests__/zai.spec.ts
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const openai_1 = __importDefault(require("openai"))
const types_1 = require("@ali-code/types")
const zai_1 = require("../zai")
vitest.mock("openai", () => {
	const createMock = vitest.fn()
	return {
		default: vitest.fn(() => ({ chat: { completions: { create: createMock } } })),
	}
})
describe("ZAiHandler", () => {
	let handler
	let mockCreate
	beforeEach(() => {
		vitest.clearAllMocks()
		mockCreate = openai_1.default().chat.completions.create
	})
	describe("International Z AI", () => {
		beforeEach(() => {
			handler = new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "international_coding" })
		})
		it("should use the correct international Z AI base URL", () => {
			new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "international_coding" })
			expect(openai_1.default).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: "https://api.z.ai/api/coding/paas/v4",
				}),
			)
		})
		it("should use the provided API key for international", () => {
			const zaiApiKey = "test-zai-api-key"
			new zai_1.ZAiHandler({ zaiApiKey, zaiApiLine: "international_coding" })
			expect(openai_1.default).toHaveBeenCalledWith(expect.objectContaining({ apiKey: zaiApiKey }))
		})
		it("should return international default model when no model is specified", () => {
			const model = handler.getModel()
			expect(model.id).toBe(types_1.internationalZAiDefaultModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[types_1.internationalZAiDefaultModelId])
		})
		it("should return specified international model when valid model is provided", () => {
			const testModelId = "glm-4.5-air"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[testModelId])
		})
		it("should return GLM-4.6 international model with correct configuration", () => {
			const testModelId = "glm-4.6"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[testModelId])
			expect(model.info.contextWindow).toBe(200_000)
		})
		it("should return GLM-4.7 international model with thinking support", () => {
			const testModelId = "glm-4.7"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[testModelId])
			expect(model.info.contextWindow).toBe(200_000)
			expect(model.info.supportsReasoningEffort).toEqual(["disable", "medium"])
			expect(model.info.reasoningEffort).toBe("medium")
			expect(model.info.preserveReasoning).toBe(true)
		})
		it("should return GLM-4.5v international model with vision support", () => {
			const testModelId = "glm-4.5v"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[testModelId])
			expect(model.info.supportsImages).toBe(true)
			expect(model.info.maxTokens).toBe(16_384)
			expect(model.info.contextWindow).toBe(131_072)
		})
	})
	describe("China Z AI", () => {
		beforeEach(() => {
			handler = new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "china_coding" })
		})
		it("should use the correct China Z AI base URL", () => {
			new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "china_coding" })
			expect(openai_1.default).toHaveBeenCalledWith(
				expect.objectContaining({ baseURL: "https://open.bigmodel.cn/api/coding/paas/v4" }),
			)
		})
		it("should use the provided API key for China", () => {
			const zaiApiKey = "test-zai-api-key"
			new zai_1.ZAiHandler({ zaiApiKey, zaiApiLine: "china_coding" })
			expect(openai_1.default).toHaveBeenCalledWith(expect.objectContaining({ apiKey: zaiApiKey }))
		})
		it("should return China default model when no model is specified", () => {
			const model = handler.getModel()
			expect(model.id).toBe(types_1.mainlandZAiDefaultModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[types_1.mainlandZAiDefaultModelId])
		})
		it("should return specified China model when valid model is provided", () => {
			const testModelId = "glm-4.5-air"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "china_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[testModelId])
		})
		it("should return GLM-4.6 China model with correct configuration", () => {
			const testModelId = "glm-4.6"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "china_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[testModelId])
			expect(model.info.contextWindow).toBe(204_800)
		})
		it("should return GLM-4.5v China model with vision support", () => {
			const testModelId = "glm-4.5v"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "china_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[testModelId])
			expect(model.info.supportsImages).toBe(true)
			expect(model.info.maxTokens).toBe(16_384)
			expect(model.info.contextWindow).toBe(131_072)
		})
		it("should return GLM-4.7 China model with thinking support", () => {
			const testModelId = "glm-4.7"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "china_coding",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[testModelId])
			expect(model.info.contextWindow).toBe(204_800)
			expect(model.info.supportsReasoningEffort).toEqual(["disable", "medium"])
			expect(model.info.reasoningEffort).toBe("medium")
			expect(model.info.preserveReasoning).toBe(true)
		})
	})
	describe("International API", () => {
		beforeEach(() => {
			handler = new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "international_api" })
		})
		it("should use the correct international API base URL", () => {
			new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "international_api" })
			expect(openai_1.default).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: "https://api.z.ai/api/paas/v4",
				}),
			)
		})
		it("should use the provided API key for international API", () => {
			const zaiApiKey = "test-zai-api-key"
			new zai_1.ZAiHandler({ zaiApiKey, zaiApiLine: "international_api" })
			expect(openai_1.default).toHaveBeenCalledWith(expect.objectContaining({ apiKey: zaiApiKey }))
		})
		it("should return international default model when no model is specified", () => {
			const model = handler.getModel()
			expect(model.id).toBe(types_1.internationalZAiDefaultModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[types_1.internationalZAiDefaultModelId])
		})
		it("should return specified international model when valid model is provided", () => {
			const testModelId = "glm-4.5-air"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_api",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[testModelId])
		})
	})
	describe("China API", () => {
		beforeEach(() => {
			handler = new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "china_api" })
		})
		it("should use the correct China API base URL", () => {
			new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "china_api" })
			expect(openai_1.default).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: "https://open.bigmodel.cn/api/paas/v4",
				}),
			)
		})
		it("should use the provided API key for China API", () => {
			const zaiApiKey = "test-zai-api-key"
			new zai_1.ZAiHandler({ zaiApiKey, zaiApiLine: "china_api" })
			expect(openai_1.default).toHaveBeenCalledWith(expect.objectContaining({ apiKey: zaiApiKey }))
		})
		it("should return China default model when no model is specified", () => {
			const model = handler.getModel()
			expect(model.id).toBe(types_1.mainlandZAiDefaultModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[types_1.mainlandZAiDefaultModelId])
		})
		it("should return specified China model when valid model is provided", () => {
			const testModelId = "glm-4.5-air"
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: testModelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "china_api",
			})
			const model = handlerWithModel.getModel()
			expect(model.id).toBe(testModelId)
			expect(model.info).toEqual(types_1.mainlandZAiModels[testModelId])
		})
	})
	describe("Default behavior", () => {
		it("should default to international when no zaiApiLine is specified", () => {
			const handlerDefault = new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key" })
			expect(openai_1.default).toHaveBeenCalledWith(
				expect.objectContaining({
					baseURL: "https://api.z.ai/api/coding/paas/v4",
				}),
			)
			const model = handlerDefault.getModel()
			expect(model.id).toBe(types_1.internationalZAiDefaultModelId)
			expect(model.info).toEqual(types_1.internationalZAiModels[types_1.internationalZAiDefaultModelId])
		})
		it("should use 'not-provided' as default API key when none is specified", () => {
			new zai_1.ZAiHandler({ zaiApiLine: "international_coding" })
			expect(openai_1.default).toHaveBeenCalledWith(expect.objectContaining({ apiKey: "not-provided" }))
		})
	})
	describe("API Methods", () => {
		beforeEach(() => {
			handler = new zai_1.ZAiHandler({ zaiApiKey: "test-zai-api-key", zaiApiLine: "international_coding" })
		})
		it("completePrompt method should return text from Z AI API", async () => {
			const expectedResponse = "This is a test response from Z AI"
			mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: expectedResponse } }] })
			const result = await handler.completePrompt("test prompt")
			expect(result).toBe(expectedResponse)
		})
		it("should handle errors in completePrompt", async () => {
			const errorMessage = "Z AI API error"
			mockCreate.mockRejectedValueOnce(new Error(errorMessage))
			await expect(handler.completePrompt("test prompt")).rejects.toThrow(
				`Z.ai completion error: ${errorMessage}`,
			)
		})
		it("createMessage should yield text content from stream", async () => {
			const testContent = "This is test content from Z AI stream"
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						next: vitest
							.fn()
							.mockResolvedValueOnce({
								done: false,
								value: { choices: [{ delta: { content: testContent } }] },
							})
							.mockResolvedValueOnce({ done: true }),
					}),
				}
			})
			const stream = handler.createMessage("system prompt", [])
			const firstChunk = await stream.next()
			expect(firstChunk.done).toBe(false)
			expect(firstChunk.value).toEqual({ type: "text", text: testContent })
		})
		it("createMessage should yield usage data from stream", async () => {
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						next: vitest
							.fn()
							.mockResolvedValueOnce({
								done: false,
								value: {
									choices: [{ delta: {} }],
									usage: { prompt_tokens: 10, completion_tokens: 20 },
								},
							})
							.mockResolvedValueOnce({ done: true }),
					}),
				}
			})
			const stream = handler.createMessage("system prompt", [])
			const firstChunk = await stream.next()
			expect(firstChunk.done).toBe(false)
			expect(firstChunk.value).toMatchObject({ type: "usage", inputTokens: 10, outputTokens: 20 })
		})
		it("createMessage should pass correct parameters to Z AI client", async () => {
			const modelId = "glm-4.5"
			const modelInfo = types_1.internationalZAiModels[modelId]
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: modelId,
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
			})
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						async next() {
							return { done: true }
						},
					}),
				}
			})
			const systemPrompt = "Test system prompt for Z AI"
			const messages = [{ role: "user", content: "Test message for Z AI" }]
			const messageGenerator = handlerWithModel.createMessage(systemPrompt, messages)
			await messageGenerator.next()
			// Centralized 20% cap should apply to OpenAI-compatible providers like Z AI
			const expectedMaxTokens = Math.min(modelInfo.maxTokens, Math.ceil(modelInfo.contextWindow * 0.2))
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					model: modelId,
					max_tokens: expectedMaxTokens,
					temperature: types_1.ZAI_DEFAULT_TEMPERATURE,
					messages: expect.arrayContaining([{ role: "system", content: systemPrompt }]),
					stream: true,
					stream_options: { include_usage: true },
				}),
				undefined,
			)
		})
	})
	describe("GLM-4.7 Thinking Mode", () => {
		it("should enable thinking by default for GLM-4.7 (default reasoningEffort is medium)", async () => {
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: "glm-4.7",
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
				// No reasoningEffort setting - should use model default (medium)
			})
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						async next() {
							return { done: true }
						},
					}),
				}
			})
			const messageGenerator = handlerWithModel.createMessage("system prompt", [])
			await messageGenerator.next()
			// For GLM-4.7 with default reasoning (medium), thinking should be enabled
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					model: "glm-4.7",
					thinking: { type: "enabled" },
				}),
			)
		})
		it("should disable thinking for GLM-4.7 when reasoningEffort is set to disable", async () => {
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: "glm-4.7",
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
				enableReasoningEffort: true,
				reasoningEffort: "disable",
			})
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						async next() {
							return { done: true }
						},
					}),
				}
			})
			const messageGenerator = handlerWithModel.createMessage("system prompt", [])
			await messageGenerator.next()
			// For GLM-4.7 with reasoning disabled, thinking should be disabled
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					model: "glm-4.7",
					thinking: { type: "disabled" },
				}),
			)
		})
		it("should enable thinking for GLM-4.7 when reasoningEffort is set to medium", async () => {
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: "glm-4.7",
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
				enableReasoningEffort: true,
				reasoningEffort: "medium",
			})
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						async next() {
							return { done: true }
						},
					}),
				}
			})
			const messageGenerator = handlerWithModel.createMessage("system prompt", [])
			await messageGenerator.next()
			// For GLM-4.7 with reasoning set to medium, thinking should be enabled
			expect(mockCreate).toHaveBeenCalledWith(
				expect.objectContaining({
					model: "glm-4.7",
					thinking: { type: "enabled" },
				}),
			)
		})
		it("should NOT add thinking parameter for non-thinking models like GLM-4.6", async () => {
			const handlerWithModel = new zai_1.ZAiHandler({
				apiModelId: "glm-4.6",
				zaiApiKey: "test-zai-api-key",
				zaiApiLine: "international_coding",
			})
			mockCreate.mockImplementationOnce(() => {
				return {
					[Symbol.asyncIterator]: () => ({
						async next() {
							return { done: true }
						},
					}),
				}
			})
			const messageGenerator = handlerWithModel.createMessage("system prompt", [])
			await messageGenerator.next()
			// For GLM-4.6 (no thinking support), thinking parameter should not be present
			const callArgs = mockCreate.mock.calls[0][0]
			expect(callArgs.thinking).toBeUndefined()
		})
	})
})
