import type { z as z4 } from "zod/v4"
import { z } from "zod"
/**
 * Re-export Zod v4's JSONSchema type for convenience
 */
export type JsonSchema = z4.core.JSONSchema.JSONSchema
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
export declare const ToolInputSchema: z.ZodType<JsonSchema>
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
export declare function normalizeToolSchema(schema: Record<string, unknown>): Record<string, unknown>
//# sourceMappingURL=json-schema.d.ts.map
