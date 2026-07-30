declare const _default: {
	type: "function"
	function: {
		name: string
		description: string
		strict: true
		parameters: {
			type: string
			properties: {
				question: {
					type: string
					description: string
				}
				follow_up: {
					type: string
					description: string
					items: {
						type: string
						properties: {
							text: {
								type: string
								description: string
							}
							mode: {
								type: string[]
								description: string
							}
						}
						required: string[]
						additionalProperties: boolean
					}
					minItems: number
					maxItems: number
				}
			}
			required: string[]
			additionalProperties: boolean
		}
	}
}
export default _default
//# sourceMappingURL=ask_followup_question.d.ts.map
