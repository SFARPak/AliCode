declare const _default: {
	type: "function"
	function: {
		name: string
		description: string
		strict: true
		parameters: {
			type: string
			properties: {
				path: {
					type: string
					description: string
				}
				regex: {
					type: string
					description: string
				}
				file_pattern: {
					type: string[]
					description: string
				}
			}
			required: string[]
			additionalProperties: boolean
		}
	}
}
export default _default
//# sourceMappingURL=search_files.d.ts.map
