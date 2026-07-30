"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const anthropic_filter_1 = require("../anthropic-filter")
describe("anthropic-filter", () => {
	describe("VALID_ANTHROPIC_BLOCK_TYPES", () => {
		it("should contain all valid Anthropic types", () => {
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("text")).toBe(true)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("image")).toBe(true)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("tool_use")).toBe(true)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("tool_result")).toBe(true)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("thinking")).toBe(true)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("redacted_thinking")).toBe(true)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("document")).toBe(true)
		})
		it("should not contain internal or provider-specific types", () => {
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("reasoning")).toBe(false)
			expect(anthropic_filter_1.VALID_ANTHROPIC_BLOCK_TYPES.has("thoughtSignature")).toBe(false)
		})
	})
	describe("filterNonAnthropicBlocks", () => {
		it("should pass through messages with string content", () => {
			const messages = [
				{ role: "user", content: "Hello" },
				{ role: "assistant", content: "Hi there!" },
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toEqual(messages)
		})
		it("should pass through messages with valid Anthropic blocks", () => {
			const messages = [
				{
					role: "user",
					content: [{ type: "text", text: "Hello" }],
				},
				{
					role: "assistant",
					content: [{ type: "text", text: "Hi there!" }],
				},
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toEqual(messages)
		})
		it("should filter out reasoning blocks from messages", () => {
			const messages = [
				{ role: "user", content: "Hello" },
				{
					role: "assistant",
					content: [
						{ type: "reasoning", text: "Internal reasoning" },
						{ type: "text", text: "Response" },
					],
				},
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toHaveLength(2)
			expect(result[1].content).toEqual([{ type: "text", text: "Response" }])
		})
		it("should filter out thoughtSignature blocks from messages", () => {
			const messages = [
				{ role: "user", content: "Hello" },
				{
					role: "assistant",
					content: [
						{ type: "thoughtSignature", thoughtSignature: "encrypted-sig" },
						{ type: "text", text: "Response" },
					],
				},
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toHaveLength(2)
			expect(result[1].content).toEqual([{ type: "text", text: "Response" }])
		})
		it("should remove messages that become empty after filtering", () => {
			const messages = [
				{ role: "user", content: "Hello" },
				{
					role: "assistant",
					content: [{ type: "reasoning", text: "Only reasoning" }],
				},
				{ role: "user", content: "Continue" },
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toHaveLength(2)
			expect(result[0].content).toBe("Hello")
			expect(result[1].content).toBe("Continue")
		})
		it("should handle mixed content with multiple invalid block types", () => {
			const messages = [
				{
					role: "assistant",
					content: [
						{ type: "reasoning", text: "Reasoning" },
						{ type: "text", text: "Text 1" },
						{ type: "thoughtSignature", thoughtSignature: "sig" },
						{ type: "text", text: "Text 2" },
					],
				},
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toHaveLength(1)
			expect(result[0].content).toEqual([
				{ type: "text", text: "Text 1" },
				{ type: "text", text: "Text 2" },
			])
		})
		it("should filter out any unknown block types", () => {
			const messages = [
				{
					role: "assistant",
					content: [
						{ type: "unknown_future_type", data: "some data" },
						{ type: "text", text: "Valid text" },
					],
				},
			]
			const result = (0, anthropic_filter_1.filterNonAnthropicBlocks)(messages)
			expect(result).toHaveLength(1)
			expect(result[0].content).toEqual([{ type: "text", text: "Valid text" }])
		})
	})
})
