export const INDEXING_STATUS_STATES = {
	idle: "idle",
	indexing: "indexing",
	error: "error",
} as const

export type IndexingStatusState = (typeof INDEXING_STATUS_STATES)[keyof typeof INDEXING_STATUS_STATES]

export interface IndexingStatus {
	state: IndexingStatusState
	message?: string
}

export function disabledIndexingStatus(): IndexingStatus {
	return { state: "idle", message: "Indexing is disabled" }
}

export function normalizeIndexingStatus(status: IndexingStatus): IndexingStatus {
	return status
}
