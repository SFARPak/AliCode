export type IndexingTelemetryEvent = string

export type IndexingTelemetryMode = "full" | "incremental"

export interface IndexingTelemetryReporter {
	report(_event: IndexingTelemetryEvent, _data?: Record<string, unknown>): void
}

export type IndexingTelemetrySource = "manual" | "auto" | "watch"

export type IndexingTelemetryTrigger = "save" | "open" | "interval" | "manual"
