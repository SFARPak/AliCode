declare const edit_file: {
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
				expected_replacements: {
					type: string
					description: string
					minimum: number
				}
			}
			required: string[]
			additionalProperties: boolean
		}
	}
}
export default edit_file
//# sourceMappingURL=edit_file.d.ts.map
