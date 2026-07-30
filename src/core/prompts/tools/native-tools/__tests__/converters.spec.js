"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const converters_1 = require("../converters")
;(0, vitest_1.describe)("converters", () => {
	;(0, vitest_1.describe)("convertOpenAIToolToAnthropic", () => {
		;(0, vitest_1.it)("should convert a simple OpenAI tool to Anthropic format", () => {
			const openAITool = {
				type: "function",
				function: {
					name: "get_weather",
					description: "Get the current weather in a location",
					parameters: {
						type: "object",
						properties: {
							location: {
								type: "string",
								description: "The city and state",
							},
						},
						required: ["location"],
					},
				},
			}
			const result = (0, converters_1.convertOpenAIToolToAnthropic)(openAITool)
			;(0, vitest_1.expect)(result).toEqual({
				name: "get_weather",
				description: "Get the current weather in a location",
				input_schema: {
					type: "object",
					properties: {
						location: {
							type: "string",
							description: "The city and state",
						},
					},
					required: ["location"],
				},
			})
		})
		;(0, vitest_1.it)("should handle tools with empty description", () => {
			const openAITool = {
				type: "function",
				function: {
					name: "test_tool",
					parameters: {
						type: "object",
						properties: {},
					},
				},
			}
			const result = (0, converters_1.convertOpenAIToolToAnthropic)(openAITool)
			;(0, vitest_1.expect)(result.name).toBe("test_tool")
			;(0, vitest_1.expect)(result.description).toBe("")
			;(0, vitest_1.expect)(result.input_schema).toEqual({
				type: "object",
				properties: {},
			})
		})
		;(0, vitest_1.it)("should throw error for non-function tool types", () => {
			const customTool = {
				type: "custom",
			}
			;(0, vitest_1.expect)(() => (0, converters_1.convertOpenAIToolToAnthropic)(customTool)).toThrow(
				"Unsupported tool type: custom",
			)
		})
		;(0, vitest_1.it)("should preserve complex parameter schemas", () => {
			const openAITool = {
				type: "function",
				function: {
					name: "process_data",
					description: "Process data with filters",
					parameters: {
						type: "object",
						properties: {
							items: {
								type: "array",
								items: {
									type: "object",
									properties: {
										name: { type: "string" },
										tags: {
											type: ["array", "null"],
											items: { type: "string" },
										},
									},
									required: ["name"],
								},
							},
						},
						required: ["items"],
						additionalProperties: false,
					},
				},
			}
			const result = (0, converters_1.convertOpenAIToolToAnthropic)(openAITool)
			;(0, vitest_1.expect)(result.input_schema).toEqual(openAITool.function.parameters)
		})
	})
	;(0, vitest_1.describe)("convertOpenAIToolsToAnthropic", () => {
		;(0, vitest_1.it)("should convert multiple tools", () => {
			const openAITools = [
				{
					type: "function",
					function: {
						name: "tool1",
						description: "First tool",
						parameters: { type: "object", properties: {} },
					},
				},
				{
					type: "function",
					function: {
						name: "tool2",
						description: "Second tool",
						parameters: { type: "object", properties: {} },
					},
				},
			]
			const results = (0, converters_1.convertOpenAIToolsToAnthropic)(openAITools)
			;(0, vitest_1.expect)(results).toHaveLength(2)
			;(0, vitest_1.expect)(results[0].name).toBe("tool1")
			;(0, vitest_1.expect)(results[1].name).toBe("tool2")
		})
		;(0, vitest_1.it)("should handle empty array", () => {
			const results = (0, converters_1.convertOpenAIToolsToAnthropic)([])
			;(0, vitest_1.expect)(results).toEqual([])
		})
	})
	;(0, vitest_1.describe)("convertOpenAIToolChoiceToAnthropic", () => {
		;(0, vitest_1.it)(
			"should return auto with enabled parallel tool use by default when toolChoice is undefined",
			() => {
				const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)(undefined)
				;(0, vitest_1.expect)(result).toEqual({ type: "auto", disable_parallel_tool_use: false })
			},
		)
		;(0, vitest_1.it)("should return auto with disabled parallel tool use when parallelToolCalls is false", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)(undefined, false)
			;(0, vitest_1.expect)(result).toEqual({ type: "auto", disable_parallel_tool_use: true })
		})
		;(0, vitest_1.it)("should return undefined for 'none' tool choice", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)("none")
			;(0, vitest_1.expect)(result).toBeUndefined()
		})
		;(0, vitest_1.it)("should return auto for 'auto' tool choice", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)("auto")
			;(0, vitest_1.expect)(result).toEqual({ type: "auto", disable_parallel_tool_use: false })
		})
		;(0, vitest_1.it)("should return any for 'required' tool choice", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)("required")
			;(0, vitest_1.expect)(result).toEqual({ type: "any", disable_parallel_tool_use: false })
		})
		;(0, vitest_1.it)("should return auto for unknown string tool choice", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)("unknown")
			;(0, vitest_1.expect)(result).toEqual({ type: "auto", disable_parallel_tool_use: false })
		})
		;(0, vitest_1.it)("should convert function object form to tool type", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)({
				type: "function",
				function: { name: "get_weather" },
			})
			;(0, vitest_1.expect)(result).toEqual({
				type: "tool",
				name: "get_weather",
				disable_parallel_tool_use: false,
			})
		})
		;(0, vitest_1.it)("should handle function object form with parallel tool calls disabled", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)(
				{
					type: "function",
					function: { name: "read_file" },
				},
				false,
			)
			;(0, vitest_1.expect)(result).toEqual({
				type: "tool",
				name: "read_file",
				disable_parallel_tool_use: true,
			})
		})
		;(0, vitest_1.it)("should return auto for object without function property", () => {
			const result = (0, converters_1.convertOpenAIToolChoiceToAnthropic)({ type: "something" })
			;(0, vitest_1.expect)(result).toEqual({ type: "auto", disable_parallel_tool_use: false })
		})
	})
})
