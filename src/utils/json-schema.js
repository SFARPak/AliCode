"use strict"
Object.defineProperty(exports, "__esModule", { value: true })
exports.ToolInputSchema = void 0
exports.normalizeToolSchema = normalizeToolSchema
const zod_1 = require("zod")
/**
 * Set of format values supported by OpenAI's Structured Outputs (strict mode).
 * Unsupported format values will be stripped during schema normalization.
 * @see https://platform.openai.com/docs/guides/structured-outputs#supported-schemas
 */
const OPENAI_SUPPORTED_FORMATS = new Set([
	"date-time",
	"time",
	"date",
	"duration",
	"email",
	"hostname",
	"ipv4",
	"ipv6",
	"uuid",
])
/**
 * Array-specific JSON Schema properties that must be nested inside array type variants
 * when converting to anyOf format (JSON Schema draft 2020-12).
 */
const ARRAY_SPECIFIC_PROPERTIES = ["items", "minItems", "maxItems", "uniqueItems"]
/**
 * Applies array-specific properties from source to target object.
 * Only copies properties that are defined in the source.
 */
function applyArrayProperties(target, source) {
	for (const prop of ARRAY_SPECIFIC_PROPERTIES) {
		if (source[prop] !== undefined) {
			target[prop] = source[prop]
		}
	}
	return target
}
/**
 * Zod schema for JSON Schema primitive types
 */
const JsonSchemaPrimitiveTypeSchema = zod_1.z.enum(["string", "number", "integer", "boolean", "null"])
/**
 * All valid JSON Schema type values including object and array
 */
const JsonSchemaTypeSchema = zod_1.z.union([
	JsonSchemaPrimitiveTypeSchema,
	zod_1.z.literal("object"),
	zod_1.z.literal("array"),
])
/**
 * Zod schema for JSON Schema enum values
 */
const JsonSchemaEnumValueSchema = zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.null()])
/**
 * Zod schema that validates tool input JSON Schema and sets `additionalProperties: false` by default.
 * Uses recursive parsing so the default applies to all nested schemas automatically.
 *
 * This is required by some API providers (e.g., OpenAI) for strict function calling.
 *
 * @example
 * ```typescript
 * // Validates and applies defaults in one pass - throws on invalid
 * const validatedSchema = ToolInputSchema.parse(schema)
 *
 * // Or use safeParse for error handling
 * const result = ToolInputSchema.safeParse(schema)
 * if (result.success) {
 *   // result.data has additionalProperties: false by default
 * }
 * ```
 */
exports.ToolInputSchema = zod_1.z.lazy(() =>
	zod_1.z
		.object({
			type: JsonSchemaTypeSchema.optional(),
			properties: zod_1.z.record(zod_1.z.string(), exports.ToolInputSchema).optional(),
			items: zod_1.z.union([exports.ToolInputSchema, zod_1.z.array(exports.ToolInputSchema)]).optional(),
			required: zod_1.z.array(zod_1.z.string()).optional(),
			additionalProperties: zod_1.z.union([zod_1.z.boolean(), exports.ToolInputSchema]).default(false),
			description: zod_1.z.string().optional(),
			default: zod_1.z.unknown().optional(),
			enum: zod_1.z.array(JsonSchemaEnumValueSchema).optional(),
			const: JsonSchemaEnumValueSchema.optional(),
			anyOf: zod_1.z.array(exports.ToolInputSchema).optional(),
			oneOf: zod_1.z.array(exports.ToolInputSchema).optional(),
			allOf: zod_1.z.array(exports.ToolInputSchema).optional(),
			$ref: zod_1.z.string().optional(),
			minimum: zod_1.z.number().optional(),
			maximum: zod_1.z.number().optional(),
			minLength: zod_1.z.number().optional(),
			maxLength: zod_1.z.number().optional(),
			pattern: zod_1.z.string().optional(),
			minItems: zod_1.z.number().optional(),
			maxItems: zod_1.z.number().optional(),
			uniqueItems: zod_1.z.boolean().optional(),
		})
		.passthrough(),
)
/**
 * Schema for type field that accepts both single types and array types (draft-07 nullable syntax).
 * Array types like ["string", "null"] are transformed to anyOf format for 2020-12 compliance.
 */
