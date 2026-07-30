"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const mcp_name_1 = require("../mcp-name")
describe("mcp-name utilities", () => {
	describe("constants", () => {
		it("should have correct separator and prefix", () => {
			expect(mcp_name_1.MCP_TOOL_SEPARATOR).toBe("--")
			expect(mcp_name_1.MCP_TOOL_PREFIX).toBe("mcp")
		})
	})
	describe("normalizeForComparison", () => {
		it("should convert hyphens to underscores", () => {
			expect((0, mcp_name_1.normalizeForComparison)("get-user-profile")).toBe("get_user_profile")
		})
		it("should not modify strings without hyphens", () => {
			expect((0, mcp_name_1.normalizeForComparison)("get_user_profile")).toBe("get_user_profile")
			expect((0, mcp_name_1.normalizeForComparison)("tool")).toBe("tool")
		})
		it("should handle mixed hyphens and underscores", () => {
			expect((0, mcp_name_1.normalizeForComparison)("get-user_profile")).toBe("get_user_profile")
		})
		it("should handle multiple hyphens", () => {
			expect((0, mcp_name_1.normalizeForComparison)("mcp--server--tool")).toBe("mcp__server__tool")
		})
	})
	describe("toolNamesMatch", () => {
		it("should match identical names", () => {
			expect((0, mcp_name_1.toolNamesMatch)("get_user", "get_user")).toBe(true)
			expect((0, mcp_name_1.toolNamesMatch)("get-user", "get-user")).toBe(true)
		})
		it("should match names with hyphens vs underscores", () => {
			expect((0, mcp_name_1.toolNamesMatch)("get-user", "get_user")).toBe(true)
			expect((0, mcp_name_1.toolNamesMatch)("get_user", "get-user")).toBe(true)
		})
		it("should match complex MCP tool names", () => {
			expect(
				(0, mcp_name_1.toolNamesMatch)("mcp--server--get-user-profile", "mcp__server__get_user_profile"),
			).toBe(true)
		})
		it("should not match different names", () => {
			expect((0, mcp_name_1.toolNamesMatch)("get_user", "get_profile")).toBe(false)
		})
	})
	describe("isMcpTool", () => {
		it("should return true for valid MCP tool names with hyphens", () => {
			expect((0, mcp_name_1.isMcpTool)("mcp--server--tool")).toBe(true)
			expect((0, mcp_name_1.isMcpTool)("mcp--my_server--get_forecast")).toBe(true)
			expect((0, mcp_name_1.isMcpTool)("mcp--server--get-user-profile")).toBe(true)
		})
		it("should return true for MCP tool names with underscore separators", () => {
			// Models may convert hyphens to underscores
			expect((0, mcp_name_1.isMcpTool)("mcp__server__tool")).toBe(true)
			expect((0, mcp_name_1.isMcpTool)("mcp__my_server__get_forecast")).toBe(true)
		})
		it("should return false for non-MCP tool names", () => {
			expect((0, mcp_name_1.isMcpTool)("server--tool")).toBe(false)
			expect((0, mcp_name_1.isMcpTool)("tool")).toBe(false)
			expect((0, mcp_name_1.isMcpTool)("read_file")).toBe(false)
			expect((0, mcp_name_1.isMcpTool)("")).toBe(false)
		})
		it("should return false for old single-underscore format", () => {
			expect((0, mcp_name_1.isMcpTool)("mcp_server_tool")).toBe(false)
		})
		it("should return false for partial prefix", () => {
			expect((0, mcp_name_1.isMcpTool)("mcp-server")).toBe(false)
			expect((0, mcp_name_1.isMcpTool)("mcp")).toBe(false)
		})
	})
	describe("sanitizeMcpName", () => {
		it("should return underscore placeholder for empty input", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("")).toBe("_")
		})
		it("should replace spaces with underscores", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("my server")).toBe("my_server")
			expect((0, mcp_name_1.sanitizeMcpName)("server name here")).toBe("server_name_here")
		})
		it("should remove invalid characters", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("server@name!")).toBe("servername")
			expect((0, mcp_name_1.sanitizeMcpName)("test#$%^&*()")).toBe("test")
		})
		it("should keep alphanumeric, underscores, and hyphens", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("server_name")).toBe("server_name")
			expect((0, mcp_name_1.sanitizeMcpName)("server-name")).toBe("server-name")
			expect((0, mcp_name_1.sanitizeMcpName)("Server123")).toBe("Server123")
		})
		it("should remove dots and colons for AWS Bedrock compatibility", () => {
			// Dots and colons are NOT allowed due to AWS Bedrock restrictions
			expect((0, mcp_name_1.sanitizeMcpName)("server.name")).toBe("servername")
			expect((0, mcp_name_1.sanitizeMcpName)("server:name")).toBe("servername")
			// Hyphens are preserved
			expect((0, mcp_name_1.sanitizeMcpName)("awslabs.aws-documentation-mcp-server")).toBe(
				"awslabsaws-documentation-mcp-server",
			)
		})
		it("should prepend underscore if name starts with non-letter/underscore", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("123server")).toBe("_123server")
			// Hyphen at start still needs underscore prefix (function names must start with letter/underscore)
			expect((0, mcp_name_1.sanitizeMcpName)("-server")).toBe("_-server")
			// Dots are removed, so ".server" becomes "server" which starts with a letter
			expect((0, mcp_name_1.sanitizeMcpName)(".server")).toBe("server")
		})
		it("should not modify names that start with letter or underscore", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("server")).toBe("server")
			expect((0, mcp_name_1.sanitizeMcpName)("_server")).toBe("_server")
			expect((0, mcp_name_1.sanitizeMcpName)("Server")).toBe("Server")
		})
		it("should replace double-hyphen sequences with single hyphen to avoid separator conflicts", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("server--name")).toBe("server-name")
			expect((0, mcp_name_1.sanitizeMcpName)("test---server")).toBe("test-server")
			expect((0, mcp_name_1.sanitizeMcpName)("my----tool")).toBe("my-tool")
		})
		it("should handle complex names with multiple issues", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("My Server @ Home!")).toBe("My_Server__Home")
			expect((0, mcp_name_1.sanitizeMcpName)("123-test server")).toBe("_123-test_server")
		})
		it("should return placeholder for names that become empty after sanitization", () => {
			expect((0, mcp_name_1.sanitizeMcpName)("@#$%")).toBe("_unnamed")
			// Spaces become underscores, which is a valid character, so it returns "_"
			expect((0, mcp_name_1.sanitizeMcpName)("   ")).toBe("_")
		})
		it("should preserve hyphens in tool names", () => {
			// Hyphens are preserved, not encoded
			expect((0, mcp_name_1.sanitizeMcpName)("atlassian-jira_search")).toBe("atlassian-jira_search")
			expect((0, mcp_name_1.sanitizeMcpName)("atlassian-confluence_search")).toBe("atlassian-confluence_search")
		})
	})
	describe("buildMcpToolName", () => {
		it("should build tool name with mcp-- prefix and -- separators", () => {
			expect((0, mcp_name_1.buildMcpToolName)("server", "tool")).toBe("mcp--server--tool")
		})
		it("should sanitize both server and tool names", () => {
			expect((0, mcp_name_1.buildMcpToolName)("my server", "my tool")).toBe("mcp--my_server--my_tool")
		})
		it("should handle names with special characters", () => {
			expect((0, mcp_name_1.buildMcpToolName)("server@name", "tool!name")).toBe("mcp--servername--toolname")
		})
		it("should truncate long names to 64 characters", () => {
			const longServer = "a".repeat(50)
			const longTool = "b".repeat(50)
			const result = (0, mcp_name_1.buildMcpToolName)(longServer, longTool)
			expect(result.length).toBeLessThanOrEqual(64)
			expect(result.startsWith("mcp--")).toBe(true)
		})
		it("should handle names starting with numbers", () => {
			expect((0, mcp_name_1.buildMcpToolName)("123server", "456tool")).toBe("mcp--_123server--_456tool")
		})
		it("should preserve underscores in server and tool names", () => {
			expect((0, mcp_name_1.buildMcpToolName)("my_server", "my_tool")).toBe("mcp--my_server--my_tool")
		})
		it("should preserve hyphens in tool names", () => {
			// Hyphens are preserved (not encoded)
			expect((0, mcp_name_1.buildMcpToolName)("onellm", "atlassian-jira_search")).toBe(
				"mcp--onellm--atlassian-jira_search",
			)
		})
		it("should handle tool names with multiple hyphens", () => {
			expect((0, mcp_name_1.buildMcpToolName)("server", "get-user-profile")).toBe("mcp--server--get-user-profile")
		})
	})
	describe("parseMcpToolName", () => {
		it("should parse valid mcp tool names with hyphen separators", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp--server--tool")).toEqual({
				serverName: "server",
				toolName: "tool",
			})
		})
		it("should parse MCP tool names with underscore separators (model output)", () => {
			// Models may convert hyphens to underscores
			expect((0, mcp_name_1.parseMcpToolName)("mcp__server__tool")).toEqual({
				serverName: "server",
				toolName: "tool",
			})
		})
		it("should return null for non-mcp tool names", () => {
			expect((0, mcp_name_1.parseMcpToolName)("server--tool")).toBeNull()
			expect((0, mcp_name_1.parseMcpToolName)("tool")).toBeNull()
		})
		it("should return null for old single-underscore format", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp_server_tool")).toBeNull()
		})
		it("should handle tool names with underscores", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp--server--tool_name")).toEqual({
				serverName: "server",
				toolName: "tool_name",
			})
		})
		it("should correctly handle server names with underscores", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp--my_server--tool")).toEqual({
				serverName: "my_server",
				toolName: "tool",
			})
		})
		it("should handle both server and tool names with underscores", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp--my_server--get_forecast")).toEqual({
				serverName: "my_server",
				toolName: "get_forecast",
			})
		})
		it("should handle tool names with hyphens", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp--onellm--atlassian-jira_search")).toEqual({
				serverName: "onellm",
				toolName: "atlassian-jira_search",
			})
		})
		it("should return null for malformed names", () => {
			expect((0, mcp_name_1.parseMcpToolName)("mcp--")).toBeNull()
			expect((0, mcp_name_1.parseMcpToolName)("mcp--server")).toBeNull()
		})
	})
	describe("normalizeMcpToolName", () => {
		it("should convert underscore separators to hyphen separators", () => {
			expect((0, mcp_name_1.normalizeMcpToolName)("mcp__server__tool")).toBe("mcp--server--tool")
		})
		it("should not modify names that already have hyphen separators", () => {
			expect((0, mcp_name_1.normalizeMcpToolName)("mcp--server--tool")).toBe("mcp--server--tool")
		})
		it("should not modify non-MCP tool names", () => {
			expect((0, mcp_name_1.normalizeMcpToolName)("read_file")).toBe("read_file")
			expect((0, mcp_name_1.normalizeMcpToolName)("some__tool")).toBe("some__tool")
		})
		it("should preserve underscores within names while normalizing separators", () => {
			// Model outputs: mcp__my_server__get_user_profile
			// Should become: mcp--my_server--get_user_profile (preserving underscores in names)
			expect((0, mcp_name_1.normalizeMcpToolName)("mcp__my_server__get_user_profile")).toBe(
				"mcp--my_server--get_user_profile",
			)
		})
		it("should handle tool names that originally had hyphens (converted by model)", () => {
			// Original: mcp--server--get-user-profile
			// Model outputs: mcp__server__get_user_profile (hyphens converted to underscores)
			// Normalized: mcp--server--get_user_profile
			expect((0, mcp_name_1.normalizeMcpToolName)("mcp__server__get_user_profile")).toBe(
				"mcp--server--get_user_profile",
			)
		})
	})
	describe("roundtrip behavior", () => {
		it("should be able to parse names that were built", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("server", "tool")
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "server",
				toolName: "tool",
			})
		})
		it("should preserve names through roundtrip with underscores", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("my_server", "my_tool")
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "my_server",
				toolName: "my_tool",
			})
		})
		it("should handle spaces that get converted to underscores", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("my server", "get tool")
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "my_server",
				toolName: "get_tool",
			})
		})
		it("should handle complex server and tool names", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("Weather API", "get_current_forecast")
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "Weather_API",
				toolName: "get_current_forecast",
			})
		})
		it("should preserve hyphens through roundtrip", () => {
			// Build with hyphens in tool name
			const toolName = (0, mcp_name_1.buildMcpToolName)("onellm", "atlassian-jira_search")
			expect(toolName).toBe("mcp--onellm--atlassian-jira_search")
			// Parse directly
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "onellm",
				toolName: "atlassian-jira_search",
			})
		})
		it("should handle tool names with multiple hyphens", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("server", "get-user-profile")
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "server",
				toolName: "get-user-profile",
			})
		})
	})
	describe("model compatibility - full flow", () => {
		it("should handle the complete flow when model preserves hyphens", () => {
			// Step 1: Build the tool name
			const builtName = (0, mcp_name_1.buildMcpToolName)("onellm", "atlassian-jira_search")
			expect(builtName).toBe("mcp--onellm--atlassian-jira_search")
			// Step 2: Model outputs as-is (no mangling)
			const modelOutput = "mcp--onellm--atlassian-jira_search"
			// Step 3: Normalize (no change needed)
			const normalizedName = (0, mcp_name_1.normalizeMcpToolName)(modelOutput)
			expect(normalizedName).toBe("mcp--onellm--atlassian-jira_search")
			// Step 4: Parse
			const parsed = (0, mcp_name_1.parseMcpToolName)(normalizedName)
			expect(parsed).toEqual({
				serverName: "onellm",
				toolName: "atlassian-jira_search",
			})
		})
		it("should handle the complete flow when model converts separators only", () => {
			// Step 1: Build the tool name
			const builtName = (0, mcp_name_1.buildMcpToolName)("onellm", "atlassian-jira_search")
			expect(builtName).toBe("mcp--onellm--atlassian-jira_search")
			// Step 2: Model converts -- separators to __
			const modelOutput = "mcp__onellm__atlassian-jira_search"
			// Step 3: Normalize the separators back
			const normalizedName = (0, mcp_name_1.normalizeMcpToolName)(modelOutput)
			expect(normalizedName).toBe("mcp--onellm--atlassian-jira_search")
			// Step 4: Parse
			const parsed = (0, mcp_name_1.parseMcpToolName)(normalizedName)
			expect(parsed).toEqual({
				serverName: "onellm",
				toolName: "atlassian-jira_search",
			})
		})
		it("should handle the complete flow when model converts ALL hyphens to underscores", () => {
			// Step 1: Build the tool name
			const builtName = (0, mcp_name_1.buildMcpToolName)("onellm", "atlassian-jira_search")
			expect(builtName).toBe("mcp--onellm--atlassian-jira_search")
			// Step 2: Model converts ALL hyphens to underscores
			const modelOutput = "mcp__onellm__atlassian_jira_search"
			// Step 3: Normalize
			const normalizedName = (0, mcp_name_1.normalizeMcpToolName)(modelOutput)
			expect(normalizedName).toBe("mcp--onellm--atlassian_jira_search")
			// Step 4: Parse - the tool name now has underscore instead of hyphen
			const parsed = (0, mcp_name_1.parseMcpToolName)(normalizedName)
			expect(parsed).toEqual({
				serverName: "onellm",
				toolName: "atlassian_jira_search", // Note: underscore, not hyphen
			})
			// Step 5: Use fuzzy matching to find the original tool
			expect((0, mcp_name_1.toolNamesMatch)("atlassian-jira_search", parsed.toolName)).toBe(true)
		})
		it("should handle tool names with multiple hyphens through the full flow", () => {
			// Build
			const builtName = (0, mcp_name_1.buildMcpToolName)("server", "get-user-profile")
			expect(builtName).toBe("mcp--server--get-user-profile")
			// Model converts all hyphens to underscores
			const modelOutput = "mcp__server__get_user_profile"
			// Normalize
			const normalizedName = (0, mcp_name_1.normalizeMcpToolName)(modelOutput)
			expect(normalizedName).toBe("mcp--server--get_user_profile")
			// Parse
			const parsed = (0, mcp_name_1.parseMcpToolName)(normalizedName)
			expect(parsed).toEqual({
				serverName: "server",
				toolName: "get_user_profile",
			})
			// Use fuzzy matching to find the original tool
			expect((0, mcp_name_1.toolNamesMatch)("get-user-profile", parsed.toolName)).toBe(true)
		})
	})
	describe("edge cases", () => {
		it("should handle very long tool names by truncating", () => {
			const longServer = "very-long-server-name-that-exceeds"
			const longTool = "very-long-tool-name-that-also-exceeds"
			const result = (0, mcp_name_1.buildMcpToolName)(longServer, longTool)
			expect(result.length).toBeLessThanOrEqual(64)
			// Should still be parseable
			const parsed = (0, mcp_name_1.parseMcpToolName)(result)
			expect(parsed).not.toBeNull()
			expect(parsed?.serverName).toBeDefined()
		})
		it("should handle server names with hyphens", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("my-server", "tool")
			expect(toolName).toBe("mcp--my-server--tool")
			const parsed = (0, mcp_name_1.parseMcpToolName)(toolName)
			expect(parsed).toEqual({
				serverName: "my-server",
				toolName: "tool",
			})
		})
		it("should handle both server and tool names with hyphens", () => {
			const toolName = (0, mcp_name_1.buildMcpToolName)("my-server", "get-user")
			expect(toolName).toBe("mcp--my-server--get-user")
			// When model converts all hyphens
			const modelOutput = "mcp__my_server__get_user"
			const parsed = (0, mcp_name_1.parseMcpToolName)(modelOutput)
			expect(parsed).toEqual({
				serverName: "my_server",
				toolName: "get_user",
			})
			// Fuzzy match should work
			expect((0, mcp_name_1.toolNamesMatch)("my-server", parsed.serverName)).toBe(true)
			expect((0, mcp_name_1.toolNamesMatch)("get-user", parsed.toolName)).toBe(true)
		})
	})
})
