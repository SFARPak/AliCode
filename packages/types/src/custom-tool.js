// Re-export from Zod for convenience.
export { z as parametersSchema } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"
/**
 * Converts a Zod schema to a JSON Schema (draft-07) representation.
 * This is a thin wrapper around `zod-to-json-schema` to provide
 * a consistent API across zod versions.
 */
export function toJSONSchema(schema) {
	return zodToJsonSchema(schema, { $refStrategy: "none" })
}
/**
 * Helper function to define a custom tool with proper type inference.
 *
 * This is optional - you can also just export a plain object that matches
 * the CustomToolDefinition interface.
 *
 * @example
 * ```ts
 * import { parametersSchema as z, defineCustomTool } from "@ali-code/types"
 *
 * export default defineCustomTool({
 *   name: "add_numbers",
 *   description: "Add two numbers",
 *   parameters: z.object({
 *     a: z.number().describe("First number"),
 *     b: z.number().describe("Second number"),
 *   }),
 *   async execute({ a, b }) {
 *     return `The sum is ${a + b}`
 *   }
 * })
 * ```
 */
export function defineCustomTool(definition) {
	return definition
}
