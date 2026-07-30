declare const _default: {
	type: "function"
	function: {
		name: string
		description: string
		strict: true
		parameters: {
			type: string
			properties: {
				command: {
					type: string
					description: string
				}
				cwd: {
					type: string[]
					description: string
				}
				timeout: {
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
//# sourceMappingURL=execute_command.d.ts.map
