"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
const vitest_1 = require("vitest")
const json_schema_1 = require("../json-schema")
;(0, vitest_1.describe)("normalizeToolSchema", () => {
	;(0, vitest_1.it)("should convert type array to anyOf for nullable string", () => {
		const input = {
			type: ["string", "null"],
			description: "Optional field",
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// additionalProperties should NOT be added to non-object types (string, null)
		;(0, vitest_1.expect)(result).toEqual({
			anyOf: [{ type: "string" }, { type: "null" }],
			description: "Optional field",
		})
	})
	;(0, vitest_1.it)("should convert type array to anyOf for nullable array", () => {
		const input = {
			type: ["array", "null"],
			items: { type: "string" },
			description: "Optional array",
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// Array-specific properties (items) should be moved inside the array variant
		// This is required by strict schema validators like GPT-5-mini
		;(0, vitest_1.expect)(result).toEqual({
			anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
			description: "Optional array",
		})
	})
	;(0, vitest_1.it)("should preserve single type values", () => {
		const input = {
			type: "string",
			description: "Required field",
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// additionalProperties should NOT be added to string type
		;(0, vitest_1.expect)(result).toEqual({
			type: "string",
			description: "Required field",
		})
	})
	;(0, vitest_1.it)("should recursively transform nested properties", () => {
		const input = {
			type: "object",
			properties: {
				name: { type: "string" },
				optional: {
					type: ["string", "null"],
					description: "Optional nested field",
				},
			},
			required: ["name"],
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// additionalProperties: false should ONLY be on the object type, not on primitives
		;(0, vitest_1.expect)(result).toEqual({
			type: "object",
			properties: {
				name: { type: "string" },
				optional: {
					anyOf: [{ type: "string" }, { type: "null" }],
					description: "Optional nested field",
				},
			},
			required: ["name"],
			additionalProperties: false,
		})
	})
	;(0, vitest_1.it)("should recursively transform items in arrays", () => {
		const input = {
			type: "array",
			items: {
				type: "object",
				properties: {
					path: { type: "string" },
					tags: {
						type: ["array", "null"],
						items: { type: "string" },
					},
				},
			},
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// additionalProperties: false should ONLY be on object types
		// Array-specific properties (items) should be moved inside the array variant
		;(0, vitest_1.expect)(result).toEqual({
			type: "array",
			items: {
				type: "object",
				properties: {
					path: { type: "string" },
					tags: {
						anyOf: [{ type: "array", items: { type: "string" } }, { type: "null" }],
					},
				},
				additionalProperties: false,
			},
		})
	})
	;(0, vitest_1.it)("should handle deeply nested structures", () => {
		const input = {
			type: "object",
			properties: {
				files: {
					type: "array",
					items: {
						type: "object",
						properties: {
							path: { type: "string" },
							ranges: {
								type: ["array", "null"],
								items: {
									type: "array",
									items: { type: "integer" },
								},
							},
						},
						required: ["path", "ranges"],
					},
				},
			},
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		;(0, vitest_1.expect)(result.properties).toBeDefined()
		const properties = result.properties
		const filesItems = properties.files.items
		const filesItemsProps = filesItems.properties
		// Array-specific properties (items) should be moved inside the array variant
		;(0, vitest_1.expect)(filesItemsProps.ranges.anyOf).toEqual([
			{ type: "array", items: { type: "array", items: { type: "integer" } } },
			{ type: "null" },
		])
	})
	;(0, vitest_1.it)("should flatten top-level anyOf and recursively transform nested schemas", () => {
		// Top-level anyOf is flattened for provider compatibility (OpenRouter/Claude)
		// but nested anyOf inside properties is preserved
		const input = {
			anyOf: [
				{
					type: "object",
					properties: {
						optional: { type: ["string", "null"] },
					},
				},
				{ type: "null" },
			],
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// Top-level anyOf should be flattened to the object variant
		// Nested type array should be converted to anyOf
		;(0, vitest_1.expect)(result).toEqual({
			type: "object",
			properties: {
				optional: { anyOf: [{ type: "string" }, { type: "null" }] },
			},
			additionalProperties: false,
		})
	})
	;(0, vitest_1.it)("should handle null or non-object input", () => {
		;(0, vitest_1.expect)((0, json_schema_1.normalizeToolSchema)(null)).toBeNull()
		;(0, vitest_1.expect)((0, json_schema_1.normalizeToolSchema)("string")).toBe("string")
		;(0, vitest_1.expect)((0, json_schema_1.normalizeToolSchema)(123)).toBe(123)
	})
	;(0, vitest_1.it)("should force additionalProperties to false for object types even when set to a schema", () => {
		// For strict mode compatibility, we MUST force additionalProperties: false
		// even when the original schema allowed arbitrary properties
		const input = {
			type: "object",
			additionalProperties: {
				type: ["string", "null"],
			},
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// The original additionalProperties schema is replaced with false for strict mode
		;(0, vitest_1.expect)(result).toEqual({
			type: "object",
			properties: {},
			additionalProperties: false,
		})
	})
	;(0, vitest_1.it)("should preserve additionalProperties when it is a boolean", () => {
		const input = {
			type: "object",
			additionalProperties: false,
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		;(0, vitest_1.expect)(result).toEqual({
			type: "object",
			properties: {},
			additionalProperties: false,
		})
	})
	;(0, vitest_1.it)("should handle the read_file tool schema structure", () => {
		// This is the actual structure used in read_file tool
		const input = {
			type: "object",
			properties: {
				path: {
					type: "string",
					description: "Path to the file",
				},
				indentation: {
					type: ["object", "null"],
					properties: {
						anchor_line: {
							type: ["integer", "null"],
						},
					},
				},
			},
			required: ["path"],
			additionalProperties: false,
		}
		const result = (0, json_schema_1.normalizeToolSchema)(input)
		// Verify nested nullable objects are transformed correctly
		const props = result.properties
		;(0, vitest_1.expect)(props.indentation.anyOf).toEqual([{ type: "object" }, { type: "null" }])
		;(0, vitest_1.expect)(props.indentation.additionalProperties).toBe(false)
		;(0, vitest_1.expect)(props.indentation.properties.anchor_line).toEqual({
			anyOf: [{ type: "integer" }, { type: "null" }],
		})
	})
	;(0, vitest_1.describe)("format field handling", () => {
		;(0, vitest_1.it)("should preserve supported format values (date-time)", () => {
			const input = {
				type: "string",
				format: "date-time",
				description: "Timestamp",
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			// additionalProperties should NOT be added to string types
			;(0, vitest_1.expect)(result).toEqual({
				type: "string",
				format: "date-time",
				description: "Timestamp",
			})
		})
		;(0, vitest_1.it)("should preserve supported format values (email)", () => {
			const input = {
				type: "string",
				format: "email",
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			;(0, vitest_1.expect)(result.format).toBe("email")
		})
		;(0, vitest_1.it)("should preserve supported format values (uuid)", () => {
			const input = {
				type: "string",
				format: "uuid",
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			;(0, vitest_1.expect)(result.format).toBe("uuid")
		})
		;(0, vitest_1.it)("should preserve all supported format values", () => {
			const supportedFormats = [
				"date-time",
				"time",
				"date",
				"duration",
				"email",
				"hostname",
				"ipv4",
				"ipv6",
				"uuid",
			]
			for (const format of supportedFormats) {
				const input = { type: "string", format }
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				;(0, vitest_1.expect)(result.format).toBe(format)
			}
		})
		;(0, vitest_1.it)("should strip unsupported format value (uri)", () => {
			const input = {
				type: "string",
				format: "uri",
				description: "URL field",
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			// additionalProperties should NOT be added to string types
			;(0, vitest_1.expect)(result).toEqual({
				type: "string",
				description: "URL field",
			})
			;(0, vitest_1.expect)(result.format).toBeUndefined()
		})
		;(0, vitest_1.it)("should strip unsupported format value (uri-reference)", () => {
			const input = {
				type: "string",
				format: "uri-reference",
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			;(0, vitest_1.expect)(result.format).toBeUndefined()
		})
		;(0, vitest_1.it)("should strip unsupported format values (various)", () => {
			const unsupportedFormats = ["uri", "uri-reference", "iri", "iri-reference", "regex", "json-pointer"]
			for (const format of unsupportedFormats) {
				const input = { type: "string", format }
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				;(0, vitest_1.expect)(result.format).toBeUndefined()
			}
		})
		;(0, vitest_1.it)("should strip unsupported format in nested properties", () => {
			const input = {
				type: "object",
				properties: {
					url: {
						type: "string",
						format: "uri",
						description: "A URL",
					},
					email: {
						type: "string",
						format: "email",
						description: "An email",
					},
				},
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			const props = result.properties
			;(0, vitest_1.expect)(props.url.format).toBeUndefined()
			;(0, vitest_1.expect)(props.url.description).toBe("A URL")
			;(0, vitest_1.expect)(props.email.format).toBe("email")
			;(0, vitest_1.expect)(props.email.description).toBe("An email")
		})
		;(0, vitest_1.it)("should strip unsupported format in deeply nested structures", () => {
			const input = {
				type: "object",
				properties: {
					items: {
						type: "array",
						items: {
							type: "object",
							properties: {
								link: {
									type: "string",
									format: "uri",
								},
								timestamp: {
									type: "string",
									format: "date-time",
								},
							},
						},
					},
				},
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			const props = result.properties
			const itemsItems = props.items.items
			const nestedProps = itemsItems.properties
			;(0, vitest_1.expect)(nestedProps.link.format).toBeUndefined()
			;(0, vitest_1.expect)(nestedProps.timestamp.format).toBe("date-time")
		})
		;(0, vitest_1.it)("should handle MCP fetch server schema with uri format", () => {
			// This is similar to the actual fetch MCP server schema that caused the error
			const input = {
				type: "object",
				properties: {
					url: {
						type: "string",
						format: "uri",
						description: "URL to fetch",
					},
				},
				required: ["url"],
			}
			const result = (0, json_schema_1.normalizeToolSchema)(input)
			const props = result.properties
			;(0, vitest_1.expect)(props.url.format).toBeUndefined()
			;(0, vitest_1.expect)(props.url.type).toBe("string")
			;(0, vitest_1.expect)(props.url.description).toBe("URL to fetch")
		})
		;(0, vitest_1.describe)("top-level anyOf/oneOf/allOf flattening", () => {
			;(0, vitest_1.it)("should flatten top-level anyOf to object schema", () => {
				// This is the type of schema that caused the OpenRouter error:
				// "input_schema does not support oneOf, allOf, or anyOf at the top level"
				const input = {
					anyOf: [
						{
							type: "object",
							properties: {
								name: { type: "string" },
							},
							required: ["name"],
						},
						{ type: "null" },
					],
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				// Should flatten to the object variant
				;(0, vitest_1.expect)(result.anyOf).toBeUndefined()
				;(0, vitest_1.expect)(result.type).toBe("object")
				;(0, vitest_1.expect)(result.properties).toBeDefined()
				;(0, vitest_1.expect)(result.properties.name).toEqual({ type: "string" })
				;(0, vitest_1.expect)(result.additionalProperties).toBe(false)
			})
			;(0, vitest_1.it)("should flatten top-level oneOf to object schema", () => {
				const input = {
					oneOf: [
						{
							type: "object",
							properties: {
								url: { type: "string" },
							},
						},
						{
							type: "object",
							properties: {
								path: { type: "string" },
							},
						},
					],
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				// Should use the first object variant
				;(0, vitest_1.expect)(result.oneOf).toBeUndefined()
				;(0, vitest_1.expect)(result.type).toBe("object")
				;(0, vitest_1.expect)(result.properties.url).toBeDefined()
			})
			;(0, vitest_1.it)("should flatten top-level allOf to object schema", () => {
				const input = {
					allOf: [
						{
							type: "object",
							properties: {
								base: { type: "string" },
							},
						},
						{
							properties: {
								extra: { type: "number" },
							},
						},
					],
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				// Should use the first object variant
				;(0, vitest_1.expect)(result.allOf).toBeUndefined()
				;(0, vitest_1.expect)(result.type).toBe("object")
			})
			;(0, vitest_1.it)("should preserve description when flattening top-level anyOf", () => {
				const input = {
					description: "Input for the tool",
					anyOf: [
						{
							type: "object",
							properties: {
								data: { type: "string" },
							},
						},
						{ type: "null" },
					],
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				;(0, vitest_1.expect)(result.description).toBe("Input for the tool")
				;(0, vitest_1.expect)(result.anyOf).toBeUndefined()
				;(0, vitest_1.expect)(result.type).toBe("object")
			})
			;(0, vitest_1.it)("should create generic object schema if no object variant found", () => {
				const input = {
					anyOf: [{ type: "string" }, { type: "number" }],
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				// Should create a fallback object schema
				;(0, vitest_1.expect)(result.anyOf).toBeUndefined()
				;(0, vitest_1.expect)(result.type).toBe("object")
				;(0, vitest_1.expect)(result.additionalProperties).toBe(false)
			})
			;(0, vitest_1.it)("should NOT flatten nested anyOf (only top-level)", () => {
				const input = {
					type: "object",
					properties: {
						field: {
							anyOf: [{ type: "string" }, { type: "null" }],
						},
					},
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				// Nested anyOf should be preserved
				const props = result.properties
				;(0, vitest_1.expect)(props.field.anyOf).toBeDefined()
			})
			;(0, vitest_1.it)("should handle MCP server schema with top-level anyOf", () => {
				// Real-world example: some MCP servers define optional nullable root schemas
				const input = {
					$schema: "http://json-schema.org/draft-07/schema#",
					anyOf: [
						{
							type: "object",
							additionalProperties: false,
							properties: {
								issueId: { type: "string", description: "The issue ID" },
								body: { type: "string", description: "The content" },
							},
							required: ["issueId", "body"],
						},
					],
				}
				const result = (0, json_schema_1.normalizeToolSchema)(input)
				;(0, vitest_1.expect)(result.anyOf).toBeUndefined()
				;(0, vitest_1.expect)(result.type).toBe("object")
				;(0, vitest_1.expect)(result.properties).toBeDefined()
				;(0, vitest_1.expect)(result.required).toContain("issueId")
				;(0, vitest_1.expect)(result.required).toContain("body")
			})
		})
	})
})
