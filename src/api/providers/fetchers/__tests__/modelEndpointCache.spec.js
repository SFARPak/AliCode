"use strict"
// npx vitest run api/providers/fetchers/__tests__/modelEndpointCache.spec.ts
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
const modelEndpointCache_1 = require("../modelEndpointCache")
const modelCache = __importStar(require("../modelCache"))
const openrouter = __importStar(require("../openrouter"))
vitest_1.vi.mock("../modelCache")
vitest_1.vi.mock("../openrouter")
;(0, vitest_1.describe)("modelEndpointCache", () => {
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.clearAllMocks()
	})
	;(0, vitest_1.describe)("getModelEndpoints", () => {
		;(0, vitest_1.it)("should copy model-level capabilities from parent model to endpoints", async () => {
			// Mock the parent model data with capabilities
			const mockParentModels = {
				"anthropic/claude-sonnet-4": {
					maxTokens: 8192,
					contextWindow: 200000,
					supportsImages: true,
					supportsPromptCache: true,
					supportsReasoningEffort: true,
					supportedParameters: ["max_tokens", "temperature", "reasoning"],
					inputPrice: 3,
					outputPrice: 15,
				},
			}
			// Mock endpoint data WITHOUT capabilities (as returned by API)
			const mockEndpoints = {
				anthropic: {
					maxTokens: 8192,
					contextWindow: 200000,
					supportsImages: true,
					supportsPromptCache: true,
					inputPrice: 3,
					outputPrice: 15,
					// Note: No supportsReasoningEffort, or supportedParameters
				},
				"amazon-bedrock": {
					maxTokens: 8192,
					contextWindow: 200000,
					supportsImages: true,
					supportsPromptCache: true,
					inputPrice: 3,
					outputPrice: 15,
				},
			}
			vitest_1.vi.spyOn(modelCache, "getModels").mockResolvedValue(mockParentModels)
			vitest_1.vi.spyOn(openrouter, "getOpenRouterModelEndpoints").mockResolvedValue(mockEndpoints)
			const result = await (0, modelEndpointCache_1.getModelEndpoints)({
				router: "openrouter",
				modelId: "anthropic/claude-sonnet-4",
				endpoint: "anthropic",
			})
			// Verify capabilities were copied from parent to ALL endpoints
			;(0, vitest_1.expect)(result.anthropic.supportsReasoningEffort).toBe(true)
			;(0, vitest_1.expect)(result.anthropic.supportedParameters).toEqual([
				"max_tokens",
				"temperature",
				"reasoning",
			])
			;(0, vitest_1.expect)(result["amazon-bedrock"].supportsReasoningEffort).toBe(true)
			;(0, vitest_1.expect)(result["amazon-bedrock"].supportedParameters).toEqual([
				"max_tokens",
				"temperature",
				"reasoning",
			])
		})
		;(0, vitest_1.it)("should create independent array copies to avoid shared references", async () => {
			const mockParentModels = {
				"test/model": {
					maxTokens: 1000,
					contextWindow: 10000,
					supportsPromptCache: false,
					supportedParameters: ["max_tokens", "temperature"],
				},
			}
			const mockEndpoints = {
				"endpoint-1": {
					maxTokens: 1000,
					contextWindow: 10000,
					supportsPromptCache: false,
				},
				"endpoint-2": {
					maxTokens: 1000,
					contextWindow: 10000,
					supportsPromptCache: false,
				},
			}
			vitest_1.vi.spyOn(modelCache, "getModels").mockResolvedValue(mockParentModels)
			vitest_1.vi.spyOn(openrouter, "getOpenRouterModelEndpoints").mockResolvedValue(mockEndpoints)
			const result = await (0, modelEndpointCache_1.getModelEndpoints)({
				router: "openrouter",
				modelId: "test/model",
				endpoint: "endpoint-1",
			})
			// Modify one endpoint's array
			result["endpoint-1"].supportedParameters?.push("reasoning")
			// Verify the other endpoint's array was NOT affected (independent copy)
			;(0, vitest_1.expect)(result["endpoint-1"].supportedParameters).toHaveLength(3)
			;(0, vitest_1.expect)(result["endpoint-2"].supportedParameters).toHaveLength(2)
		})
		;(0, vitest_1.it)("should handle missing parent model gracefully", async () => {
			const mockParentModels = {}
			const mockEndpoints = {
				anthropic: {
					maxTokens: 8192,
					contextWindow: 200000,
					supportsImages: true,
					supportsPromptCache: true,
				},
			}
			vitest_1.vi.spyOn(modelCache, "getModels").mockResolvedValue(mockParentModels)
			vitest_1.vi.spyOn(openrouter, "getOpenRouterModelEndpoints").mockResolvedValue(mockEndpoints)
			const result = await (0, modelEndpointCache_1.getModelEndpoints)({
				router: "openrouter",
				modelId: "missing/model",
				endpoint: "anthropic",
			})
			// Should not crash, but copied capabilities will be undefined
			;(0, vitest_1.expect)(result.anthropic).toBeDefined()
			;(0, vitest_1.expect)(result.anthropic.supportedParameters).toBeUndefined()
		})
		;(0, vitest_1.it)("should return empty object for non-openrouter providers", async () => {
			const result = await (0, modelEndpointCache_1.getModelEndpoints)({
				router: "vercel-ai-gateway",
				modelId: "claude-sonnet-4",
				endpoint: "default",
			})
			;(0, vitest_1.expect)(result).toEqual({})
		})
		;(0, vitest_1.it)("should return empty object when modelId or endpoint is missing", async () => {
			const result1 = await (0, modelEndpointCache_1.getModelEndpoints)({
				router: "openrouter",
				modelId: undefined,
				endpoint: "anthropic",
			})
			const result2 = await (0, modelEndpointCache_1.getModelEndpoints)({
				router: "openrouter",
				modelId: "anthropic/claude-sonnet-4",
				endpoint: undefined,
			})
			;(0, vitest_1.expect)(result1).toEqual({})
			;(0, vitest_1.expect)(result2).toEqual({})
		})
	})
})
