"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const UpdateTodoListTool_1 = require("../UpdateTodoListTool")
;(0, vitest_1.describe)("parseMarkdownChecklist", () => {
	;(0, vitest_1.describe)("standard checkbox format (without dash prefix)", () => {
		;(0, vitest_1.it)("should parse pending tasks", () => {
			const md = `[ ] Task 1
[ ] Task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("pending")
			;(0, vitest_1.expect)(result[1].content).toBe("Task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("pending")
		})
		;(0, vitest_1.it)("should parse completed tasks with lowercase x", () => {
			const md = `[x] Completed task 1
[x] Completed task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Completed task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("completed")
			;(0, vitest_1.expect)(result[1].content).toBe("Completed task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("completed")
		})
		;(0, vitest_1.it)("should parse completed tasks with uppercase X", () => {
			const md = `[X] Completed task 1
[X] Completed task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Completed task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("completed")
			;(0, vitest_1.expect)(result[1].content).toBe("Completed task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("completed")
		})
		;(0, vitest_1.it)("should parse in-progress tasks with dash", () => {
			const md = `[-] In progress task 1
[-] In progress task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("In progress task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("in_progress")
			;(0, vitest_1.expect)(result[1].content).toBe("In progress task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("in_progress")
		})
		;(0, vitest_1.it)("should parse in-progress tasks with tilde", () => {
			const md = `[~] In progress task 1
[~] In progress task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("In progress task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("in_progress")
			;(0, vitest_1.expect)(result[1].content).toBe("In progress task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("in_progress")
		})
	})
	;(0, vitest_1.describe)("dash-prefixed checkbox format", () => {
		;(0, vitest_1.it)("should parse pending tasks with dash prefix", () => {
			const md = `- [ ] Task 1
- [ ] Task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("pending")
			;(0, vitest_1.expect)(result[1].content).toBe("Task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("pending")
		})
		;(0, vitest_1.it)("should parse completed tasks with dash prefix and lowercase x", () => {
			const md = `- [x] Completed task 1
- [x] Completed task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Completed task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("completed")
			;(0, vitest_1.expect)(result[1].content).toBe("Completed task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("completed")
		})
		;(0, vitest_1.it)("should parse completed tasks with dash prefix and uppercase X", () => {
			const md = `- [X] Completed task 1
- [X] Completed task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Completed task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("completed")
			;(0, vitest_1.expect)(result[1].content).toBe("Completed task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("completed")
		})
		;(0, vitest_1.it)("should parse in-progress tasks with dash prefix and dash marker", () => {
			const md = `- [-] In progress task 1
- [-] In progress task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("In progress task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("in_progress")
			;(0, vitest_1.expect)(result[1].content).toBe("In progress task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("in_progress")
		})
		;(0, vitest_1.it)("should parse in-progress tasks with dash prefix and tilde marker", () => {
			const md = `- [~] In progress task 1
- [~] In progress task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("In progress task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("in_progress")
			;(0, vitest_1.expect)(result[1].content).toBe("In progress task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("in_progress")
		})
	})
	;(0, vitest_1.describe)("mixed formats", () => {
		;(0, vitest_1.it)("should parse mixed formats correctly", () => {
			const md = `[ ] Task without dash
- [ ] Task with dash
[x] Completed without dash
- [X] Completed with dash
[-] In progress without dash
- [~] In progress with dash`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(6)
			;(0, vitest_1.expect)(result[0].content).toBe("Task without dash")
			;(0, vitest_1.expect)(result[0].status).toBe("pending")
			;(0, vitest_1.expect)(result[1].content).toBe("Task with dash")
			;(0, vitest_1.expect)(result[1].status).toBe("pending")
			;(0, vitest_1.expect)(result[2].content).toBe("Completed without dash")
			;(0, vitest_1.expect)(result[2].status).toBe("completed")
			;(0, vitest_1.expect)(result[3].content).toBe("Completed with dash")
			;(0, vitest_1.expect)(result[3].status).toBe("completed")
			;(0, vitest_1.expect)(result[4].content).toBe("In progress without dash")
			;(0, vitest_1.expect)(result[4].status).toBe("in_progress")
			;(0, vitest_1.expect)(result[5].content).toBe("In progress with dash")
			;(0, vitest_1.expect)(result[5].status).toBe("in_progress")
		})
	})
	;(0, vitest_1.describe)("edge cases", () => {
		;(0, vitest_1.it)("should handle empty strings", () => {
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)("")
			;(0, vitest_1.expect)(result).toEqual([])
		})
		;(0, vitest_1.it)("should handle non-string input", () => {
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(null)
			;(0, vitest_1.expect)(result).toEqual([])
		})
		;(0, vitest_1.it)("should handle undefined input", () => {
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(undefined)
			;(0, vitest_1.expect)(result).toEqual([])
		})
		;(0, vitest_1.it)("should ignore non-checklist lines", () => {
			const md = `This is not a checklist
[ ] Valid task
Just some text
- Not a checklist item
- [x] Valid completed task
[not valid] Invalid format`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(2)
			;(0, vitest_1.expect)(result[0].content).toBe("Valid task")
			;(0, vitest_1.expect)(result[0].status).toBe("pending")
			;(0, vitest_1.expect)(result[1].content).toBe("Valid completed task")
			;(0, vitest_1.expect)(result[1].status).toBe("completed")
		})
		;(0, vitest_1.it)("should handle extra spaces", () => {
			const md = `  [ ]   Task with spaces  
-  [ ]  Task with dash and spaces
  [x]  Completed with spaces
-   [X]   Completed with dash and spaces`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(4)
			;(0, vitest_1.expect)(result[0].content).toBe("Task with spaces")
			;(0, vitest_1.expect)(result[1].content).toBe("Task with dash and spaces")
			;(0, vitest_1.expect)(result[2].content).toBe("Completed with spaces")
			;(0, vitest_1.expect)(result[3].content).toBe("Completed with dash and spaces")
		})
		;(0, vitest_1.it)("should handle Windows line endings", () => {
			const md = "[ ] Task 1\r\n- [x] Task 2\r\n[-] Task 3"
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result).toHaveLength(3)
			;(0, vitest_1.expect)(result[0].content).toBe("Task 1")
			;(0, vitest_1.expect)(result[0].status).toBe("pending")
			;(0, vitest_1.expect)(result[1].content).toBe("Task 2")
			;(0, vitest_1.expect)(result[1].status).toBe("completed")
			;(0, vitest_1.expect)(result[2].content).toBe("Task 3")
			;(0, vitest_1.expect)(result[2].status).toBe("in_progress")
		})
	})
	;(0, vitest_1.describe)("ID generation", () => {
		;(0, vitest_1.it)("should generate consistent IDs for the same content and status", () => {
			const md1 = `[ ] Task 1
[x] Task 2`
			const md2 = `[ ] Task 1
[x] Task 2`
			const result1 = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md1)
			const result2 = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md2)
			;(0, vitest_1.expect)(result1[0].id).toBe(result2[0].id)
			;(0, vitest_1.expect)(result1[1].id).toBe(result2[1].id)
		})
		;(0, vitest_1.it)("should generate different IDs for different content", () => {
			const md = `[ ] Task 1
[ ] Task 2`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result[0].id).not.toBe(result[1].id)
		})
		;(0, vitest_1.it)("should generate different IDs for same content but different status", () => {
			const md = `[ ] Task 1
[x] Task 1`
			const result = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md)
			;(0, vitest_1.expect)(result[0].id).not.toBe(result[1].id)
		})
		;(0, vitest_1.it)("should generate same IDs regardless of dash prefix", () => {
			const md1 = `[ ] Task 1`
			const md2 = `- [ ] Task 1`
			const result1 = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md1)
			const result2 = (0, UpdateTodoListTool_1.parseMarkdownChecklist)(md2)
			;(0, vitest_1.expect)(result1[0].id).toBe(result2[0].id)
		})
	})
})
