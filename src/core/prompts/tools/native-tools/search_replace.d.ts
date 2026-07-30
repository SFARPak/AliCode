declare const search_replace: {
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
			}
			required: string[]
			additionalProperties: boolean
		}
	}
}
export default search_replace
//# sourceMappingURL=search_replace.d.ts.map
