export interface IndexingConfigInput {
	enabled?: boolean
}

export interface IndexingConfig {
	enabled: boolean
}

export function toIndexingConfigInput(_config: IndexingConfig): IndexingConfigInput {
	return { enabled: _config.enabled }
}
