"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const index_1 = require("../index")
const condense_1 = require("../../condense")
;(0, vitest_1.describe)("Non-Destructive Sliding Window Truncation", () => {
	let messages
	;(0, vitest_1.beforeEach)(() => {
		// Create a sample conversation with 11 messages (1 initial + 10 conversation messages)
		messages = [
			{ role: "user", content: "Initial task", ts: 1000 },
			{ role: "assistant", content: "Response 1", ts: 1100 },
			{ role: "user", content: "Message 2", ts: 1200 },
			{ role: "assistant", content: "Response 2", ts: 1300 },
			{ role: "user", content: "Message 3", ts: 1400 },
			{ role: "assistant", content: "Response 3", ts: 1500 },
			{ role: "user", content: "Message 4", ts: 1600 },
			{ role: "assistant", content: "Response 4", ts: 1700 },
			{ role: "user", content: "Message 5", ts: 1800 },
			{ role: "assistant", content: "Response 5", ts: 1900 },
			{ role: "user", content: "Message 6", ts: 2000 },
		]
	})
	;(0, vitest_1.describe)("truncateConversation()", () => {
		;(0, vitest_1.it)("should tag messages with truncationParent instead of deleting", () => {
			const result = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			// All messages should still be present plus the truncation marker
			;(0, vitest_1.expect)(result.messages.length).toBe(messages.length + 1) // +1 for truncation marker
			// Calculate expected messages to remove: floor((11-1) * 0.5) = 5, rounded to even = 4
			const expectedMessagesToRemove = 4
			// Find which messages have truncationParent set
			const taggedMessages = result.messages.filter((msg) => msg.truncationParent)
			;(0, vitest_1.expect)(taggedMessages.length).toBe(expectedMessagesToRemove)
			// All tagged messages should point to the truncationId
			for (const msg of taggedMessages) {
				;(0, vitest_1.expect)(msg.truncationParent).toBe(result.truncationId)
			}
			// First message should not be tagged
			;(0, vitest_1.expect)(result.messages[0].truncationParent).toBeUndefined()
			// Marker should not have truncationParent
			const marker = result.messages.find((msg) => msg.isTruncationMarker)
			;(0, vitest_1.expect)(marker?.truncationParent).toBeUndefined()
		})
		;(0, vitest_1.it)("should insert truncation marker with truncationId", () => {
			const result = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			// Truncation marker should be at the boundary (after truncated messages)
			// With 4 messages truncated (indices 1-4), marker should be at index 5
			const marker = result.messages.find((msg) => msg.isTruncationMarker)
			;(0, vitest_1.expect)(marker).toBeDefined()
			;(0, vitest_1.expect)(marker.isTruncationMarker).toBe(true)
			;(0, vitest_1.expect)(marker.truncationId).toBeDefined()
			;(0, vitest_1.expect)(marker.truncationId).toBe(result.truncationId)
			;(0, vitest_1.expect)(marker.role).toBe("user")
			;(0, vitest_1.expect)(marker.content).toContain("Sliding window truncation")
		})
		;(0, vitest_1.it)("should return truncationId and messagesRemoved", () => {
			const result = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			;(0, vitest_1.expect)(result.truncationId).toBeDefined()
			;(0, vitest_1.expect)(typeof result.truncationId).toBe("string")
			;(0, vitest_1.expect)(result.messagesRemoved).toBe(4) // floor((11-1) * 0.5) rounded to even
		})
		;(0, vitest_1.it)("should round messagesToRemove to an even number", () => {
			// Test with 12 messages (1 initial + 11 conversation)
			const manyMessages = [
				{ role: "user", content: "Initial", ts: 1000 },
				...Array.from({ length: 11 }, (_, i) => ({
					role: i % 2 === 0 ? "assistant" : "user",
					content: `Message ${i + 1}`,
					ts: 1100 + i * 100,
				})),
			]
			// fracToRemove=0.5 -> rawMessagesToRemove = floor(11 * 0.5) = 5
			// messagesToRemove = 5 - (5 % 2) = 4 (rounded down to even)
			const result = (0, index_1.truncateConversation)(manyMessages, 0.5, "test-task-id")
			;(0, vitest_1.expect)(result.messagesRemoved).toBe(4)
		})
	})
	;(0, vitest_1.describe)("getEffectiveApiHistory()", () => {
		;(0, vitest_1.it)("should filter out truncated messages when truncation marker exists", () => {
			const truncationResult = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			const effective = (0, condense_1.getEffectiveApiHistory)(truncationResult.messages)
			// Should exclude 4 truncated messages but keep the first message and truncation marker
			// Original: 11 messages
			// After truncation: 11 + 1 marker = 12
			// Effective: 11 - 4 (hidden) + 1 (marker) = 8
			;(0, vitest_1.expect)(effective.length).toBe(8)
			// First message should be present
			;(0, vitest_1.expect)(effective[0].content).toBe("Initial task")
			// Truncation marker should be present
			;(0, vitest_1.expect)(effective[1].isTruncationMarker).toBe(true)
			// Messages with truncationParent should be filtered out
			for (const msg of effective) {
				if (msg.truncationParent) {
					throw new Error("Message with truncationParent should be filtered out")
				}
			}
		})
		;(0, vitest_1.it)("should include truncated messages when truncation marker is removed", () => {
			const truncationResult = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			// Remove the truncation marker (simulate rewind past truncation)
			const messagesWithoutMarker = truncationResult.messages.filter((msg) => !msg.isTruncationMarker)
			const effective = (0, condense_1.getEffectiveApiHistory)(messagesWithoutMarker)
			// All messages should be visible now
			;(0, vitest_1.expect)(effective.length).toBe(messages.length)
			// Verify first and last messages are present
			;(0, vitest_1.expect)(effective[0].content).toBe("Initial task")
			;(0, vitest_1.expect)(effective[effective.length - 1].content).toBe("Message 6")
		})
		;(0, vitest_1.it)("should handle both condenseParent and truncationParent filtering", () => {
			// Create a scenario with both condensing and truncation
			const messagesWithCondense = [
				{ role: "user", content: "Initial", ts: 1000 },
				{ role: "assistant", content: "Msg 1", ts: 1100, condenseParent: "condense-1" },
				{ role: "user", content: "Msg 2", ts: 1200, condenseParent: "condense-1" },
				{
					role: "assistant",
					content: "Summary 1",
					ts: 1250,
					isSummary: true,
					condenseId: "condense-1",
				},
				{ role: "user", content: "Msg 3", ts: 1300 },
				{ role: "assistant", content: "Msg 4", ts: 1400 },
			]
			const truncationResult = (0, index_1.truncateConversation)(messagesWithCondense, 0.5, "test-task-id")
			const effective = (0, condense_1.getEffectiveApiHistory)(truncationResult.messages)
			// Should filter both condensed messages and truncated messages
			// Messages with condenseParent="condense-1" should be filtered (summary exists)
			// Messages with truncationParent should be filtered (marker exists)
			const hasCondensedMessage = effective.some((msg) => msg.condenseParent === "condense-1")
			const hasTruncatedMessage = effective.some((msg) => msg.truncationParent)
			;(0, vitest_1.expect)(hasCondensedMessage).toBe(false)
			;(0, vitest_1.expect)(hasTruncatedMessage).toBe(false)
		})
	})
	;(0, vitest_1.describe)("cleanupAfterTruncation()", () => {
		;(0, vitest_1.it)("should clear orphaned truncationParent tags when marker is deleted", () => {
			const truncationResult = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			// Remove the truncation marker (simulate rewind)
			const messagesWithoutMarker = truncationResult.messages.filter((msg) => !msg.isTruncationMarker)
			const cleaned = (0, condense_1.cleanupAfterTruncation)(messagesWithoutMarker)
			// All truncationParent tags should be cleared
			for (const msg of cleaned) {
				;(0, vitest_1.expect)(msg.truncationParent).toBeUndefined()
			}
		})
		;(0, vitest_1.it)("should preserve truncationParent tags when marker still exists", () => {
			const truncationResult = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			const cleaned = (0, condense_1.cleanupAfterTruncation)(truncationResult.messages)
			// truncationParent tags should be preserved (marker still exists)
			const taggedMessages = cleaned.filter((msg) => msg.truncationParent)
			;(0, vitest_1.expect)(taggedMessages.length).toBeGreaterThan(0)
			// All tagged messages should point to the existing marker
			for (const msg of taggedMessages) {
				;(0, vitest_1.expect)(msg.truncationParent).toBe(truncationResult.truncationId)
			}
		})
		;(0, vitest_1.it)("should handle both condenseParent and truncationParent cleanup", () => {
			const messagesWithBoth = [
				{ role: "user", content: "Initial", ts: 1000 },
				{ role: "assistant", content: "Msg 1", ts: 1100, condenseParent: "orphan-condense" },
				{ role: "user", content: "Msg 2", ts: 1200, truncationParent: "orphan-truncation" },
				{ role: "assistant", content: "Msg 3", ts: 1300 },
			]
			const cleaned = (0, condense_1.cleanupAfterTruncation)(messagesWithBoth)
			// Both orphaned parent references should be cleared
			;(0, vitest_1.expect)(cleaned[1].condenseParent).toBeUndefined()
			;(0, vitest_1.expect)(cleaned[2].truncationParent).toBeUndefined()
		})
		;(0, vitest_1.it)("should preserve valid parent references", () => {
			const messagesWithValidParents = [
				{ role: "user", content: "Initial", ts: 1000 },
				{ role: "assistant", content: "Msg 1", ts: 1100, condenseParent: "valid-condense" },
				{
					role: "assistant",
					content: "Summary",
					ts: 1150,
					isSummary: true,
					condenseId: "valid-condense",
				},
				{ role: "user", content: "Msg 2", ts: 1200, truncationParent: "valid-truncation" },
				{
					role: "assistant",
					content: "Truncation marker",
					ts: 1250,
					isTruncationMarker: true,
					truncationId: "valid-truncation",
				},
			]
			const cleaned = (0, condense_1.cleanupAfterTruncation)(messagesWithValidParents)
			// Valid parent references should be preserved
			;(0, vitest_1.expect)(cleaned[1].condenseParent).toBe("valid-condense")
			;(0, vitest_1.expect)(cleaned[3].truncationParent).toBe("valid-truncation")
		})
	})
	;(0, vitest_1.describe)("Rewind past truncation integration", () => {
		;(0, vitest_1.it)("should restore hidden messages when rewinding past truncation point", () => {
			// Step 1: Perform truncation
			const truncationResult = (0, index_1.truncateConversation)(messages, 0.5, "test-task-id")
			// Step 2: Verify messages are hidden initially
			const effectiveBeforeRewind = (0, condense_1.getEffectiveApiHistory)(truncationResult.messages)
			;(0, vitest_1.expect)(effectiveBeforeRewind.length).toBeLessThan(messages.length)
			// Step 3: Simulate rewind by removing truncation marker and subsequent messages
			// In practice this would be done via removeMessagesThisAndSubsequent
			const markerIndex = truncationResult.messages.findIndex((msg) => msg.isTruncationMarker)
			const messagesAfterRewind = truncationResult.messages.slice(0, markerIndex)
			// Step 4: Clean up orphaned parent references
			const cleanedAfterRewind = (0, condense_1.cleanupAfterTruncation)(messagesAfterRewind)
			// Step 5: Get effective history after cleanup
			const effectiveAfterRewind = (0, condense_1.getEffectiveApiHistory)(cleanedAfterRewind)
			// All original messages before the marker should be restored
			;(0, vitest_1.expect)(effectiveAfterRewind.length).toBe(markerIndex)
			// No messages should have truncationParent
			for (const msg of effectiveAfterRewind) {
				;(0, vitest_1.expect)(msg.truncationParent).toBeUndefined()
			}
		})
		;(0, vitest_1.it)("should handle multiple truncations correctly", () => {
			// Step 1: First truncation
			const firstTruncation = (0, index_1.truncateConversation)(messages, 0.5, "task-1")
			// Step 2: Get effective history and simulate more messages being added
			const effectiveAfterFirst = (0, condense_1.getEffectiveApiHistory)(firstTruncation.messages)
			const moreMessages = [
				...firstTruncation.messages,
				{ role: "user", content: "New message 1", ts: 3000 },
				{ role: "assistant", content: "New response 1", ts: 3100 },
				{ role: "user", content: "New message 2", ts: 3200 },
				{ role: "assistant", content: "New response 2", ts: 3300 },
			]
			// Step 3: Second truncation
			const secondTruncation = (0, index_1.truncateConversation)(moreMessages, 0.5, "task-1")
			// Step 4: Get effective history after second truncation
			const effectiveAfterSecond = (0, condense_1.getEffectiveApiHistory)(secondTruncation.messages)
			// Should have messages hidden by both truncations filtered out
			const firstMarker = secondTruncation.messages.find(
				(msg) => msg.isTruncationMarker && msg.truncationId === firstTruncation.truncationId,
			)
			const secondMarker = secondTruncation.messages.find(
				(msg) => msg.isTruncationMarker && msg.truncationId === secondTruncation.truncationId,
			)
			;(0, vitest_1.expect)(firstMarker).toBeDefined()
			;(0, vitest_1.expect)(secondMarker).toBeDefined()
			// Messages tagged with either truncationId should be filtered
			for (const msg of effectiveAfterSecond) {
				if (msg.truncationParent === firstTruncation.truncationId) {
					throw new Error("First truncation messages should be filtered")
				}
				if (msg.truncationParent === secondTruncation.truncationId) {
					throw new Error("Second truncation messages should be filtered")
				}
			}
		})
		;(0, vitest_1.it)("should handle rewinding when second truncation affects first truncation marker", () => {
			// Step 1: First truncation
			const firstTruncation = (0, index_1.truncateConversation)(messages, 0.5, "task-1")
			// Step 2: Add more messages AFTER getting effective history
			// This simulates real usage where we only send effective messages to API
			const effectiveAfterFirst = (0, condense_1.getEffectiveApiHistory)(firstTruncation.messages)
			const moreMessages = [
				...firstTruncation.messages, // Keep full history with tagged messages
				{ role: "user", content: "New message 1", ts: 3000 },
				{ role: "assistant", content: "New response 1", ts: 3100 },
				{ role: "user", content: "New message 2", ts: 3200 },
				{ role: "assistant", content: "New response 2", ts: 3300 },
			]
			// Step 3: Second truncation - this will tag some messages including possibly the first marker
			const secondTruncation = (0, index_1.truncateConversation)(moreMessages, 0.5, "task-1")
			// Step 4: Simulate rewind past second truncation marker
			const secondMarkerIndex = secondTruncation.messages.findIndex(
				(msg) => msg.isTruncationMarker && msg.truncationId === secondTruncation.truncationId,
			)
			const afterSecondRewind = secondTruncation.messages.slice(0, secondMarkerIndex)
			// Step 5: Clean up orphaned references
			const cleaned = (0, condense_1.cleanupAfterTruncation)(afterSecondRewind)
			// Step 6: Get effective history
			const effective = (0, condense_1.getEffectiveApiHistory)(cleaned)
			// The second truncation marker should be removed
			const hasSecondTruncationMarker = effective.some(
				(msg) => msg.isTruncationMarker && msg.truncationId === secondTruncation.truncationId,
			)
			;(0, vitest_1.expect)(hasSecondTruncationMarker).toBe(false)
			// Messages that were tagged by the second truncation should have those tags cleared
			const hasSecondTruncationParent = cleaned.some(
				(msg) => msg.truncationParent === secondTruncation.truncationId,
			)
			;(0, vitest_1.expect)(hasSecondTruncationParent).toBe(false)
			// First truncation marker and its tagged messages may or may not be present
			// depending on whether the second truncation affected them
			// The important thing is that cleanup works correctly
			;(0, vitest_1.expect)(cleaned.length).toBeGreaterThan(0)
		})
	})
	;(0, vitest_1.describe)("Edge cases", () => {
		;(0, vitest_1.it)("should handle truncateConversation with fracToRemove=0", () => {
			const result = (0, index_1.truncateConversation)(messages, 0, "test-task-id")
			// No messages should be tagged (messagesToRemove = 0)
			const taggedMessages = result.messages.filter((msg) => msg.truncationParent)
			;(0, vitest_1.expect)(taggedMessages.length).toBe(0)
			;(0, vitest_1.expect)(result.messagesRemoved).toBe(0)
			// When nothing is truncated, no marker is inserted
			;(0, vitest_1.expect)(result.messages).toEqual(messages)
		})
		;(0, vitest_1.it)("should handle truncateConversation with very few messages", () => {
			const fewMessages = [
				{ role: "user", content: "Initial", ts: 1000 },
				{ role: "assistant", content: "Response", ts: 1100 },
			]
			const result = (0, index_1.truncateConversation)(fewMessages, 0.5, "test-task-id")
			// With only 1 message after first, 0.5 fraction = 0.5, floored to 0, rounded to even = 0
			// So no messages should be removed and no marker inserted
			;(0, vitest_1.expect)(result.messages.length).toBe(2)
			;(0, vitest_1.expect)(result.messagesRemoved).toBe(0)
		})
		;(0, vitest_1.it)("should handle truncating all visible messages except first", () => {
			// This tests the edge case where visibleIndices[messagesToRemove + 1] would be undefined
			// 3 messages total: first is preserved, 2 others can be truncated
			const threeMessages = [
				{ role: "user", content: "Initial", ts: 1000 },
				{ role: "assistant", content: "Response 1", ts: 1100 },
				{ role: "user", content: "Message 2", ts: 1200 },
			]
			// With fracToRemove = 1.0:
			// visibleCount = 3
			// rawMessagesToRemove = floor((3-1) * 1.0) = 2
			// messagesToRemove = 2 (already even)
			// This truncates ALL messages except the first
			const result = (0, index_1.truncateConversation)(threeMessages, 1.0, "test-task-id")
			;(0, vitest_1.expect)(result.messagesRemoved).toBe(2)
			// Should have 3 original messages + 1 marker = 4
			;(0, vitest_1.expect)(result.messages.length).toBe(4)
			// First message should be untouched
			;(0, vitest_1.expect)(result.messages[0].truncationParent).toBeUndefined()
			;(0, vitest_1.expect)(result.messages[0].content).toBe("Initial")
			// Messages at indices 1 and 2 should be tagged
			;(0, vitest_1.expect)(result.messages[1].truncationParent).toBe(result.truncationId)
			;(0, vitest_1.expect)(result.messages[2].truncationParent).toBe(result.truncationId)
			// Marker should be at the end (index 3)
			;(0, vitest_1.expect)(result.messages[3].isTruncationMarker).toBe(true)
			;(0, vitest_1.expect)(result.messages[3].role).toBe("user")
		})
		;(0, vitest_1.it)("should handle empty condenseParent and truncationParent gracefully", () => {
			const messagesWithoutTags = [
				{ role: "user", content: "Message 1", ts: 1000 },
				{ role: "assistant", content: "Response 1", ts: 1100 },
			]
			const cleaned = (0, condense_1.cleanupAfterTruncation)(messagesWithoutTags)
			// Should return same messages unchanged
			;(0, vitest_1.expect)(cleaned).toEqual(messagesWithoutTags)
		})
	})
})
