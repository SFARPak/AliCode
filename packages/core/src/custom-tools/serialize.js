import { parametersSchema } from "@ali-code/types"
export function serializeCustomTool({ name, description, parameters, source }) {
	return {
		name,
		description,
		parameters: parameters ? parametersSchema.toJSONSchema(parameters) : undefined,
		source,
	}
}
export function serializeCustomTools(tools) {
	return tools.map(serializeCustomTool)
}
