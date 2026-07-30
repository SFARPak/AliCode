export interface CodeIndexConfig {
	enabled: boolean
	maxFileSize?: number
	excludePatterns?: string[]
}

export interface PreviousConfigSnapshot {
	config: CodeIndexConfig
	timestamp: number
}
