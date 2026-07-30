declare const edit: {
	type: "function"
	function: {
		name: string
		description: string
		parameters: {
			type: string
			properties: {
				file_path: {
					type: string
					description: string
				}
				old_string: {
					type: string
					description: string
				}
				new_string: {
					type: string
					description: string
				}
				replace_all: {
					type: string
					description: string
					default: boolean
				}
			}
			required: string[]
			additionalProperties: boolean
		}
	}
}
export default edit
//# sourceMappingURL=edit.d.ts.map
