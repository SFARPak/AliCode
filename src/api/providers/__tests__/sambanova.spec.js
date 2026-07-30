"use strict"
// npx vitest run src/api/providers/__tests__/sambanova.spec.ts
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod }
	}
Object.defineProperty(exports, "__esModule", { value: true })
const openai_1 = __importDefault(require("openai"))
const types_1 = require("@ali-code/types")
const sambanova_1 = require("../sambanova")
vitest.mock("openai", () => {
	const createMock = vitest.fn()
	return {
		default: vitest.fn(() => ({ chat: { completions: { create: createMock } } })),
	}
})
describe("SambaNovaHandler", () => {
	let handler
	let mockCreate
	beforeEach(() => {
		vitest.clearAllMocks()
		mockCreate = openai_1.default().chat.completions.create
		handler = new sambanova_1.SambaNovaHandler({ sambaNovaApiKey: "test-sambanova-api-key" })
	})
	it("should use the correct SambaNova base URL", () => {
		new sambanova_1.SambaNovaHandler({ sambaNovaApiKey: "test-sambanova-api-key" })
		expect(openai_1.default).toHaveBeenCalledWith(
			expect.objectContaining({ baseURL: "https://api.sambanova.ai/v1" }),
		)
	})
	it("should use the provided API key", () => {
		const sambaNovaApiKey = "test-sambanova-api-key"
		new sambanova_1.SambaNovaHandler({ sambaNovaApiKey })
		expect(openai_1.default).toHaveBeenCalledWith(expect.objectContaining({ apiKey: sambaNovaApiKey }))
	})
	it("should return default model when no model is specified", () => {
		const model = handler.getModel()
		expect(model.id).toBe(types_1.sambaNovaDefaultModelId)
		expect(model.info).toEqual(types_1.sambaNovaModels[types_1.sambaNovaDefaultModelId])
	})
	it("should return specified model when valid model is provided", () => {
		const testModelId = "Meta-Llama-3.3-70B-Instruct"
		const handlerWithModel = new sambanova_1.SambaNovaHandler({
			apiModelId: testModelId,
			sambaNovaApiKey: "test-sambanova-api-key",
		})
		const model = handlerWithModel.getModel()
		expect(model.id).toBe(testModelId)
		expect(model.info).toEqual(types_1.sambaNovaModels[testModelId])
	})
	it("completePrompt method should return text from SambaNova API", async () => {
		const expectedResponse = "This is a test response from SambaNova"
		mockCreate.mockResolvedValueOnce({ choices: [{ message: { content: expectedResponse } }] })
		const result = await handler.completePrompt("test prompt")
		expect(result).toBe(expectedResponse)
	})
	it("should handle errors in completePrompt", async () => {
		const errorMessage = "SambaNova API error"
		mockCreate.mockRejectedValueOnce(new Error(errorMessage))
		await expect(handler.completePrompt("test prompt")).rejects.toThrow(
			`SambaNova completion error: ${errorMessage}`,
		)
	})
	it("createMessage should yield text content from stream", async () => {
		const testContent = "This is test content from SambaNova stream"
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
							value: { choices: [{ delta: {} }], usage: { prompt_tokens: 10, completion_tokens: 20 } },
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
	it("createMessage should pass correct parameters to SambaNova client", async () => {
		const modelId = "Meta-Llama-3.3-70B-Instruct"
		const modelInfo = types_1.sambaNovaModels[modelId]
		const handlerWithModel = new sambanova_1.SambaNovaHandler({
			apiModelId: modelId,
			sambaNovaApiKey: "test-sambanova-api-key",
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
		const systemPrompt = "Test system prompt for SambaNova"
		const messages = [{ role: "user", content: "Test message for SambaNova" }]
		const messageGenerator = handlerWithModel.createMessage(systemPrompt, messages)
		await messageGenerator.next()
		expect(mockCreate).toHaveBeenCalledWith(
			expect.objectContaining({
				model: modelId,
				max_tokens: modelInfo.maxTokens,
				temperature: 0.7,
				messages: expect.arrayContaining([{ role: "system", content: systemPrompt }]),
				stream: true,
				stream_options: { include_usage: true },
			}),
			undefined,
		)
	})
})
