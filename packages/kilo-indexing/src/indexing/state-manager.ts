export interface IndexingState {
	status: string
}

export class CodeIndexStateManager {
	getState(): IndexingState {
		return { status: "idle" }
	}
}
