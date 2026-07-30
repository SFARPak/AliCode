"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const index_1 = require("../index")
;(0, vitest_1.describe)("nested condensing scenarios", () => {
	;(0, vitest_1.describe)("fresh-start model (user-role summaries)", () => {
		;(0, vitest_1.it)("should return only the latest summary and messages after it", () => {
			const condenseId1 = "condense-1"
			const condenseId2 = "condense-2"
			// Simulate history after two nested condenses with user-role summaries
			const history = [
				// Original task - condensed in first condense
				{ role: "user", content: "Build an app", ts: 100, condenseParent: condenseId1 },
				// Messages from first condense
				{ role: "assistant", content: "Starting...", ts: 200, condenseParent: condenseId1 },
				{ role: "user", content: "Add auth", ts: 300, condenseParent: condenseId1 },
				// First summary (user role, fresh-start model) - then condensed in second condense
				{
					role: "user",
					content: [{ type: "text", text: "## Summary 1" }],
					ts: 399,
					isSummary: true,
					condenseId: condenseId1,
					condenseParent: condenseId2, // Tagged during second condense
				},
				// Messages after first condense but before second
				{ role: "assistant", content: "Auth added", ts: 400, condenseParent: condenseId2 },
				{ role: "user", content: "Add database", ts: 500, condenseParent: condenseId2 },
				// Second summary (user role, fresh-start model)
				{
					role: "user",
					content: [{ type: "text", text: "## Summary 2" }],
					ts: 599,
					isSummary: true,
					condenseId: condenseId2,
				},
				// Messages after second condense (kept messages)
				{ role: "assistant", content: "Database added", ts: 600 },
				{ role: "user", content: "Now test it", ts: 700 },
			]
			// Step 1: Get effective history
			const effectiveHistory = (0, index_1.getEffectiveApiHistory)(history)
			// Should only contain: Summary2, and messages after it
			;(0, vitest_1.expect)(effectiveHistory.length).toBe(3)
			;(0, vitest_1.expect)(effectiveHistory[0].isSummary).toBe(true)
			;(0, vitest_1.expect)(effectiveHistory[0].condenseId).toBe(condenseId2) // Latest summary
			;(0, vitest_1.expect)(effectiveHistory[1].content).toBe("Database added")
			;(0, vitest_1.expect)(effectiveHistory[2].content).toBe("Now test it")
			// Verify NO condensed messages are included
			const hasCondensedMessages = effectiveHistory.some(
				(msg) => msg.condenseParent && history.some((m) => m.isSummary && m.condenseId === msg.condenseParent),
			)
			;(0, vitest_1.expect)(hasCondensedMessages).toBe(false)
			// Step 2: Get messages since last summary (on effective history)
			const messagesSinceLastSummary = (0, index_1.getMessagesSinceLastSummary)(effectiveHistory)
			// Should be the same as effective history since Summary2 is already at the start
			;(0, vitest_1.expect)(messagesSinceLastSummary.length).toBe(3)
			;(0, vitest_1.expect)(messagesSinceLastSummary[0].isSummary).toBe(true)
			;(0, vitest_1.expect)(messagesSinceLastSummary[0].condenseId).toBe(condenseId2)
			// CRITICAL: No previous history (Summary1 or original task) should be included
			const hasSummary1 = messagesSinceLastSummary.some((m) => m.condenseId === condenseId1)
			;(0, vitest_1.expect)(hasSummary1).toBe(false)
			const hasOriginalTask = messagesSinceLastSummary.some((m) => m.content === "Build an app")
			;(0, vitest_1.expect)(hasOriginalTask).toBe(false)
		})
		;(0, vitest_1.it)("should handle triple nested condense correctly", () => {
			const condenseId1 = "condense-1"
			const condenseId2 = "condense-2"
			const condenseId3 = "condense-3"
			const history = [
				// First condense content
				{ role: "user", content: "Task", ts: 100, condenseParent: condenseId1 },
				{
					role: "user",
					content: [{ type: "text", text: "## Summary 1" }],
					ts: 199,
					isSummary: true,
					condenseId: condenseId1,
					condenseParent: condenseId2,
				},
				// Second condense content
				{ role: "assistant", content: "After S1", ts: 200, condenseParent: condenseId2 },
				{
					role: "user",
					content: [{ type: "text", text: "## Summary 2" }],
					ts: 299,
					isSummary: true,
					condenseId: condenseId2,
					condenseParent: condenseId3,
				},
				// Third condense content
				{ role: "assistant", content: "After S2", ts: 300, condenseParent: condenseId3 },
				{
					role: "user",
					content: [{ type: "text", text: "## Summary 3" }],
					ts: 399,
					isSummary: true,
					condenseId: condenseId3,
				},
				// Current messages
				{ role: "assistant", content: "Current work", ts: 400 },
			]
			const effectiveHistory = (0, index_1.getEffectiveApiHistory)(history)
			// Should only contain Summary3 and current work
			;(0, vitest_1.expect)(effectiveHistory.length).toBe(2)
			;(0, vitest_1.expect)(effectiveHistory[0].condenseId).toBe(condenseId3)
			;(0, vitest_1.expect)(effectiveHistory[1].content).toBe("Current work")
			const messagesSinceLastSummary = (0, index_1.getMessagesSinceLastSummary)(effectiveHistory)
			;(0, vitest_1.expect)(messagesSinceLastSummary.length).toBe(2)
			// No previous summaries should be included
			const hasPreviousSummaries = messagesSinceLastSummary.some(
				(m) => m.condenseId === condenseId1 || m.condenseId === condenseId2,
			)
			;(0, vitest_1.expect)(hasPreviousSummaries).toBe(false)
		})
	})
	;(0, vitest_1.describe)("getMessagesSinceLastSummary behavior with full vs effective history", () => {
		;(0, vitest_1.it)("should return consistent results when called with full history vs effective history", () => {
			const condenseId = "condense-1"
			const fullHistory = [
				{ role: "user", content: "Original task", ts: 100, condenseParent: condenseId },
				{ role: "assistant", content: "Response", ts: 200, condenseParent: condenseId },
				{
					role: "user",
					content: [{ type: "text", text: "Summary" }],
					ts: 299,
					isSummary: true,
					condenseId,
				},
				{ role: "assistant", content: "After summary", ts: 300 },
			]
			// Called with FULL history (as in summarizeConversation)
			const fromFullHistory = (0, index_1.getMessagesSinceLastSummary)(fullHistory)
			// Called with EFFECTIVE history (as in attemptApiRequest)
			const effectiveHistory = (0, index_1.getEffectiveApiHistory)(fullHistory)
			const fromEffectiveHistory = (0, index_1.getMessagesSinceLastSummary)(effectiveHistory)
			// Both should return the same messages when summary is user role
			;(0, vitest_1.expect)(fromFullHistory.length).toBe(fromEffectiveHistory.length)
			// Both should start with the summary
			;(0, vitest_1.expect)(fromFullHistory[0].isSummary).toBe(true)
			;(0, vitest_1.expect)(fromEffectiveHistory[0].isSummary).toBe(true)
		})
		;(0, vitest_1.it)("should not include condensed original task in effective history", () => {
			const condenseId1 = "condense-1"
			const condenseId2 = "condense-2"
			// Scenario: Two nested condenses with user-role summaries
			const fullHistory = [
				{ role: "user", content: "Original task - should NOT appear", ts: 100, condenseParent: condenseId1 },
				{ role: "assistant", content: "Old response", ts: 200, condenseParent: condenseId1 },
				// First summary (user role, fresh-start model), then condensed again
				{
					role: "user",
					content: [{ type: "text", text: "Summary 1" }],
					ts: 299,
					isSummary: true,
					condenseId: condenseId1,
					condenseParent: condenseId2,
				},
				{ role: "assistant", content: "After S1", ts: 300, condenseParent: condenseId2 },
				// Second summary (user role, fresh-start model)
				{
					role: "user",
					content: [{ type: "text", text: "Summary 2" }],
					ts: 399,
					isSummary: true,
					condenseId: condenseId2,
				},
				{ role: "assistant", content: "Current message", ts: 400 },
			]
			const effectiveHistory = (0, index_1.getEffectiveApiHistory)(fullHistory)
			;(0, vitest_1.expect)(effectiveHistory.length).toBe(2) // Summary2 + Current message
			const messagesSinceLastSummary = (0, index_1.getMessagesSinceLastSummary)(effectiveHistory)
			// The original task should NOT be included
			const hasOriginalTask = messagesSinceLastSummary.some((m) =>
				typeof m.content === "string"
					? m.content.includes("Original task")
					: JSON.stringify(m.content).includes("Original task"),
			)
			;(0, vitest_1.expect)(hasOriginalTask).toBe(false)
			// Summary1 should not be included (it was condensed)
			const hasSummary1 = messagesSinceLastSummary.some((m) => m.condenseId === condenseId1)
			;(0, vitest_1.expect)(hasSummary1).toBe(false)
		})
	})
})
