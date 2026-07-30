declare const apply_patch: {
	type: "function"
	function: {
		name: string
		description: string
		parameters: {
			type: string
			properties: {
				patch: {
					type: string
					description: string
				}
			}
			required: string[]
			additionalProperties: boolean
		}
	}
}
export default apply_patch
//# sourceMappingURL=apply_patch.d.ts.map
