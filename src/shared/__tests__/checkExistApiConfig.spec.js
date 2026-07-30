"use strict"
// npx vitest run src/shared/__tests__/checkExistApiConfig.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const checkExistApiConfig_1 = require("../checkExistApiConfig")
describe("checkExistKey", () => {
	it("should return false for undefined config", () => {
		expect((0, checkExistApiConfig_1.checkExistKey)(undefined)).toBe(false)
	})
	it("should return false for empty config", () => {
		const config = {}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(false)
	})
	it("should return true when one key is defined", () => {
		const config = {
			apiKey: "test-key",
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(true)
	})
	it("should return true when multiple keys are defined", () => {
		const config = {
			apiKey: "test-key",
			openRouterApiKey: "openrouter-key",
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(true)
	})
	it("should return true when only non-key fields are undefined", () => {
		const config = {
			apiKey: "test-key",
			apiProvider: undefined,
			anthropicBaseUrl: undefined,
			modelMaxThinkingTokens: undefined,
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(true)
	})
	it("should return false when all key fields are undefined", () => {
		const config = {
			apiKey: undefined,
			openRouterApiKey: undefined,
			awsRegion: undefined,
			vertexProjectId: undefined,
			openAiApiKey: undefined,
			ollamaModelId: undefined,
			lmStudioModelId: undefined,
			geminiApiKey: undefined,
			openAiNativeApiKey: undefined,
			deepSeekApiKey: undefined,
			moonshotApiKey: undefined,
			mistralApiKey: undefined,
			vsCodeLmModelSelector: undefined,
			requestyApiKey: undefined,
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(false)
	})
	it("should return true for fake-ai provider without API key", () => {
		const config = {
			apiProvider: "fake-ai",
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(true)
	})
	it("should return true for openai-codex provider without API key", () => {
		const config = {
			apiProvider: "openai-codex",
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(true)
	})
	it("should return true for qwen-code provider without API key", () => {
		const config = {
			apiProvider: "qwen-code",
		}
		expect((0, checkExistApiConfig_1.checkExistKey)(config)).toBe(true)
	})
})
