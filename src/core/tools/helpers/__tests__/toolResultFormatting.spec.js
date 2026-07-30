"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const toolResultFormatting_1 = require("../toolResultFormatting")
;(0, vitest_1.describe)("toolResultFormatting", () => {
	;(0, vitest_1.describe)("formatToolInvocation", () => {
		;(0, vitest_1.it)("should format", () => {
			const result = (0, toolResultFormatting_1.formatToolInvocation)("read_file", { path: "test.ts" })
			;(0, vitest_1.expect)(result).toBe("Called read_file with path: test.ts")
			;(0, vitest_1.expect)(result).not.toContain("<")
		})
		;(0, vitest_1.it)("should handle multiple parameters", () => {
			const result = (0, toolResultFormatting_1.formatToolInvocation)("read_file", {
				path: "test.ts",
				start_line: "1",
			})
			;(0, vitest_1.expect)(result).toContain("Called read_file with")
			;(0, vitest_1.expect)(result).toContain("path: test.ts")
			;(0, vitest_1.expect)(result).toContain("start_line: 1")
		})
		;(0, vitest_1.it)("should handle empty parameters", () => {
			const result = (0, toolResultFormatting_1.formatToolInvocation)("list_files", {})
			;(0, vitest_1.expect)(result).toBe("Called list_files")
		})
	})
})
