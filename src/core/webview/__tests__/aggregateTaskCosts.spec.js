"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const aggregateTaskCosts_js_1 = require("../aggregateTaskCosts.js")
;(0, vitest_1.describe)("aggregateTaskCostsRecursive", () => {
	let consoleWarnSpy
	;(0, vitest_1.beforeEach)(() => {
		consoleWarnSpy = vitest_1.vi.spyOn(console, "warn").mockImplementation(() => {})
	})
	;(0, vitest_1.it)("should calculate cost for task with no children", async () => {
		const mockHistory = {
			"task-1": {
				id: "task-1",
				totalCost: 1.5,
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("task-1", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(1.5)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0)
		;(0, vitest_1.expect)(result.totalCost).toBe(1.5)
		;(0, vitest_1.expect)(result.childBreakdown).toEqual({})
	})
	;(0, vitest_1.it)("should calculate cost for task with undefined childIds", async () => {
		const mockHistory = {
			"task-1": {
				id: "task-1",
				totalCost: 2.0,
				// childIds is undefined
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("task-1", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(2.0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0)
		;(0, vitest_1.expect)(result.totalCost).toBe(2.0)
		;(0, vitest_1.expect)(result.childBreakdown).toEqual({})
	})
	;(0, vitest_1.it)("should aggregate parent with one child", async () => {
		const mockHistory = {
			parent: {
				id: "parent",
				totalCost: 1.0,
				childIds: ["child-1"],
			},
			"child-1": {
				id: "child-1",
				totalCost: 0.5,
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("parent", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(1.0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0.5)
		;(0, vitest_1.expect)(result.totalCost).toBe(1.5)
		;(0, vitest_1.expect)(result.childBreakdown).toHaveProperty("child-1")
		const child1 = result.childBreakdown?.["child-1"]
		;(0, vitest_1.expect)(child1).toBeDefined()
		;(0, vitest_1.expect)(child1.totalCost).toBe(0.5)
	})
	;(0, vitest_1.it)("should aggregate parent with multiple children", async () => {
		const mockHistory = {
			parent: {
				id: "parent",
				totalCost: 1.0,
				childIds: ["child-1", "child-2", "child-3"],
			},
			"child-1": {
				id: "child-1",
				totalCost: 0.5,
				childIds: [],
			},
			"child-2": {
				id: "child-2",
				totalCost: 0.75,
				childIds: [],
			},
			"child-3": {
				id: "child-3",
				totalCost: 0.25,
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("parent", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(1.0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(1.5) // 0.5 + 0.75 + 0.25
		;(0, vitest_1.expect)(result.totalCost).toBe(2.5)
		;(0, vitest_1.expect)(Object.keys(result.childBreakdown || {})).toHaveLength(3)
	})
	;(0, vitest_1.it)("should recursively aggregate multi-level hierarchy", async () => {
		const mockHistory = {
			parent: {
				id: "parent",
				totalCost: 1.0,
				childIds: ["child"],
			},
			child: {
				id: "child",
				totalCost: 0.5,
				childIds: ["grandchild"],
			},
			grandchild: {
				id: "grandchild",
				totalCost: 0.25,
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("parent", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(1.0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0.75) // child (0.5) + grandchild (0.25)
		;(0, vitest_1.expect)(result.totalCost).toBe(1.75)
		// Verify child breakdown
		const child = result.childBreakdown?.["child"]
		;(0, vitest_1.expect)(child).toBeDefined()
		;(0, vitest_1.expect)(child.ownCost).toBe(0.5)
		;(0, vitest_1.expect)(child.childrenCost).toBe(0.25)
		;(0, vitest_1.expect)(child.totalCost).toBe(0.75)
		// Verify grandchild breakdown
		const grandchild = child.childBreakdown?.["grandchild"]
		;(0, vitest_1.expect)(grandchild).toBeDefined()
		;(0, vitest_1.expect)(grandchild.ownCost).toBe(0.25)
		;(0, vitest_1.expect)(grandchild.childrenCost).toBe(0)
		;(0, vitest_1.expect)(grandchild.totalCost).toBe(0.25)
	})
	;(0, vitest_1.it)("should detect and prevent circular references", async () => {
		const mockHistory = {
			"task-a": {
				id: "task-a",
				totalCost: 1.0,
				childIds: ["task-b"],
			},
			"task-b": {
				id: "task-b",
				totalCost: 0.5,
				childIds: ["task-a"], // Circular reference back to task-a
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("task-a", getTaskHistory)
		// Should still process task-b but ignore the circular reference
		;(0, vitest_1.expect)(result.ownCost).toBe(1.0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0.5) // Only task-b's own cost, circular ref returns 0
		;(0, vitest_1.expect)(result.totalCost).toBe(1.5)
		// Verify warning was logged
		;(0, vitest_1.expect)(consoleWarnSpy).toHaveBeenCalledWith(
			vitest_1.expect.stringContaining("Circular reference detected: task-a"),
		)
	})
	;(0, vitest_1.it)("should handle missing task gracefully", async () => {
		const mockHistory = {
			parent: {
				id: "parent",
				totalCost: 1.0,
				childIds: ["nonexistent-child"],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("parent", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(1.0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0) // Missing child contributes 0
		;(0, vitest_1.expect)(result.totalCost).toBe(1.0)
		// Verify warning was logged
		;(0, vitest_1.expect)(consoleWarnSpy).toHaveBeenCalledWith(
			vitest_1.expect.stringContaining("Task nonexistent-child not found"),
		)
	})
	;(0, vitest_1.it)("should return zero costs for completely missing task", async () => {
		const mockHistory = {}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("nonexistent", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0)
		;(0, vitest_1.expect)(result.totalCost).toBe(0)
		;(0, vitest_1.expect)(consoleWarnSpy).toHaveBeenCalledWith(
			vitest_1.expect.stringContaining("Task nonexistent not found"),
		)
	})
	;(0, vitest_1.it)("should handle task with null totalCost", async () => {
		const mockHistory = {
			"task-1": {
				id: "task-1",
				totalCost: null, // Explicitly null (invalid type in prod)
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("task-1", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0)
		;(0, vitest_1.expect)(result.totalCost).toBe(0)
	})
	;(0, vitest_1.it)("should handle task with undefined totalCost", async () => {
		const mockHistory = {
			"task-1": {
				id: "task-1",
				// totalCost is undefined
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("task-1", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(0)
		;(0, vitest_1.expect)(result.childrenCost).toBe(0)
		;(0, vitest_1.expect)(result.totalCost).toBe(0)
	})
	;(0, vitest_1.it)("should handle complex hierarchy with mixed costs", async () => {
		const mockHistory = {
			root: {
				id: "root",
				totalCost: 2.5,
				childIds: ["child-1", "child-2"],
			},
			"child-1": {
				id: "child-1",
				totalCost: 1.2,
				childIds: ["grandchild-1", "grandchild-2"],
			},
			"child-2": {
				id: "child-2",
				totalCost: 0.8,
				childIds: [],
			},
			"grandchild-1": {
				id: "grandchild-1",
				totalCost: 0.3,
				childIds: [],
			},
			"grandchild-2": {
				id: "grandchild-2",
				totalCost: 0.15,
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("root", getTaskHistory)
		;(0, vitest_1.expect)(result.ownCost).toBe(2.5)
		// child-1: 1.2 + 0.3 + 0.15 = 1.65
		// child-2: 0.8
		// Total children: 2.45
		;(0, vitest_1.expect)(result.childrenCost).toBe(2.45)
		;(0, vitest_1.expect)(result.totalCost).toBe(4.95) // 2.5 + 2.45
	})
	;(0, vitest_1.it)("should handle siblings without cross-contamination", async () => {
		const mockHistory = {
			parent: {
				id: "parent",
				totalCost: 1.0,
				childIds: ["sibling-1", "sibling-2"],
			},
			"sibling-1": {
				id: "sibling-1",
				totalCost: 0.5,
				childIds: ["nephew"],
			},
			"sibling-2": {
				id: "sibling-2",
				totalCost: 0.3,
				childIds: ["nephew"], // Same child ID as sibling-1
			},
			nephew: {
				id: "nephew",
				totalCost: 0.1,
				childIds: [],
			},
		}
		const getTaskHistory = vitest_1.vi.fn(async (id) => mockHistory[id])
		const result = await (0, aggregateTaskCosts_js_1.aggregateTaskCostsRecursive)("parent", getTaskHistory)
		// Both siblings should independently count nephew
		// sibling-1: 0.5 + 0.1 = 0.6
		// sibling-2: 0.3 + 0.1 = 0.4
		// Total: 1.0 + 0.6 + 0.4 = 2.0
		;(0, vitest_1.expect)(result.totalCost).toBe(2.0)
	})
})
