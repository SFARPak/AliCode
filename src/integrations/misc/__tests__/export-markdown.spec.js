"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const export_markdown_1 = require("../export-markdown")
;(0, vitest_1.describe)("export-markdown", () => {
	;(0, vitest_1.describe)("formatContentBlockToMarkdown", () => {
		;(0, vitest_1.it)("should format text blocks", () => {
			const block = { type: "text", text: "Hello, world!" }
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe("Hello, world!")
		})
		;(0, vitest_1.it)("should format image blocks", () => {
			const block = {
				type: "image",
				source: { type: "base64", media_type: "image/png", data: "data" },
			}
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe("[Image]")
		})
		;(0, vitest_1.it)("should format tool_use blocks with string input", () => {
			const block = { type: "tool_use", name: "read_file", id: "123", input: "file.txt" }
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Tool Use: read_file]\nfile.txt",
			)
		})
		;(0, vitest_1.it)("should format tool_use blocks with object input", () => {
			const block = {
				type: "tool_use",
				name: "read_file",
				id: "123",
				input: { path: "file.txt", line_count: 10 },
			}
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Tool Use: read_file]\nPath: file.txt\nLine_count: 10",
			)
		})
		;(0, vitest_1.it)("should format tool_result blocks with string content", () => {
			const block = { type: "tool_result", tool_use_id: "123", content: "File content" }
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Tool]\nFile content",
			)
		})
		;(0, vitest_1.it)("should format tool_result blocks with error", () => {
			const block = {
				type: "tool_result",
				tool_use_id: "123",
				content: "Error message",
				is_error: true,
			}
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Tool (Error)]\nError message",
			)
		})
		;(0, vitest_1.it)("should format tool_result blocks with array content", () => {
			const block = {
				type: "tool_result",
				tool_use_id: "123",
				content: [
					{ type: "text", text: "Line 1" },
					{ type: "text", text: "Line 2" },
				],
			}
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Tool]\nLine 1\nLine 2",
			)
		})
		;(0, vitest_1.it)("should format reasoning blocks", () => {
			const block = { type: "reasoning", text: "Let me think about this..." }
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Reasoning]\nLet me think about this...",
			)
		})
		;(0, vitest_1.it)("should skip thoughtSignature blocks", () => {
			const block = { type: "thoughtSignature" }
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe("")
		})
		;(0, vitest_1.it)("should handle unexpected content types", () => {
			const block = { type: "unknown_type" }
			;(0, vitest_1.expect)((0, export_markdown_1.formatContentBlockToMarkdown)(block)).toBe(
				"[Unexpected content type: unknown_type]",
			)
		})
	})
})
