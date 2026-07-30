"use strict"
// npx vitest run src/api/providers/__tests__/bedrock-inference-profiles.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const types_1 = require("@ali-code/types")
const bedrock_1 = require("../bedrock")
// Mock AWS SDK
vitest.mock("@aws-sdk/client-bedrock-runtime", () => {
	return {
		BedrockRuntimeClient: vitest.fn().mockImplementation(() => ({
			send: vitest.fn(),
			config: { region: "us-east-1" },
		})),
		ConverseCommand: vitest.fn(),
		ConverseStreamCommand: vitest.fn(),
	}
})
describe("Amazon Bedrock Inference Profiles", () => {
	// Helper function to create a handler with specific options
	const createHandler = (options = {}) => {
		const defaultOptions = {
			apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			awsRegion: "us-east-1",
			...options,
		}
		return new bedrock_1.AwsBedrockHandler(defaultOptions)
	}
	describe("AWS_INFERENCE_PROFILE_MAPPING constant", () => {
		it("should contain all expected region mappings", () => {
			expect(types_1.AWS_INFERENCE_PROFILE_MAPPING).toEqual([
				["ap-southeast-2", "au."],
				["ap-southeast-4", "au."],
				["ap-northeast-", "jp."],
				["us-gov-", "ug."],
				["us-", "us."],
				["eu-", "eu."],
				["ap-", "apac."],
				["ca-", "ca."],
				["sa-", "sa."],
			])
		})
		it("should be ordered by pattern length (descending)", () => {
			const lengths = types_1.AWS_INFERENCE_PROFILE_MAPPING.map(([pattern]) => pattern.length)
			const sortedLengths = [...lengths].sort((a, b) => b - a)
			expect(lengths).toEqual(sortedLengths)
		})
		it("should have valid inference profile prefixes", () => {
			types_1.AWS_INFERENCE_PROFILE_MAPPING.forEach(([regionPattern, inferenceProfile]) => {
				expect(regionPattern).toMatch(/^[a-z0-9-]+$/)
				expect(inferenceProfile).toMatch(/^[a-z]+\.$/)
			})
		})
	})
	describe("getPrefixForRegion function", () => {
		it("should return correct prefix for US government regions", () => {
			const handler = createHandler()
			expect(handler.constructor.getPrefixForRegion("us-gov-east-1")).toBe("ug.")
			expect(handler.constructor.getPrefixForRegion("us-gov-west-1")).toBe("ug.")
		})
		it("should return correct prefix for US commercial regions", () => {
			const handler = createHandler()
			expect(handler.constructor.getPrefixForRegion("us-east-1")).toBe("us.")
			expect(handler.constructor.getPrefixForRegion("us-west-1")).toBe("us.")
			expect(handler.constructor.getPrefixForRegion("us-west-2")).toBe("us.")
		})
		it("should return correct prefix for European regions", () => {
			const handler = createHandler()
			expect(handler.constructor.getPrefixForRegion("eu-west-1")).toBe("eu.")
			expect(handler.constructor.getPrefixForRegion("eu-central-1")).toBe("eu.")
			expect(handler.constructor.getPrefixForRegion("eu-north-1")).toBe("eu.")
			expect(handler.constructor.getPrefixForRegion("eu-south-1")).toBe("eu.")
		})
		it("should return correct prefix for Asia Pacific regions", () => {
			const handler = createHandler()
			// Australia regions (Sydney and Melbourne) get au. prefix
			expect(handler.constructor.getPrefixForRegion("ap-southeast-2")).toBe("au.")
			expect(handler.constructor.getPrefixForRegion("ap-southeast-4")).toBe("au.")
			// Japan regions (Tokyo and Osaka) get jp. prefix
			expect(handler.constructor.getPrefixForRegion("ap-northeast-1")).toBe("jp.")
			expect(handler.constructor.getPrefixForRegion("ap-northeast-3")).toBe("jp.")
			// Other APAC regions get apac. prefix
			expect(handler.constructor.getPrefixForRegion("ap-southeast-1")).toBe("apac.")
			expect(handler.constructor.getPrefixForRegion("ap-south-1")).toBe("apac.")
			expect(handler.constructor.getPrefixForRegion("ap-east-1")).toBe("apac.")
		})
		it("should return correct prefix for Canada regions", () => {
			const handler = createHandler()
			expect(handler.constructor.getPrefixForRegion("ca-central-1")).toBe("ca.")
			expect(handler.constructor.getPrefixForRegion("ca-west-1")).toBe("ca.")
		})
		it("should return correct prefix for South America regions", () => {
			const handler = createHandler()
			expect(handler.constructor.getPrefixForRegion("sa-east-1")).toBe("sa.")
		})
		it("should return undefined for unsupported regions", () => {
			const handler = createHandler()
			expect(handler.constructor.getPrefixForRegion("af-south-1")).toBeUndefined()
			expect(handler.constructor.getPrefixForRegion("me-south-1")).toBeUndefined()
			expect(handler.constructor.getPrefixForRegion("cn-north-1")).toBeUndefined()
			expect(handler.constructor.getPrefixForRegion("invalid-region")).toBeUndefined()
		})
		it("should prioritize longer patterns over shorter ones", () => {
			const handler = createHandler()
			// us-gov- should be matched before us-
			expect(handler.constructor.getPrefixForRegion("us-gov-east-1")).toBe("ug.")
			expect(handler.constructor.getPrefixForRegion("us-gov-west-1")).toBe("ug.")
			// Regular us- regions should still work
			expect(handler.constructor.getPrefixForRegion("us-east-1")).toBe("us.")
			expect(handler.constructor.getPrefixForRegion("us-west-2")).toBe("us.")
		})
	})
	describe("Cross-region inference integration", () => {
		it("should apply ug. prefix for US government regions", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "us-gov-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("ug.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should apply us. prefix for US commercial regions", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "us-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("us.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should apply eu. prefix for European regions", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "eu-west-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("eu.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should apply apac. prefix for Asia Pacific regions", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "ap-southeast-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("apac.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should apply ca. prefix for Canada regions", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "ca-central-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("ca.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should apply sa. prefix for South America regions", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "sa-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("sa.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should not apply prefix when cross-region inference is disabled", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: false,
				awsRegion: "us-gov-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			expect(model.id).toBe("anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should handle unsupported regions gracefully", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "af-south-1", // Unsupported region
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const model = handler.getModel()
			// Should remain unchanged when no prefix is found
			expect(model.id).toBe("anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should work with different model IDs", () => {
			const testModels = [
				"anthropic.claude-3-haiku-20240307-v1:0",
				"anthropic.claude-3-opus-20240229-v1:0",
				"amazon.nova-pro-v1:0",
				"meta.llama3-1-70b-instruct-v1:0",
			]
			testModels.forEach((modelId) => {
				const handler = createHandler({
					awsUseCrossRegionInference: true,
					awsRegion: "eu-west-1",
					apiModelId: modelId,
				})
				const model = handler.getModel()
				expect(model.id).toBe(`eu.${modelId}`)
			})
		})
		it("should prioritize us-gov- over us- in cross-region inference", () => {
			// Test that us-gov-east-1 gets ug. prefix, not us.
			const govHandler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "us-gov-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const govModel = govHandler.getModel()
			expect(govModel.id).toBe("ug.anthropic.claude-3-sonnet-20240229-v1:0")
			// Test that regular us-east-1 still gets us. prefix
			const usHandler = createHandler({
				awsUseCrossRegionInference: true,
				awsRegion: "us-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0",
			})
			const usModel = usHandler.getModel()
			expect(usModel.id).toBe("us.anthropic.claude-3-sonnet-20240229-v1:0")
		})
		it("should prioritize global inference over cross-region inference when both are enabled", () => {
			// When both global inference and cross-region inference are enabled,
			// global inference should take precedence
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsUseGlobalInference: true,
				awsRegion: "us-east-1",
				apiModelId: "anthropic.claude-sonnet-4-20250514-v1:0", // Model that supports global inference
			})
			const model = handler.getModel()
			// Should use global. prefix, not us. prefix
			expect(model.id).toBe("global.anthropic.claude-sonnet-4-20250514-v1:0")
		})
		it("should fall back to cross-region inference when global inference is disabled", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsUseGlobalInference: false,
				awsRegion: "us-east-1",
				apiModelId: "anthropic.claude-sonnet-4-20250514-v1:0",
			})
			const model = handler.getModel()
			// Should use cross-region prefix since global is disabled
			expect(model.id).toBe("us.anthropic.claude-sonnet-4-20250514-v1:0")
		})
		it("should not apply global inference prefix to unsupported models even when enabled", () => {
			const handler = createHandler({
				awsUseCrossRegionInference: true,
				awsUseGlobalInference: true,
				awsRegion: "us-east-1",
				apiModelId: "anthropic.claude-3-sonnet-20240229-v1:0", // Model that does NOT support global inference
			})
			const model = handler.getModel()
			// Should fall back to cross-region prefix since model doesn't support global inference
			expect(model.id).toBe("us.anthropic.claude-3-sonnet-20240229-v1:0")
		})
	})
})
