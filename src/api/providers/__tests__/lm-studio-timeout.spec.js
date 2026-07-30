"use strict"
// npx vitest run api/providers/__tests__/lm-studio-timeout.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const lm_studio_1 = require("../lm-studio")
// Mock the timeout config utility
vitest.mock("../utils/timeout-config", () => ({
	getApiRequestTimeout: vitest.fn(),
}))
const timeout_config_1 = require("../utils/timeout-config")
// Mock OpenAI
const mockOpenAIConstructor = vitest.fn()
vitest.mock("openai", () => {
	return {
		__esModule: true,
		default: vitest.fn().mockImplementation((config) => {
			mockOpenAIConstructor(config)
			return {
				chat: {
					completions: {
						create: vitest.fn(),
					},
				},
			}
		}),
	}
})
describe("LmStudioHandler timeout configuration", () => {
	beforeEach(() => {
		vitest.clearAllMocks()
	})
	it("should use default timeout of 600 seconds when no configuration is set", () => {
		timeout_config_1.getApiRequestTimeout.mockReturnValue(600000)
		const options = {
			apiModelId: "llama2",
			lmStudioModelId: "llama2",
			lmStudioBaseUrl: "http://localhost:1234",
		}
		new lm_studio_1.LmStudioHandler(options)
		expect(timeout_config_1.getApiRequestTimeout).toHaveBeenCalled()
		expect(mockOpenAIConstructor).toHaveBeenCalledWith(
			expect.objectContaining({
				baseURL: "http://localhost:1234/v1",
				apiKey: "noop",
				timeout: 600000, // 600 seconds in milliseconds
			}),
		)
	})
	it("should use custom timeout when configuration is set", () => {
		timeout_config_1.getApiRequestTimeout.mockReturnValue(1200000) // 20 minutes
		const options = {
			apiModelId: "llama2",
			lmStudioModelId: "llama2",
			lmStudioBaseUrl: "http://localhost:1234",
		}
		new lm_studio_1.LmStudioHandler(options)
		expect(mockOpenAIConstructor).toHaveBeenCalledWith(
			expect.objectContaining({
				timeout: 1200000, // 1200 seconds in milliseconds
			}),
		)
	})
	it("should handle zero timeout (no timeout)", () => {
		timeout_config_1.getApiRequestTimeout.mockReturnValue(0)
		const options = {
			apiModelId: "llama2",
			lmStudioModelId: "llama2",
		}
		new lm_studio_1.LmStudioHandler(options)
		expect(mockOpenAIConstructor).toHaveBeenCalledWith(
			expect.objectContaining({
				timeout: 0, // No timeout
			}),
		)
	})
})