const TypeFieldSchema = zod_1.z.union([JsonSchemaTypeSchema, zod_1.z.array(JsonSchemaTypeSchema)])
/**
 * Internal Zod schema that normalizes tool input JSON Schema to be compliant with JSON Schema draft 2020-12.
 *
 * This schema performs three key transformations:
 * 1. Sets `additionalProperties: false` by default (required by OpenAI strict mode)
 * 2. Converts deprecated `type: ["T", "null"]` array syntax to `anyOf` format
 *    (required by Claude on Bedrock which enforces JSON Schema draft 2020-12)
 * 3. Strips unsupported `format` values (e.g., "uri") for OpenAI Structured Outputs compatibility
 *
 * Uses recursive parsing so transformations apply to all nested schemas automatically.
 */
const NormalizedToolSchemaInternal = zod_1.z.lazy(() =>
	zod_1.z
		.object({
			// Accept both single type and array of types, transform array to anyOf
			type: TypeFieldSchema.optional(),
			properties: zod_1.z.record(zod_1.z.string(), NormalizedToolSchemaInternal).optional(),
			items: zod_1.z
				.union([NormalizedToolSchemaInternal, zod_1.z.array(NormalizedToolSchemaInternal)])
				.optional(),
			required: zod_1.z.array(zod_1.z.string()).optional(),
			// Don't set default here - we'll handle it conditionally in the transform
			additionalProperties: zod_1.z.union([zod_1.z.boolean(), NormalizedToolSchemaInternal]).optional(),
			description: zod_1.z.string().optional(),
			default: zod_1.z.unknown().optional(),
			enum: zod_1.z.array(JsonSchemaEnumValueSchema).optional(),
			const: JsonSchemaEnumValueSchema.optional(),
			anyOf: zod_1.z.array(NormalizedToolSchemaInternal).optional(),
			oneOf: zod_1.z.array(NormalizedToolSchemaInternal).optional(),
			allOf: zod_1.z.array(NormalizedToolSchemaInternal).optional(),
			$ref: zod_1.z.string().optional(),
			minimum: zod_1.z.number().optional(),
			maximum: zod_1.z.number().optional(),
			minLength: zod_1.z.number().optional(),
			maxLength: zod_1.z.number().optional(),
			pattern: zod_1.z.string().optional(),
			minItems: zod_1.z.number().optional(),
			maxItems: zod_1.z.number().optional(),
			uniqueItems: zod_1.z.boolean().optional(),
			// Format field - unsupported values will be stripped in transform
			format: zod_1.z.string().optional(),
		})
		.passthrough()
		.transform((schema) => {
			const {
				type,
				required,
				properties,
				additionalProperties,
				format,
				items,
				minItems,
				maxItems,
				uniqueItems,
				...rest
			} = schema
			const result = { ...rest }
			// Determine if this schema represents an object type
			const isObjectType =
				type === "object" || (Array.isArray(type) && type.includes("object")) || properties !== undefined
			// Collect array-specific properties for potential use in type handling
			const arrayProps = { items, minItems, maxItems, uniqueItems }
			// If type is an array, convert to anyOf format (JSON Schema 2020-12)
			// Array-specific properties must be moved inside the array variant
			if (Array.isArray(type)) {
				result.anyOf = type.map((t) => {
					if (t === "array") {
						return applyArrayProperties({ type: t }, arrayProps)
					}
					return { type: t }
				})
			} else if (type !== undefined) {
				result.type = type
				// For single "array" type, preserve array-specific properties at root
				if (type === "array") {
					applyArrayProperties(result, arrayProps)
				}
			}
			// Strip unsupported format values for OpenAI compatibility
			// Only include format if it's a supported value
			if (format && OPENAI_SUPPORTED_FORMATS.has(format)) {
				result.format = format
			}
			// Handle properties and required for strict mode
			if (properties) {
				result.properties = properties
				if (required) {
					const propertyKeys = Object.keys(properties)
					const filteredRequired = required.filter((key) => propertyKeys.includes(key))
					if (filteredRequired.length > 0) {
						result.required = filteredRequired
					}
				}
			} else if (result.type === "object" || (Array.isArray(type) && type.includes("object"))) {
				// For type: "object" without properties, add empty properties
				// This is required by OpenAI strict mode
				result.properties = {}
			}
			// Only add additionalProperties for object-type schemas
			// Adding it to primitive types (string, number, etc.) is invalid JSON Schema
			if (isObjectType) {
				// For strict mode compatibility, we MUST set additionalProperties to false
				// Even if the original schema had {} (any) or true, we force false because
				// OpenAI/OpenRouter strict mode rejects schemas with additionalProperties != false
				// The original schema intent (allowing arbitrary properties) is incompatible with strict mode
				result.additionalProperties = false
			}
			// For non-object types, don't include additionalProperties at all
			return result
		}),
)
/**
 * Flattens a schema with top-level anyOf/oneOf/allOf to a simple object schema.
 * This is needed because some providers (OpenRouter, Claude) don't support
 * schema composition keywords at the top level of tool input schemas.
 *
 * @param schema - The schema to flatten
 * @returns A flattened schema without top-level composition keywords
 */
