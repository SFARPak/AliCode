"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const tool_id_1 = require("../tool-id")
describe("sanitizeToolUseId", () => {
	describe("valid IDs pass through unchanged", () => {
		it("should preserve alphanumeric IDs", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("toolu_01AbC")).toBe("toolu_01AbC")
		})
		it("should preserve IDs with underscores", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool_use_123")).toBe("tool_use_123")
		})
		it("should preserve IDs with hyphens", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool-with-hyphens")).toBe("tool-with-hyphens")
		})
		it("should preserve mixed valid characters", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("toolu_01AbC-xyz_789")).toBe("toolu_01AbC-xyz_789")
		})
		it("should handle empty string", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("")).toBe("")
		})
	})
	describe("invalid characters get replaced with underscore", () => {
		it("should replace dots with underscores", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool.with.dots")).toBe("tool_with_dots")
		})
		it("should replace colons with underscores", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool:with:colons")).toBe("tool_with_colons")
		})
		it("should replace slashes with underscores", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool/with/slashes")).toBe("tool_with_slashes")
		})
		it("should replace backslashes with underscores", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool\\with\\backslashes")).toBe("tool_with_backslashes")
		})
		it("should replace spaces with underscores", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("tool with spaces")).toBe("tool_with_spaces")
		})
		it("should replace multiple invalid characters", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("mcp.server:tool/name")).toBe("mcp_server_tool_name")
		})
		it("should sanitize Gemini/OpenRouter function call IDs with dots and colons", () => {
			// This is the exact pattern seen in reported API errors where tool_result IDs
			// didn't match tool_use IDs due to missing sanitization
			expect((0, tool_id_1.sanitizeToolUseId)("functions.read_file:0")).toBe("functions_read_file_0")
			expect((0, tool_id_1.sanitizeToolUseId)("functions.write_to_file:1")).toBe("functions_write_to_file_1")
			expect((0, tool_id_1.sanitizeToolUseId)("read_file:0")).toBe("read_file_0")
		})
	})
	describe("real-world MCP tool use ID patterns", () => {
		it("should sanitize MCP server-prefixed IDs with dots", () => {
			// MCP tool names often include server names with dots
			expect((0, tool_id_1.sanitizeToolUseId)("toolu_mcp.linear.create_issue")).toBe(
				"toolu_mcp_linear_create_issue",
			)
		})
		it("should sanitize IDs with URL-like patterns", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("toolu_https://api.example.com/tool")).toBe(
				"toolu_https___api_example_com_tool",
			)
		})
		it("should sanitize IDs with special characters from server names", () => {
			expect((0, tool_id_1.sanitizeToolUseId)("call_mcp--analytics--query-run")).toBe(
				"call_mcp--analytics--query-run",
			)
		})
		it("should preserve valid native tool call IDs", () => {
			// Standard Anthropic tool_use IDs
			expect((0, tool_id_1.sanitizeToolUseId)("toolu_01H2X3Y4Z5")).toBe("toolu_01H2X3Y4Z5")
		})
	})
})
describe("truncateOpenAiCallId", () => {
	describe("IDs within limit pass through unchanged", () => {
		it("should preserve short IDs", () => {
			expect((0, tool_id_1.truncateOpenAiCallId)("toolu_01AbC")).toBe("toolu_01AbC")
		})
		it("should preserve IDs exactly at the limit", () => {
			const id64Chars = "a".repeat(64)
			expect((0, tool_id_1.truncateOpenAiCallId)(id64Chars)).toBe(id64Chars)
		})
		it("should handle empty string", () => {
			expect((0, tool_id_1.truncateOpenAiCallId)("")).toBe("")
		})
	})
	describe("long IDs get truncated with hash suffix", () => {
		it("should truncate IDs longer than 64 characters", () => {
			const longId = "a".repeat(70) // 70 chars, exceeds 64 limit
			const result = (0, tool_id_1.truncateOpenAiCallId)(longId)
			expect(result.length).toBe(64)
		})
		it("should produce consistent results for the same input", () => {
			const longId = "toolu_mcp--linear--create_issue_12345678-1234-1234-1234-123456789012"
			const result1 = (0, tool_id_1.truncateOpenAiCallId)(longId)
			const result2 = (0, tool_id_1.truncateOpenAiCallId)(longId)
			expect(result1).toBe(result2)
		})
		it("should produce different results for different inputs", () => {
			const longId1 = "a".repeat(70) + "_unique1"
			const longId2 = "a".repeat(70) + "_unique2"
			const result1 = (0, tool_id_1.truncateOpenAiCallId)(longId1)
			const result2 = (0, tool_id_1.truncateOpenAiCallId)(longId2)
			expect(result1).not.toBe(result2)
		})
		it("should preserve the prefix and add hash suffix", () => {
			const longId = "toolu_mcp--linear--create_issue_" + "x".repeat(50)
			const result = (0, tool_id_1.truncateOpenAiCallId)(longId)
			// Should start with the prefix (first 55 chars)
			expect(result.startsWith("toolu_mcp--linear--create_issue_")).toBe(true)
			// Should contain a separator and hash
			expect(result).toContain("_")
		})
		it("should handle the exact reported issue length (69 chars)", () => {
			// The original error mentioned 69 characters
			const id69Chars = "toolu_mcp--analytics--query_run_" + "a".repeat(37) // total 69 chars
			expect(id69Chars.length).toBe(69)
			const result = (0, tool_id_1.truncateOpenAiCallId)(id69Chars)
			expect(result.length).toBe(64)
		})
	})
	describe("custom max length", () => {
		it("should support custom max length", () => {
			const longId = "a".repeat(50)
			const result = (0, tool_id_1.truncateOpenAiCallId)(longId, 32)
			expect(result.length).toBe(32)
		})
		it("should not truncate if within custom limit", () => {
			const id = "short_id"
			expect((0, tool_id_1.truncateOpenAiCallId)(id, 100)).toBe(id)
		})
	})
})
describe("sanitizeOpenAiCallId", () => {
	it("should sanitize characters and truncate if needed", () => {
		// ID with invalid chars and too long
		const longIdWithInvalidChars = "toolu_mcp.server:tool/name_" + "x".repeat(50)
		const result = (0, tool_id_1.sanitizeOpenAiCallId)(longIdWithInvalidChars)
		// Should be within limit
		expect(result.length).toBeLessThanOrEqual(64)
		// Should not contain invalid characters
		expect(result).toMatch(/^[a-zA-Z0-9_-]+$/)
	})
	it("should only sanitize if length is within limit", () => {
		const shortIdWithInvalidChars = "tool.with.dots"
		const result = (0, tool_id_1.sanitizeOpenAiCallId)(shortIdWithInvalidChars)
		expect(result).toBe("tool_with_dots")
	})
	it("should handle real-world MCP tool IDs", () => {
		// Real MCP tool ID that might exceed 64 chars
		const mcpToolId = "call_mcp--analytics--dashboard_create_12345678-1234-1234-1234-123456789012"
		const result = (0, tool_id_1.sanitizeOpenAiCallId)(mcpToolId)
		expect(result.length).toBeLessThanOrEqual(64)
		expect(result).toMatch(/^[a-zA-Z0-9_-]+$/)
	})
	it("should preserve IDs that are already valid and within limit", () => {
		const validId = "toolu_01AbC-xyz_789"
		expect((0, tool_id_1.sanitizeOpenAiCallId)(validId)).toBe(validId)
	})
})
describe("OPENAI_CALL_ID_MAX_LENGTH constant", () => {
	it("should be 64", () => {
		expect(tool_id_1.OPENAI_CALL_ID_MAX_LENGTH).toBe(64)
	})
})
