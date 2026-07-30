"use strict"
// cd src && npx vitest run api/providers/__tests__/openai-codex-native-tool-calls.spec.ts
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const openai_codex_1 = require("../openai-codex")
const NativeToolCallParser_1 = require("../../../core/assistant-message/NativeToolCallParser")
const oauth_1 = require("../../../integrations/openai-codex/oauth")
;(0, vitest_1.describe)("OpenAiCodexHandler native tool calls", () => {
	let handler
	let mockOptions
	;(0, vitest_1.beforeEach)(() => {
		vitest_1.vi.restoreAllMocks()
		NativeToolCallParser_1.NativeToolCallParser.clearRawChunkState()
		NativeToolCallParser_1.NativeToolCallParser.clearAllStreamingToolCalls()
		mockOptions = {
			apiModelId: "gpt-5.2-2025-12-11",
			// minimal settings; OAuth is mocked below
		}
		handler = new openai_codex_1.OpenAiCodexHandler(mockOptions)
	})
	;(0, vitest_1.it)("yields tool_call_partial chunks when API returns function_call-only response", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield {
							type: "response.output_item.added",
							item: {
								type: "function_call",
								call_id: "call_1",
								name: "attempt_completion",
								arguments: "",
							},
							output_index: 0,
						}
						yield {
							type: "response.function_call_arguments.delta",
							delta: '{"result":"hi"}',
							// Note: intentionally omit call_id + name to simulate tool-call-only streams.
							item_id: "fc_1",
							output_index: 0,
						}
						yield {
							type: "response.completed",
							response: {
								id: "resp_1",
								status: "completed",
								output: [
									{
										type: "function_call",
										call_id: "call_1",
										name: "attempt_completion",
										arguments: '{"result":"hi"}',
									},
								],
								usage: { input_tokens: 1, output_tokens: 1 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "hello" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
			if (chunk.type === "tool_call_partial") {
				// Simulate Task.ts behavior so finish_reason handling can emit tool_call_end elsewhere
				NativeToolCallParser_1.NativeToolCallParser.processRawChunk({
					index: chunk.index,
					id: chunk.id,
					name: chunk.name,
					arguments: chunk.arguments,
				})
			}
		}
		const toolChunks = chunks.filter((c) => c.type === "tool_call_partial")
		;(0, vitest_1.expect)(toolChunks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(toolChunks[0]).toMatchObject({
			type: "tool_call_partial",
			id: "call_1",
			name: "attempt_completion",
		})
	})
	;(0, vitest_1.it)("yields text when Codex emits assistant message only in response.output_item.done", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield {
							type: "response.output_item.done",
							item: {
								type: "message",
								role: "assistant",
								content: [{ type: "output_text", text: "hello from spark" }],
							},
							output_index: 0,
						}
						yield {
							type: "response.completed",
							response: {
								id: "resp_done_only",
								status: "completed",
								output: [
									{
										type: "message",
										role: "assistant",
										content: [{ type: "output_text", text: "hello from spark" }],
									},
								],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const textChunks = chunks.filter((c) => c.type === "text")
		;(0, vitest_1.expect)(textChunks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(textChunks.map((c) => c.text).join("")).toContain("hello from spark")
	})
	;(0, vitest_1.it)("yields text when Codex emits assistant message only in response.completed output", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield {
							type: "response.completed",
							response: {
								id: "resp_completed_only",
								status: "completed",
								output: [
									{
										type: "message",
										role: "assistant",
										content: [{ type: "output_text", text: "final payload only" }],
									},
								],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const textChunks = chunks.filter((c) => c.type === "text")
		;(0, vitest_1.expect)(textChunks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(textChunks.map((c) => c.text).join("")).toContain("final payload only")
	})
	;(0, vitest_1.it)("yields text when Codex emits response.output_text.done without deltas", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield {
							type: "response.output_text.done",
							text: "done-event text only",
						}
						yield {
							type: "response.completed",
							response: {
								id: "resp_done_text_only",
								status: "completed",
								output: [],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const textChunks = chunks.filter((c) => c.type === "text")
		;(0, vitest_1.expect)(textChunks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(textChunks.map((c) => c.text).join("")).toContain("done-event text only")
	})
	;(0, vitest_1.it)("yields tool_call when Codex emits function_call only in response.output_item.done", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield {
							type: "response.output_item.done",
							item: {
								type: "function_call",
								call_id: "call_done_only",
								name: "attempt_completion",
								arguments: '{"result":"ok"}',
							},
							output_index: 0,
						}
						yield {
							type: "response.completed",
							response: {
								id: "resp_done_tool_only",
								status: "completed",
								output: [],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const toolCalls = chunks.filter((c) => c.type === "tool_call")
		;(0, vitest_1.expect)(toolCalls.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(toolCalls[0]).toMatchObject({
			type: "tool_call",
			id: "call_done_only",
			name: "attempt_completion",
		})
	})
	;(0, vitest_1.it)("yields text when Codex emits response.content_part.added", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield {
							type: "response.content_part.added",
							part: {
								type: "output_text",
								text: "content part text",
							},
							output_index: 0,
							content_index: 0,
						}
						yield {
							type: "response.completed",
							response: {
								id: "resp_content_part",
								status: "completed",
								output: [],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const textChunks = chunks.filter((c) => c.type === "text")
		;(0, vitest_1.expect)(textChunks.length).toBeGreaterThan(0)
		;(0, vitest_1.expect)(textChunks.map((c) => c.text).join("")).toContain("content part text")
	})
	;(0, vitest_1.it)("does not duplicate text when Codex emits delta and output_text.done", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield { type: "response.output_text.delta", delta: "hello " }
						yield { type: "response.output_text.delta", delta: "world" }
						yield { type: "response.output_text.done", text: "hello world" }
						yield {
							type: "response.completed",
							response: {
								id: "resp_delta_done",
								status: "completed",
								output: [],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const textChunks = chunks.filter((c) => c.type === "text")
		;(0, vitest_1.expect)(textChunks.map((c) => c.text).join("")).toBe("hello world")
	})
	;(0, vitest_1.it)("does not duplicate text when Codex emits delta and content_part.added", async () => {
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccessToken").mockResolvedValue("test-token")
		vitest_1.vi.spyOn(oauth_1.openAiCodexOAuthManager, "getAccountId").mockResolvedValue("acct_test")
		handler.client = {
			responses: {
				create: vitest_1.vi.fn().mockResolvedValue({
					async *[Symbol.asyncIterator]() {
						yield { type: "response.output_text.delta", delta: "hello world" }
						yield {
							type: "response.content_part.added",
							part: { type: "output_text", text: "hello world" },
							output_index: 0,
							content_index: 0,
						}
						yield {
							type: "response.completed",
							response: {
								id: "resp_delta_content_part",
								status: "completed",
								output: [],
								usage: { input_tokens: 1, output_tokens: 2 },
							},
						}
					},
				}),
			},
		}
		const stream = handler.createMessage("system", [{ role: "user", content: "test" }], {
			taskId: "t",
			tools: [],
		})
		const chunks = []
		for await (const chunk of stream) {
			chunks.push(chunk)
		}
		const textChunks = chunks.filter((c) => c.type === "text")
		;(0, vitest_1.expect)(textChunks.map((c) => c.text).join("")).toBe("hello world")
	})
})