function flattenTopLevelComposition(schema) {
	const { anyOf, oneOf, allOf, ...rest } = schema
	// If no top-level composition keywords, return as-is
	if (!anyOf && !oneOf && !allOf) {
		return schema
	}
	// Get the composition array to process (prefer anyOf, then oneOf, then allOf)
	const compositionArray = anyOf || oneOf || allOf
	if (!compositionArray || !Array.isArray(compositionArray) || compositionArray.length === 0) {
		return schema
	}
	// Find the first non-null object type variant to use as the base
	// This preserves the most information while making the schema compatible
	const objectVariant = compositionArray.find(
		(variant) =>
			typeof variant === "object" &&
			variant !== null &&
			(variant.type === "object" || variant.properties !== undefined),
	)
	if (objectVariant) {
		// Merge remaining properties with the object variant
		return { ...rest, ...objectVariant }
	}
	// If no object variant found, create a generic object schema
	// This is a fallback that allows any object structure
	return {
		type: "object",
		additionalProperties: false,
		...rest,
	}
}
/**
 * Normalizes a tool input JSON Schema to be compliant with JSON Schema draft 2020-12.
 *
 * This function performs four key transformations:
 * 1. Sets `additionalProperties: false` by default (required by OpenAI strict mode)
 * 2. Converts deprecated `type: ["T", "null"]` array syntax to `anyOf` format
 *    (required by Claude on Bedrock which enforces JSON Schema draft 2020-12)
 * 3. Strips unsupported `format` values (e.g., "uri") for OpenAI Structured Outputs compatibility
 * 4. Flattens top-level anyOf/oneOf/allOf (required by OpenRouter/Claude which don't support
 *    schema composition keywords at the top level)
 *
 * Uses recursive parsing so transformations apply to all nested schemas automatically.
 *
 * @param schema - The JSON Schema to normalize
 * @returns A normalized schema object that is JSON Schema draft 2020-12 compliant
 */
function normalizeToolSchema(schema) {
	if (typeof schema !== "object" || schema === null) {
		return schema
	}
	// First, flatten any top-level composition keywords before normalizing
	const flattenedSchema = flattenTopLevelComposition(schema)
	const result = NormalizedToolSchemaInternal.safeParse(flattenedSchema)
	return result.success ? result.data : flattenedSchema
}
