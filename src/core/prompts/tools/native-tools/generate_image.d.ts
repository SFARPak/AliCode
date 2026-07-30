declare const _default: {
	type: "function"
	function: {
		name: string
		description: string
		strict: true
		parameters: {
			type: string
			properties: {
				prompt: {
					type: string
					description: string
				}
				path: {
					type: string
					description: string
				}
				image: {
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
//# sourceMappingURL=generate_image.d.ts.map
